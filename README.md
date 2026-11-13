# Sale Admin VistaX

Ứng dụng quản lý công việc cho đội Sale Admin, gói trong **một file HTML** (`sale-admin-vistax.html`). Không cần cài đặt, không cần máy chủ.

## Cách dùng
1. Tải file `sale-admin-vistax.html`, mở bằng Chrome hoặc Edge.
2. Vào **Cài đặt**: thêm thành viên và vai trò, ngày nghỉ lễ.
3. Chọn tên của mình ở góc trái dưới.
4. Tạo dự án (hoặc **Nhập từ Checklist** bằng cách dán dòng từ sheet DỰ ÁN), thêm hạng mục, thêm công việc.

## Dữ liệu
- Lưu trong trình duyệt của máy đang mở (localStorage, khóa `saleadmin_vistax_v1`).
- Làm chung giữa nhiều máy: **Cài đặt → Xuất file dữ liệu (.json)**, gửi file, máy khác **Nhập file dữ liệu**. File nhập sau thay thế toàn bộ dữ liệu trên máy nhận, nên một người giữ bản gốc.
- Không dùng chế độ ẩn danh; xuất file sao lưu mỗi tuần.

## Màn hình
Tổng quan · Daily To-do · Dự án (Dự án › Hạng mục › Công việc) · Công việc (danh sách / bảng kéo thả) · Lịch · Báo cáo (xuất CSV) · Thông báo · Lịch sử · Cài đặt · Hướng dẫn (đặc tả đầy đủ trong ứng dụng).

## Giới hạn hiện tại
- Chưa có đăng nhập; vai trò chỉ là phân quyền trên giao diện.
- Chưa đồng bộ tự động giữa nhiều máy; chưa gửi thông báo email/Zalo.
- Muốn dùng chung thời gian thực: nâng cấp lên bản có máy chủ (ví dụ Next.js + Supabase), giữ nguyên mô hình dữ liệu trong mục Hướng dẫn → 5.
