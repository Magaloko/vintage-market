import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import useLocalStorage from '../../../lib/useLocalStorage'

const GOLD = '#B08D57'
const INK = '#2C2420'
const MUTED = 'rgba(44, 36, 32, 0.5)'
const FAINT = 'rgba(44, 36, 32, 0.15)'
const panelStyle = { backgroundColor: '#FFFFFF', border: '1px solid rgba(176,141,87,0.12)', borderRadius: '2px' }
const fmtCur = (n) => new Intl.NumberFormat('de-AT', { style: 'currency', currency: 'EUR' }).format(n || 0)

const STAGE_FAQS = {
  Prospecting: (d) => [
    { q: 'Почему нам стоит поговорить с вами?', a: `Мы специализируемся на помощи компаниям вроде ${d.company} в достижении [конкретная цель]. Наш подход основан на [методология], которая обеспечила [результат] для аналогичных клиентов.` },
    { q: 'Чем ваше решение отличается от конкурентов?', a: `Наше решение фокусируется на [уникальный аспект]. В отличие от конкурентов, мы [отличие 1], [отличие 2] и [отличие 3]. Главное — мы обеспечиваем [уникальная ценность].` },
    { q: 'Вы работаете с компаниями нашего профиля?', a: `Да, мы работали с [кол-во] компаниями в вашей отрасли. Среди недавних клиентов [примеры]. Они достигли [результат].` },
    { q: 'Как выглядит типичный процесс?', a: `1. Discovery-звонок (1 неделя)\n2. Предложение и планирование (1–2 недели)\n3. Внедрение (4–8 недель)\n4. Запуск и поддержка (постоянно)` },
  ],
  Discovery: (d) => [
    { q: 'Сколько времени занимает внедрение?', a: `Обычно 4–12 недель в зависимости от объёма. Для ${d.dealName} можете ожидать [сроки].` },
    { q: 'Какую поддержку вы предоставляете?', a: `Включено:\n- Выделенный менеджер внедрения\n- Техподдержка\n- Обучение команды\n- Квартальные обзоры\n- Приоритетная линия поддержки` },
    { q: 'Как измерить успех?', a: `Мы определяем KPI на этапе Discovery:\n- [Метрика 1]: ожидаемая [цель]\n- [Метрика 2]: ожидаемая [цель]\nОтслеживаем ежемесячно.` },
    { q: 'Что происходит после подписания?', a: `В течение 2 недель:\n1. Kickoff-встреча\n2. Планирование настройки\n3. Утверждение графика обучения\nМенеджер становится основным контактом.` },
  ],
  Proposal: (d) => [
    { q: 'Можете ли вы адаптировать решение?', a: `Да, у нас есть несколько уровней кастомизации. 95% случаев покрывает стандартная конфигурация. Кастомная работа оценивается отдельно.` },
    { q: 'Что входит в стоимость?', a: `Инвестиция ${fmtCur(d.value)} включает:\n- Лицензию\n- Услуги по внедрению\n- Обучение\n- 12 месяцев поддержки` },
    { q: 'Есть ли дополнительные расходы?', a: `Обычно нет, если только вы не захотите:\n- Кастомную разработку\n- Премиум-поддержку\n- Доп. лицензии\nОбсудим при планировании.` },
    { q: 'Что если нам нужны изменения?', a: `Изменения в рамках объёма — включены. Вне объёма — можно добавить в следующие фазы или как доп. заказ. Мы тщательно управляем scope.` },
  ],
  Negotiation: (d) => [
    { q: 'Можете снизить цену?', a: `${fmtCur(d.value)} отражает качество сервиса. Мы можем обсудить:\n- Поэтапное внедрение\n- Скидки за долгосрочный контракт\n- Расширение scope для лучшего ROI` },
    { q: 'Что если внедрение пойдёт не по плану?', a: `Мы используем проверенную методологию. При отставании:\n1. Выявляем проблему сразу\n2. Выделяем доп. ресурсы\n3. Корректируем сроки\n4. Поддерживаем до успеха` },
    { q: 'Можно начать с пилота?', a: `Обычно рекомендуем полное внедрение. Однако можем обсудить пилот с ограниченным scope.` },
    { q: 'Какие условия оплаты?', a: `Стандартные условия. Также возможны:\n- Квартальные платежи\n- Оплата по milestone\n- Годовой платёж со скидкой` },
  ],
  Closed: (d) => [
    { q: 'Когда начинаем?', a: `После подписания — в течение [срок]. Kickoff назначен через [дней].` },
    { q: 'С кем я буду работать?', a: `Основной контакт — [менеджер]. По техническим вопросам — [техконтакт].` },
    { q: 'Как защищены наши данные?', a: `Соответствуем [стандартам]. Данные:\n- Зашифрованы в транзите и хранении\n- Ежедневное резервирование\n- Расположены в EU\n- Защищены [мерами]` },
    { q: 'Что если мы хотим отменить?', a: `Контракт включает [условия отмены]. После [период] — любая сторона может отменить с [уведомление].` },
  ],
}

export default function FAQBuilder({ deal, onClose }) {
  const [faqs, setFaqs] = useLocalStorage('sales_faqs', [])
  const [open, setOpen] = useState({})

  const stageFaqs = (STAGE_FAQS[deal.stage] || STAGE_FAQS.Discovery)(deal)

  const toggle = (idx) => setOpen((prev) => ({ ...prev, [idx]: !prev[idx] }))

  const saveTemplate = () => {
    const template = {
      id: Date.now().toString(36),
      dealId: deal.id,
      company: deal.company,
      stage: deal.stage,
      faqs: stageFaqs,
      createdAt: new Date().toISOString(),
    }
    setFaqs((prev) => [...prev, template])
    toast.success('FAQ сохранён!')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose}>
      <div className="w-full max-w-2xl my-8 p-6" style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display text-xl italic" style={{ color: INK }}>FAQ — {deal.company}</h2>
            <p className="font-body text-xs" style={{ color: MUTED }}>Этап: {deal.stage} · {stageFaqs.length} вопросов</p>
          </div>
          <button onClick={onClose}><X size={18} style={{ color: FAINT }} /></button>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-2 mb-4">
          {stageFaqs.map((item, idx) => (
            <div key={idx} style={{ border: '1px solid rgba(176,141,87,0.1)', borderRadius: '2px' }}>
              <button
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[rgba(176,141,87,0.03)] transition-colors"
              >
                <span className="font-body text-sm font-medium" style={{ color: INK }}>Q: {item.q}</span>
                {open[idx] ? <ChevronUp size={14} style={{ color: MUTED }} /> : <ChevronDown size={14} style={{ color: MUTED }} />}
              </button>
              {open[idx] && (
                <div className="px-4 pb-3">
                  <div className="p-3" style={{ backgroundColor: 'rgba(44,36,32,0.02)', borderRadius: '2px' }}>
                    <p className="font-body text-[10px] uppercase mb-1" style={{ color: GOLD }}>A:</p>
                    <p className="font-body text-sm whitespace-pre-line" style={{ color: INK }}>{item.a}</p>
                  </div>
                </div>
              )}
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
