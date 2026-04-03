# Cấu trúc Database Đồ án Web Bán Phụ tùng Ô tô (HUTECH)

Tài liệu này mô tả chi tiết 11 Model (Schema) cần thiết để ứng dụng hoạt động đầy đủ với các chức năng đã xây dựng. Sử dụng **Mongoose (MongoDB)** để triển khai.

---

## 1. User (Người dùng)
Lưu trữ tài khoản đăng nhập cho Admin, Nhân viên và Khách hàng.
- `username`: String (Required, Unique) - Tên đăng nhập.
- `password`: String (Required) - Mật khẩu (nên được hash).
- `email`: String (Required, Unique) - Email liên lạc.
- `role`: ObjectId (Ref: 'Role') - Liên kết với bảng phân quyền.
- `fullName`: String - Họ tên đầy đủ.
- `avatar`: String - URL ảnh đại diện.

## 2. Role (Quyền hạn)
Định nghĩa các vai trò trong hệ thống.
- `name`: String (Unique) - Tên quyền (Admin, Staff, Customer).
- `description`: String - Mô tả quyền hạn.

## 3. Category (Danh mục)
Phân loại các loại phụ tùng.
- `name`: String (Required, Unique) - Tên danh mục (Lốp, Đèn, Bugi...).
- `description`: String - Mô tả danh mục.
- `image`: String - Ảnh minh họa danh mục.

## 4. Part (Phụ tùng)
Thông tin chi tiết về từng sản phẩm phụ tùng.
- `name`: String (Required) - Tên phụ tùng.
- `price`: Number (Required) - Giá gốc.
- `discountPrice`: Number - Giá sau khi giảm (nếu có).
- `hasPromotion`: Boolean - Trạng thái có đang giảm giá hay không.
- `stock`: Number - Số lượng tồn kho.
- `description`: String - Mô tả chi tiết sản phẩm.
- `image`: String - URL ảnh sản phẩm.
- `category`: ObjectId (Ref: 'Category') - Thuộc danh mục nào.
- `supplier`: ObjectId (Ref: 'Supplier') - Nhà cung cấp nào.

## 5. Supplier (Nhà cung cấp)
Thông tin các đơn vị cung cấp hàng hóa.
- `name`: String (Required) - Tên công ty/nhà cung cấp.
- `contactName`: String - Tên người liên hệ.
- `email`: String - Email nhà cung cấp.
- `phone`: String - Số điện thoại.
- `address`: String - Địa chỉ văn phòng.

## 6. Customer (Khách hàng)
Thông tin bổ sung cho người mua hàng.
- `user`: ObjectId (Ref: 'User') - Liên kết với tài khoản User.
- `fullName`: String (Required) - Tên khách hàng.
- `phone`: String - Số điện thoại nhận hàng.
- `address`: String - Địa chỉ giao hàng mặc định.
- `loyaltyPoints`: Number - Điểm tích lũy.

## 7. Order (Đơn hàng)
Thông tin tổng quát về một giao dịch bán hàng.
- `customer`: ObjectId (Ref: 'Customer') - Người mua.
- `orderDate`: Date - Ngày đặt hàng.
- `totalAmount`: Number - Tổng tiền đơn hàng.
- `status`: String (Enum) - Trạng thái (Pending, Processing, Shipped, Delivered, Cancelled).
- `shippingAddress`: String - Địa chỉ giao hàng cho đơn này.
- `promotion`: ObjectId (Ref: 'Promotion') - Mã giảm giá đã áp dụng.

## 8. OrderDetail (Chi tiết đơn hàng)
Lưu trữ danh sách các món hàng trong một đơn hàng.
- `order`: ObjectId (Ref: 'Order') - Thuộc đơn hàng nào.
- `part`: ObjectId (Ref: 'Part') - Sản phẩm nào.
- `quantity`: Number - Số lượng mua.
- `unitPrice`: Number - Giá tại thời điểm mua.

## 9. Cart (Giỏ hàng)
Lưu trữ tạm thời các sản phẩm khách hàng chọn.
- `customer`: ObjectId (Ref: 'Customer') - Chủ giỏ hàng.
- `items`: Array
    - `part`: ObjectId (Ref: 'Part')
    - `quantity`: Number

## 10. Review (Đánh giá)
Phản hồi của khách hàng về sản phẩm.
- `customer`: ObjectId (Ref: 'Customer') - Người đánh giá.
- `part`: ObjectId (Ref: 'Part') - Sản phẩm được đánh giá.
- `rating`: Number (1-5) - Số sao.
- `comment`: String - Nội dung nhận xét.

## 11. Promotion (Khuyến mãi)
Quản lý các mã giảm giá toàn hệ thống.
- `code`: String (Unique) - Mã code (Vd: HUTECH20).
- `discountType`: String (Enum) - Loại giảm (Percentage, FixedAmount).
- `discountValue`: Number - Giá trị giảm.
- `startDate`: Date - Ngày bắt đầu.
- `endDate`: Date - Ngày kết thúc.
- `isActive`: Boolean - Trạng thái kích hoạt.

---
*Tài liệu này được soạn thảo dựa trên yêu cầu đồ án Web Phụ tùng Ô tô - Giảng viên TUNGNT.*
