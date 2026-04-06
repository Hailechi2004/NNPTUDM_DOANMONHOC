const bcrypt = require('bcrypt');
const { pool, query, queryOne } = require('../utils/db');

async function getRoleIdByName(roleName) {
  const role = await queryOne('SELECT id FROM roles WHERE name = ? LIMIT 1', [roleName]);
  return role ? role.id : null;
}

async function listUsers() {
  const rows = await query(
    `SELECT u.id, u.username, u.email, u.full_name, u.avatar, u.status, r.name AS role
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     ORDER BY u.id ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    avatar: row.avatar,
    role: row.role,
    status: row.status,
  }));
}

async function findUserById(id) {
  const row = await queryOne(
    `SELECT u.id, u.username, u.email, u.full_name, u.avatar, u.status, r.name AS role
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [id]
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    fullName: row.full_name,
    email: row.email,
    avatar: row.avatar,
    role: row.role,
    status: row.status,
  };
}

async function ensureCustomerProfile(connection, userId, fullName) {
  const [existingRows] = await connection.execute(
    'SELECT id FROM customers WHERE user_id = ? LIMIT 1',
    [userId]
  );

  if (existingRows.length === 0) {
    await connection.execute(
      `INSERT INTO customers (user_id, full_name, phone, address, loyalty_points)
       VALUES (?, ?, NULL, NULL, 0)`,
      [userId, fullName]
    );
  } else {
    await connection.execute('UPDATE customers SET full_name = ? WHERE user_id = ?', [fullName, userId]);
  }
}

async function createUser(payload) {
  const roleId = await getRoleIdByName(payload.role || 'Customer');
  if (!roleId) {
    throw new Error('Role khong hop le');
  }

  const passwordHash = await bcrypt.hash(payload.password || '123456', 10);
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.execute(
      `INSERT INTO users (username, password_hash, email, role_id, full_name, avatar, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.username,
        passwordHash,
        payload.email,
        roleId,
        payload.fullName,
        payload.avatar || null,
        payload.status || 'Active',
      ]
    );

    if ((payload.role || 'Customer') === 'Customer') {
      await ensureCustomerProfile(connection, result.insertId, payload.fullName);
    }

    await connection.commit();
    return findUserById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function updateUser(id, payload) {
  const roleId = await getRoleIdByName(payload.role);
  if (!roleId) {
    throw new Error('Role khong hop le');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute(
      `UPDATE users
       SET username = ?, email = ?, role_id = ?, full_name = ?, status = ?
       WHERE id = ?`,
      [payload.username, payload.email, roleId, payload.fullName, payload.status, id]
    );

    if (payload.role === 'Customer') {
      await ensureCustomerProfile(connection, id, payload.fullName);
    }

    await connection.commit();
    return findUserById(id);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function deleteUser(id) {
  const result = await query('DELETE FROM users WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createUser,
  deleteUser,
  ensureCustomerProfile,
  findUserById,
  getRoleIdByName,
  listUsers,
  updateUser,
};
