# Nido Edge CMS

> **Ultra-fast, minimalist, Edge-native Multi-tenant CMS & AI-Powered Content Engine.**  
> Built with **SvelteKit 2**, **Svelte 5 Runes**, **Tailwind CSS v4**, and **Universal Storage Adapters** (Cloudflare KV, Local FS, GitHub Sync).

[![Svelte 5](https://img.shields.io/badge/Svelte-5.x_Runes-ff3e00?logo=svelte&logoColor=white)](https://svelte.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudflare Workers](https://img.shields.io/badge/Edge-Cloudflare_KV-f38020?logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/stevedat/nido-edge-cms)

---

## ⚡ Khởi Động Nhanh (1-Minute Quickstart)

```bash
# 1. Clone mã nguồn & cài đặt thư viện
git clone https://github.com/stevedat/nido-edge-cms.git && cd nido-edge-cms
npm install

# 2. Cấu hình biến môi trường
cp .env.example .env
# Mở file .env và cấu hình ADMIN_PASSWORD cùng JWT_SECRET của riêng bạn

# 3. Khởi chạy máy chủ cục bộ (Local Dev)
npm run dev
```

- 🌐 **Giao diện Trang chủ (Storefront / Onboarding)**: [http://localhost:5173](http://localhost:5173)
- 🔐 **Bảng Điều Khiển Quản Trị (Admin Portal)**: [http://localhost:5173/admin/login](http://localhost:5173/admin/login)
- 🤖 **Phòng Điều Khiển AI Builder**: [http://localhost:5173/admin/builder](http://localhost:5173/admin/builder)

---

## 🌟 Điểm Nhấn Cốt Lõi (Core Highlights)

### 1. 🤖 Tích Hợp Sẵn Trình Tạo Web Bằng AI (AI Website Builder)
- **Chế độ Tự Động (Auto API Key)**: Nhập yêu cầu giao diện (Prompt) + Google Gemini API Key. AI sẽ tự động lập trình mã nguồn Svelte 5 và sinh cấu trúc Form Quản trị (`schema.json`) đồng bộ.
- **Chế độ Thủ Công Miễn Phí (Manual Prompt Mode)**: Sao chép System Prompt chuẩn, dán vào ChatGPT / Claude Web, rồi dán chuỗi JSON kết quả trở lại CMS để tạo website ngay lập tức mà không tốn chi phí API.

### 2. ⚡ Không Ác Mộng Database (No SQL · No Prisma · No Migrations)
- Quản lý nội dung 100% bằng **JSON Schemas & Markdown**. Không cần cài PostgreSQL/MySQL, không cấu hình Docker DB, không bao giờ gặp xung đột migration.
- Hỗ trợ đa dạng Storage Adapter:
  - **Local Filesystem (`FsStorageAdapter`)**: Lưu trực tiếp vào thư mục `src/content/` (phù hợp Local Dev, VPS, Docker).
  - **Cloudflare KV (`CloudflareKVAdapter`)**: Phân tán toàn cầu trên mạng lưới Edge của Cloudflare với thời gian phản hồi sub-millisecond.
  - **GitHub Sync (`GitHubStorageAdapter`)**: Tự động commit nội dung trực tiếp vào Git repository (GitOps workflow).

### 3. 🏢 Kiến Trúc Multi-Tenant Độc Lập Trên Mạng Lưới Edge
- Một lần triển khai (Single Instance) có thể phục vụ **hàng trăm khách hàng / thương hiệu độc lập**.
- Dữ liệu và cấu hình giao diện được cô lập hoàn toàn theo Tenant ID (`src/content/{domain}/`).
- Tự động nhận diện Tenant linh hoạt qua:
  - Host Header / Custom Domain (`khachhang.com`)
  - Subdomain (`tenant1.example.com`)
  - Query parameter (`?tenant=brand1`)
  - Header HTTP (`x-tenant-domain: brand1`)
- Cung cấp sẵn **REST API Auto-Provisioning** (`/api/v1/tenants`) cho phép tự động cấp phát website mới ngay khi khách thanh toán qua Stripe/LemonSqueezy.

### 4. 🎨 Chuẩn Thiết Kế Apple Minimalist & Dark Mode OLED (`AGENTS.md`)
- 100% Semantic Design Tokens từ Tailwind v4: `bg-main-bg`, `bg-soft-bg`, `bg-surface`, `text-text-main`, `border-border-subtle`.
- Dark Mode OLED màu đen sâu tuyệt đối (`#000000`) với đường viền phản quang specular highlight.
- Quy chuẩn nét Icon Apple SF Symbols (`strokeWidth={1.75}`) và vùng chạm di động tối thiểu 44px (`min-h-[44px]`).

### 5. 🌐 Quốc Tế Hóa Song Ngữ 100% (i18n)
- Đồng bộ song ngữ Anh - Việt đầy đủ từ giao diện công khai, bảng điều khiển quản trị, đến các thông báo hệ thống.
- Hỗ trợ hàm dịch `t('namespace.key')` và dữ liệu đa ngữ theo Tenant.

### 6. 🛡️ An Toàn & Bảo Mật Chuẩn Edge
- **Proof-of-Work (PoW) Anti-Spam**: Chặn bot spam form liên hệ/leads bằng thuật toán giải mã băm trên trình duyệt mà không cần CAPTCHA phiền phức.
- **Xác thực JWT an toàn**: Phiên đăng nhập HttpOnly, phân quyền Admin / Tenant Admin, so sánh mật khẩu chống timing attack (`constantTimeEqual`).
- **Bảo vệ Payload Hydration**: Dữ liệu nạp phía client tuyệt đối không rò rỉ password hash hay bí mật hệ thống khi mở F12 DevTools.

---

## 🚀 Hướng Dẫn Triển Khai (Deployment Guide)

Nido Edge CMS được thiết kế để chạy mượt mà trên mọi môi trường từ Edge Serverless đến máy chủ VPS truyền thống.

### Lựa Chọn 1: Triển Khai Lên Cloudflare Pages & KV (Khuyên dùng - Chi phí $0)

Hệ thống tận dụng Cloudflare Pages kết hợp Cloudflare KV để đạt hiệu năng Edge toàn cầu và 0ms cold-start.

#### Bước 1: 1-Click Deploy qua Giao diện
Bấm nút bên dưới để Cloudflare tự động fork repository, tạo project và cấp tên miền `*.pages.dev` miễn phí:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/stevedat/nido-edge-cms)

#### Bước 2: Triển Khai Qua Wrangler CLI
```bash
# 1. Đăng nhập tài khoản Cloudflare
npx wrangler login

# 2. Tạo KV Namespace để lưu trữ dữ liệu CMS
npx wrangler kv:namespace create "EDGE_CMS_KV"
# Lấy ID namespace trả về (ví dụ: a1b2c3d4e5f6...) dán vào wrangler.toml

# 3. Đóng gói và phát hành
npm run deploy
```

#### Bước 3: Cấu hình Biến Môi trường trên Cloudflare Pages
Vào **Cloudflare Dashboard** → **Workers & Pages** → Chọn dự án → **Settings** → **Environment variables**:
- `ADMIN_PASSWORD`: Mật khẩu đăng nhập quản trị viên chính.
- `JWT_SECRET`: Chuỗi khóa bảo mật ngẫu nhiên 64 ký tự (tạo bằng lệnh `openssl rand -hex 32`).
- `STORAGE_ADAPTER`: `cloudflare-kv`
- `ROOT_DOMAIN`: Tên miền chính của bạn (ví dụ: `yourdomain.com`).

---

### Lựa Chọn 2: Triển Khai Lên Vercel (Edge / Node.js)

1. Đẩy mã nguồn lên tài khoản GitHub của bạn.
2. Truy cập [Vercel Dashboard](https://vercel.com) → Chọn **Add New Project** → Import repo `nido-edge-cms`.
3. Trong mục **Environment Variables**, thêm:
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `ROOT_DOMAIN`
4. Bấm **Deploy**. Vercel sẽ tự động phát hiện SvelteKit và thiết lập môi trường chạy tối ưu.

---

### Lựa Chọn 3: Triển Khai Lên VPS / Server Riêng (Docker & Node.js)

Nếu bạn muốn tự làm chủ 100% hạ tầng với Node.js và lưu trữ file cục bộ (`FsStorageAdapter`):

#### 1. Chạy Trực Tiếp Bằng PM2
```bash
# Đóng gói ứng dụng
npm run build

# Khởi chạy bằng PM2
pm2 start build/index.js --name "nido-edge-cms" --env PORT=3000
```

#### 2. Chạy Qua Docker
Tạo tệp `Dockerfile`:
```dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src/content ./src/content
EXPOSE 3000
CMD ["node", "build"]
```

Build và chạy container:
```bash
docker build -t nido-edge-cms .
docker run -d -p 3000:3000 \
  -e ADMIN_PASSWORD="your-secure-password" \
  -e JWT_SECRET="your-64-character-jwt-secret" \
  -v $(pwd)/data/content:/app/src/content \
  --name edge-cms-app nido-edge-cms
```

---

### Lựa Chọn 4: Git-Backed CMS (Lưu Trữ Nội Dung Trực Tiếp Lên GitHub)

Bạn có thể cấu hình CMS hoạt động như một **Decoupled Git Editor**:
1. Trong file `.env`, thiết lập:
   ```bash
   STORAGE_ADAPTER="github"
   GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx" # Personal Access Token có quyền repo
   GITHUB_REPO="username/my-content-repo"
   GITHUB_BRANCH="main"
   ```
2. Mỗi khi bạn thêm bài viết, tạo dự án hoặc chạy AI Builder, Edge CMS sẽ tự động tạo commit Git và đẩy trực tiếp lên kho lưu trữ GitHub của bạn.

---

## 🔌 Universal Edge REST API (`/api/v1/`)

Hệ sinh thái cung cấp hệ thống API RESTful đầy đủ, hỗ trợ CORS, xác thực Bearer Token và giải thuật PoW:

| Phương Thức | Đường Dẫn (Endpoint) | Mô Tả Chức Năng | Yêu Cầu Xác Thực |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/tenants` | Tự động khởi tạo Website/Tenant mới | `Bearer <MASTER_API_KEY>` |
| `POST` | `/api/v1/auth/login` | Đăng nhập tài khoản Admin/Tenant | Không (Xác thực mật khẩu) |
| `GET` | `/api/v1/posts` | Danh sách bài viết (phân trang, lọc tag) | Công khai |
| `GET` | `/api/v1/posts/[slug]` | Chi tiết bài viết theo đường dẫn tĩnh (slug) | Công khai |
| `GET` | `/api/v1/projects` | Danh sách các dự án tiêu biểu | Công khai |
| `GET` | `/api/v1/settings` | Cấu hình website, thông tin SEO & Theme | Công khai |
| `GET` | `/api/v1/challenge` | Cấp mã băm Proof-of-Work chống bot | Công khai |
| `POST` | `/api/v1/leads` | Nhận form liên hệ khách hàng (kèm giải PoW) | Xác thực mã PoW |
| `GET` | `/api/v1/builder/generate` | Lấy System Prompt mẫu cho AI Builder | Công khai |
| `POST` | `/api/v1/builder/generate` | Hô biến giao diện Svelte & Schema bằng AI | Cookie Admin |

### Ví dụ: Cấp phát Tenant tự động qua cURL

```bash
curl -X POST https://your-domain.com/api/v1/tenants \
  -H "Authorization: Bearer <MASTER_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "brand-agency.com",
    "siteTitle": "Brand Agency Official",
    "themePreset": "apple",
    "homeLayout": "editorial",
    "adminPassword": "strong-password-for-client"
  }'
```

---

## 📁 Cấu Trúc Thư Mục Dự Án (Project Structure)

```text
nido-edge-cms/
├── AGENTS.md                  # 5 Điều luật bất biến cho AI Agents (Design & Tokens)
├── src/
│   ├── content/               # Thư mục lưu trữ dữ liệu JSON theo từng Tenant
│   │   └── default/           # Tenant mặc định (settings, posts, projects, leads...)
│   ├── lib/
│   │   ├── core/              # Universal Engine độc lập (Auth, Storage, Crypto, Content)
│   │   ├── components/        # Thư viện UI chuẩn Apple Minimalist & Svelte 5 Runes
│   │   ├── i18n/              # Hệ thống từ điển đa ngữ song ngữ (vi.ts, en.ts)
│   │   └── server/            # Adapters kết nối SvelteKit với Core Engine
│   └── routes/
│       ├── (public)/          # Giao diện người dùng công khai (Trang chủ, Blog, Dự án)
│       ├── admin/             # Bảng quản trị (/admin/login, /admin/dashboard, /admin/builder)
│       └── api/v1/            # Universal Edge REST API Endpoints
└── scripts/                   # Công cụ kiểm toán quy chuẩn thiết kế & đa ngữ tự động
```

---

## 🛠️ Bộ Công Cụ Kiểm Toán Tự Động (Scripts)

Dự án tích hợp sẵn các công cụ rà soát chất lượng mã nguồn:

```bash
# Kiểm tra lỗi cú pháp TypeScript và Svelte 5 Runes
npm run check

# Kiểm tra quy chuẩn thiết kế Apple Minimalist & cấm hardcode màu sắc
npm run audit:design           # hoặc node scripts/audit-design-system.mjs
node scripts/audit-design-system.mjs --fix  # Tự động sửa icon strokeWidth={1.75}

# Kiểm toán độ đồng bộ song ngữ giữa vi.ts và en.ts
npm run i18n:check
```

---

## ⚖️ Giấy Phép Sử Dụng (License)

Dự án được phân phối theo giấy phép [GNU AGPLv3](LICENSE). Để tích hợp thương mại độc quyền hoặc triển khai các giải pháp doanh nghiệp đóng gói kín mã nguồn, vui lòng tham khảo [COMMERCIAL.md](COMMERCIAL.md).

---

_Được xây dựng & duy trì bởi **Steve Dat** ([@stevedat](https://github.com/stevedat)). Bản quyền thuộc **Nido Holdings**._
