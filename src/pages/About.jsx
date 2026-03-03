export default function About() {
  return (
    <div className="page-enter">
      {/* Hero header — Deep Navy */}
      <div className="pt-28 pb-16" style={{ backgroundColor: '#0C0A08' }}>
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-sans text-xs tracking-[0.3em] uppercase"
            style={{ color: 'rgba(176, 141, 87, 0.5)' }}>О нас</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mt-3 italic"
            style={{ color: '#F0E6D6' }}>
            История, которую<br />можно потрогать
          </h1>
        </div>
        <div className="section-gold-line mt-16" />
      </div>

      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="space-y-8 font-body text-lg leading-relaxed" style={{ color: 'rgba(28, 28, 26, 0.6)' }}>
          <p>
            <span className="font-display text-4xl float-left mr-3 mt-1 leading-none" style={{ color: '#0C0A08' }}>Э</span>ПОХА — это не просто магазин.
            Это пространство, где каждая вещь рассказывает свою историю. Мы верим, что винтаж — это не про старое.
            Это про вечное.
          </p>

          <p>
            Наша команда путешествует по Европе в поисках уникальных предметов из прошлых десятилетий.
            Мы тщательно отбираем каждый экспонат, проверяем его подлинность и состояние,
            чтобы предложить вам только лучшее.
          </p>

          <div className="vintage-divider my-12" />

          <h2 className="font-display text-2xl font-bold" style={{ color: '#0C0A08' }}>Наши ценности</h2>

          <p>
            <strong style={{ color: '#0C0A08' }}>Подлинность.</strong> Каждый предмет проходит экспертную оценку.
            Мы гарантируем происхождение и возраст всех товаров в нашей коллекции.
          </p>

          <p>
            <strong style={{ color: '#0C0A08' }}>Устойчивость.</strong> Давая вещам вторую жизнь,
            мы поддерживаем осознанное потребление и заботимся об окружающей среде.
          </p>

          <p>
            <strong style={{ color: '#0C0A08' }}>Эмоция.</strong> Винтажная вещь — это не просто объект.
            Это чувство, настроение, связь с эпохой. Мы хотим, чтобы каждая покупка приносила вам радость.
          </p>

          <div className="vintage-divider my-12" />

          <blockquote className="pl-6 italic font-display text-2xl"
            style={{ borderLeft: '2px solid #B08D57', color: 'rgba(14, 26, 43, 0.7)' }}>
            &laquo;Настоящая красота не стареет — она приобретает глубину&raquo;
          </blockquote>
        </div>
      </div>
    </div>
  )
}
