import { useState, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getPriceHistory } from '../../lib/api'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div
      style={{
        backgroundColor: '#0C0A08',
        border: '1px solid rgba(240,230,214,0.1)',
        borderRadius: 8,
        padding: '8px 12px',
        color: '#F0E6D6',
        fontFamily: 'DM Sans, sans-serif',
        fontSize: 13,
      }}
    >
      <p style={{ margin: 0, fontWeight: 500 }}>
        {`Цена: ${payload[0].value}\u20AC`}
      </p>
      <p style={{ margin: 0, opacity: 0.6, fontSize: 12, marginTop: 2 }}>
        {label}
      </p>
    </div>
  )
}

export default function PriceHistoryChart({ productId }) {
  const [chartData, setChartData] = useState(null)

  useEffect(() => {
    if (!productId) return

    let cancelled = false

    async function fetchData() {
      const { data, error } = await getPriceHistory(productId)

      if (cancelled) return
      if (error || !data || data.length < 2) {
        setChartData(null)
        return
      }

      const mapped = data.map((entry) => {
        const d = new Date(entry.changed_at)
        const day = String(d.getDate()).padStart(2, '0')
        const month = String(d.getMonth() + 1).padStart(2, '0')
        return {
          date: `${day}.${month}`,
          price: entry.price,
        }
      })

      setChartData(mapped)
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [productId])

  if (!chartData || chartData.length < 2) return null

  const axisTick = {
    fontSize: 12,
    fill: 'rgba(44,36,32,0.35)',
    fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <section className="mt-6">
      <h3
        className="font-display text-lg mb-3"
        style={{ color: '#0C0A08' }}
      >
        История цен
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B08D57" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#B08D57" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(44,36,32,0.08)"
            vertical={false}
          />

          <XAxis
            dataKey="date"
            tick={axisTick}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={axisTick}
            axisLine={false}
            tickLine={false}
            width={45}
            tickFormatter={(v) => `${v}\u20AC`}
          />

          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="price"
            stroke="#B08D57"
            strokeWidth={2}
            fill="url(#priceGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#B08D57', stroke: '#0C0A08', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </section>
  )
}
