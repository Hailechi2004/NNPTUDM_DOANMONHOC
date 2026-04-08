const { pool, query, queryOne } = require('../utils/db');
const { ensureAppSchema } = require('../utils/dbMigration');
const partService = require('./partService');

const STATUS_LABELS = {
  Pending: 'Chờ thanh toán',
  Processing: 'Đang xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Done: 'Hoàn tất',
  Cancelled: 'Đã hủy',
};

function requireCustomer(authUser) {
  if (!authUser || authUser.role !== 'Customer') {
    throw new Error('Chức năng này chỉ dành cho tài khoản khách hàng');
  }
}

async function findCustomerByUserId(userId, connection = null) {
  const executor = connection || pool;
  const [rows] = await executor.execute(
    `SELECT id, full_name, phone, address
     FROM customers
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

async function ensureCustomerByUserId(userId, connection = null) {
  const executor = connection || pool;
  const existingCustomer = await findCustomerByUserId(userId, connection);
  if (existingCustomer) {
    return existingCustomer;
  }

  const [userRows] = await executor.execute(
    `SELECT u.id, u.full_name, u.email, r.name AS role_name
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );

  const user = userRows[0] || null;
  if (!user || user.role_name !== 'Customer') {
    return null;
  }

  const fullName = user.full_name || user.email || `Customer ${userId}`;
  const [insertResult] = await executor.execute(
    `INSERT INTO customers (user_id, full_name, phone, address, loyalty_points)
     VALUES (?, ?, NULL, NULL, 0)`,
    [userId, fullName]
  );

  return {
    id: insertResult.insertId,
    full_name: fullName,
    phone: null,
    address: null,
  };
}

async function ensureCart(customerId, connection = null) {
  const executor = connection || pool;
  const [existingRows] = await executor.execute(
    'SELECT id, customer_id FROM carts WHERE customer_id = ? LIMIT 1',
    [customerId]
  );

  if (existingRows[0]) {
    return existingRows[0];
  }

  const [insertResult] = await executor.execute(
    'INSERT INTO carts (customer_id) VALUES (?)',
    [customerId]
  );

  return {
    id: insertResult.insertId,
    customer_id: customerId,
  };
}

async function listShopCategories() {
  const rows = await query(
    `SELECT c.id, c.name, COUNT(p.id) AS part_count
     FROM categories c
     LEFT JOIN parts p ON p.category_id = c.id
     GROUP BY c.id, c.name
     ORDER BY c.name ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    count: Number(row.part_count || 0),
  }));
}

function normalizeShopFilters(input = {}) {
  return {
    categoryId: input.category || input.categoryId || '',
    search: input.search ? String(input.search).trim() : '',
    sort: input.sort || 'newest',
  };
}

function isPromotionUsable(promotion) {
  if (!promotion || !promotion.is_active) {
    return false;
  }

  if (promotion.end_date && new Date(promotion.end_date).getTime() < Date.now()) {
    return false;
  }

  return true;
}

function calculateCartPricing(part, promotion) {
  const basePrice = Number(part.price || 0);
  const defaultState = partService.getPromotionState(part.price, part.discountPrice, part.hasPromotion);
  const defaultPrice = defaultState.finalPrice;

  if (!promotion) {
    return {
      basePrice,
      finalPrice: defaultPrice,
      originalPrice: defaultState.originalPrice || null,
      showPromotion: defaultState.showPromotion,
      discountAmount: 0,
      totalSavings: Math.max(0, basePrice - defaultPrice),
      promotionCode: null,
    };
  }

  const promoPrice = partService.calculatePromotionPrice(defaultPrice, promotion);
  const finalPrice = Math.min(defaultPrice, promoPrice);
  const discountAmount = Math.max(0, defaultPrice - finalPrice);

  return {
    basePrice,
    finalPrice,
    originalPrice: finalPrice < defaultPrice ? defaultPrice : (defaultState.originalPrice || null),
    showPromotion: finalPrice < basePrice,
    discountAmount,
    totalSavings: Math.max(0, basePrice - finalPrice),
    promotionCode: discountAmount > 0 ? promotion.code : null,
  };
}

async function getCartCount(userId) {
  await ensureAppSchema();
  const customer = await ensureCustomerByUserId(userId);
  if (!customer) {
    return 0;
  }

  const cart = await ensureCart(customer.id);
  const row = await queryOne(
    `SELECT COALESCE(SUM(quantity), 0) AS total_quantity
     FROM cart_items
     WHERE cart_id = ?`,
    [cart.id]
  );
  return Number(row ? row.total_quantity : 0);
}

async function getShopHomeData({ query: filters = {}, authUser = null, isPreviewMode = false, currentPath = '/' }) {
  const normalizedFilters = normalizeShopFilters(filters);
  const parts = await partService.listParts(normalizedFilters);
  const categories = await listShopCategories();
  const cartCount = authUser ? await getCartCount(authUser.id) : 0;

  return {
    title: isPreviewMode ? 'Xem trước cửa hàng' : 'Cửa hàng phụ tùng',
    parts,
    categories,
    cartCount,
    currentCategoryId: normalizedFilters.categoryId,
    currentSearch: normalizedFilters.search,
    currentSort: normalizedFilters.sort,
    isPreviewMode,
    currentPath,
  };
}

async function getShopProductDetail(id, authUser = null) {
  await ensureAppSchema();
  const part = await partService.findPartById(id);
  if (!part) {
    return null;
  }

  const assignedPromotion = part.promotionId ? await partService.findPromotionForPart(id) : null;

  return {
    title: part.name,
    part,
    cartCount: authUser ? await getCartCount(authUser.id) : 0,
    assignedPromotion: isPromotionUsable(assignedPromotion) ? assignedPromotion : null,
  };
}

async function getCartDetail(authUser) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const customer = await ensureCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const cart = await ensureCart(customer.id);
  const rows = await query(
    `SELECT
       ci.id,
       ci.part_id,
       ci.quantity,
       ci.applied_promotion_id,
       p.name,
       p.image,
       p.price,
       p.discount_price,
       p.has_promotion,
       p.stock,
       p.promotion_id,
       c.name AS category_name,
       pr.code AS applied_code,
       pr.discount_type,
       pr.discount_value,
       pr.is_active,
       pr.end_date
     FROM cart_items ci
     INNER JOIN parts p ON p.id = ci.part_id
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN promotions pr ON pr.id = ci.applied_promotion_id
     WHERE ci.cart_id = ?
     ORDER BY ci.id ASC`,
    [cart.id]
  );

  const items = rows.map((row) => {
    const part = {
      price: Number(row.price),
      discountPrice: row.discount_price === null ? null : Number(row.discount_price),
      hasPromotion: Boolean(row.has_promotion),
    };

    const appliedPromotion = row.applied_promotion_id ? {
      id: row.applied_promotion_id,
      code: row.applied_code,
      discount_type: row.discount_type,
      discount_value: Number(row.discount_value || 0),
      is_active: Boolean(row.is_active),
      end_date: row.end_date,
    } : null;

    const pricing = calculateCartPricing(part, isPromotionUsable(appliedPromotion) ? appliedPromotion : null);

    return {
      id: row.id,
      partId: row.part_id,
      name: row.name,
      image: row.image,
      category: row.category_name || 'Chưa phân loại',
      quantity: Number(row.quantity),
      stock: Number(row.stock || 0),
      price: pricing.basePrice,
      finalPrice: pricing.finalPrice,
      originalPrice: pricing.originalPrice,
      showPromotion: pricing.showPromotion,
      lineTotal: pricing.finalPrice * Number(row.quantity),
      appliedPromotionCode: pricing.promotionCode,
      discountAmount: pricing.discountAmount,
      totalSavings: pricing.totalSavings,
      canApplyPromotion: Boolean(row.promotion_id),
    };
  });

  return {
    customer,
    cartId: cart.id,
    items,
    cartCount: items.reduce((sum, item) => sum + item.quantity, 0),
    totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
}

async function addToCart(authUser, partId, quantity = 1) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const customer = await ensureCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const part = await partService.findPartById(partId);
  if (!part) {
    throw new Error('Sản phẩm không tồn tại');
  }

  const parsedQuantity = Number(quantity || 1);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error('Số lượng thêm vào giỏ không hợp lệ');
  }

  const cart = await ensureCart(customer.id);
  const existing = await queryOne(
    'SELECT id, quantity FROM cart_items WHERE cart_id = ? AND part_id = ? LIMIT 1',
    [cart.id, partId]
  );

  const nextQuantity = Number(existing ? existing.quantity : 0) + parsedQuantity;
  if (nextQuantity > part.stock) {
    throw new Error('Số lượng vượt quá tồn kho hiện tại');
  }

  if (existing) {
    await query(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [nextQuantity, existing.id]
    );
  } else {
    await query(
      'INSERT INTO cart_items (cart_id, part_id, quantity, applied_promotion_id) VALUES (?, ?, ?, NULL)',
      [cart.id, partId, parsedQuantity]
    );
  }

  return getCartDetail(authUser);
}

async function updateCartItem(authUser, partId, quantity) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const customer = await ensureCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const cart = await ensureCart(customer.id);
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity)) {
    throw new Error('Số lượng không hợp lệ');
  }

  if (parsedQuantity <= 0) {
    await query('DELETE FROM cart_items WHERE cart_id = ? AND part_id = ?', [cart.id, partId]);
    return getCartDetail(authUser);
  }

  const part = await partService.findPartById(partId);
  if (!part) {
    throw new Error('Sản phẩm không tồn tại');
  }

  if (parsedQuantity > part.stock) {
    throw new Error('Số lượng vượt quá tồn kho hiện tại');
  }

  await query(
    'UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND part_id = ?',
    [parsedQuantity, cart.id, partId]
  );

  return getCartDetail(authUser);
}

async function applyPromotionCode(authUser, partId, promoCode) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const customer = await ensureCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const cart = await ensureCart(customer.id);
  const cartItem = await queryOne(
    'SELECT id FROM cart_items WHERE cart_id = ? AND part_id = ? LIMIT 1',
    [cart.id, partId]
  );

  if (!cartItem) {
    throw new Error('Sản phẩm chưa có trong giỏ hàng');
  }

  const part = await partService.findPartById(partId);
  if (!part || !part.promotionId) {
    throw new Error('Sản phẩm này không được áp dụng mã giảm giá');
  }

  const promotion = await partService.findPromotionForPart(partId);
  if (!isPromotionUsable(promotion)) {
    throw new Error('Mã khuyến mãi của sản phẩm hiện không khả dụng');
  }

  if (String(promoCode || '').trim().toUpperCase() !== String(promotion.code || '').toUpperCase()) {
    throw new Error('Mã khuyến mãi không đúng hoặc không áp dụng cho sản phẩm này');
  }

  await query(
    'UPDATE cart_items SET applied_promotion_id = ? WHERE id = ?',
    [promotion.id, cartItem.id]
  );

  return getCartDetail(authUser);
}

async function clearPromotionCode(authUser, partId) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const customer = await ensureCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const cart = await ensureCart(customer.id);
  await query(
    'UPDATE cart_items SET applied_promotion_id = NULL WHERE cart_id = ? AND part_id = ?',
    [cart.id, partId]
  );

  return getCartDetail(authUser);
}

async function removeCartItem(authUser, partId) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const customer = await ensureCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const cart = await ensureCart(customer.id);
  await query('DELETE FROM cart_items WHERE cart_id = ? AND part_id = ?', [cart.id, partId]);
  return getCartDetail(authUser);
}

async function checkoutCart(authUser, shippingAddress) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const customer = await ensureCustomerByUserId(authUser.id, connection);
    if (!customer) {
      throw new Error('Không tìm thấy thông tin khách hàng');
    }

    const cart = await ensureCart(customer.id, connection);
    const [items] = await connection.execute(
      `SELECT
         ci.part_id,
         ci.quantity,
         ci.applied_promotion_id,
         p.name,
         p.image,
         p.price,
         p.discount_price,
         p.has_promotion,
         p.stock,
         pr.code AS applied_code,
         pr.discount_type,
         pr.discount_value,
         pr.is_active,
         pr.end_date
       FROM cart_items ci
       INNER JOIN parts p ON p.id = ci.part_id
       LEFT JOIN promotions pr ON pr.id = ci.applied_promotion_id
       WHERE ci.cart_id = ?
       ORDER BY ci.id ASC`,
      [cart.id]
    );

    if (items.length === 0) {
      throw new Error('Giỏ hàng đang trống');
    }

    let totalAmount = 0;
    const preparedItems = items.map((item) => {
      const quantity = Number(item.quantity);
      const stock = Number(item.stock);
      if (quantity > stock) {
        throw new Error(`Sản phẩm ${item.name} không đủ tồn kho`);
      }

      const pricing = calculateCartPricing(
        {
          price: Number(item.price),
          discountPrice: item.discount_price === null ? null : Number(item.discount_price),
          hasPromotion: Boolean(item.has_promotion),
        },
        item.applied_promotion_id ? {
          id: item.applied_promotion_id,
          code: item.applied_code,
          discount_type: item.discount_type,
          discount_value: Number(item.discount_value || 0),
          is_active: Boolean(item.is_active),
          end_date: item.end_date,
        } : null
      );

      totalAmount += pricing.finalPrice * quantity;

      return {
        partId: item.part_id,
        quantity,
        unitPrice: pricing.finalPrice,
        promotionCode: pricing.promotionCode,
        discountAmount: pricing.discountAmount,
        productName: item.name,
        productImage: item.image,
      };
    });

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (customer_id, total_amount, status, shipping_address)
       VALUES (?, ?, 'Pending', ?)`,
      [customer.id, totalAmount, shippingAddress || customer.address || null]
    );

    for (const item of preparedItems) {
      await connection.execute(
        `INSERT INTO order_details (order_id, part_id, quantity, unit_price, promotion_code, discount_amount, product_name, product_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderResult.insertId,
          item.partId,
          item.quantity,
          item.unitPrice,
          item.promotionCode || null,
          item.discountAmount,
          item.productName,
          item.productImage,
        ]
      );

      await connection.execute(
        'UPDATE parts SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.partId]
      );
    }

    await connection.execute('DELETE FROM cart_items WHERE cart_id = ?', [cart.id]);
    await connection.commit();
    return orderResult.insertId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function listCustomerOrders(authUser) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const customer = await ensureCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const rows = await query(
    `SELECT id, order_date, total_amount, status, shipping_address
     FROM orders
     WHERE customer_id = ?
     ORDER BY order_date DESC, id DESC`,
    [customer.id]
  );

  return rows.map((row) => ({
    id: row.id,
    code: `ORD-${String(row.id).padStart(4, '0')}`,
    orderDate: new Date(row.order_date).toISOString().slice(0, 10),
    totalAmount: Number(row.total_amount),
    status: STATUS_LABELS[row.status] || row.status,
    shippingAddress: row.shipping_address,
  }));
}

async function findCustomerOrderDetail(authUser, orderId) {
  await ensureAppSchema();
  requireCustomer(authUser);

  const customer = await ensureCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const order = await queryOne(
    `SELECT id, order_date, total_amount, status, shipping_address
     FROM orders
     WHERE id = ? AND customer_id = ?
     LIMIT 1`,
    [orderId, customer.id]
  );

  if (!order) {
    return null;
  }

  const items = await query(
    `SELECT
       od.part_id,
       od.quantity,
       od.unit_price,
       od.promotion_code,
       od.discount_amount,
       COALESCE(od.product_name, p.name) AS product_name,
       COALESCE(od.product_image, p.image) AS product_image
     FROM order_details od
     LEFT JOIN parts p ON p.id = od.part_id
     WHERE od.order_id = ?
     ORDER BY od.id ASC`,
    [orderId]
  );

  return {
    id: `ORD-${String(order.id).padStart(4, '0')}`,
    rawId: order.id,
    orderDate: new Date(order.order_date).toISOString().slice(0, 10),
    totalAmount: Number(order.total_amount),
    status: STATUS_LABELS[order.status] || order.status,
    shippingAddress: order.shipping_address,
    items: items.map((item) => ({
      partId: item.part_id,
      name: item.product_name || 'Sản phẩm',
      image: item.product_image || '',
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      originalUnitPrice: Number(item.discount_amount || 0) > 0
        ? Number(item.unit_price) + Number(item.discount_amount || 0)
        : null,
      promotionCode: item.promotion_code,
      discountAmount: Number(item.discount_amount || 0),
      lineTotal: Number(item.quantity) * Number(item.unit_price),
    })),
  };
}

module.exports = {
  addToCart,
  applyPromotionCode,
  calculateCartPricing,
  checkoutCart,
  clearPromotionCode,
  ensureCart,
  ensureCustomerByUserId,
  findCustomerByUserId,
  findCustomerOrderDetail,
  getCartCount,
  getCartDetail,
  getShopHomeData,
  getShopProductDetail,
  isPromotionUsable,
  listCustomerOrders,
  listShopCategories,
  normalizeShopFilters,
  removeCartItem,
  requireCustomer,
  updateCartItem,
};
