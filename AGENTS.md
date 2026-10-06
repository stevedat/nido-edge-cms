# Nido Edge CMS — Quy Chuẩn Thiết Kế & Nguyên Tắc Triển Khai Bắt Buộc (AGENTS.md)

Tài liệu này định nghĩa **5 Điều Luật Tối Thượng (Immutable Laws)** cho bất kỳ Agent nào tham gia phát triển, chỉnh sửa, hoặc tái cấu trúc mã nguồn trong kho lưu trữ này. Mọi thay đổi về giao diện (UI) và trải nghiệm (UX) bắt buộc phải tuân thủ 100% để đảm bảo tính nhất quán chuẩn Apple Minimalist, khả năng tiếp cận WCAG AAA và kiến trúc Edge Multi-tenant.

---

## 1. NGUYÊN TẮC BẤT BIẾN (IMMUTABLE LAWS)

### Luật 1 — Chỉ Dùng Semantic Design Tokens (Cấm Hardcode Màu)

Hệ thống sử dụng bộ biến CSS và Tailwind v4 theme tokens trong `src/routes/layout.css`.

- ❌ **NGHIÊM CẤM** dùng các class màu cố định hoặc mã màu hex trực tiếp:
  - Cấm: `bg-white`, `bg-black`, `bg-slate-50`, `bg-slate-900`, `bg-gray-100`, `text-slate-900`, `text-gray-600`, `border-slate-200`, `border-gray-300`...
- **BẮT BUỘC** dùng hệ thống tokens ngữ nghĩa:
- **Nền tổng thể (Background)**: `bg-main-bg` (nền trang), `bg-soft-bg` (nền phân khu/secondary fill), `bg-surface` (thẻ Card, Dialog, Modal, Drawer).
- **Viền (Borders)**: `border-border-subtle` (viền mờ tinh tế 9% light / 14% dark), `border-border-strong` (viền nổi bật).
- **Văn bản (Typography)**: `text-text-main` (tiêu đề, tương phản cực cao AAA), `text-text-body` (đoạn văn, nội dung chính), `text-text-muted` (phụ đề, metadata, nhãn thời gian), `text-primary` (màu nhấn chủ đạo).
- **Tương tác hover**: `hover:bg-soft-bg`, `hover:border-border-strong`.

> **Lý do:** Đây là một Giao diện cơ sở (AI-Ready Minimalist UI). Việc dùng các semantic token này giúp AI sinh code (Cursor/Windsurf) dễ dàng đọc hiểu và thay đổi thiết kế toàn cục một cách đồng bộ mà không phá vỡ cấu trúc.

---

### Luật 2 — Chuẩn Nét Icon Apple SF Symbols (`strokeWidth={1.75}`)

Hệ sinh thái sử dụng bộ thư viện `lucide-svelte`. Mặc định của Lucide là nét 2.0px (quá thô so với phong cách Apple tối giản).

- **Mọi icon Lucide** trên toàn hệ thống bắt buộc khai báo `strokeWidth={1.75}`.
- Ví dụ: `<Search size={16} strokeWidth={1.75} class="text-text-muted" />`
- Ví dụ: `<BookOpen size={14} strokeWidth={1.75} class="text-primary" />`
- **Ngoại lệ duy nhất**: Icon `Check` biểu thị trạng thái đã hoàn thành / kích hoạt / bullet tích xanh: dùng `strokeWidth={2.25}` để tạo điểm nhấn dứt khoát.
- 📏 **Thang kích thước icon tiêu chuẩn**:
  - `size={11-13}`: Huy hiệu (Badge), tag metadata, nhãn phụ siêu nhỏ.
  - `size={14-16}`: Nút bấm thường, input search, menu dropdown, bảng dữ liệu.
  - `size={18-20}`: Thanh điều hướng chính (Header navbar), tiêu đề thẻ vừa.
  - `size={24-32}`: Tiêu đề section lớn, empty state minh họa.

---

### Luật 3 — Ergonomics Cảm Ứng Di Động & Phản Hồi Xúc Giác

- 👆 **Kích thước vùng chạm (Touch Target)**:
  - Mọi nút bấm (`<button>`), ô nhập liệu (`<input>`, `<select>`), liên kết tương tác (`<a href=...>`) trên màn hình di động **bắt buộc có chiều cao tối thiểu 44px** (`min-h-[44px]` hoặc `p-3`/`py-2.5` tương đương).
- ⚡ **Phản hồi chạm (Haptic / Visual Feedback)**:
  - Nút bấm chính và thẻ tương tác bắt buộc có hiệu ứng co nhẹ khi bấm: `active:scale-98` (nút lớn/card) hoặc `active:scale-95` (nút nhỏ/icon button).
  - Đi kèm `transition-all` hoặc `transition-transform duration-150`.
- 📐 **Thang bo góc (Border Radius Hierarchy)**:
  - Thẻ lớn (Card, Container, Dialog, Section): `rounded-3xl` (hoặc `rounded-2xl`).
  - Nút bấm, Input, Ô tìm kiếm: `rounded-xl` hoặc `rounded-2xl`.
  - Huy hiệu (Badge), Nút lọc Tab (Pills), Nút CTA bo tròn: `rounded-full`.

---

### Luật 4 — AI-Ready Minimalist UI & Dark Mode OLED

Dự án không sử dụng khái niệm "Theme Marketplace" truyền thống. Đây là một **Giao diện Khởi điểm (Starter UI)** tối ưu cho AI sinh code.

- 🤖 **Đặc quyền của AI Agent**: Khi User yêu cầu thay đổi Bố cục (Layout) hay Giao diện (UI) để phù hợp với ngành nghề, AI Agent được toàn quyền đập đi xây lại bằng Tailwind v4 và Svelte 5 snippets mà không bị gò bó vào bất kỳ khuôn mẫu nào.
- 🌑 **Nguyên tắc Dark Mode mặc định**:
  - Nền trang chính là màu đen sâu tuyệt đối OLED `#000000`.
  - Nền thẻ nổi là `#1C1C1E` (Dark Surface).
  - **TUYỆT ĐỐI KHÔNG DÙNG box-shadow đen đậm** trên nền tối (vì tạo cảm giác bẩn, bết dính). Chiều sâu và phân tầng thị giác trên Dark Mode được tạo nên bởi đường viền mảnh phản quang `border-border-subtle` (`rgba(255, 255, 255, 0.14)`).
  - Bật hiệu ứng phản chiếu ánh sáng tinh tế bằng class `.specular-highlight` trên các thẻ nổi bật.

---

### Luật 5 — Quốc Tế Hóa 100% (i18n) & Độc Lập Dữ Liệu Multi-tenant

- 🌐 **Không hardcode chuỗi văn bản tĩnh**:
  - Giao diện người dùng (cả Public lẫn Admin) bắt buộc dùng hàm `t('namespace.key')`.
  - Khi thêm tính năng hoặc giao diện mới, phải bổ sung đồng thời vào cả 2 tệp từ điển: `src/lib/i18n/translations/vi.ts` và `src/lib/i18n/translations/en.ts`.
- 🏢 **Dữ liệu động theo Tenant**:
  - Dữ liệu CMS động (tiêu đề bài viết, mô tả dự án...) phải đọc qua hàm `localized(item, 'property')` để tự động chọn đúng ngôn ngữ của khách.
  - Mọi thao tác CRUD phải nhận diện đúng `locals.domain` để đọc/ghi vào thư mục `src/content/{domain}/` tương ứng, không làm ảnh hưởng đến tenant khác.

---

## 2. CHECKLIST KIỂM THỬ TRƯỚC KHI BÀN GIAO (AGENT CHECKLIST)

Mỗi Agent sau khi hoàn thành code bắt buộc phải chạy các bước kiểm tra sau:

1. Chạy `npm run build`: Phải trả về exit code 0, không có lỗi cú pháp, không lỗi Svelte 5 runes hay TypeScript.
2. Chạy `node scripts/audit-design-system.mjs`: Không có vi phạm màu hardcode hay thiếu `strokeWidth={1.75}`.
3. Kiểm tra hiển thị:
   - Thử nghiệm trên cả Light Mode và Dark Mode.
   - Thử nghiệm trên độ phân giải Mobile (<640px) và Desktop (>1024px).
   - Đảm bảo các nút bấm hoạt động mượt mà, phản hồi bấm chuẩn xác.
