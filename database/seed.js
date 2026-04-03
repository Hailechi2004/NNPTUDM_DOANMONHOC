const bcrypt = require('bcrypt');
const { pool } = require('../utils/db');

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [statusColumnRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'users'
         AND COLUMN_NAME = 'status'`
    );

    if (!statusColumnRows[0].count) {
      await connection.execute(
        "ALTER TABLE users ADD COLUMN status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active' AFTER avatar"
      );
    }

    const [promotionDescriptionRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'promotions'
         AND COLUMN_NAME = 'description'`
    );

    if (!promotionDescriptionRows[0].count) {
      await connection.execute(
        'ALTER TABLE promotions ADD COLUMN description TEXT NULL AFTER discount_value'
      );
    }

    const [partPromotionRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'parts'
         AND COLUMN_NAME = 'promotion_id'`
    );

    if (!partPromotionRows[0].count) {
      await connection.execute('ALTER TABLE parts ADD COLUMN promotion_id BIGINT UNSIGNED NULL AFTER supplier_id');
      await connection.execute(
        `ALTER TABLE parts
         ADD CONSTRAINT fk_parts_promotion
         FOREIGN KEY (promotion_id) REFERENCES promotions(id)
         ON UPDATE CASCADE
         ON DELETE SET NULL`
      );
    }

    const [cartAppliedPromotionRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'cart_items'
         AND COLUMN_NAME = 'applied_promotion_id'`
    );

    if (!cartAppliedPromotionRows[0].count) {
      await connection.execute('ALTER TABLE cart_items ADD COLUMN applied_promotion_id BIGINT UNSIGNED NULL AFTER quantity');
      await connection.execute(
        `ALTER TABLE cart_items
         ADD CONSTRAINT fk_cart_items_promotion
         FOREIGN KEY (applied_promotion_id) REFERENCES promotions(id)
         ON UPDATE CASCADE
         ON DELETE SET NULL`
      );
    }

    const [orderDetailPromotionCodeRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'order_details'
         AND COLUMN_NAME = 'promotion_code'`
    );
    if (!orderDetailPromotionCodeRows[0].count) {
      await connection.execute('ALTER TABLE order_details ADD COLUMN promotion_code VARCHAR(50) NULL AFTER unit_price');
    }

    const [orderDetailDiscountRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'order_details'
         AND COLUMN_NAME = 'discount_amount'`
    );
    if (!orderDetailDiscountRows[0].count) {
      await connection.execute('ALTER TABLE order_details ADD COLUMN discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER promotion_code');
    }

    const [orderDetailProductNameRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'order_details'
         AND COLUMN_NAME = 'product_name'`
    );
    if (!orderDetailProductNameRows[0].count) {
      await connection.execute('ALTER TABLE order_details ADD COLUMN product_name VARCHAR(150) NULL AFTER discount_amount');
    }

    const [orderDetailProductImageRows] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = 'order_details'
         AND COLUMN_NAME = 'product_image'`
    );
    if (!orderDetailProductImageRows[0].count) {
      await connection.execute('ALTER TABLE order_details ADD COLUMN product_image VARCHAR(255) NULL AFTER product_name');
    }

    await connection.execute(
      "ALTER TABLE orders MODIFY COLUMN status ENUM('Pending','Processing','Shipped','Delivered','Done','Cancelled') NOT NULL DEFAULT 'Pending'"
    );

    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of [
      'cart_items',
      'carts',
      'reviews',
      'order_details',
      'orders',
      'customers',
      'users',
      'parts',
      'suppliers',
      'categories',
      'promotions',
      'roles',
    ]) {
      await connection.execute(`DELETE FROM ${table}`);
      await connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
    }
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');

    const [roleResult] = await connection.query(
      `INSERT INTO roles (name, description) VALUES
      ('Admin', 'Quan tri he thong'),
      ('Staff', 'Nhan vien quan ly don hang va san pham'),
      ('Customer', 'Khach hang mua phu tung')`
    );

    const adminRoleId = roleResult.insertId;
    const staffRoleId = adminRoleId + 1;
    const customerRoleId = adminRoleId + 2;

    const passwordHash = await bcrypt.hash('123456', 10);

    await connection.query(
      `INSERT INTO categories (name, description, image) VALUES
      ('Lop xe', 'Cac dong lop xe chinh hang cho nhieu dong xe.', 'https://picsum.photos/seed/category-tire/400/300'),
      ('Den pha', 'He thong den pha, den LED va den suong mu.', 'https://picsum.photos/seed/category-light/400/300'),
      ('Bugi', 'Phu tung bugi cho dong co xang.', 'https://picsum.photos/seed/category-spark/400/300'),
      ('Dau nhot', 'Dau nhot dong co va cac san pham cham soc may.', 'https://picsum.photos/seed/category-oil/400/300')`
    );

    await connection.query(
      `INSERT INTO suppliers (name, contact_name, email, phone, address) VALUES
      ('Cong ty Phu tung ABC', 'Tran Minh Hoang', 'abc@parts.com', '0901234567', 'TP.HCM'),
      ('Nha phan phoi XYZ', 'Le Thao Nhi', 'xyz@distributor.com', '0907654321', 'Ha Noi'),
      ('Michelin Viet Nam', 'Nguyen Tuan Kiet', 'sales@michelin.vn', '02839393939', 'Binh Duong')`
    );

    await connection.query(
      `INSERT INTO promotions (code, discount_type, discount_value, description, start_date, end_date, is_active) VALUES
      ('HUTECH20', 'Percentage', 20, 'Giam 20% cho khach dat hang trong thang 4.', '2026-04-01 00:00:00', '2026-05-01 23:59:59', TRUE),
      ('SALE500K', 'FixedAmount', 500000, 'Giam truc tiep 500000 cho don hang du dieu kien.', '2026-04-01 00:00:00', '2026-04-30 23:59:59', TRUE),
      ('OLDPROMO', 'Percentage', 10, 'Ma cu da het han.', '2026-01-01 00:00:00', '2026-02-01 23:59:59', FALSE)`
    );

    await connection.query(
      `INSERT INTO users (username, password_hash, email, role_id, full_name, avatar, status) VALUES
      ('admin', ?, 'admin@hutech.edu.vn', ?, 'Admin HUTECH', 'https://picsum.photos/seed/admin/200/200', 'Active'),
      ('staff01', ?, 'staff01@hutech.edu.vn', ?, 'Nhan vien HUTECH', 'https://picsum.photos/seed/staff/200/200', 'Active'),
      ('customer01', ?, 'customer01@gmail.com', ?, 'Nguyen Van A', 'https://picsum.photos/seed/customer1/200/200', 'Active'),
      ('customer02', ?, 'customer02@gmail.com', ?, 'Tran Thi B', 'https://picsum.photos/seed/customer2/200/200', 'Active'),
      ('customer03', ?, 'customer03@gmail.com', ?, 'Le Van C', 'https://picsum.photos/seed/customer3/200/200', 'Inactive')`,
      [
        passwordHash,
        adminRoleId,
        passwordHash,
        staffRoleId,
        passwordHash,
        customerRoleId,
        passwordHash,
        customerRoleId,
        passwordHash,
        customerRoleId,
      ]
    );

    await connection.query(
      `INSERT INTO customers (user_id, full_name, phone, address, loyalty_points) VALUES
      (3, 'Nguyen Van A', '0909000001', '123 Le Loi, Quan 1, TP.HCM', 120),
      (4, 'Tran Thi B', '0909000002', '456 Cach Mang Thang 8, Quan 3, TP.HCM', 80),
      (5, 'Le Van C', '0909000003', '789 Vo Van Ngan, Thu Duc, TP.HCM', 30)`
    );

    await connection.query(
      `INSERT INTO parts
      (name, price, discount_price, has_promotion, stock, description, image, category_id, supplier_id, promotion_id)
      VALUES
      ('Lop Michelin Pilot Sport 4', 3500000, 3200000, TRUE, 12, 'Lop hieu suat cao cho sedan va hatchback.', 'https://picsum.photos/seed/tire/400/400', 1, 3, 1),
      ('Bugi NGK Iridium', 150000, 120000, TRUE, 50, 'Bugi danh lua ben bi, ho tro tiet kiem nhien lieu.', 'https://picsum.photos/seed/sparkplug/400/400', 3, 1, 1),
      ('Den pha LED Philips', 1200000, 990000, TRUE, 20, 'Den pha LED trang sang, do ben cao.', 'https://picsum.photos/seed/headlight/400/400', 2, 2, 2),
      ('Dau nhot Castrol Edge 5W-30', 850000, NULL, FALSE, 30, 'Dau nhot tong hop toan phan cho dong co xang.', 'https://picsum.photos/seed/oil/400/400', 4, 1, NULL),
      ('Ma phanh Brembo', 2200000, 1950000, TRUE, 8, 'Bo ma phanh do ben cao, hieu suat phanh on dinh.', 'https://picsum.photos/seed/brake/400/400', 1, 2, 2),
      ('Loc gio K&N', 1800000, NULL, FALSE, 4, 'Loc gio nang cap luong khi nap cho dong co.', 'https://picsum.photos/seed/filter/400/400', 4, 1, NULL)`
    );

    await connection.query(
      `INSERT INTO orders
      (customer_id, order_date, total_amount, status, shipping_address, promotion_id)
      VALUES
      (1, '2026-04-01 10:00:00', 2656000, 'Delivered', '123 Le Loi, Quan 1, TP.HCM', 1),
      (2, '2026-04-02 09:30:00', 1450000, 'Processing', '456 Cach Mang Thang 8, Quan 3, TP.HCM', 2),
      (3, '2026-04-02 14:00:00', 850000, 'Pending', '789 Vo Van Ngan, Thu Duc, TP.HCM', NULL)`
    );

    await connection.query(
      `INSERT INTO order_details (order_id, part_id, quantity, unit_price, promotion_code, discount_amount, product_name, product_image) VALUES
      (1, 1, 1, 2560000, 'HUTECH20', 640000, 'Lop Michelin Pilot Sport 4', 'https://picsum.photos/seed/tire/400/400'),
      (1, 2, 1, 96000, 'HUTECH20', 24000, 'Bugi NGK Iridium', 'https://picsum.photos/seed/sparkplug/400/400'),
      (2, 5, 1, 1450000, 'SALE500K', 500000, 'Ma phanh Brembo', 'https://picsum.photos/seed/brake/400/400'),
      (3, 4, 1, 850000, NULL, 0, 'Dau nhot Castrol Edge 5W-30', 'https://picsum.photos/seed/oil/400/400')`
    );

    await connection.query(
      `INSERT INTO carts (customer_id) VALUES
      (1), (2), (3)`
    );

    await connection.query(
      `INSERT INTO cart_items (cart_id, part_id, quantity) VALUES
      (1, 3, 1),
      (1, 4, 2),
      (2, 1, 1),
      (3, 2, 4)`
    );

    await connection.query(
      `INSERT INTO reviews (customer_id, part_id, rating, comment, review_date) VALUES
      (1, 1, 5, 'Lop bam duong rat tot, chay em.', '2026-04-01 20:00:00'),
      (2, 5, 4, 'Ma phanh chat luong, dong goi can than.', '2026-04-02 18:00:00'),
      (3, 4, 5, 'Dau nhot dung on, xe van hanh muot.', '2026-04-02 19:00:00')`
    );

    await connection.commit();
    console.log('Seeded MySQL demo data successfully.');
    console.log('Admin login: admin / 123456');
  } catch (error) {
    await connection.rollback();
    console.error(error);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed();
