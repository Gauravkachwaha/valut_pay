import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { reportService } from '../../services/reportService'
import { analyticsService } from '../../services/analyticsService'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate } from '../../utils/formatDate'
import Spinner from '../../components/common/Spinner'
import EmptyState from '../../components/common/EmptyState'

const REPORT_TYPES = ['DAILY', 'WEEKLY', 'MONTHLY']
const FILE_TYPES = ['PDF', 'EXCEL']

export default function Reports() {
  const [reportType, setReportType] = useState('DAILY')
  const [fileType, setFileType] = useState('PDF')
  const [generating, setGenerating] = useState(false)
  const [reports, setReports] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchReports = async () => {
    try {
      const { data } = await reportService.myReports()
      const list = Array.isArray(data) ? data : data?.reports || data?.content || []
      setReports(list)
    } catch {
      toast.error('Failed to load reports')
    }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [reportsRes, metricsRes] = await Promise.allSettled([
          reportService.myReports(),
          analyticsService.metrics(),
        ])
        if (reportsRes.status === 'fulfilled') {
          const data = reportsRes.value.data
          setReports(
            Array.isArray(data) ? data : data?.reports || data?.content || []
          )
        }
        if (metricsRes.status === 'fulfilled') {
          setMetrics(metricsRes.value.data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const title = `PayVault ${reportType} Report`
      await reportService.generate({ reportType, fileType, title })
      toast.success('Report generated successfully')
      await fetchReports()
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          'Failed to generate report'
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="mt-1 text-cred-text-secondary">
          Generate and download platform reports.
        </p>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card lg:col-span-2">
          <h2 className="font-semibold text-white">Generate Report</h2>

          <div className="mt-4">
            <p className="text-sm font-medium text-cred-text-secondary">Report Type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {REPORT_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setReportType(t)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    reportType === t
                      ? 'bg-cred-gold text-white'
                      : 'border-2 border-cred-border bg-cred-card text-cred-text-secondary hover:bg-cred-elevated'
                  }`}
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium text-cred-text-secondary">File Type</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {FILE_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFileType(t)}
                  className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    fileType === t
                      ? 'bg-cred-gold text-white'
                      : 'border-2 border-cred-border bg-cred-card text-cred-text-secondary hover:bg-cred-elevated'
                  }`}
                >
                  {t === 'EXCEL' ? 'Excel' : t}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={generating}
            onClick={handleGenerate}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-sm font-bold tracking-wide text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-cred-gold hover:shadow-md disabled:opacity-50"
          >
            {generating ? <Spinner className="h-4 w-4" /> : null}
            {generating ? 'Generating...' : '🔄 Generate Report'}
          </button>
        </div>

        <div className="rounded-2xl border border-cred-border bg-cred-card p-6 shadow-cred-card">
          <h2 className="font-semibold text-white">Metrics</h2>
          {loading && !metrics ? (
            <div className="mt-4 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-cred-elevated" />
              ))}
            </div>
          ) : (
            <dl className="mt-4 space-y-3 text-sm">
              <MetricRow
                label="Total Loans Ever"
                value={metrics?.totalLoansEver ?? metrics?.totalLoans ?? '—'}
              />
              <MetricRow
                label="Total Collected Ever"
                value={formatCurrency(
                  metrics?.totalCollectedEver ?? metrics?.totalCollected
                )}
              />
              <MetricRow
                label="Active Loans"
                value={metrics?.activeLoans ?? '—'}
              />
              <MetricRow
                label="NPA Loans"
                value={metrics?.npaLoans ?? metrics?.npaAccounts ?? '—'}
              />
            </dl>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cred-border bg-cred-card shadow-cred-card">
        <div className="border-b border-cred-border px-5 py-4">
          <h2 className="font-semibold text-white">My Reports</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded-lg bg-cred-elevated" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <EmptyState
              icon="📄"
              title="No reports yet"
              description="Generate your first report to get started"
            />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-cred-border bg-cred-elevated text-xs uppercase text-cred-text-secondary">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">File</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cred-border">
                {reports.map((report) => (
                  <tr key={report.id || report.reportName} className="hover:bg-cred-elevated">
                    <td className="px-5 py-3 font-medium text-white">
                      {report.reportName || 'PayVault Report'}
                    </td>
                    <td className="px-5 py-3 text-cred-text-secondary">
                      {report.reportType
                        ? report.reportType.charAt(0) +
                          report.reportType.slice(1).toLowerCase()
                        : '—'}
                    </td>
                    <td className="px-5 py-3 text-cred-text-secondary">
                      {report.fileType}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-cred-green/10 px-2.5 py-0.5 text-xs font-medium text-cred-green">
                        ✅ {report.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-cred-text-secondary">
                      {formatDate(report.generatedAt)}
                    </td>
                    <td className="px-5 py-3 text-cred-text-secondary">
                      {report.fileSizeBytes
                        ? report.fileSizeBytes + ' B'
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

function MetricRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-cred-elevated px-4 py-3">
      <dt className="text-cred-text-secondary">{label}</dt>
      <dd className="font-semibold text-white">{value}</dd>
    </div>
  )
}
