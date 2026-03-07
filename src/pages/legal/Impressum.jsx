import PageLayout from '@/components/layout/PageLayout'

const SECTIONS = [
  {
    title: 'Оператор сайта',
    items: [
      'Galerie Du Temps',
      'Республика Казахстан',
      'Адрес: [будет указан]',
      'Регистрационный номер: [будет указан]',
    ],
  },
  {
    title: 'Контактные данные',
    items: [
      'Email: [будет указан]',
      'Телефон: [будет указан]',
      'Telegram: @galeriedutemps',
    ],
  },
  {
    title: 'Хостинг',
    items: [
      'Vercel Inc.',
      '340 S Lemon Ave #4133',
      'Walnut, CA 91789, USA',
    ],
  },
  {
    title: 'Ответственность за содержание',
    content:
      'Содержание нашего сайта создано с максимальной тщательностью. Однако мы не можем гарантировать точность, полноту и актуальность предоставленной информации. Ответственность за содержание внешних ссылок несут операторы соответствующих сайтов.',
  },
  {
    title: 'Авторские права',
    content:
      'Все материалы, опубликованные на данном сайте (тексты, изображения, графика, дизайн), защищены авторским правом. Любое использование без письменного согласия оператора запрещено.',
  },
]

export default function Impressum() {
  return (
    <PageLayout title="Правовая информация" subtitle="Impressum">
      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title} className="vintage-card p-6 md:p-8">
            <h2
              className="font-display text-xl italic mb-4"
              style={{ color: '#0C0A08' }}
            >
              {section.title}
            </h2>
            {section.items ? (
              <ul className="space-y-1.5 font-body text-sm" style={{ color: 'rgba(28, 28, 26, 0.6)' }}>
                {section.items.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="font-body text-sm leading-relaxed" style={{ color: 'rgba(28, 28, 26, 0.6)' }}>
                {section.content}
              </p>
            )}
          </section>
        ))}
      </div>
    </PageLayout>
  )
}
