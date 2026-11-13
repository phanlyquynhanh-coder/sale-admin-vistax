# Sale Admin VistaX

Hệ thống quản lý công việc Sale Admin / Growth: **Dự án › Hạng mục › Công việc**, Daily To-do, Lịch, Báo cáo, Thông báo, Lịch sử.

## Hai cách chạy

| | Bản chính (Google) | Bản độc lập |
|---|---|---|
| Mở ở đâu | https://script.google.com/macros/s/AKfycby7ZUyJAge9fSDV7LR6EqUdYyxz-RVUcZq188tuyY8NzkEPxNtqcQbSxyBDID19aQjIOQ/exec | https://phanlyquynhanh-coder.github.io/sale-admin-vistax/ hoặc file `sale-admin-vistax.html` |
| Đăng nhập | Tài khoản Google, vai trò theo email | Không |
| Dữ liệu | Google Sheet [Sale Admin VistaX – Dữ liệu](https://docs.google.com/spreadsheets/d/1mKWglv9PQSHPix7qJ0xvgYTy9AlMSPw2n1EQaqM4frY/edit) | Trình duyệt của máy đang mở |
| Checklist | Đọc trực tiếp sheet DỰ ÁN và CÔNG NỢ TỔNG HỢP | Dán dòng từ sheet DỰ ÁN |
| Dùng chung | Có, theo thời gian thực (làm mới mỗi 45 giây) | Xuất / Nhập file .json |

## Cấu trúc repo
- `app.css`, `shell.html`, `app.js` — giao diện và logic, dùng chung cho cả hai bản. Sửa ở đây rồi đẩy GitHub là bản Google tự nhận (sau vài phút).
- `index.html` — trang GitHub Pages (bản độc lập).
- `sale-admin-vistax.html` — bản một file để tải về dùng ngoại tuyến.
- `apps-script/Code.gs`, `apps-script/Index.html` — mã cho dự án Google Apps Script.

## Cài bản Google (một lần)
1. script.google.com → New project → đặt tên "Sale Admin VistaX".
2. Dán `apps-script/Code.gs` vào Code.gs; thêm file HTML tên `Index`, dán `apps-script/Index.html`.
3. Chọn hàm `setup` → Run → cấp quyền. File dữ liệu được tạo trong Drive.
4. Deploy → New deployment → Web app · Execute as: **User accessing the web app** · Who has access: **Anyone with Google account** → Deploy → lưu link.

## Thêm người dùng sau này
1. Cài đặt → Thành viên: nhập tên, **email Google**, vai trò.
2. Chia sẻ quyền **Chỉnh sửa** file "Sale Admin VistaX – Dữ liệu" và quyền **Xem** file Checklist cho email đó.
3. Gửi họ link web app.

Checklist chỉ được đọc, ứng dụng không ghi gì vào Checklist.

## Cập nhật mã máy chủ
Sửa `apps-script/Code.gs` → dán vào dự án Apps Script → Lưu → Triển khai → Quản lý các tùy chọn triển khai → sửa (bút chì) → Phiên bản: Mới → Triển khai. Link web app giữ nguyên.
