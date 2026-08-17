# Hướng dẫn triển khai VEEW Connect 2026

## Tổng quan

Bạn cần tạo tài khoản trên 4 dịch vụ sau (tất cả đều miễn phí cho mức dùng nhỏ):

| Dịch vụ | Dùng để | Link đăng ký |
|---------|---------|--------------|
| **GitHub** | Lưu code | github.com |
| **Supabase** | Database + Auth | supabase.com |
| **Resend** | Gửi email | resend.com |
| **Vercel** | Hosting website | vercel.com |

---

## Bước 1: Tạo tài khoản GitHub

1. Vào **github.com** → click **Sign up**
2. Nhập email, tạo password, chọn username (ví dụ: `veew2026`)
3. Xác nhận email
4. Tạo repository mới:
   - Click dấu **+** góc trên phải → **New repository**
   - Repository name: `veew-connect`
   - Chọn **Private**
   - Click **Create repository**
5. GitHub sẽ hiển thị lệnh để upload code. Ghi lại URL dạng:
   `https://github.com/[username]/veew-connect.git`

---

## Bước 2: Upload code lên GitHub

Nhờ kỹ thuật viên chạy các lệnh sau từ thư mục `/root/veew-connect/`:

```bash
cd /root/veew-connect
git init
git add .
git commit -m "Initial commit: VEEW Connect 2026"
git branch -M main
git remote add origin https://github.com/[username]/veew-connect.git
git push -u origin main
```

---

## Bước 3: Tạo tài khoản & dự án Supabase

### 3.1. Đăng ký
1. Vào **supabase.com** → **Start your project** → đăng nhập bằng GitHub
2. Click **New project**
3. Điền:
   - **Name**: `veew-connect`
   - **Database Password**: tạo password mạnh, **lưu lại cẩn thận**
   - **Region**: `Southeast Asia (Singapore)` — gần Việt Nam nhất
4. Click **Create new project** — đợi khoảng 2 phút

### 3.2. Chạy schema database
1. Trong Supabase dashboard, click **SQL Editor** (biểu tượng < > bên trái)
2. Click **New query**
3. Mở file `supabase/schema.sql` trong code
4. Copy toàn bộ nội dung → Paste vào SQL Editor
5. Click **Run** (hoặc Ctrl+Enter)
6. Kiểm tra: không có lỗi đỏ, thấy "Success"

### 3.3. Lấy API keys
1. Vào **Project Settings** (biểu tượng bánh răng) → **API**
2. Ghi lại 3 giá trị:
   - **Project URL** → đây là `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → đây là `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → đây là `SUPABASE_SERVICE_ROLE_KEY` ⚠️ *Giữ bí mật, không public*

### 3.4. Tạo tài khoản Admin
1. Vào **Authentication** → **Users** → **Add user** → **Create new user**
2. Điền email và password của quản trị viên
3. Click **Create user**
4. Vào **SQL Editor**, chạy lệnh sau (thay bằng ID của user vừa tạo):
```sql
INSERT INTO profiles (id, email, full_name, role, status)
VALUES (
  '[USER_ID_từ_bước_trên]',
  'admin@veew.vn',
  'Ban Tổ Chức VEEW',
  'admin',
  'approved'
);
```
   - User ID có dạng `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
   - Tìm ID trong tab **Authentication** → **Users**

---

## Bước 4: Tạo tài khoản Resend (gửi email)

1. Vào **resend.com** → **Get Started** → đăng ký
2. Vào **API Keys** → **Create API Key**
   - Name: `veew-connect`
   - Permission: **Full access**
   - Click **Add** → Copy key bắt đầu bằng `re_...`
3. Vào **Domains** → **Add Domain** → nhập `veew.vn`
4. Làm theo hướng dẫn thêm DNS records vào nhà cung cấp tên miền (CloudFlare, Namecheap, etc.)
5. Sau khi xác minh domain, email từ `noreply@veew.vn` sẽ hoạt động

> **Nếu chưa có domain:** Dùng email mặc định `onboarding@resend.dev` trong lúc test (chỉ gửi được đến email đã đăng ký Resend).

---

## Bước 5: Deploy lên Vercel

### 5.1. Đăng ký Vercel
1. Vào **vercel.com** → **Sign Up** → chọn **Continue with GitHub**
2. Authorize Vercel truy cập GitHub

### 5.2. Import project
1. Click **Add New** → **Project**
2. Tìm repository `veew-connect` → click **Import**
3. Framework: Next.js (tự nhận)
4. **QUAN TRỌNG**: Trước khi click Deploy, nhập các biến môi trường:

### 5.3. Nhập Environment Variables

Click **Environment Variables** và thêm từng biến:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL từ Supabase (bước 3.3) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key từ Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key từ Supabase |
| `RESEND_API_KEY` | API key từ Resend (bước 4) |
| `RESEND_FROM_EMAIL` | `noreply@veew.vn` |
| `RESEND_FROM_NAME` | `VEEW Connect 2026` |
| `NEXT_PUBLIC_APP_URL` | `https://connect.veew.vn` |

5. Click **Deploy** → đợi 2–3 phút

### 5.4. Kết quả
Vercel sẽ cấp một URL tạm như `veew-connect-xxx.vercel.app`. Website đã hoạt động!

---

## Bước 6: Kết nối domain connect.veew.vn

### 6.1. Thêm domain vào Vercel
1. Vào project trong Vercel → **Settings** → **Domains**
2. Nhập `connect.veew.vn` → **Add**
3. Vercel hiển thị các DNS records cần thêm

### 6.2. Thêm DNS records
Vào nơi quản lý DNS của domain `veew.vn` (CloudFlare, Namecheap, etc.):
- Thêm **CNAME record**: `connect` → `cname.vercel-dns.com`
- Hoặc theo hướng dẫn cụ thể từ Vercel

### 6.3. Cập nhật Supabase
Vào **Supabase** → **Authentication** → **URL Configuration**:
- **Site URL**: `https://connect.veew.vn`
- **Redirect URLs**: thêm `https://connect.veew.vn/**`

---

## Kiểm tra sau khi deploy

Mở trình duyệt và truy cập `https://connect.veew.vn`:

- [ ] Trang chủ hiển thị đúng với 3 portal cards
- [ ] Đăng nhập Admin thành công với tài khoản đã tạo ở bước 3.4
- [ ] Tạo 1 exhibitor test → nhận được email
- [ ] Buyer tự đăng ký → xuất hiện trong Admin → phê duyệt → buyer nhận email với mật khẩu
- [ ] Buyer đăng nhập, đặt lịch → exhibitor nhận thông báo email

---

## Cập nhật code sau này

Mỗi khi sửa code:
```bash
git add .
git commit -m "Mô tả thay đổi"
git push
```

Vercel sẽ tự động deploy lại trong 2–3 phút.

---

## Hỗ trợ kỹ thuật

Nếu gặp vấn đề:
- **Supabase**: supabase.com/docs
- **Vercel**: vercel.com/docs
- **Resend**: resend.com/docs
- Kiểm tra **Vercel** → **Functions** → **Logs** để xem lỗi runtime
