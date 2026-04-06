const { query, queryOne } = require('../utils/db');

async function listSuppliers() {
  const rows = await query(
    `SELECT id, name, contact_name, email, phone, address
     FROM suppliers
     ORDER BY id ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    contact: row.phone || row.contact_name || '',
    email: row.email,
    address: row.address,
    contactName: row.contact_name,
    phone: row.phone,
  }));
}

async function findSupplierById(id) {
  const row = await queryOne(
    'SELECT id, name, contact_name, email, phone, address FROM suppliers WHERE id = ? LIMIT 1',
    [id]
  );
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    contact: row.phone || row.contact_name || '',
    email: row.email,
    address: row.address,
    contactName: row.contact_name,
    phone: row.phone,
  };
}

async function createSupplier(payload) {
  const phone = payload.phone || payload.contact || null;
  const result = await query(
    `INSERT INTO suppliers (name, contact_name, email, phone, address)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.name, payload.contactName || null, payload.email || null, phone, payload.address || null]
  );
  return findSupplierById(result.insertId);
}

async function updateSupplier(id, payload) {
  const phone = payload.phone || payload.contact || null;
  await query(
    `UPDATE suppliers
     SET name = ?, contact_name = ?, email = ?, phone = ?, address = ?
     WHERE id = ?`,
    [payload.name, payload.contactName || null, payload.email || null, phone, payload.address || null, id]
  );
  return findSupplierById(id);
}

async function deleteSupplier(id) {
  const result = await query('DELETE FROM suppliers WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createSupplier,
  deleteSupplier,
  findSupplierById,
  listSuppliers,
  updateSupplier,
};
