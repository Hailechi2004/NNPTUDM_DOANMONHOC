const { query, queryOne } = require('../utils/db');

function getPromotionState(price, discountPrice, hasPromotion) {
  const parsedPrice = Number(price || 0);
  const parsedDiscount = discountPrice === null || discountPrice === undefined || discountPrice === ''
    ? null
    : Number(discountPrice);
  const showPromotion = Boolean(hasPromotion) && parsedDiscount !== null && parsedDiscount > 0 && parsedDiscount < parsedPrice;

  return {
    price: parsedPrice,
    discountPrice: parsedDiscount,
    finalPrice: showPromotion ? parsedDiscount : parsedPrice,
    originalPrice: showPromotion ? parsedPrice : null,
    showPromotion,
    discountPercent: showPromotion && parsedPrice > 0
      ? Math.round((1 - (parsedDiscount / parsedPrice)) * 100)
      : 0,
  };
}

function normalizePartPayload(payload) {
  const price = Number(payload.price || 0);
  const stock = Number(payload.stock || 0);
  const rawDiscount = payload.discountPrice === '' || payload.discountPrice === undefined || payload.discountPrice === null
    ? null
    : Number(payload.discountPrice);
  const wantsPromotion = payload.hasPromotion === 'on' || payload.hasPromotion === 'true';

  if (!payload.name || !String(payload.name).trim()) {
    throw new Error('Tên phụ tùng không được để trống');
  }

  if (!Number.isFinite(price) || price < 0) {
    throw new Error('Giá bán không hợp lệ');
  }

  if (!Number.isFinite(stock) || stock < 0) {
    throw new Error('Số lượng tồn kho không hợp lệ');
  }

  if (rawDiscount !== null && (!Number.isFinite(rawDiscount) || rawDiscount < 0)) {
    throw new Error('Giá khuyến mãi không hợp lệ');
  }

  if (rawDiscount !== null && rawDiscount > price) {
    throw new Error('Giá khuyến mãi không được cao hơn giá gốc');
  }

  const promotionState = getPromotionState(price, rawDiscount, wantsPromotion);

  return {
    name: String(payload.name).trim(),
    categoryId: payload.categoryId ? Number(payload.categoryId) : null,
    supplierId: payload.supplierId ? Number(payload.supplierId) : null,
    promotionId: promotionState.showPromotion && payload.promotionId ? Number(payload.promotionId) : null,
    price,
    discountPrice: promotionState.showPromotion ? promotionState.discountPrice : null,
    hasPromotion: promotionState.showPromotion,
    stock,
    description: payload.description || null,
    image: payload.image || null,
  };
}

function mapPartRow(row) {
  const promotionState = getPromotionState(row.price, row.discount_price, row.has_promotion);
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    supplierId: row.supplier_id,
    promotionId: row.promotion_id,
    category: row.category_name || 'Chưa phân loại',
    supplier: row.supplier_name || 'Chưa gán nhà cung cấp',
    promotionCode: row.promotion_code || '',
    price: promotionState.price,
    discountPrice: promotionState.discountPrice,
    finalPrice: promotionState.finalPrice,
    originalPrice: promotionState.originalPrice,
    showPromotion: promotionState.showPromotion,
    discountPercent: promotionState.discountPercent,
    stock: Number(row.stock),
    image: row.image,
    description: row.description,
    hasPromotion: Boolean(row.has_promotion),
  };
}

function buildListPartsQuery(filters = {}) {
  const where = [];
  const params = [];

  if (filters.categoryId) {
    where.push('p.category_id = ?');
    params.push(Number(filters.categoryId));
  }

  if (filters.search) {
    where.push('(p.name LIKE ? OR c.name LIKE ? OR s.name LIKE ?)');
    params.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
  }

  if (filters.stockFilter === 'out') {
    where.push('p.stock = 0');
  } else if (filters.stockFilter === 'low') {
    where.push('p.stock BETWEEN 1 AND 5');
  } else if (filters.stockFilter === 'high') {
    where.push('p.stock > 20');
  } else if (filters.stockFilter === 'available') {
    where.push('p.stock > 0');
  }

  let orderBy = 'p.id DESC';
  if (filters.sort === 'price-asc') {
    orderBy = 'p.price ASC, p.id DESC';
  } else if (filters.sort === 'price-desc') {
    orderBy = 'p.price DESC, p.id DESC';
  } else if (filters.sort === 'stock-desc') {
    orderBy = 'p.stock DESC, p.id DESC';
  }

  return {
    sql: `SELECT
       p.id, p.name, p.price, p.discount_price, p.has_promotion, p.stock, p.description, p.image,
       p.category_id, p.supplier_id, p.promotion_id,
       c.name AS category_name, s.name AS supplier_name, pr.code AS promotion_code
     FROM parts p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     LEFT JOIN promotions pr ON pr.id = p.promotion_id
     ${where.length > 0 ? `WHERE ${where.join(' AND ')}` : ''}
     ORDER BY ${orderBy}`,
    params,
  };
}

async function listParts(filters = {}) {
  const statement = buildListPartsQuery(filters);
  const rows = await query(statement.sql, statement.params);

  return rows.map(mapPartRow);
}

async function findPartById(id) {
  const row = await queryOne(
    `SELECT
       p.id, p.name, p.price, p.discount_price, p.has_promotion, p.stock, p.description, p.image,
       p.category_id, p.supplier_id, p.promotion_id,
       c.name AS category_name, s.name AS supplier_name, pr.code AS promotion_code
     FROM parts p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN suppliers s ON s.id = p.supplier_id
     LEFT JOIN promotions pr ON pr.id = p.promotion_id
     WHERE p.id = ?
     LIMIT 1`,
    [id]
  );

  return row ? mapPartRow(row) : null;
}

async function findPromotionForPart(partId) {
  return queryOne(
    `SELECT pr.id, pr.code, pr.discount_type, pr.discount_value, pr.is_active, pr.end_date
     FROM parts p
     INNER JOIN promotions pr ON pr.id = p.promotion_id
     WHERE p.id = ?
     LIMIT 1`,
    [partId]
  );
}

function calculatePromotionPrice(price, promotion) {
  const basePrice = Number(price || 0);
  if (!promotion) {
    return basePrice;
  }

  if (promotion.discount_type === 'Percentage') {
    return Math.max(0, basePrice - ((basePrice * Number(promotion.discount_value || 0)) / 100));
  }

  return Math.max(0, basePrice - Number(promotion.discount_value || 0));
}

async function createPart(payload) {
  const data = normalizePartPayload(payload);
  const result = await query(
    `INSERT INTO parts
     (name, price, discount_price, has_promotion, stock, description, image, category_id, supplier_id, promotion_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.name,
      data.price,
      data.discountPrice,
      data.hasPromotion,
      data.stock,
      data.description,
      data.image,
      data.categoryId,
      data.supplierId,
      data.promotionId,
    ]
  );

  return findPartById(result.insertId);
}

async function updatePart(id, payload) {
  const data = normalizePartPayload(payload);
  await query(
    `UPDATE parts
     SET name = ?, price = ?, discount_price = ?, has_promotion = ?, stock = ?, description = ?, image = ?, category_id = ?, supplier_id = ?, promotion_id = ?
     WHERE id = ?`,
    [
      data.name,
      data.price,
      data.discountPrice,
      data.hasPromotion,
      data.stock,
      data.description,
      data.image,
      data.categoryId,
      data.supplierId,
      data.promotionId,
      id,
    ]
  );

  return findPartById(id);
}

async function getPartDeleteBlockers(id) {
  const [orderUsage, cartUsage] = await Promise.all([
    queryOne(
      `SELECT COUNT(*) AS total
       FROM order_details
       WHERE part_id = ?`,
      [id]
    ),
    queryOne(
      `SELECT COUNT(*) AS total
       FROM cart_items
       WHERE part_id = ?`,
      [id]
    ),
  ]);

  return {
    orderCount: Number(orderUsage ? orderUsage.total : 0),
    cartCount: Number(cartUsage ? cartUsage.total : 0),
  };
}

async function deletePart(id) {
  const blockers = await getPartDeleteBlockers(id);
  if (blockers.orderCount > 0) {
    const error = new Error('Khong the xoa phu tung nay vi da xuat hien trong don hang. Hay giu lai de bao toan lich su giao dich.');
    error.status = 409;
    error.code = 'PART_IN_ORDERS';
    throw error;
  }

  if (blockers.cartCount > 0) {
    const error = new Error('Khong the xoa phu tung nay vi dang ton tai trong gio hang cua khach hang.');
    error.status = 409;
    error.code = 'PART_IN_CARTS';
    throw error;
  }

  const result = await query('DELETE FROM parts WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function getPartFormOptions() {
  const categories = await query('SELECT id, name FROM categories ORDER BY name ASC');
  const suppliers = await query('SELECT id, name FROM suppliers ORDER BY name ASC');
  const promotions = await query(
    `SELECT id, code, discount_type, discount_value
     FROM promotions
     WHERE is_active = TRUE
     ORDER BY code ASC`
  );

  return {
    categories,
    suppliers,
    promotions,
  };
}

module.exports = {
  buildListPartsQuery,
  calculatePromotionPrice,
  createPart,
  deletePart,
  findPartById,
  findPromotionForPart,
  getPartDeleteBlockers,
  getPartFormOptions,
  getPromotionState,
  listParts,
  mapPartRow,
  normalizePartPayload,
  updatePart,
};
