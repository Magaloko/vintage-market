import { useState } from 'react'
import { X, Copy, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../../lib/useLocalStorage'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: '#FFFFFF', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }
const fmtCur = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n || 0)

const STAGE_PROMPTS = {
  Prospecting: {
    title: 'Скрипты холодного контакта',
    scripts: (d) => [
      {
        title: 'Insight-подход',
        content: `Тема: Мысли о B2B-стратегии ${d.company}\n\nЗдравствуйте, ${d.decision_makers?.[0] || 'команда'},\n\nМы заметили, что компании вашей отрасли сталкиваются с [отраслевая проблема]. Это часто ведёт к [бизнес-последствие].\n\nМы изучили ${d.company} и считаем, что 15-минутный разговор о возможных решениях будет полезен.\n\nБудет ли удобно пятница 14:00–15:00 по CET?\n\nС уважением`,
        notes: 'Используйте отраслевые инсайты для повышения открываемости'
      },
      {
        title: 'Проблемный подход',
        content: `Тема: ${d.company} — потенциал оптимизации\n\nЗдравствуйте,\n\nМы работали с компаниями подобными ${d.company} над решением [типичная проблема].\n\nИнтересно то, что большинство видят [измеримый результат] в течение 90 дней.\n\nИмеет ли смысл поговорить 15 минут?\n\nС уважением`,
        notes: 'Количественные результаты повышают доверие'
      },
    ],
    tips: 'Персонализируйте инсайтами о компании. Укажите конкретную выгоду. CTA простой (звонок/встреча).',
  },
  Discovery: {
    title: 'Гайд по Discovery-звонку',
    scripts: (d) => [
      {
        title: 'Структура разговора',
        content: `Открытие (2 мин):\n"Спасибо за время. Моя цель — понять вашу ситуацию, не продавать."\n\nВопросы о ситуации (5–7 мин):\n1. "Расскажите, как вы сейчас решаете [проблему]?"\n2. "Что работает хорошо, что нет?"\n3. "Как это влияет на команду/метрики?"\n4. "Давно ли это проблема?"\n\nУглубление (5–7 мин):\n5. "Что вы уже пробовали?"\n6. "Как выглядит идеальный результат?"\n7. "Кто участвует в принятии решения?"\n\nЗакрытие:\n"Это очень полезно. Я подготовлю несколько идей и свяжусь [дата]."`,
        notes: 'Выключите режим продавца. 70% слушать, 30% говорить.',
      },
    ],
    tips: 'Цель: понимать, не продавать. Записывайте болевые точки.',
  },
  Proposal: {
    title: 'Скрипт презентации предложения',
    scripts: (d) => [
      {
        title: 'Структура Proposal',
        content: `I. СИТУАЦИЯ (2 мин)\n"По результатам нашего разговора, ${d.company}:\n- Столкнулись с проблемой 1\n- Испытывают последствие 2\n- Влияние на эффективность 3"\n\nII. РЕШЕНИЕ (4 мин)\n"Мы предлагаем решение, которое:\n- Достигнет результата 1\n- Обеспечит выгоду 2"\n\nIII. ПЛАН (2 мин)\n"Наш план:\n- Недели 1–2: Онбординг\n- Недели 3–4: Запуск"\n\nIV. ИНВЕСТИЦИЯ (2 мин)\n"Инвестиция: ${fmtCur(d.value)}\nОжидаемый ROI: [X]% за [период]"\n\nV. СЛЕДУЮЩИЕ ШАГИ\n"Если вы согласны, мы начнём [дата]."`,
        notes: 'Покажите понимание их проблемы. Свяжите решение с болями.',
      },
    ],
    tips: 'Структура: Ситуация → Решение → План → Инвестиция → Следующие шаги',
  },
  Negotiation: {
    title: 'Работа с возражениями',
    scripts: (d) => [
      {
        title: '"Слишком дорого"',
        content: `"Я понимаю — это инвестиция.\n\nВот как я это вижу:\n- Ваша текущая ситуация обходится в [годовая стоимость проблемы]\n- С нашим решением вы получите [ROI] за 12 месяцев\n- То есть вы инвестируете ${fmtCur(d.value)} и возвращаете [ROI]\n\nТехнически вы зарабатываете, инвестируя.\n\nОбсудим гибкий план оплаты?"`,
        notes: 'Сравнивайте стоимость с ROI, а не с ценой.',
      },
      {
        title: '"Нам нужно подумать"',
        content: `"Абсолютно справедливо — это важное решение.\n\nОдин вопрос: о чём именно нужно подумать?\n- О цене?\n- О сроках?\n- О функциях?\n- О чём-то ещё?"\n\n[Слушаем]\n\n"Понял. Вот предложение: я отправлю 2-страничный план, который решает [их вопрос]. Вы обдумаете, и мы созвонимся [день]. Подходит?"`,
        notes: 'Сначала диагностика. Потом конкретный следующий шаг с датой.',
      },
    ],
    tips: 'Найдите реальное возражение. Адресуйте его прямо. Назначьте дату.',
  },
  Closed: {
    title: 'Скрипт пост-сделки',
    scripts: (d) => [
      {
        title: 'Kickoff follow-up',
        content: `"Спасибо за доверие!\n\nНаш план запуска:\n1. Kickoff-встреча на следующей неделе\n2. Подтверждение таймлайна\n3. Назначение ответственных\n\nСледующий шаг: [дата и время]\n\nМы рады начать сотрудничество с ${d.company}!"`,
        notes: 'Подтвердите ценность. Установите ожидания.',
      },
    ],
    tips: 'Поблагодарите. Определите план. Подтвердите следующую встречу.',
  },
}

export default function ScriptGenerator({ deal, onClose }) {
  const [scripts, setScripts] = useLocalStorage('sales_scripts', [])

  const stageData = STAGE_PROMPTS[deal.stage] || STAGE_PROMPTS.Discovery
  const generated = stageData.scripts(deal)

  const copyScript = (text) => {
    navigator.clipboard.writeText(text).then(
      () => toast.success('Скрипт скопирован!'),
      () => toast.error('Не удалось скопировать')
    )
  }

  const saveTemplate = () => {
    const template = {
      id: Date.now().toString(36),
      dealId: deal.id,
      company: deal.company,
      stage: deal.stage,
      scripts: generated,
      createdAt: new Date().toISOString(),
    }
    setScripts((prev) => [...prev, template])
    toast.success('Шаблон сохранён!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-2xl my-8 p-6" style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl italic" style={{ color: INK }}>Скрипты — {deal.company}</h2>
            <p className="font-body text-xs" style={{ color: MUTED }}>{stageData.title}</p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        {/* Tips */}
        <div className="p-3 mb-4" style={{ backgroundColor: 'rgba(176,141,87,0.05)', borderRadius: '2px' }}>
          <p className="font-body text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: GOLD }}>Советы</p>
          <p className="font-body text-sm" style={{ color: MUTED }}>{stageData.tips}</p>
        </div>

        {/* Scripts */}
        <div className="space-y-4 mb-4">
          {generated.map((script, idx) => (
            <div key={idx} style={{ border: '1px solid rgba(176,141,87,0.1)', borderRadius: '2px' }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid rgba(176,141,87,0.08)' }}>
                <h3 className="font-body text-sm font-medium" style={{ color: INK }}>{script.title}</h3>
                <button onClick={() => copyScript(script.content)} className="flex items-center gap-1 px-2 py-1 font-body text-[10px]" style={{ color: GOLD }}>
                  <Copy size={10} /> Копировать
                </button>
              </div>
              <pre className="p-4 font-body text-xs whitespace-pre-wrap" style={{ color: INK, backgroundColor: 'rgba(44,36,32,0.02)' }}>
                {script.content}
              </pre>
              <p className="px-4 py-2 font-body text-[10px]" style={{ color: MUTED, borderTop: '1px solid rgba(44,36,32,0.05)' }}>
                {script.notes}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <button onClick={saveTemplate} className="flex items-center gap-2 px-4 py-2.5 font-body text-xs tracking-wider uppercase" style={{ backgroundColor: GOLD, color: '#fff', borderRadius: '2px' }}>
            <Save size={12} /> Сохранить шаблон
          </button>
          <button onClick={onClose} className="px-6 py-2.5 font-body text-xs tracking-wider uppercase" style={{ border: '1px solid rgba(44,36,32,0.15)', color: MUTED, borderRadius: '2px' }}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  )
}
