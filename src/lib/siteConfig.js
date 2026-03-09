export const siteConfig = {
  name: 'Galerie du Temps',
  tagline: 'Le temps embellit toute chose',
  city: 'Казахстан',
  address: 'Республика Казахстан',

  email: 'info@galerie-du-temps.com',
  phone: '+7 XXX XXX XXXX',
  phoneClean: '+7XXXXXXXXXX',

  whatsapp: '436781228875',
  telegram: 'galeriedutemps_bot',

  instagram: 'https://www.instagram.com/galeriedutemps_/',
  facebook: null,

  // Kaspi.kz payment
  kaspiLink: 'https://kaspi.kz/pay/galeriedutemps',
  kaspiPhone: '+7XXXXXXXXXX',

  // Crypto wallets (null = hidden)
  crypto: {
    btc: null,   // e.g. 'bc1q...'
    eth: null,   // e.g. '0x...'
    usdt_trc20: null,  // e.g. 'T...'
  },

  messageTemplates: {
    whatsapp: (product, formatPrice) =>
      `Здравствуйте! Меня интересует "${product.title}" (${formatPrice ? formatPrice(product.price) : product.price + '€'}). Можно узнать подробности?`,
    telegram: (product, formatPrice) =>
      `Здравствуйте! Интересует "${product.title}" (${formatPrice ? formatPrice(product.price) : product.price + '€'})`,
  },
}
