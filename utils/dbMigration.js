const { pool } = require('./db');

let schemaPromise = null;

async function hasColumn(connection, tableName, columnName) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [tableName, columnName]
  );

  return Number(rows[0].count || 0) > 0;
}

async function ensureAppSchema() {
  if (schemaPromise) {
    return schemaPromise;
  }

  schemaPromise = (async () => {
    const connection = await pool.getConnection();
    try {
      if (!(await hasColumn(connection, 'cart_items', 'applied_promotion_id'))) {
        await connection.execute('ALTER TABLE cart_items ADD COLUMN applied_promotion_id BIGINT UNSIGNED NULL AFTER quantity');
        await connection.execute(
          `ALTER TABLE cart_items
           ADD CONSTRAINT fk_cart_items_promotion
           FOREIGN KEY (applied_promotion_id) REFERENCES promotions(id)
           ON UPDATE CASCADE
           ON DELETE SET NULL`
        );
      }

      if (!(await hasColumn(connection, 'order_details', 'promotion_code'))) {
        await connection.execute('ALTER TABLE order_details ADD COLUMN promotion_code VARCHAR(50) NULL AFTER unit_price');
      }

      if (!(await hasColumn(connection, 'order_details', 'discount_amount'))) {
        await connection.execute('ALTER TABLE order_details ADD COLUMN discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER promotion_code');
      }

      if (!(await hasColumn(connection, 'order_details', 'product_name'))) {
        await connection.execute('ALTER TABLE order_details ADD COLUMN product_name VARCHAR(150) NULL AFTER discount_amount');
      }

      if (!(await hasColumn(connection, 'order_details', 'product_image'))) {
        await connection.execute('ALTER TABLE order_details ADD COLUMN product_image VARCHAR(255) NULL AFTER product_name');
      }
    } finally {
      connection.release();
    }
  })();

  return schemaPromise;
}

module.exports = {
  ensureAppSchema,
};
