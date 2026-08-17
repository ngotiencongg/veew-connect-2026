import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = `${process.env.RESEND_FROM_NAME} <${process.env.RESEND_FROM_EMAIL}>`
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://connect.veew.vn'

// ── Buyer approval + credentials ─────────────────────────────
export async function sendBuyerCredentials(opts: {
  to: string
  name: string
  password: string
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: '🎉 Tài khoản VEEW Connect 2026 của bạn đã được phê duyệt',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#1a1a2e">
        <div style="background:linear-gradient(135deg,#7B2FBE,#E91E8C);padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:24px">VEEW Connect 2026</h1>
          <p style="color:rgba(255,255,255,.8);margin:8px 0 0">Vietnam Event & Exhibition Week</p>
        </div>
        <div style="background:#f9f7ff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e8d5ff">
          <h2 style="color:#7B2FBE">Xin chào ${opts.name}!</h2>
          <p>Đăng ký Hosted Buyer của bạn đã được <strong style="color:#00C853">phê duyệt</strong>.
          Dưới đây là thông tin đăng nhập vào hệ thống VEEW Connect 2026:</p>
          <div style="background:#fff;border:2px solid #7B2FBE;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>🌐 Link đăng nhập:</strong><br>
              <a href="${APP_URL}/buyer/login" style="color:#7B2FBE">${APP_URL}/buyer/login</a></p>
            <p style="margin:8px 0"><strong>📧 Email:</strong> ${opts.to}</p>
            <p style="margin:8px 0 0"><strong>🔑 Mật khẩu:</strong> ${opts.password}</p>
          </div>
          <p style="color:#666;font-size:14px">Vui lòng đổi mật khẩu sau khi đăng nhập lần đầu.</p>
          <div style="text-align:center;margin-top:24px">
            <a href="${APP_URL}/buyer/login"
               style="background:linear-gradient(135deg,#7B2FBE,#E91E8C);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
              Đăng nhập ngay →
            </a>
          </div>
          <hr style="margin:24px 0;border:none;border-top:1px solid #e8d5ff">
          <p style="font-size:12px;color:#999;text-align:center">
            VEEW 2026 • Vietnam Exposition Center, Hà Nội • 17–19/10/2026
          </p>
        </div>
      </div>`,
  })
}

// ── Exhibitor account creation ────────────────────────────────
export async function sendExhibitorCredentials(opts: {
  to: string
  name: string
  company: string
  password: string
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: '🏢 Tài khoản Exhibitor VEEW Connect 2026',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#7B2FBE,#E91E8C);padding:32px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0">VEEW Connect 2026</h1>
        </div>
        <div style="background:#f9f7ff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e8d5ff">
          <h2 style="color:#7B2FBE">Xin chào ${opts.name}!</h2>
          <p>Ban Tổ Chức VEEW đã tạo tài khoản Exhibitor cho <strong>${opts.company}</strong>.
          Dùng thông tin sau để đăng nhập và quản lý lịch tiếp khách:</p>
          <div style="background:#fff;border:2px solid #7B2FBE;border-radius:8px;padding:20px;margin:20px 0">
            <p style="margin:0 0 8px"><strong>🌐 Link đăng nhập:</strong><br>
              <a href="${APP_URL}/exhibitor/login">${APP_URL}/exhibitor/login</a></p>
            <p style="margin:8px 0"><strong>📧 Email:</strong> ${opts.to}</p>
            <p style="margin:8px 0 0"><strong>🔑 Mật khẩu:</strong> ${opts.password}</p>
          </div>
          <p>Sau khi đăng nhập, bạn có thể:</p>
          <ul style="color:#444">
            <li>Thêm các slot thời gian bạn sẵn sàng tiếp khách</li>
            <li>Duyệt hoặc từ chối yêu cầu đặt lịch từ Buyers</li>
            <li>Đề xuất cuộc gặp qua Ban Tổ Chức</li>
          </ul>
          <div style="text-align:center;margin-top:24px">
            <a href="${APP_URL}/exhibitor/login"
               style="background:linear-gradient(135deg,#7B2FBE,#E91E8C);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
              Đăng nhập →
            </a>
          </div>
        </div>
      </div>`,
  })
}

// ── Meeting confirmation ──────────────────────────────────────
export async function sendMeetingConfirmation(opts: {
  to: string
  buyerName: string
  exhibitorName: string
  date: string
  time: string
  venue: string
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `✅ Lịch hẹn đã xác nhận: ${opts.exhibitorName} — ${opts.date}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#7B2FBE,#E91E8C);padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">Lịch hẹn đã xác nhận ✅</h1>
        </div>
        <div style="background:#f9f7ff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e8d5ff">
          <p>Xin chào <strong>${opts.buyerName}</strong>,</p>
          <p>Lịch hẹn của bạn với <strong>${opts.exhibitorName}</strong> đã được xác nhận:</p>
          <div style="background:#fff;border-left:4px solid #00C853;padding:16px 20px;border-radius:0 8px 8px 0;margin:16px 0">
            <p style="margin:0 0 6px">📅 <strong>${opts.date}</strong></p>
            <p style="margin:0 0 6px">🕐 <strong>${opts.time}</strong> (30 phút)</p>
            <p style="margin:0">📍 <strong>${opts.venue}</strong></p>
          </div>
          <p style="color:#666;font-size:14px">Vui lòng có mặt đúng giờ. Mang theo card visit và tài liệu giới thiệu nếu cần.</p>
        </div>
      </div>`,
  })
}

// ── Booking notification to exhibitor ────────────────────────
export async function sendBookingNotificationToExhibitor(opts: {
  to: string
  exhibitorName: string
  buyerName: string
  buyerCompany: string
  date: string
  time: string
  notes?: string
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.to,
    subject: `📅 Yêu cầu đặt lịch mới từ ${opts.buyerName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:linear-gradient(135deg,#7B2FBE,#E91E8C);padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:20px">Yêu cầu đặt lịch mới 📅</h1>
        </div>
        <div style="background:#f9f7ff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e8d5ff">
          <p>Xin chào <strong>${opts.exhibitorName}</strong>,</p>
          <p>Bạn có một yêu cầu đặt lịch mới:</p>
          <div style="background:#fff;border:1px solid #e8d5ff;border-radius:8px;padding:16px 20px;margin:16px 0">
            <p style="margin:0 0 6px">👤 <strong>${opts.buyerName}</strong> — ${opts.buyerCompany}</p>
            <p style="margin:0 0 6px">📅 ${opts.date} lúc ${opts.time}</p>
            ${opts.notes ? `<p style="margin:0;color:#666;font-style:italic">💬 ${opts.notes}</p>` : ''}
          </div>
          <div style="text-align:center;margin-top:24px">
            <a href="${APP_URL}/exhibitor/requests"
               style="background:linear-gradient(135deg,#7B2FBE,#E91E8C);color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
              Duyệt yêu cầu →
            </a>
          </div>
        </div>
      </div>`,
  })
}
