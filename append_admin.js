const fs = require('fs');
fs.appendFileSync('app/actions/admin.ts', `
export async function fetchGoogleSheetCsv(csvUrl: string) {
  try {
    const res = await fetch(csvUrl, { cache: 'no-store' })
    if (!res.ok) return { error: 'Không thể tải file Google Sheet. Đảm bảo file được chia sẻ công khai.' }
    const text = await res.text()
    return { data: text }
  } catch (err: any) {
    return { error: 'Lỗi tải file: ' + err.message }
  }
}
`);
console.log('Appended fetchGoogleSheetCsv');
