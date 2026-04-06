const { query, queryOne } = require('../utils/db');

function mapPromotionRow(row) {
  const isExpired = row.end_date && new Date(row.end_date).getTime() < Date.now();
  return {
    id: row.id,
    code: row.code,
    discount: row.discount_type === 'Percentage'
      ? `${Number(row.discount_value)}%`
      : `${Number(row.discount_value).toLocaleString('vi-VN')} đ`,
    type: row.discount_type === 'FixedAmount' ? 'Fixed' : 'Percentage',
    status: !row.is_active ? 'Disabled' : isExpired ? 'Expired' : 'Active',
    description: row.description || '',
    startDate: row.start_date,
    endDate: row.end_date,
    discountValue: Number(row.discount_value),
  };
}

function parseDiscountValue(payload) {
  const rawValue = String(payload.discountValue || payload.discount || payload.value || '0').replace(/[^0-9.]/g, '');
  return Number(rawValue || 0);
}

function toDbDiscountType(type) {
  if (type === 'Fixed' || type === 'FixedAmount') {
    return 'FixedAmount';
  }
  return 'Percentage';
}

async function listPromotions() {
  const rows = await query(
    `SELECT id, code, discount_type, discount_value, description, start_date, end_date, is_active
     FROM promotions
     ORDER BY id ASC`
  );
  return rows.map(mapPromotionRow);
}

async function findPromotionById(id) {
  const row = await queryOne(
    `SELECT id, code, discount_type, discount_value, description, start_date, end_date, is_active
     FROM promotions
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return row ? mapPromotionRow(row) : null;
}

async function createPromotion(payload) {
  const result = await query(
    `INSERT INTO promotions (code, discount_type, discount_value, description, start_date, end_date, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      String(payload.code || '').toUpperCase(),
      toDbDiscountType(payload.discountType || payload.type),
      parseDiscountValue(payload),
      payload.description || null,
      payload.startDate || new Date(),
      payload.endDate || new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)),
      payload.isActive !== undefined ? Boolean(payload.isActive) : payload.status !== 'Disabled',
    ]
  );
  return findPromotionById(result.insertId);
}

async function updatePromotion(id, payload) {
  await query(
    `UPDATE promotions
     SET code = ?, discount_type = ?, discount_value = ?, description = ?, is_active = ?
     WHERE id = ?`,
    [
      String(payload.code || '').toUpperCase(),
      toDbDiscountType(payload.discountType || payload.type),
      parseDiscountValue(payload),
      payload.description || null,
      payload.isActive !== undefined ? Boolean(payload.isActive) : payload.status !== 'Disabled',
      id,
    ]
  );
  return findPromotionById(id);
}

async function listActivePromotions() {
  const rows = await query(
    `SELECT id, code, discount_type, discount_value, description, start_date, end_date, is_active
     FROM promotions
     WHERE is_active = TRUE
     ORDER BY code ASC`
  );
  return rows.map(mapPromotionRow);
}

async function deletePromotion(id) {
  const result = await query('DELETE FROM promotions WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createPromotion,
  deletePromotion,
  findPromotionById,
  listActivePromotions,
  listPromotions,
  mapPromotionRow,
  parseDiscountValue,
  toDbDiscountType,
  updatePromotion,
};
