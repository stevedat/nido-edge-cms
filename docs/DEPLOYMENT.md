# Deployment Guide — Nido Edge CMS

## 🚀 Preparing for Deployment

### 1. Configure Environment Variables

In your hosting dashboard (Vercel, Cloudflare, etc.), add these environment variables:

```bash
# Site Configuration
SITE_URL="https://your-domain.com"
ROOT_DOMAIN="your-domain.com"

# Admin Dashboard Authentication
ADMIN_PASSWORD="<generate-a-strong-password>"
JWT_SECRET="<generate-a-random-64-char-hex-string>"
JWT_EXPIRES_IN="7d"

# Optional: GitHub Content Sync (For Git-backed CMS workflow)
# GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
# GITHUB_REPO="your-username/your-repo"
# GITHUB_BRANCH="main"
# GITHUB_COMMITTER_NAME="Edge CMS Bot"
# GITHUB_COMMITTER_EMAIL="bot@example.com"

# Environment
NODE_ENV="production"
```

> **Security Note:** Generate `JWT_SECRET` with `openssl rand -hex 32` and create a strong `ADMIN_PASSWORD` with mixed characters. Never commit real credentials to version control.

### 2. Deploy to Vercel

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy
vercel

# Or deploy from GitHub:
# 1. Push code to GitHub
# 2. Connect repository in Vercel Dashboard
# 3. Automatic deployment on push
```

### 3. Deploy to Cloudflare Pages

```bash
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare
```

### 4. Custom Domain Setup

1. In your hosting dashboard, add your custom domain.
2. Configure DNS records at your domain registrar:

| Type | Name | Value |
| :--- | :--- | :--- |
| **CNAME** | `@` | `cname.vercel-dns.com` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

SSL certificates are provisioned automatically within 1–5 minutes.

---

## 🔐 Admin Access

After deployment:

1. Navigate to `https://your-domain.com/admin/login`
2. Log in with the `ADMIN_PASSWORD` you configured in your environment variables.
3. **Immediately change the password** in Settings → Security & Admin Password.

---

## 🛠️ Features

- ✅ Role-based admin authentication (JWT)
- ✅ Multi-tenant domain routing (Edge)
- ✅ CRUD for Posts, Videos, Projects
- ✅ Tiptap WYSIWYG + Markdown editor
- ✅ Video embed (YouTube, Vimeo, TikTok, etc.)
- ✅ File upload system
- ✅ 4 Apple Minimalist theme presets
- ✅ Bilingual i18n (Vietnamese / English)
- ✅ OLED Dark Mode
- ✅ Responsive design (Mobile-first)
- ✅ Git-backed JSON content storage

---

## 📱 Access Points

- **Website**: `https://your-domain.com`
- **Admin Panel**: `https://your-domain.com/admin`

---

## 🔧 Troubleshooting

### Common Issues

1. **Login fails**:
   - Verify `ADMIN_PASSWORD` env var is set correctly.
   - Check that `JWT_SECRET` is configured.

2. **Content not updating**:
   - If using GitHub sync, verify `GITHUB_TOKEN` has write access.
   - Check server logs for file write permission errors.

3. **Build errors**:
   - Environment variables are needed at runtime, not build time.
   - Run `npm run check` locally before deploying.

### Debug

```bash
# Check logs
vercel logs your-app-url

# Local development
npm run dev
```

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](LICENSE) for details.