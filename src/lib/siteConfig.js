export const siteConfig = {
  name: 'Galerie du Temps',
  tagline: 'Le temps embellit toute chose',
  city: 'Вена, Австрия',
  address: 'Wien, Österreich',

  email: 'info@galerie-du-temps.com',
  phone: '+43 123 456 789',
  phoneClean: '+43123456789',

  whatsapp: '436601234567',
  telegram: 'galeriedutemps',

  instagram: 'https://instagram.com/galeriedutemps',
  facebook: null,

  messageTemplates: {
    whatsapp: (product, formatPrice) =>
      `Здравствуйте! Меня интересует "${product.title}" (${formatPrice ? formatPrice(product.price) : product.price + '€'}). Можно узнать подробности?`,
    telegram: (product, formatPrice) =>
      `Здравствуйте! Интересует "${product.title}" (${formatPrice ? formatPrice(product.price) : product.price + '€'})`,
  },
}
