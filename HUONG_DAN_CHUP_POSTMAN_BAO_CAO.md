# Hướng Dẫn Chụp Postman Cho Báo Cáo

## 1. Mục tiêu

File này dùng để liệt kê các chức năng chính của hệ thống để chụp ảnh trên Postman đưa vào báo cáo môn học.

Hệ thống hiện tại dùng:

- `Node.js + Express`
- `EJS`
- `MySQL`
- `JWT + cookie`
- `express-validator`
- `multer` để upload ảnh vào thư mục `uploads/`

Đây cũng là các phần bám theo cấu trúc và công nghệ trong folder mẫu của thầy.

## 2. Chuẩn bị trước khi chụp

Chạy project:

```powershell
npm start
```

Nếu bạn đang chạy cổng `3001` thì dùng:

```text
http://localhost:3001
```

Nếu chạy cổng mặc định thì dùng:

```text
http://localhost:3000
```

Trong Postman nên tạo biến:

- `baseUrl = http://localhost:3001`

Nếu máy bạn đang chạy ở cổng khác thì đổi lại cho đúng.

## 3. Tài khoản để test

### Admin

- `admin / 123456`

### Nhân viên

- `staff01 / 123456`

### Khách hàng

- `customer01 / 123456`
- `customer02 / 123456`

## 4. Lưu ý khi chụp trên Postman

- Hệ thống xác thực bằng cookie `token`
- Sau khi `POST /auth/login`, Postman sẽ lưu cookie nếu cùng domain `localhost`
- Với các API cần đăng nhập, bạn nên login trước rồi mới gửi request tiếp theo
- Một số chức năng quản trị cũ đang lưu bằng `GET + query params`, nên trong Postman bạn điền ở tab `Params`
- Chức năng thêm/sửa phụ tùng có upload ảnh nên phải dùng `Body -> form-data`

Nếu muốn chụp rõ response đăng nhập, bạn có thể tắt:

- `Settings -> Automatically follow redirects`

Khi đó Postman sẽ hiện rõ `302 Found` và cookie `token`.

## 5. Thứ tự chụp ảnh gợi ý cho báo cáo

Nên chụp theo thứ tự sau:

1. Đăng ký tài khoản khách hàng
2. Đăng nhập hệ thống
3. Xem dashboard
4. Quản lý danh mục
5. Quản lý nhà cung cấp
6. Quản lý khuyến mãi
7. Quản lý phụ tùng
8. Quản lý đơn hàng
9. Chức năng khách hàng: xem shop
10. Thêm giỏ hàng
11. Áp mã giảm giá
12. Đặt hàng
13. Xem đơn hàng của khách

## 6. Danh sách chức năng nên chụp

## 6.1. Xác thực

### 1. Đăng ký tài khoản khách hàng

- Method: `POST`
- URL: `{{baseUrl}}/auth/register`
- Body: `x-www-form-urlencoded`

```text
username = postman_user
fullName = Người Dùng Postman
email = postman_user@example.com
password = 123456
confirmPassword = 123456
phone = 0909009999
address = 123 Đường ABC, TP.HCM
avatar =
```

Ảnh nên chụp:

- Request body
- Response thành công hoặc redirect về `/`

### 2. Đăng nhập admin

- Method: `POST`
- URL: `{{baseUrl}}/auth/login`
- Body: `x-www-form-urlencoded`

```text
username = admin
password = 123456
```

Ảnh nên chụp:

- Form body
- Cookie `token`
- Response `302` hoặc trang trả về sau đăng nhập

### 3. Đăng xuất

- Method: `POST`
- URL: `{{baseUrl}}/auth/logout`

## 6.2. Dashboard

### 4. Xem dashboard admin

- Method: `GET`
- URL: `{{baseUrl}}/`
- Quyền: `Admin` hoặc `Staff`

Nội dung nên chụp:

- Thống kê doanh thu
- Số lượng đơn hàng
- Số lượng phụ tùng
- Số lượng khách hàng

Lưu ý:

- Doanh thu chỉ tính các đơn `Delivered` và `Done`

## 6.3. Quản lý danh mục

### 5. Xem danh sách danh mục

- Method: `GET`
- URL: `{{baseUrl}}/categories`

### 6. Thêm danh mục

- Method: `POST`
- URL: `{{baseUrl}}/categories/add/save`
- Body: `x-www-form-urlencoded`

```text
name = Phụ kiện nội thất
description = Các sản phẩm nội thất, trang trí và tiện ích trong xe
image = https://picsum.photos/seed/interior/400/300
```

### 7. Sửa danh mục

- Method: `POST`
- URL: `{{baseUrl}}/categories/edit/1/save`
- Body: `x-www-form-urlencoded`

```text
name = Lốp xe cao cấp
description = Danh mục lốp xe cho nhiều dòng xe
image = https://picsum.photos/seed/category-tire-new/400/300
```

### 8. Xóa danh mục

- Method: `GET`
- URL: `{{baseUrl}}/categories/delete/1`

Khuyến nghị:

- Khi chụp báo cáo, nên tạo 1 danh mục test rồi xóa danh mục test đó, tránh xóa dữ liệu chính

## 6.4. Quản lý nhà cung cấp

### 9. Xem danh sách nhà cung cấp

- Method: `GET`
- URL: `{{baseUrl}}/suppliers`

### 10. Thêm nhà cung cấp

- Method: `GET`
- URL: `{{baseUrl}}/suppliers/add/save`
- Params:

```text
name = Công ty Phụ tùng Postman
contact = 0908123456
email = postman_supplier@gmail.com
address = TP.HCM
contactName = Nguyễn Văn Test
```

### 11. Sửa nhà cung cấp

- Method: `GET`
- URL: `{{baseUrl}}/suppliers/edit/1/save`
- Params:

```text
name = Michelin Việt Nam Update
contact = 02839393939
email = sales@michelin.vn
address = Bình Dương
contactName = Nguyễn Tuấn Kiệt
```

### 12. Xóa nhà cung cấp

- Method: `GET`
- URL: `{{baseUrl}}/suppliers/delete/1`

Khuyến nghị:

- Nên tạo một nhà cung cấp test rồi xóa chính bản ghi test đó

## 6.5. Quản lý khuyến mãi

### 13. Xem danh sách khuyến mãi

- Method: `GET`
- URL: `{{baseUrl}}/promotions`

### 14. Thêm mã khuyến mãi

- Method: `GET`
- URL: `{{baseUrl}}/promotions/add/save`
- Params:

```text
code = POSTMAN20
status = Active
type = Percentage
discount = 20
description = Giảm 20 phần trăm cho bài chụp Postman
```

### 15. Sửa mã khuyến mãi

- Method: `GET`
- URL: `{{baseUrl}}/promotions/edit/1/save`
- Params:

```text
code = HUTECH25
status = Active
type = Percentage
discount = 25
description = Cập nhật mức giảm giá
```

### 16. Xóa mã khuyến mãi

- Method: `GET`
- URL: `{{baseUrl}}/promotions/delete/1`

Khuyến nghị:

- Nên thao tác với mã test riêng để tránh làm mất dữ liệu đang dùng

## 6.6. Quản lý phụ tùng

### 17. Xem danh sách phụ tùng

- Method: `GET`
- URL: `{{baseUrl}}/parts`

Có thể chụp thêm các URL lọc:

- `{{baseUrl}}/parts?stock=low`
- `{{baseUrl}}/parts?stock=out`
- `{{baseUrl}}/parts?search=bugi`

### 18. Xem chi tiết phụ tùng

- Method: `GET`
- URL: `{{baseUrl}}/parts/detail/1`

### 19. Thêm phụ tùng có upload ảnh

- Method: `POST`
- URL: `{{baseUrl}}/parts/add/save`
- Body: `form-data`

Field text:

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
existingImage = 
```

Field file:

```text
imageFile = chọn 1 ảnh từ máy tính
```

Ảnh nên chụp:

- Tab `form-data`
- Trường `imageFile`
- Response redirect sau khi thêm

### 20. Sửa phụ tùng

- Method: `POST`
- URL: `{{baseUrl}}/parts/edit/1/save`
- Body: `form-data`

Ví dụ:

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
existingImage = /uploads/ten-anh-neu-da-upload.jpg
description = Cập nhật thông tin phụ tùng
```

### 21. Xóa phụ tùng

- Method: `GET`
- URL: `{{baseUrl}}/parts/delete/1`

Khuyến nghị:

- Tạo 1 phụ tùng test riêng rồi xóa đúng bản ghi test đó

## 6.7. Quản lý đơn hàng

### 22. Xem danh sách đơn hàng

- Method: `GET`
- URL: `{{baseUrl}}/orders`

### 23. Xem chi tiết đơn hàng

- Method: `GET`
- URL: `{{baseUrl}}/orders/detail/ORD-0001`

### 24. Cập nhật trạng thái đơn hàng

- Method: `GET`
- URL: `{{baseUrl}}/orders/update-status/ORD-0001`
- Params:

```text
status = Hoàn tất
```

Các giá trị có thể dùng:

- `Chờ thanh toán`
- `Đang xử lý`
- `Đang giao`
- `Đã giao`
- `Hoàn tất`
- `Đã hủy`

### 25. Xóa đơn hàng

- Method: `GET`
- URL: `{{baseUrl}}/orders/delete/ORD-0001`

Khuyến nghị:

- Chỉ xóa đơn test

## 6.8. Chức năng khách hàng

Trước phần này nên đăng nhập lại bằng tài khoản:

- `customer01 / 123456`

### 26. Xem trang cửa hàng

- Method: `GET`
- URL: `{{baseUrl}}/shop`

### 27. Xem chi tiết sản phẩm

- Method: `GET`
- URL: `{{baseUrl}}/shop/product/1`

### 28. Xem giỏ hàng

- Method: `GET`
- URL: `{{baseUrl}}/shop/cart`

### 29. Thêm sản phẩm vào giỏ hàng

- Method: `POST`
- URL: `{{baseUrl}}/shop/cart/add/1`
- Body: `x-www-form-urlencoded`

```text
quantity = 1
```

### 30. Cập nhật số lượng trong giỏ hàng

- Method: `POST`
- URL: `{{baseUrl}}/shop/cart/update/1`
- Body: `x-www-form-urlencoded`

```text
quantity = 2
```

### 31. Áp mã giảm giá cho sản phẩm trong giỏ

- Method: `POST`
- URL: `{{baseUrl}}/shop/cart/apply-code/1`
- Body: `x-www-form-urlencoded`

```text
promoCode = HUTECH20
```

Lưu ý:

- Chỉ áp được nếu admin đã gán mã đó cho sản phẩm
- Ví dụ:
  - sản phẩm `1` thường dùng `HUTECH20`
  - sản phẩm `5` thường dùng `SALE500K`

### 32. Gỡ mã giảm giá

- Method: `POST`
- URL: `{{baseUrl}}/shop/cart/clear-code/1`

### 33. Xóa sản phẩm khỏi giỏ hàng

- Method: `POST`
- URL: `{{baseUrl}}/shop/cart/remove/1`

### 34. Đặt hàng

- Method: `POST`
- URL: `{{baseUrl}}/shop/checkout`
- Body: `x-www-form-urlencoded`

```text
shippingAddress = 123 Lê Lợi, Quận 1, TP.HCM
```

### 35. Xem danh sách đơn hàng của khách

- Method: `GET`
- URL: `{{baseUrl}}/shop/orders`

### 36. Xem chi tiết đơn hàng của khách

- Method: `GET`
- URL: `{{baseUrl}}/shop/orders/1`

## 7. Danh sách ảnh tối thiểu nên có trong báo cáo

Nếu không muốn chụp quá nhiều, bạn có thể chụp tối thiểu các ảnh sau:

1. Đăng ký tài khoản
2. Đăng nhập admin
3. Dashboard admin
4. Thêm danh mục
5. Thêm nhà cung cấp
6. Thêm mã khuyến mãi
7. Thêm phụ tùng có upload ảnh
8. Danh sách phụ tùng
9. Cập nhật trạng thái đơn hàng
10. Đăng nhập khách hàng
11. Thêm vào giỏ hàng
12. Áp mã giảm giá
13. Đặt hàng thành công
14. Xem chi tiết đơn hàng khách

## 8. Gợi ý trình bày trong báo cáo

Mỗi hình nên ghi ngắn gọn:

- Tên chức năng
- URL
- Method
- Vai trò sử dụng
- Kết quả trả về

Ví dụ:

```text
Hình X.Y. Chức năng thêm phụ tùng bằng Postman, sử dụng multipart/form-data và upload ảnh vào thư mục uploads.
```

## 9. Ghi chú cuối

- Với các chức năng `xóa`, nên dùng dữ liệu test riêng
- Với chức năng `thêm/sửa phụ tùng`, nên ưu tiên chụp vì đây là phần thể hiện rõ `multer` và thư mục `uploads/`
- Với phần `đăng nhập/đăng ký`, nên chụp để thể hiện hệ thống dùng dữ liệu thật từ `MySQL`
- Với phần `áp mã giảm giá`, nên chụp thêm trước và sau khi áp để báo cáo đẹp hơn

