const { pool, query, queryOne } = require('../utils/db');
const partController = require('./parts');

function getExecutor(connection) {
  return connection || pool;
}

async function executeAll(connection, sql, params = []) {
  const executor = getExecutor(connection);
  const [rows] = await executor.execute(sql, params);
  return rows;
}

async function executeOne(connection, sql, params = []) {
  const rows = await executeAll(connection, sql, params);
  return rows[0] || null;
}

function requireCustomer(authUser) {
  if (!authUser || authUser.role !== 'Customer') {
    throw new Error('Chức năng này chỉ dành cho tài khoản khách hàng');
  }
}

async function findCustomerByUserId(userId, connection = null) {
  return executeOne(
    connection,
    `SELECT c.id, c.full_name, c.phone, c.address
     FROM customers c
     WHERE c.user_id = ?
     LIMIT 1`,
    [userId]
  );
}

async function ensureCart(customerId, connection = null) {
  const existing = await executeOne(
    connection,
    'SELECT id, customer_id FROM carts WHERE customer_id = ? LIMIT 1',
    [customerId]
  );

  if (existing) {
    return existing;
  }

  const executor = getExecutor(connection);
  const [result] = await executor.execute(
    'INSERT INTO carts (customer_id) VALUES (?)',
    [customerId]
  );

  return {
    id: result.insertId,
    customer_id: customerId,
  };
}

async function getCartCount(userId) {
  const customer = await findCustomerByUserId(userId);
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

async function getShopHomeData({ query: filters = {}, authUser = null, isPreviewMode = false, currentPath = '/' }) {
  const normalizedFilters = normalizeShopFilters(filters);
  const parts = await partController.listParts(normalizedFilters);
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
  const part = await partController.findPartById(id);
  if (!part) {
    return null;
  }

  return {
    title: part.name,
    part,
    cartCount: authUser ? await getCartCount(authUser.id) : 0,
  };
}

async function getCartDetail(authUser) {
  requireCustomer(authUser);

  const customer = await findCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const cart = await ensureCart(customer.id);
  const rows = await query(
    `SELECT
       ci.id,
       ci.part_id,
       ci.quantity,
       p.name,
       p.image,
       p.price,
       p.discount_price,
       p.has_promotion,
       p.stock,
       c.name AS category_name
     FROM cart_items ci
     INNER JOIN parts p ON p.id = ci.part_id
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE ci.cart_id = ?
     ORDER BY ci.id ASC`,
    [cart.id]
  );

  const items = rows.map((row) => {
    const promotionState = partController.getPromotionState(row.price, row.discount_price, row.has_promotion);
    return {
      id: row.id,
      partId: row.part_id,
      name: row.name,
      image: row.image,
      category: row.category_name || 'Chưa phân loại',
      quantity: Number(row.quantity),
      stock: Number(row.stock || 0),
      price: promotionState.price,
      finalPrice: promotionState.finalPrice,
      originalPrice: promotionState.originalPrice,
      showPromotion: promotionState.showPromotion,
      lineTotal: promotionState.finalPrice * Number(row.quantity),
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
  requireCustomer(authUser);

  const customer = await findCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const part = await partController.findPartById(partId);
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
      'INSERT INTO cart_items (cart_id, part_id, quantity) VALUES (?, ?, ?)',
      [cart.id, partId, parsedQuantity]
    );
  }

  return getCartDetail(authUser);
}

async function updateCartItem(authUser, partId, quantity) {
  requireCustomer(authUser);

  const customer = await findCustomerByUserId(authUser.id);
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

  const part = await partController.findPartById(partId);
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

async function removeCartItem(authUser, partId) {
  requireCustomer(authUser);

  const customer = await findCustomerByUserId(authUser.id);
  if (!customer) {
    throw new Error('Không tìm thấy thông tin khách hàng');
  }

  const cart = await ensureCart(customer.id);
  await query('DELETE FROM cart_items WHERE cart_id = ? AND part_id = ?', [cart.id, partId]);
  return getCartDetail(authUser);
}

async function checkoutCart(authUser, shippingAddress) {
  requireCustomer(authUser);

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const customer = await findCustomerByUserId(authUser.id, connection);
    if (!customer) {
      throw new Error('Không tìm thấy thông tin khách hàng');
    }

    const cart = await ensureCart(customer.id, connection);
    const items = await executeAll(
      connection,
      `SELECT
         ci.part_id,
         ci.quantity,
         p.name,
         p.price,
         p.discount_price,
         p.has_promotion,
         p.stock
       FROM cart_items ci
       INNER JOIN parts p ON p.id = ci.part_id
       WHERE ci.cart_id = ?
       ORDER BY ci.id ASC`,
      [cart.id]
    );

    if (items.length === 0) {
      throw new Error('Giỏ hàng đang trống');
    }

    let totalAmount = 0;
    for (const item of items) {
      const quantity = Number(item.quantity);
      const stock = Number(item.stock);
      if (quantity > stock) {
        throw new Error(`Sản phẩm ${item.name} không đủ tồn kho`);
      }

      const promotionState = partController.getPromotionState(item.price, item.discount_price, item.has_promotion);
      totalAmount += promotionState.finalPrice * quantity;
    }

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (customer_id, total_amount, status, shipping_address)
       VALUES (?, ?, 'Pending', ?)`,
      [customer.id, totalAmount, shippingAddress || customer.address || null]
    );

    for (const item of items) {
      const quantity = Number(item.quantity);
      const promotionState = partController.getPromotionState(item.price, item.discount_price, item.has_promotion);

      await connection.execute(
        `INSERT INTO order_details (order_id, part_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, item.part_id, quantity, promotionState.finalPrice]
      );

      await connection.execute(
        'UPDATE parts SET stock = stock - ? WHERE id = ?',
        [quantity, item.part_id]
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
  requireCustomer(authUser);

  const customer = await findCustomerByUserId(authUser.id);
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

  const statusLabels = {
    Pending: 'Cho thanh toan',
    Processing: 'Đang xử lý',
    Shipped: 'Đang giao',
    Delivered: 'Đã giao',
    Done: 'Hoàn tất',
    Cancelled: 'Đã hủy',
  };

  return rows.map((row) => ({
    id: row.id,
    code: `ORD-${String(row.id).padStart(4, '0')}`,
    orderDate: new Date(row.order_date).toISOString().slice(0, 10),
    totalAmount: Number(row.total_amount),
    status: statusLabels[row.status] || row.status,
    shippingAddress: row.shipping_address,
  }));
}

module.exports = {
  addToCart,
  checkoutCart,
  getCartCount,
  getCartDetail,
  getShopHomeData,
  getShopProductDetail,
  listCustomerOrders,
  removeCartItem,
  updateCartItem,
};
