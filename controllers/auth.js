const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query, queryOne, pool } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'HUTECH';

function buildAuthPayload(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    fullName: user.full_name,
    role: user.role_name,
    status: user.status,
  };
}

function signToken(user) {
  return jwt.sign(buildAuthPayload(user), JWT_SECRET, {
    expiresIn: '1h',
  });
}

async function findUserForAuth(username) {
  return queryOne(
    `SELECT u.id, u.username, u.email, u.password_hash, u.full_name, u.status, r.name AS role_name
     FROM users u
     INNER JOIN roles r ON r.id = u.role_id
     WHERE u.username = ? OR u.email = ?
     LIMIT 1`,
    [username, username]
  );
}

async function registerCustomer(payload) {
  const existing = await queryOne(
    'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
    [payload.username, payload.email]
  );

  if (existing) {
    throw new Error('Tên đăng nhập hoặc email đã tồn tại');
  }

  const passwordHash = await bcrypt.hash(payload.password, 10);
  const customerRole = await queryOne('SELECT id FROM roles WHERE name = ? LIMIT 1', ['Customer']);
  if (!customerRole) {
    throw new Error('Không tìm thấy quyền Customer trong cơ sở dữ liệu');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userResult] = await connection.execute(
      `INSERT INTO users (username, password_hash, email, role_id, full_name, avatar, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.username,
        passwordHash,
        payload.email,
        customerRole.id,
        payload.fullName,
        payload.avatar || null,
        'Active',
      ]
    );

    await connection.execute(
      `INSERT INTO customers (user_id, full_name, phone, address, loyalty_points)
       VALUES (?, ?, ?, ?, 0)`,
      [userResult.insertId, payload.fullName, payload.phone || null, payload.address || null]
    );

    await connection.execute(
      `INSERT INTO carts (customer_id)
       SELECT id
       FROM customers
       WHERE user_id = ?`,
      [userResult.insertId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }

  return findUserForAuth(payload.username);
}

async function loginWithPassword(username, password) {
  const user = await findUserForAuth(username);
  if (!user) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    return null;
  }

  return user;
}

module.exports = {
  buildAuthPayload,
  findUserForAuth,
  loginWithPassword,
  registerCustomer,
  signToken,
};
