export const siteConfig = {
  name: 'Galerie du Temps',
  tagline: 'Le temps embellit toute chose',
  city: 'Казахстан',
  address: 'Республика Казахстан',

  email: 'info@galerie-du-temps.com',
  phone: '+7 XXX XXX XXXX',
  phoneClean: '+7XXXXXXXXXX',

  whatsapp: '7XXXXXXXXXX',
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
