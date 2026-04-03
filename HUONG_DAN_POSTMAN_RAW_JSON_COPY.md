# Hướng Dẫn Postman Dạng Raw JSON Để Copy Thẳng

## 1. Mục đích

File này dành cho trường hợp bạn muốn:

- vào `Body`
- chọn `raw`
- chọn `JSON`
- copy nguyên khối vào Postman

để test luôn mà không phải tự thêm:

- dấu `{ }`
- dấu `"`
- dấu `,`

## 2. Ghi nhớ rất quan trọng

Không phải request nào cũng dùng `raw JSON` được.

Hệ thống hiện tại chia làm 3 loại:

### Loại 1. Dùng được `raw JSON`

Thường là các request `POST` như:

- đăng nhập
- đăng ký
- thêm danh mục
- sửa danh mục
- thêm vào giỏ hàng
- cập nhật giỏ hàng
- áp mã giảm giá
- đặt hàng

### Loại 2. BẮT BUỘC dùng `form-data`

Chỉ áp dụng cho:

- thêm phụ tùng có upload ảnh
- sửa phụ tùng có upload ảnh

Vì có file ảnh nên không thể dùng `raw JSON`.

### Loại 3. Dùng `GET + Params`

Các request như:

- thêm nhà cung cấp
- sửa nhà cung cấp
- thêm khuyến mãi
- sửa khuyến mãi
- cập nhật trạng thái đơn hàng

những request này không dùng `raw JSON`, mà điền ở tab `Params`.

## 3. Cách chọn đúng trong Postman

Nếu request bên dưới ghi là `raw JSON`, thì làm đúng:

1. Chọn `Body`
2. Chọn `raw`
3. Chọn `JSON`
4. Copy nguyên block JSON mình ghi vào

Khi đó Postman sẽ tự thêm:

```text
Content-Type: application/json
```

Bạn không cần tự thêm header này nữa.

## 4. Biến dùng chung

```text
baseUrl = http://localhost:3001
```

## 5. Tài khoản test

### Admin

```json
{
  "username": "admin",
  "password": "123456"
}
```

### Customer

```json
{
  "username": "customer01",
  "password": "123456"
}
```

---

## 6. NHÓM RAW JSON CÓ THỂ COPY THẲNG

## 6.1. Đăng ký tài khoản

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/auth/register
```

### Authorization

```text
No Auth
```

### Headers

```text
Để trống
```

### Body

Chọn:

```text
raw -> JSON
```

Copy:

```json
{
  "username": "postman_user_01",
  "fullName": "Người Dùng Postman",
  "email": "postman_user_01@gmail.com",
  "password": "123456",
  "confirmPassword": "123456",
  "phone": "0909009999",
  "address": "123 Lê Lợi, Quận 1, TP.HCM",
  "avatar": ""
}
```

## 6.2. Đăng nhập admin

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/auth/login
```

### Authorization

```text
No Auth
```

### Headers

```text
Để trống
```

### Body

Chọn:

```text
raw -> JSON
```

Copy:

```json
{
  "username": "admin",
  "password": "123456"
}
```

## 6.3. Đăng nhập customer

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/auth/login
```

### Body

```json
{
  "username": "customer01",
  "password": "123456"
}
```

## 6.4. Đăng xuất

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/auth/logout
```

### Body

```text
Không có body
```

## 6.5. Thêm danh mục

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/categories/add/save
```

### Body

```json
{
  "name": "Phụ kiện nội thất",
  "description": "Các sản phẩm nội thất và tiện ích bên trong xe",
  "image": "https://picsum.photos/seed/noithat/400/300"
}
```

## 6.6. Sửa danh mục

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/categories/edit/1/save
```

### Body

```json
{
  "name": "Lốp xe cao cấp",
  "description": "Danh mục lốp xe cho nhiều dòng xe",
  "image": "https://picsum.photos/seed/lopxe-new/400/300"
}
```

## 6.7. Thêm vào giỏ hàng

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/shop/cart/add/1
```

### Body

```json
{
  "quantity": 1
}
```

## 6.8. Cập nhật giỏ hàng

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/shop/cart/update/1
```

### Body

```json
{
  "quantity": 2
}
```

## 6.9. Áp mã giảm giá

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/shop/cart/apply-code/1
```

### Body

```json
{
  "promoCode": "HUTECH20"
}
```

Ví dụ khác:

### URL

```text
{{baseUrl}}/shop/cart/apply-code/5
```

### Body

```json
{
  "promoCode": "SALE500K"
}
```

## 6.10. Gỡ mã giảm giá

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/shop/cart/clear-code/1
```

### Body

```text
Không có body
```

## 6.11. Xóa khỏi giỏ hàng

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/shop/cart/remove/1
```

### Body

```text
Không có body
```

## 6.12. Đặt hàng

### Method

```text
POST
```

### URL

```text
{{baseUrl}}/shop/checkout
```

### Body

```json
{
  "shippingAddress": "123 Lê Lợi, Quận 1, TP.HCM"
}
```

---

## 7. NHÓM KHÔNG DÙNG RAW JSON

## 7.1. Thêm phụ tùng có ảnh

### Lý do

Có file ảnh nên phải dùng:

```text
Body -> form-data
```

### URL

```text
{{baseUrl}}/parts/add/save
```

### Các ô cần điền

Text:

```text
name = Gạt mưa Bosch
categoryId = 1
price = 450000
discountPrice = 390000
supplierId = 1
stock = 15
hasPromotion = on
promotionId = 1
image =
description = Gạt mưa chất lượng cao, bền và êm
existingImage =/uploads/1775141755259-Pilot-Sport-5.jpg
```

File:

```text
imageFile = chọn file ảnh từ máy
```

## 7.2. Sửa phụ tùng có ảnh

### URL

```text
{{baseUrl}}/parts/edit/1/save
```

### Phải dùng

```text
Body -> form-data
```

### Điền

```text
name = Lốp Michelin Pilot Sport 4 Update
categoryId = 1
price = 3500000
discountPrice = 3200000
supplierId = 3
stock = 10
hasPromotion = on
promotionId = 1
image = https://picsum.photos/seed/tire-update/400/400
existingImage = /uploads/anh-cu.jpg
description = Cập nhật thông tin phụ tùng
imageFile = chọn file ảnh nếu muốn đổi ảnh
```

## 7.3. Thêm nhà cung cấp

### Không dùng raw JSON

Phải dùng:

```text
GET + Params
```

### URL

```text
{{baseUrl}}/suppliers/add/save
```

### Params

```text
name = Công ty Phụ tùng Postman
contact = 0908123456
email = postman_supplier@gmail.com
address = TP.HCM
contactName = Nguyễn Văn Test
```

## 7.4. Sửa nhà cung cấp

### URL

```text
{{baseUrl}}/suppliers/edit/1/save
```

### Params

```text
name = Michelin Việt Nam Update
contact = 02839393939
email = sales@michelin.vn
address = Bình Dương
contactName = Nguyễn Tuấn Kiệt
```

## 7.5. Thêm khuyến mãi

### Không dùng raw JSON

Phải dùng:

```text
GET + Params
```

### URL

```text
{{baseUrl}}/promotions/add/save
```

### Params

```text
code = POSTMAN20
status = Active
type = Percentage
discount = 20
description = Giảm 20 phần trăm cho bài test Postman
```

## 7.6. Sửa khuyến mãi

### URL

```text
{{baseUrl}}/promotions/edit/1/save
```

### Params

```text
code = HUTECH25
status = Active
type = Percentage
discount = 25
description = Cập nhật mức giảm giá
```

## 7.7. Cập nhật trạng thái đơn hàng

### Không dùng raw JSON

Phải dùng:

```text
GET + Params
```

### URL

```text
{{baseUrl}}/orders/update-status/ORD-0001
```

### Params

```text
status = Hoàn tất
```

Hoặc:

```text
status = Đã giao
```

---

## 8. Nếu muốn copy Header thủ công

Chỉ dùng khi Postman không giữ cookie.

### Cookie

```text
Key = Cookie
Value = token=GIA_TRI_TOKEN
```

### Bearer token

```text
Key = Authorization
Value = Bearer GIA_TRI_TOKEN
```

## 9. Những request nên chụp đẹp nhất

1. Đăng ký tài khoản bằng raw JSON
2. Đăng nhập admin bằng raw JSON
3. Thêm danh mục bằng raw JSON
4. Thêm phụ tùng bằng form-data
5. Thêm nhà cung cấp bằng Params
6. Thêm khuyến mãi bằng Params
7. Áp mã giảm giá bằng raw JSON
8. Đặt hàng bằng raw JSON
