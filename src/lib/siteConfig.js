// ── Site Configuration ───────────────────────────────────────────
// Edit these values to update contact info across the entire site.

export const siteConfig = {
  name: 'Galerie du Temps',
  tagline: 'Le temps embellit toute chose',
  city: 'Вена, Австрия',
  address: 'Wien, Österreich',

  // Contact — used on Contact page, ProductPage, and Footer
  email: 'info@galerie-du-temps.com',
  phone: '+43 123 456 789',
  phoneClean: '+43123456789',       // no spaces, for tel: links

  // WhatsApp — set your number with country code, no + or spaces
  // e.g. Austria +43 660 1234567 → '436601234567'
  whatsapp: '436601234567',

  // Telegram — your username without @
  telegram: 'galeriedutemps',

  // Social links (optional, set to null to hide)
  instagram: 'https://instagram.com/galeriedutemps',
  facebook: null,

  // Default message templates (used when contacting about a product)
  messageTemplates: {
    whatsapp: (product) =>
      `Здравствуйте! Меня интересует "${product.title}" (${product.price}€). Можно узнать подробности?`,
    telegram: (product) =>
      `Здравствуйте! Интересует "${product.title}" (${product.price}€)`,
  },
}
