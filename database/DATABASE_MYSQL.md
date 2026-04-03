# Cau truc Database Do an Web Ban Phu Tung O To (HUTECH) - MySQL

Tai lieu nay mo ta cau truc database da duoc dieu chinh tu mau MongoDB de phu hop voi do an mon hoc cua chung ta khi su dung MySQL.

## 1. Tong quan

Database de xuat su dung ten:

`nnptudm_22dthe9`

Cong nghe:

- He quan tri co so du lieu: MySQL 8.0
- Bo ma: `utf8mb4`
- Engine: `InnoDB`

## 2. Danh sach bang

He thong chinh su dung 11 thuc the nghiep vu goc cua de tai:

1. `roles`
2. `users`
3. `categories`
4. `suppliers`
5. `parts`
6. `customers`
7. `promotions`
8. `orders`
9. `order_details`
10. `carts`
11. `reviews`

De phu hop voi MySQL va thiet ke chuan hoa, phan `Cart.items` trong MongoDB duoc tach thanh bang phu:

- `cart_items`

Bang nay la bang ky thuat can thiet trong mo hinh quan he, giup luu nhieu san pham trong mot gio hang.

## 3. Mo ta bang

### roles
- `id`: khoa chinh
- `name`: ten quyen, unique, vi du `Admin`, `Staff`, `Customer`
- `description`: mo ta quyen

### users
- `id`: khoa chinh
- `username`: ten dang nhap, unique
- `password_hash`: mat khau da ma hoa
- `email`: email, unique
- `role_id`: khoa ngoai sang `roles`
- `full_name`: ho ten
- `avatar`: duong dan anh dai dien
- `status`: `Active` hoac `Inactive`
- `created_at`, `updated_at`

### categories
- `id`: khoa chinh
- `name`: ten danh muc, unique
- `description`: mo ta danh muc
- `image`: hinh minh hoa

### suppliers
- `id`: khoa chinh
- `name`: ten nha cung cap
- `contact_name`: nguoi lien he
- `email`: email nha cung cap
- `phone`: so dien thoai
- `address`: dia chi

### parts
- `id`: khoa chinh
- `name`: ten phu tung
- `price`: gia goc
- `discount_price`: gia khuyen mai
- `has_promotion`: co dang giam gia hay khong
- `stock`: ton kho
- `description`: mo ta
- `image`: hinh anh
- `category_id`: khoa ngoai sang `categories`
- `supplier_id`: khoa ngoai sang `suppliers`
- `promotion_id`: khoa ngoai sang `promotions`, cho phep ap ma hoac huy ma tren tung san pham
- `created_at`, `updated_at`

### customers
- `id`: khoa chinh
- `user_id`: khoa ngoai sang `users`, unique
- `full_name`: ten khach hang
- `phone`: so dien thoai
- `address`: dia chi mac dinh
- `loyalty_points`: diem tich luy

### promotions
- `id`: khoa chinh
- `code`: ma khuyen mai, unique
- `discount_type`: `Percentage` hoac `FixedAmount`
- `discount_value`: gia tri giam
- `description`: mo ta chuong trinh khuyen mai
- `start_date`: ngay bat dau
- `end_date`: ngay ket thuc
- `is_active`: trang thai kich hoat

### orders
- `id`: khoa chinh
- `customer_id`: khoa ngoai sang `customers`
- `order_date`: ngay dat hang
- `total_amount`: tong tien
- `status`: `Pending`, `Processing`, `Shipped`, `Delivered`, `Done`, `Cancelled`
- `shipping_address`: dia chi giao hang
- `promotion_id`: khoa ngoai sang `promotions`, co the null
- `created_at`, `updated_at`

### order_details
- `id`: khoa chinh
- `order_id`: khoa ngoai sang `orders`
- `part_id`: khoa ngoai sang `parts`
- `quantity`: so luong mua
- `unit_price`: gia tai thoi diem mua

### carts
- `id`: khoa chinh
- `customer_id`: khoa ngoai sang `customers`, unique
- `created_at`, `updated_at`

### cart_items
- `id`: khoa chinh
- `cart_id`: khoa ngoai sang `carts`
- `part_id`: khoa ngoai sang `parts`
- `quantity`: so luong
- unique `(cart_id, part_id)` de tranh trung san pham trong cung mot gio

### reviews
- `id`: khoa chinh
- `customer_id`: khoa ngoai sang `customers`
- `part_id`: khoa ngoai sang `parts`
- `rating`: diem 1-5
- `comment`: nhan xet
- `review_date`: ngay danh gia

## 4. Ghi chu dieu chinh so voi mau

- Mau goc viet theo MongoDB/Mongoose, con do an hien tai cua chung ta can MySQL.
- `ObjectId` da duoc doi thanh khoa ngoai so nguyen.
- `Cart.items` da duoc tach thanh `carts` va `cart_items` de dung thiet ke quan he.
- Mot so bang duoc them timestamp de tien mo rong cho CRUD, thong ke va audit.

## 5. Tep SQL

Tep SQL khoi tao database da duoc tao tai:

`database/mysql_schema.sql`

Tep nay gom:

- Tao database `nnptudm_22dthe9`
- Tao toan bo bang
- Tao khoa ngoai
- Chen san 3 role mac dinh: `Admin`, `Staff`, `Customer`
