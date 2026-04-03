DROP DATABASE IF EXISTS nnptudm_22dthe9;
CREATE DATABASE nnptudm_22dthe9 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nnptudm_22dthe9;

CREATE TABLE roles (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  role_id BIGINT UNSIGNED NOT NULL,
  full_name VARCHAR(120) NULL,
  avatar VARCHAR(255) NULL,
  status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE categories (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  image VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE suppliers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  contact_name VARCHAR(120) NULL,
  email VARCHAR(120) NULL,
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL
) ENGINE=InnoDB;

CREATE TABLE parts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  discount_price DECIMAL(12,2) NULL,
  has_promotion BOOLEAN NOT NULL DEFAULT FALSE,
  stock INT NOT NULL DEFAULT 0,
  description TEXT NULL,
  image VARCHAR(255) NULL,
  category_id BIGINT UNSIGNED NULL,
  supplier_id BIGINT UNSIGNED NULL,
  promotion_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_parts_price CHECK (price >= 0),
  CONSTRAINT chk_parts_discount_price CHECK (discount_price IS NULL OR discount_price >= 0),
  CONSTRAINT chk_parts_stock CHECK (stock >= 0),
  CONSTRAINT fk_parts_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_parts_supplier
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL,
  CONSTRAINT fk_parts_promotion
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE customers (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  phone VARCHAR(20) NULL,
  address VARCHAR(255) NULL,
  loyalty_points INT NOT NULL DEFAULT 0,
  CONSTRAINT chk_customers_loyalty_points CHECK (loyalty_points >= 0),
  CONSTRAINT fk_customers_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE promotions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  discount_type ENUM('Percentage', 'FixedAmount') NOT NULL,
  discount_value DECIMAL(12,2) NOT NULL,
  description TEXT NULL,
  start_date DATETIME NULL,
  end_date DATETIME NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT chk_promotions_discount_value CHECK (discount_value >= 0)
) ENGINE=InnoDB;

CREATE TABLE orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(12,2) NOT NULL,
  status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Done', 'Cancelled') NOT NULL DEFAULT 'Pending',
  shipping_address VARCHAR(255) NULL,
  promotion_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_orders_total_amount CHECK (total_amount >= 0),
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_orders_promotion
    FOREIGN KEY (promotion_id) REFERENCES promotions(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE order_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id BIGINT UNSIGNED NOT NULL,
  part_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  CONSTRAINT chk_order_details_quantity CHECK (quantity > 0),
  CONSTRAINT chk_order_details_unit_price CHECK (unit_price >= 0),
  CONSTRAINT fk_order_details_order
    FOREIGN KEY (order_id) REFERENCES orders(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_order_details_part
    FOREIGN KEY (part_id) REFERENCES parts(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE carts (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_carts_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE cart_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  cart_id BIGINT UNSIGNED NOT NULL,
  part_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  CONSTRAINT uq_cart_items_cart_part UNIQUE (cart_id, part_id),
  CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0),
  CONSTRAINT fk_cart_items_cart
    FOREIGN KEY (cart_id) REFERENCES carts(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_cart_items_part
    FOREIGN KEY (part_id) REFERENCES parts(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE reviews (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT UNSIGNED NOT NULL,
  part_id BIGINT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NULL,
  review_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT fk_reviews_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_part
    FOREIGN KEY (part_id) REFERENCES parts(id)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB;

INSERT INTO roles (name, description) VALUES
('Admin', 'Quan tri he thong'),
('Staff', 'Nhan vien quan ly don hang va san pham'),
('Customer', 'Khach hang mua phu tung');
