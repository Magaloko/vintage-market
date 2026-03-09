import { useState, useMemo } from 'react'
import { FileSearch, Search, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../lib/useLocalStorage'
import { getRoleProfiles, analyze } from '../../lib/atsEngine'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: 'rgba(255,255,255,0.85)', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }

const roles = getRoleProfiles()

/* ── Score Ring SVG ────────────────────────────────────────── */

function ScoreRing({ score }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 75 ? '#7A8B6F' : score >= 50 ? '#f59e0b' : '#B5736A'

  return (
    <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
      <svg width="130" height="130" viewBox="0 0 130 130">
        <circle cx="65" cy="65" r={r} fill="none" stroke="rgba(44,36,32,0.06)" strokeWidth="8" />
        <circle
          cx="65" cy="65" r={r}
          fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl italic" style={{ color }}>{score}</span>
        <span className="font-body text-[10px] tracking-[0.2em] uppercase" style={{ color: MUTED }}>ATS</span>
      </div>
    </div>
  )
}

/* ── Competency Bar ───────────────────────────────────────── */

function CompetencyBar({ name, data }) {
  const color = data.level === 'strong' ? '#7A8B6F' : data.level === 'partial' ? '#f59e0b' : '#B5736A'
  const label = data.level === 'strong' ? 'Сильно' : data.level === 'partial' ? 'Частично' : 'Отсутствует'
  const Icon = data.level === 'strong' ? CheckCircle : data.level === 'partial' ? AlertTriangle : XCircle

  return (
    <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid rgba(44,36,32,0.05)' }}>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm truncate" style={{ color: INK }}>{name}</p>
      </div>
      <div className="w-24 h-1.5 rounded-full" style={{ backgroundColor: 'rgba(44,36,32,0.06)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${data.fillPct}%`, backgroundColor: color }} />
      </div>
      <div className="flex items-center gap-1 w-28">
        <Icon size={11} style={{ color }} />
        <span className="font-body text-[10px]" style={{ color }}>{label}</span>
        <span className="font-body text-[10px]" style={{ color: FAINT }}>({data.matched.length}/{data.total})</span>
      </div>
    </div>
  )
}

/* ── Main Component ────────────────────────────────────────── */

export default function AdminCVAnalyzer() {
  const [saved, setSaved] = useLocalStorage('cv_last', { cvText: '', jdTexts: ['', '', ''], role: 'sales-rep', result: null })

  const [role, setRole] = useState(saved.role || 'sales-rep')
  const [cvText, setCvText] = useState(saved.cvText || '')
  const [jdTexts, setJdTexts] = useState(saved.jdTexts || ['', '', ''])
  const [activeJd, setActiveJd] = useState(0)
  const [result, setResult] = useState(saved.result || null)
  const [loading, setLoading] = useState(false)

  const wordCount = useMemo(() => cvText.trim().split(/\s+/).filter(Boolean).length, [cvText])

  const handleJdChange = (val) => {
    setJdTexts((prev) => prev.map((t, i) => (i === activeJd ? val : t)))
  }

  const handleAnalyze = () => {
    if (cvText.trim().length < 100) return toast.error('Минимум 100 символов CV')
    if (!jdTexts.some((t) => t.trim().length > 50)) return toast.error('Введите хотя бы одну вакансию')

    setLoading(true)
    setTimeout(() => {
      const res = analyze(cvText, jdTexts, role)
      setResult(res)
      setSaved({ cvText, jdTexts, role, result: res })
      setLoading(false)
      toast.success(`ATS Score: ${res.score}/100`)
    }, 400)
  }

  return (
    <div className="page-enter">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(176, 141, 87, 0.1)' }}>
          <FileSearch size={20} style={{ color: GOLD }} />
        </div>
        <div>
          <h1 className="font-display text-2xl italic" style={{ color: INK }}>CV Анализатор</h1>
          <p className="font-body text-sm mt-0.5" style={{ color: MUTED }}>
            ATS-оценка кандидатов на позиции продавцов и представителей
          </p>
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Input */}
        <div className="space-y-4">
          {/* Role */}
          <div style={panelStyle} className="p-4">
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>Целевая роль</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="gdt-input">
              {roles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>

          {/* CV Text */}
          <div style={panelStyle} className="p-4">
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>Резюме (текст)</label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              rows={12}
              className="gdt-input resize-none text-sm"
              placeholder="Вставьте текст резюме кандидата (plain text)..."
            />
            <p className="font-body text-[10px] mt-1.5" style={{ color: FAINT }}>{wordCount} слов</p>
          </div>

          {/* JD Tabs */}
          <div style={panelStyle} className="p-4">
            <label className="font-body text-[10px] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>Описание вакансии (1–3)</label>
            <div className="flex gap-1 mb-2">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  onClick={() => setActiveJd(i)}
                  className="px-3 py-1 font-body text-xs transition-all"
                  style={{
                    backgroundColor: activeJd === i ? 'rgba(176,141,87,0.12)' : 'transparent',
                    color: activeJd === i ? GOLD : MUTED,
                    borderRadius: '2px',
                  }}
                >
                  JD {i + 1}
                </button>
              ))}
            </div>
            <textarea
              value={jdTexts[activeJd]}
              onChange={(e) => handleJdChange(e.target.value)}
              rows={8}
              className="gdt-input resize-none text-sm"
              placeholder="Вставьте текст вакансии..."
            />
          </div>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 font-body text-sm tracking-wider uppercase transition-opacity"
            style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px', opacity: loading ? 0.6 : 1 }}
          >
            <Search size={16} />
            {loading ? 'Анализируем...' : 'Рассчитать ATS-Score'}
          </button>
        </div>

        {/* RIGHT — Results */}
        <div className="space-y-4">
          {!result ? (
            <div style={panelStyle} className="p-12 text-center">
              <FileSearch size={40} className="mx-auto mb-4" style={{ color: FAINT }} />
              <p className="font-body text-sm" style={{ color: FAINT }}>
                Вставьте CV и вакансию, затем нажмите «Рассчитать»
              </p>
            </div>
          ) : (
            <>
              {/* Score + Breakdown */}
              <div style={panelStyle} className="p-4">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(44,36,32,0.4)' }}>
                  Общий Score — {result.roleLabel}
                </p>
                <div className="flex items-center gap-6">
                  <ScoreRing score={result.score} />
                  <div className="flex-1 space-y-3">
                    {[
                      { label: 'Keywords', pct: result.breakdown.keywords.score, w: 40, color: GOLD },
                      { label: 'Структура', pct: result.breakdown.structure.score, w: 30, color: '#3b82f6' },
                      { label: 'Результаты', pct: result.breakdown.results.score, w: 30, color: '#7A8B6F' },
                    ].map((d) => (
                      <div key={d.label}>
                        <div className="flex justify-between font-body text-xs mb-1">
                          <span style={{ color: MUTED }}>{d.label} ({d.w}%)</span>
                          <span style={{ color: INK }}>{d.pct}/100</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(44,36,32,0.06)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${d.pct}%`, backgroundColor: d.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Competency Matrix */}
              <div style={panelStyle} className="p-4">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(44,36,32,0.4)' }}>Матрица компетенций</p>
                {Object.entries(result.competencies).map(([name, data]) => (
                  <CompetencyBar key={name} name={name} data={data} />
                ))}
              </div>

              {/* Keyword Gaps */}
              <div style={panelStyle} className="p-4">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(44,36,32,0.4)' }}>Keyword-анализ</p>
                {result.keywords.found.length > 0 && (
                  <div className="mb-3">
                    <p className="font-body text-xs mb-1.5" style={{ color: '#7A8B6F' }}>✓ Найдено ({result.keywords.found.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {result.keywords.found.slice(0, 15).map((kw) => (
                        <span key={kw} className="px-2 py-0.5 font-body text-[10px] rounded-sm" style={{ backgroundColor: 'rgba(122,139,111,0.1)', color: '#7A8B6F' }}>{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {result.keywords.missing.length > 0 && (
                  <div>
                    <p className="font-body text-xs mb-1.5" style={{ color: '#B5736A' }}>✕ Отсутствуют ({result.keywords.missing.length})</p>
                    <div className="flex flex-wrap gap-1">
                      {result.keywords.missing.map((kw) => (
                        <span key={kw} className="px-2 py-0.5 font-body text-[10px] rounded-sm" style={{ backgroundColor: 'rgba(181,115,106,0.1)', color: '#B5736A' }}>{kw}</span>
                      ))}
                    </div>
                    <p className="font-body text-[10px] mt-2" style={{ color: FAINT }}>Интегрируйте эти ключевые слова в bullet points</p>
                  </div>
                )}
              </div>

              {/* 4-Step Recommendations */}
              <div style={panelStyle} className="p-4">
                <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(44,36,32,0.4)' }}>4 шага репозиционирования</p>
                <div className="space-y-3">
                  {result.steps.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div
                        className="w-6 h-6 flex-shrink-0 flex items-center justify-center rounded-full font-body text-[10px] font-medium"
                        style={{ backgroundColor: 'rgba(176,141,87,0.1)', color: GOLD }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-body text-sm font-medium" style={{ color: INK }}>{step.title}</p>
                        <p className="font-body text-xs mt-0.5" style={{ color: MUTED }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
