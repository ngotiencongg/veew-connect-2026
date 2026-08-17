'use client'
import { useState, useTransition } from 'react'
import Papa from 'papaparse'
import { importBuyers, type ImportBuyerRow } from '@/app/actions/admin'

type ParsedRow = ImportBuyerRow & { _error?: string }
type ImportResult = { email: string; status: 'success' | 'error'; message?: string }

export default function ImportPage() {
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [results, setResults] = useState<ImportResult[]>([])
  const [step, setStep] = useState<'upload' | 'preview' | 'done'>('upload')
  const [isPending, startTransition] = useTransition()
  const [sheetUrl, setSheetUrl] = useState('')
  const [sheetError, setSheetError] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (res: { data: any[] }) => {
        const parsed: ParsedRow[] = res.data.map((row: any) => ({
          email: (row.email || row['e-mail'] || '').trim(),
          full_name: (row.full_name || row.name || row.họ_tên || '').trim(),
          company: (row.company || row.công_ty || '').trim(),
          position: (row.position || row.chức_vụ || '').trim() || undefined,
          phone: (row.phone || row.điện_thoại || '').trim() || undefined,
          industry: (row.industry || row.ngành || '').trim() || undefined,
          country: (row.country || row.quốc_gia || '').trim() || undefined,
        }))
        setRows(parsed)
        setStep('preview')
      },
    })
  }

  async function fetchFromSheet() {
    setSheetError('')
    if (!sheetUrl.includes('docs.google.com/spreadsheets')) {
      setSheetError('Vui lòng nhập đúng URL Google Sheet.')
      return
    }
    // Convert to CSV export URL
    const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
    if (!match) { setSheetError('Không thể phân tích URL.'); return }
    const id = match[1]
    const csvUrl = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv`

    try {
      const res = await fetch(csvUrl)
      const text = await res.text()
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h: string) => h.trim().toLowerCase().replace(/\s+/g, '_'),
        complete: (parsed: { data: any[] }) => {
          const data: ParsedRow[] = parsed.data.map((row: any) => ({
            email: (row.email || '').trim(),
            full_name: (row.full_name || row.name || '').trim(),
            company: (row.company || '').trim(),
            position: (row.position || '').trim() || undefined,
            phone: (row.phone || '').trim() || undefined,
            industry: (row.industry || '').trim() || undefined,
            country: (row.country || '').trim() || undefined,
          }))
          setRows(data)
          setStep('preview')
        },
      })
    } catch {
      setSheetError('Không thể tải dữ liệu. Đảm bảo Sheet đã được chia sẻ công khai.')
    }
  }

  function doImport() {
    const validRows = rows.filter(r => r.email && r.full_name && r.company)
    startTransition(async () => {
      const result = await importBuyers(validRows)
      setResults(result.results)
      setStep('done')
    })
  }

  const successCount = results.filter(r => r.status === 'success').length
  const errorCount = results.filter(r => r.status === 'error').length

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Import Buyers</h1>

      {step === 'upload' && (
        <div className="grid gap-4 max-w-2xl">
          {/* CSV upload */}
          <div className="card p-6">
            <h3 className="font-semibold mb-3">📁 Upload file CSV / Excel (lưu dạng CSV)</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              File CSV cần có các cột: <code className="text-purple-400">email, full_name, company</code> (bắt buộc),
              và tuỳ chọn: <code className="text-purple-400">position, phone, industry, country</code>
            </p>
            <label className="btn-grad cursor-pointer inline-block text-sm">
              Chọn file CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
            </label>
          </div>

          {/* Google Sheet */}
          <div className="card p-6">
            <h3 className="font-semibold mb-3">📊 Nhập từ Google Sheet</h3>
            <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
              Sheet phải được chia sẻ "Anyone with the link" và có cùng cấu trúc cột như CSV.
            </p>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="https://docs.google.com/spreadsheets/d/..."
                value={sheetUrl}
                onChange={e => setSheetUrl(e.target.value)}
              />
              <button onClick={fetchFromSheet} className="btn-grad whitespace-nowrap">Tải dữ liệu</button>
            </div>
            {sheetError && <p className="text-red-400 text-sm mt-2">{sheetError}</p>}
          </div>

          {/* Download template */}
          <div className="card p-4 text-sm" style={{ background: 'rgba(0,188,212,.05)', borderColor: 'rgba(0,188,212,.2)' }}>
            <p style={{ color: 'var(--muted)' }}>
              💡 Cần template? Tạo file với dòng đầu tiên là header:
              <br />
              <code className="text-cyan-400 text-xs">email,full_name,company,position,phone,industry,country</code>
            </p>
          </div>
        </div>
      )}

      {step === 'preview' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Xem trước — {rows.length} dòng</h3>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Hợp lệ: {rows.filter(r => r.email && r.full_name && r.company).length} /
                Thiếu dữ liệu: {rows.filter(r => !r.email || !r.full_name || !r.company).length}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('upload')} className="btn-outline text-sm">Quay lại</button>
              <button onClick={doImport} disabled={isPending} className="btn-grad text-sm"
                style={{ background: 'linear-gradient(135deg, #00BCD4, #7B2FBE)' }}>
                {isPending ? 'Đang import...' : `Import ${rows.filter(r => r.email && r.full_name && r.company).length} buyers`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
              <thead>
                <tr style={{ color: 'var(--muted)' }}>
                  <th className="text-left px-3 py-2 text-xs">#</th>
                  <th className="text-left px-3 py-2 text-xs">Email</th>
                  <th className="text-left px-3 py-2 text-xs">Họ tên</th>
                  <th className="text-left px-3 py-2 text-xs">Công ty</th>
                  <th className="text-left px-3 py-2 text-xs">Chức vụ</th>
                  <th className="text-left px-3 py-2 text-xs">Ngành</th>
                  <th className="text-left px-3 py-2 text-xs">QG</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const valid = row.email && row.full_name && row.company
                  return (
                    <tr key={i} className="card" style={{ opacity: valid ? 1 : 0.5 }}>
                      <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted)' }}>{i + 1}</td>
                      <td className="px-3 py-2">{row.email || <span className="text-red-400">⚠ thiếu</span>}</td>
                      <td className="px-3 py-2">{row.full_name || <span className="text-red-400">⚠ thiếu</span>}</td>
                      <td className="px-3 py-2">{row.company || <span className="text-red-400">⚠ thiếu</span>}</td>
                      <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted)' }}>{row.position}</td>
                      <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted)' }}>{row.industry}</td>
                      <td className="px-3 py-2 text-xs" style={{ color: 'var(--muted)' }}>{row.country}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 'done' && (
        <div>
          <div className="grid grid-cols-2 gap-4 mb-6 max-w-sm">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--green)' }}>{successCount}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Thành công</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: 'var(--red)' }}>{errorCount}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Lỗi</p>
            </div>
          </div>

          <div className="grid gap-2 mb-6">
            {results.map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span>{r.status === 'success' ? '✅' : '❌'}</span>
                <span>{r.email}</span>
                {r.message && <span className="text-xs text-red-400">{r.message}</span>}
              </div>
            ))}
          </div>

          <button onClick={() => { setStep('upload'); setRows([]); setResults([]) }} className="btn-outline">
            Import thêm
          </button>
        </div>
      )}
    </div>
  )
}
