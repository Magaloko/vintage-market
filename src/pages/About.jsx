export default function About() {
  return (
    <div className="page-enter">
      <div className="bg-vintage-dark text-vintage-cream py-20">
        <div className="max-w-7xl mx-auto px-6">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-vintage-cream/40">О нас</span>
          <h1 className="font-display text-4xl md:text-6xl font-bold mt-3 italic">
            История, которую<br />можно потрогать
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="space-y-8 font-body text-lg text-vintage-ink/70 leading-relaxed">
          <p>
            <span className="font-display text-4xl text-vintage-dark float-left mr-3 mt-1 leading-none">Э</span>ПОХА — это не просто магазин.
            Это пространство, где каждая вещь рассказывает свою историю. Мы верим, что винтаж — это не про старое.
            Это про вечное.
          </p>

          <p>
            Наша команда путешествует по Европе в поисках уникальных предметов из прошлых десятилетий.
            Мы тщательно отбираем каждый экспонат, проверяем его подлинность и состояние,
            чтобы предложить вам только лучшее.
          </p>

          <div className="vintage-divider my-12" />

          <h2 className="font-display text-2xl font-bold text-vintage-dark">Наши ценности</h2>

          <p>
            <strong className="text-vintage-dark">Подлинность.</strong> Каждый предмет проходит экспертную оценку.
            Мы гарантируем происхождение и возраст всех товаров в нашей коллекции.
          </p>

          <p>
            <strong className="text-vintage-dark">Устойчивость.</strong> Давая вещам вторую жизнь,
            мы поддерживаем осознанное потребление и заботимся об окружающей среде.
          </p>

          <p>
            <strong className="text-vintage-dark">Эмоция.</strong> Винтажная вещь — это не просто объект.
            Это чувство, настроение, связь с эпохой. Мы хотим, чтобы каждая покупка приносила вам радость.
          </p>

          <div className="vintage-divider my-12" />

          <blockquote className="border-l-2 border-vintage-gold pl-6 italic font-display text-2xl text-vintage-dark/80">
            «Настоящая красота не стареет — она приобретает глубину»
          </blockquote>
        </div>
      </div>
    </div>
  )
}
