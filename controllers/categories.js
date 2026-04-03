const { query, queryOne } = require('../utils/db');

function normalizeCategoryPayload(payload = {}) {
  const name = String(payload.name || '').trim();
  const description = String(payload.description || '').trim();
  const image = String(payload.image || '').trim();

  if (!name) {
    throw new Error('Tên danh mục không được để trống');
  }

  return {
    name,
    description: description || null,
    image: image || null,
  };
}

async function listCategories() {
  return query(
    `SELECT c.id, c.name, c.description, c.image, COUNT(p.id) AS count
     FROM categories c
     LEFT JOIN parts p ON p.category_id = c.id
     GROUP BY c.id, c.name, c.description, c.image
     ORDER BY c.id ASC`
  );
}

async function findCategoryById(id) {
  return queryOne('SELECT id, name, description, image FROM categories WHERE id = ? LIMIT 1', [id]);
}

async function createCategory(payload) {
  const data = normalizeCategoryPayload(payload);
  const result = await query(
    'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
    [data.name, data.description, data.image]
  );
  return findCategoryById(result.insertId);
}

async function updateCategory(id, payload) {
  const current = await findCategoryById(id);
  if (!current) {
    return null;
  }

  const data = normalizeCategoryPayload(payload);
  await query(
    'UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?',
    [data.name, data.description, data.image === null ? current.image : data.image, id]
  );
  return findCategoryById(id);
}

async function deleteCategory(id) {
  const result = await query('DELETE FROM categories WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createCategory,
  deleteCategory,
  findCategoryById,
  listCategories,
  updateCategory,
};
