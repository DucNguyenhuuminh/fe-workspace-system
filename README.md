# ☁️ CloudDrive - Frontend Application

Đây là mã nguồn Frontend cho hệ thống **CloudDrive / Distributed Workspace System** (Lấy cảm hứng từ Google Drive). Dự án cung cấp giao diện người dùng hiện đại, mượt mà để quản lý tệp tin cá nhân và không gian làm việc nhóm.

## 🚀 Công nghệ sử dụng (Tech Stack)

* **Core:** [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool:** [Vite](https://vitejs.dev/) (Nhanh và tối ưu hóa tốt)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS)
* **Routing:** [React Router v6](https://reactrouter.com/) (Nested routing, App Shell Layout)
* **HTTP Client:** [Axios](https://axios-http.com/) (Interceptors, xử lý JWT Token)
* **Icons:** [Lucide React](https://lucide.dev/)

## ✨ Các tính năng nổi bật (Features)

* 🔐 **Xác thực người dùng:** Đăng nhập, Đăng ký, Quản lý phiên làm việc bằng JWT Token.
* 🗂️ **My Drive (Ổ đĩa cá nhân):**
  * Tạo, đổi tên, xóa thư mục.
  * Duyệt cây thư mục đa cấp với thanh điều hướng (Breadcrumbs).
  * Chuyển đổi linh hoạt giữa chế độ xem Lưới (Grid) và Danh sách (List).
  * Trạng thái rỗng (Empty State) và Skeleton Loading tinh tế.
* 🏢 **Workspaces (Không gian làm việc chung):**
  * Quản lý các nhóm làm việc với thiết kế thẻ (Card) trực quan.
  * Tạo không gian làm việc mới.
  * Xem chi tiết tệp tin và thành viên trong từng Workspace.
* 🎨 **UI/UX Tối ưu:**
  * Kiến trúc App Shell (Sidebar và Header cố định).
  * Hiệu ứng hover, transition mượt mà.

## 📁 Cấu trúc thư mục (Folder Structure)

\`\`\`text
src/
├── components/       # Các component dùng chung (Layout, Modal, Navbar...)
├── pages/            # Các trang chính (Dashboard, Login, Workspaces...)
├── services/         # Chứa các hàm gọi API (api.ts, auth, folder, workspace)
├── types/            # Định nghĩa các Interface TypeScript (User, Folder, Workspace)
├── App.tsx           # File