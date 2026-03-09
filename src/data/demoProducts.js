// =============================================================================
// Category Groups
// =============================================================================

export const categoryGroups = [
  { id: 'vintage',    name: 'Винтаж и антиквариат' },
  { id: 'realestate', name: 'Недвижимость' },
  { id: 'shops',      name: 'Магазины и бутики' },
  { id: 'vehicles',   name: 'Транспорт' },
]

// =============================================================================
// Categories
// =============================================================================

export const categories = [
  // --- Vintage (А–Я) ---
  { id: 'accessories',     name: 'Аксессуары',          group: 'vintage' },
  { id: 'costume_jewelry', name: 'Бижутерия',           group: 'vintage' },
  { id: 'vinyl',           name: 'Винил и музыка',      group: 'vintage' },
  { id: 'art',             name: 'Искусство',           group: 'vintage' },
  { id: 'books',           name: 'Книги',               group: 'vintage' },
  { id: 'collectibles',    name: 'Коллекционное',       group: 'vintage' },
  { id: 'furniture',       name: 'Мебель',              group: 'vintage' },
  { id: 'clothing',        name: 'Одежда',              group: 'vintage' },
  { id: 'ceramics',        name: 'Посуда',              group: 'vintage' },
  { id: 'cutlery',         name: 'Столовые приборы',    group: 'vintage' },
  { id: 'electronics',     name: 'Электроника',         group: 'vintage' },
  { id: 'jewelry',         name: 'Ювелирные украшения', group: 'vintage' },

  // --- Real Estate (А–Я) ---
  { id: 'house',      name: 'Дом',       group: 'realestate' },
  { id: 'apartment',  name: 'Квартира',  group: 'realestate' },
  { id: 'commercial', name: 'Коммерция', group: 'realestate' },

  // --- Shops ---
  { id: 'shop', name: 'Магазин / Бутик', group: 'shops' },

  // --- Vehicles ---
  { id: 'vehicle', name: 'Транспорт', group: 'vehicles' },
]

// =============================================================================
// Category-Specific Fields
// -----------------------------------------------------------------------------
// Each field: { key, label, type, placeholder?, options?, required?, unit? }
// Types: text | number | select | textarea
// =============================================================================

export const categoryFields = {

  // ---------------------------------------------------------------------------
  // Vintage
  // ---------------------------------------------------------------------------

  clothing: [
    { key: 'size',     label: 'Размер',   type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Другой'] },
    { key: 'material', label: 'Материал', type: 'text',   placeholder: 'Шёлк, хлопок, шерсть...' },
    { key: 'gender',   label: 'Пол',      type: 'select', options: ['Женское', 'Мужское', 'Унисекс'] },
    { key: 'color',    label: 'Цвет',     type: 'text' },
  ],

  accessories: [
    { key: 'accessory_type', label: 'Тип',      type: 'select', options: ['Сумка', 'Часы', 'Очки', 'Ремень', 'Шарф', 'Головной убор', 'Другое'] },
    { key: 'material',       label: 'Материал', type: 'text',   placeholder: 'Кожа, металл, ткань...' },
    { key: 'color',          label: 'Цвет',     type: 'text' },
  ],

  furniture: [
    { key: 'furniture_type', label: 'Тип',             type: 'select', options: ['Стул / Кресло', 'Стол', 'Шкаф', 'Диван', 'Кровать', 'Лампа', 'Зеркало', 'Другое'] },
    { key: 'dimensions',     label: 'Размеры (Д×Ш×В)', type: 'text',   placeholder: '120×60×80 см' },
    { key: 'material',       label: 'Материал',        type: 'text',   placeholder: 'Дерево, металл, ротанг...' },
    { key: 'color',          label: 'Цвет / отделка',  type: 'text' },
  ],

  collectibles: [
    { key: 'collectible_type', label: 'Тип',            type: 'select', options: ['Монета', 'Марка', 'Открытка', 'Пластинка', 'Игрушка', 'Медаль', 'Другое'] },
    { key: 'origin',           label: 'Происхождение', type: 'text',   placeholder: 'СССР, Германия...' },
    { key: 'rarity',           label: 'Редкость',       type: 'select', options: ['Обычная', 'Редкая', 'Очень редкая', 'Уникальная'] },
  ],

  jewelry: [
    { key: 'jewelry_type', label: 'Тип',    type: 'select', options: ['Кольцо', 'Серьги', 'Ожерелье', 'Браслет', 'Брошь', 'Запонки', 'Другое'] },
    { key: 'material',     label: 'Металл', type: 'select', options: ['Золото', 'Серебро', 'Платина', 'Бижутерия', 'Другое'] },
    { key: 'hallmark',     label: 'Проба',  type: 'text',   placeholder: '585, 925...' },
    { key: 'stones',       label: 'Камни',  type: 'text',   placeholder: 'Аметист, бриллиант...' },
    { key: 'weight_grams', label: 'Вес',    type: 'number', unit: 'г' },
  ],

  costume_jewelry: [
    { key: 'jewelry_type', label: 'Тип',      type: 'select', options: ['Кольцо', 'Серьги', 'Ожерелье', 'Браслет', 'Брошь', 'Комплект', 'Другое'] },
    { key: 'material',     label: 'Материал', type: 'select', options: ['Бижутерный сплав', 'Позолота', 'Посеребрение', 'Пластик', 'Стекло', 'Другое'] },
    { key: 'stones',       label: 'Камни / вставки', type: 'text', placeholder: 'Стразы, кристаллы, эмаль...' },
    { key: 'color',        label: 'Цвет',     type: 'text' },
  ],

  cutlery: [
    { key: 'cutlery_type',  label: 'Тип',              type: 'select', options: ['Набор', 'Ложки', 'Вилки', 'Ножи', 'Сервировочные', 'Подстаканник', 'Другое'] },
    { key: 'material',      label: 'Материал',         type: 'select', options: ['Серебро', 'Мельхиор', 'Нержавеющая сталь', 'Позолота', 'Другое'] },
    { key: 'hallmark',      label: 'Проба / клеймо',   type: 'text',   placeholder: '875, 925, МНЦ...' },
    { key: 'set_pieces',    label: 'Кол-во предметов', type: 'number' },
    { key: 'manufacturer',  label: 'Производитель',   type: 'text',   placeholder: 'ЗиШ, Кольчугино...' },
  ],

  art: [
    { key: 'art_type',   label: 'Техника',        type: 'select', options: ['Живопись', 'Графика', 'Скульптура', 'Плакат', 'Фотография', 'Принт', 'Другое'] },
    { key: 'artist',     label: 'Автор',          type: 'text',   placeholder: 'Если известен' },
    { key: 'dimensions', label: 'Размеры',        type: 'text',   placeholder: '60×80 см' },
    { key: 'signed',     label: 'Подпись автора', type: 'select', options: ['Есть', 'Нет', 'Неизвестно'] },
    { key: 'framed',     label: 'Рама',           type: 'select', options: ['С рамой', 'Без рамы'] },
  ],

  books: [
    { key: 'author',         label: 'Автор',         type: 'text',   required: true },
    { key: 'publisher',      label: 'Издательство', type: 'text' },
    { key: 'year_published', label: 'Год издания',  type: 'number' },
    { key: 'pages',          label: 'Страниц',      type: 'number' },
    { key: 'language',       label: 'Язык',          type: 'select', options: ['Русский', 'Немецкий', 'Английский', 'Французский', 'Другой'] },
    { key: 'book_condition', label: 'Обложка',       type: 'select', options: ['Твёрдая', 'Мягкая'] },
  ],

  vinyl: [
    { key: 'artist',          label: 'Исполнитель',      type: 'text',   required: true },
    { key: 'genre',           label: 'Жанр',              type: 'select', options: ['Джаз', 'Классика', 'Рок', 'Поп', 'Электроника', 'Соул / Фанк', 'Другой'] },
    { key: 'format',          label: 'Формат',            type: 'select', options: ['LP 12"', 'EP 10"', 'Single 7"', 'CD', 'Кассета'] },
    { key: 'label',           label: 'Лейбл',             type: 'text',   placeholder: 'Blue Note, Columbia...' },
    { key: 'vinyl_condition', label: 'Состояние винила', type: 'select', options: ['Mint', 'Near Mint', 'Very Good+', 'Very Good', 'Good', 'Fair'] },
  ],

  electronics: [
    { key: 'electronics_type', label: 'Тип',          type: 'select', options: ['Радио', 'Проигрыватель', 'Телевизор', 'Фотоаппарат', 'Телефон', 'Печатная машинка', 'Другое'] },
    { key: 'working',          label: 'Работает',     type: 'select', options: ['Да, полностью', 'Частично', 'Нет / декор', 'Требует ремонта'] },
    { key: 'voltage',          label: 'Напряжение', type: 'text',   placeholder: '220V' },
  ],

  ceramics: [
    { key: 'ceramic_type', label: 'Тип',               type: 'select', options: ['Тарелка', 'Чашка / Набор', 'Ваза', 'Сервиз', 'Фигурка', 'Другое'] },
    { key: 'material',     label: 'Материал',          type: 'select', options: ['Фарфор', 'Керамика', 'Стекло', 'Хрусталь', 'Фаянс'] },
    { key: 'manufacturer', label: 'Производитель',    type: 'text',   placeholder: 'Meissen, ЛФЗ...' },
    { key: 'set_pieces',   label: 'Кол-во предметов', type: 'number' },
  ],

  // ---------------------------------------------------------------------------
  // Real Estate
  // ---------------------------------------------------------------------------

  apartment: [
    { key: 'rooms',          label: 'Комнат',       type: 'number', required: true },
    { key: 'area_m2',        label: 'Площадь',      type: 'number', required: true, unit: 'м²' },
    { key: 'floor',          label: 'Этаж',          type: 'text',   placeholder: '3 из 5' },
    { key: 'address',        label: 'Адрес / район', type: 'text',   required: true },
    { key: 'heating',        label: 'Отопление',    type: 'select', options: ['Центральное', 'Газовое', 'Электрическое', 'Тёплый пол', 'Другое'] },
    { key: 'furnished',      label: 'Мебель',        type: 'select', options: ['С мебелью', 'Без мебели', 'Частично'] },
    { key: 'balcony',        label: 'Балкон',        type: 'select', options: ['Есть', 'Нет'] },
    { key: 'available_from', label: 'Доступно с',   type: 'text',   placeholder: 'Сразу / 01.04.2026' },
    { key: 'rent_or_buy',    label: 'Тип сделки',   type: 'select', options: ['Аренда', 'Покупка'], required: true },
  ],

  house: [
    { key: 'rooms',      label: 'Комнат',         type: 'number', required: true },
    { key: 'area_m2',    label: 'Площадь дома',   type: 'number', required: true, unit: 'м²' },
    { key: 'plot_m2',    label: 'Участок',         type: 'number', unit: 'м²' },
    { key: 'floors',     label: 'Этажей',          type: 'number' },
    { key: 'address',    label: 'Адрес / район',   type: 'text',   required: true },
    { key: 'year_built', label: 'Год постройки',  type: 'number' },
    { key: 'garage',     label: 'Гараж',            type: 'select', options: ['Есть', 'Нет'] },
    { key: 'garden',     label: 'Сад / участок',   type: 'select', options: ['Есть', 'Нет'] },
    { key: 'heating',    label: 'Отопление',       type: 'select', options: ['Газ', 'Электро', 'Дрова / камин', 'Тепловой насос', 'Другое'] },
    { key: 'rent_or_buy', label: 'Тип сделки',    type: 'select', options: ['Аренда', 'Покупка'], required: true },
  ],

  commercial: [
    { key: 'commercial_type', label: 'Тип',        type: 'select', options: ['Офис', 'Магазин', 'Склад', 'Ресторан / Кафе', 'Мастерская', 'Другое'], required: true },
    { key: 'area_m2',         label: 'Площадь',    type: 'number', required: true, unit: 'м²' },
    { key: 'address',         label: 'Адрес',       type: 'text',   required: true },
    { key: 'floor',           label: 'Этаж',        type: 'text' },
    { key: 'parking',         label: 'Парковка',   type: 'select', options: ['Есть', 'Нет'] },
    { key: 'rent_or_buy',     label: 'Тип сделки', type: 'select', options: ['Аренда', 'Покупка'], required: true },
  ],

  // ---------------------------------------------------------------------------
  // Shops / Dealers
  // ---------------------------------------------------------------------------

  shop: [
    { key: 'shop_name',       label: 'Название магазина', type: 'text',     required: true },
    { key: 'shop_type',       label: 'Тип',                type: 'select',   options: ['Винтаж', 'Антиквариат', 'Second Hand', 'Флоамаркт', 'Онлайн-магазин', 'Другое'], required: true },
    { key: 'owner_name',      label: 'Владелец / контакт', type: 'text' },
    { key: 'phone',           label: 'Телефон',             type: 'text',     placeholder: '+43 ...' },
    { key: 'email',           label: 'Email',               type: 'text' },
    { key: 'website',         label: 'Вебсайт',            type: 'text',     placeholder: 'https://...' },
    { key: 'address',         label: 'Адрес',               type: 'text' },
    { key: 'opening_hours',   label: 'Часы работы',        type: 'text',     placeholder: 'Пн-Пт 10:00-18:00' },
    { key: 'specialization',  label: 'Специализация',      type: 'textarea', placeholder: 'На чём специализируется магазин...' },
  ],

  // ---------------------------------------------------------------------------
  // Vehicles
  // ---------------------------------------------------------------------------

  vehicle: [
    { key: 'make',         label: 'Марка',        type: 'text',   required: true, placeholder: 'Mercedes, BMW, ВАЗ...' },
    { key: 'model',        label: 'Модель',       type: 'text',   required: true },
    { key: 'year_made',    label: 'Год выпуска', type: 'number', required: true },
    { key: 'mileage_km',   label: 'Пробег',       type: 'number', unit: 'км' },
    { key: 'engine',       label: 'Двигатель',   type: 'text',   placeholder: '2.0L бензин' },
    { key: 'transmission', label: 'КПП',          type: 'select', options: ['Механика', 'Автомат'] },
    { key: 'color',        label: 'Цвет',         type: 'text' },
    { key: 'vehicle_type', label: 'Тип',          type: 'select', options: ['Легковой', 'Мотоцикл', 'Велосипед', 'Другое'] },
  ],
}

// =============================================================================
// Helper: get label for a field value
// =============================================================================

export const getFieldLabel = (categoryId, fieldKey, value) => {
  const fields = categoryFields[categoryId]
  if (!fields) return value
  const field = fields.find((f) => f.key === fieldKey)
  if (!field) return value
  return value
}

// =============================================================================
// Known Brands (for brand dropdown in product form)
// =============================================================================

export const knownBrands = [
  // Porcelain & Ceramics
  { id: 'villeroy_boch',  name: 'Villeroy & Boch',  categories: ['ceramics', 'cutlery'] },
  { id: 'wmf',            name: 'WMF',              categories: ['ceramics', 'cutlery'] },
  { id: 'bauscher',       name: 'Bauscher',          categories: ['ceramics'] },
  { id: 'schoenwald',     name: 'Schönwald',         categories: ['ceramics'] },
  { id: 'playground',     name: 'Playground',         categories: ['ceramics'] },
  { id: 'heart_soul',     name: 'Heart & Soul',      categories: ['ceramics'] },
  { id: 'churchill',      name: 'Churchill',          categories: ['ceramics'] },
  { id: 'fortessa',       name: 'Fortessa',           categories: ['ceramics', 'cutlery'] },
  { id: 'meissen',        name: 'Meissen',            categories: ['ceramics'] },
  { id: 'rosenthal',      name: 'Rosenthal',          categories: ['ceramics'] },
  { id: 'lfz',            name: 'ЛФЗ / ИФЗ',        categories: ['ceramics'] },
  // Jewelry
  { id: 'cartier',   name: 'Cartier',   categories: ['jewelry', 'accessories'] },
  { id: 'tiffany',   name: 'Tiffany',   categories: ['jewelry'] },
  { id: 'bulgari',   name: 'Bulgari',   categories: ['jewelry'] },
  // Fashion
  { id: 'chanel',    name: 'Chanel',    categories: ['clothing', 'accessories', 'costume_jewelry'] },
  { id: 'hermes',    name: 'Hermès',    categories: ['clothing', 'accessories'] },
  { id: 'dior',      name: 'Dior',      categories: ['clothing', 'accessories', 'costume_jewelry'] },
  // Electronics
  { id: 'grundig',   name: 'Grundig',   categories: ['electronics'] },
  { id: 'telefunken', name: 'Telefunken', categories: ['electronics'] },
]

// =============================================================================
// Special Attributes (value-increasing markers)
// =============================================================================

export const specialAttributes = [
  { id: 'unique',          label: 'Единственный экземпляр',  icon: '✦', color: '#B08D57' },
  { id: 'limited_edition', label: 'Лимитированная серия',    icon: '◈', color: '#9B7CB8' },
  { id: 'collectors_item', label: 'Коллекционное',           icon: '★', color: '#C9956B' },
  { id: 'certified',       label: 'С сертификатом',          icon: '◉', color: '#7A8B6F' },
  { id: 'signed',          label: 'С подписью автора',       icon: '✎', color: '#B5736A' },
  { id: 'provenance',      label: 'С провенансом',           icon: '⚜', color: '#8B7355' },
]

// =============================================================================
// Conditions
// =============================================================================

export const conditions = [
  { id: 'new',               name: 'Новое' },
  { id: 'excellent',         name: 'Отличное' },
  { id: 'good',              name: 'Хорошее' },
  { id: 'vintage_character', name: 'Винтаж с характером' },
]

// =============================================================================
// Eras
// =============================================================================

export const eras = [
  { id: '1920s-1930s', name: '1920–1930е', start: 1920, end: 1939 },
  { id: '1940s-1950s', name: '1940–1950е', start: 1940, end: 1959 },
  { id: '1960s',       name: '1960е',      start: 1960, end: 1969 },
  { id: '1970s',       name: '1970е',      start: 1970, end: 1979 },
  { id: '1980s',       name: '1980е',      start: 1980, end: 1989 },
  { id: '1990s',       name: '1990е',      start: 1990, end: 1999 },
]

// =============================================================================
// Format Era Range
// =============================================================================

export function formatEra(start, end) {
  if (start && end) return start === end ? String(start) : `${start}–${end}`
  if (start) return `с ${start}`
  if (end) return `до ${end}`
  return null
}

// =============================================================================
// Subcategories
// =============================================================================

export const subcategories = {
  // ── Аксессуары ──────────────────────────────────────────
  accessories: [
    { id: 'fans',        name: 'Веера' },
    { id: 'wallets',     name: 'Кошельки / Портмоне' },
    { id: 'glasses',     name: 'Очки' },
    { id: 'cigarette',   name: 'Портсигары / Мундштуки' },
    { id: 'compacts',    name: 'Пудреницы / Зеркала' },
    { id: 'belts',       name: 'Ремни' },
    { id: 'bags',        name: 'Сумки / Портфели' },
    { id: 'canes',       name: 'Трости' },
    { id: 'acc_other',   name: 'Другое' },
  ],
  // ── Бижутерия ───────────────────────────────────────────
  costume_jewelry: [
    { id: 'cj_bracelets',  name: 'Браслеты' },
    { id: 'cj_brooches',   name: 'Броши' },
    { id: 'cj_rings',      name: 'Кольца' },
    { id: 'cj_sets',       name: 'Комплекты' },
    { id: 'cj_necklaces',  name: 'Ожерелья / Бусы' },
    { id: 'cj_pendants',   name: 'Подвески' },
    { id: 'cj_earrings',   name: 'Серьги / Клипсы' },
  ],
  // ── Винил и музыка ──────────────────────────────────────
  vinyl: [
    { id: 'instruments', name: 'Инструменты' },
    { id: 'cassettes',   name: 'Кассеты' },
    { id: 'players',     name: 'Проигрыватели' },
    { id: 'singles',     name: 'Синглы / 7"' },
    { id: 'lp',          name: 'LP / Альбомы' },
  ],
  // ── Искусство ───────────────────────────────────────────
  art: [
    { id: 'graphics',   name: 'Графика / Гравюры' },
    { id: 'icons',       name: 'Иконы' },
    { id: 'paintings',   name: 'Картины / Живопись' },
    { id: 'posters',     name: 'Плакаты / Афиши' },
    { id: 'sculptures',  name: 'Скульптуры' },
    { id: 'photos',      name: 'Фотографии' },
  ],
  // ── Книги ───────────────────────────────────────────────
  books: [
    { id: 'albums',      name: 'Альбомы / Каталоги' },
    { id: 'children',    name: 'Детские' },
    { id: 'periodicals', name: 'Журналы / Газеты' },
    { id: 'nonfiction',  name: 'Научная / Техническая' },
    { id: 'rare',        name: 'Редкие / Антикварные' },
    { id: 'fiction',     name: 'Художественная' },
  ],
  // ── Коллекционное ───────────────────────────────────────
  collectibles: [
    { id: 'militaria',  name: 'Военное' },
    { id: 'badges',     name: 'Значки / Ордена' },
    { id: 'toys',       name: 'Игрушки' },
    { id: 'stamps',     name: 'Марки' },
    { id: 'coins',      name: 'Монеты' },
    { id: 'postcards',  name: 'Открытки' },
    { id: 'col_other',  name: 'Другое' },
  ],
  // ── Мебель ──────────────────────────────────────────────
  furniture: [
    { id: 'f_decor',    name: 'Декор интерьера' },
    { id: 'mirrors',    name: 'Зеркала' },
    { id: 'desks',      name: 'Письменные столы' },
    { id: 'lamps',      name: 'Светильники / Лампы' },
    { id: 'tables',     name: 'Столы' },
    { id: 'chairs',     name: 'Стулья / Кресла' },
    { id: 'clocks',     name: 'Часы' },
    { id: 'cabinets',   name: 'Шкафы / Комоды' },
  ],
  // ── Одежда ──────────────────────────────────────────────
  clothing: [
    { id: 'pants',       name: 'Брюки' },
    { id: 'hats',        name: 'Головные уборы' },
    { id: 'cl_sets',     name: 'Костюмы / Комплекты' },
    { id: 'jackets',     name: 'Куртки / Пиджаки' },
    { id: 'coats',       name: 'Пальто / Плащи' },
    { id: 'dresses',     name: 'Платья' },
    { id: 'shirts',      name: 'Рубашки / Блузки' },
    { id: 'knitwear',    name: 'Трикотаж / Свитера' },
    { id: 'scarves',     name: 'Шарфы / Платки' },
    { id: 'skirts',      name: 'Юбки' },
  ],
  // ── Посуда ──────────────────────────────────────────────
  ceramics: [
    { id: 'vases',       name: 'Вазы' },
    { id: 'decorative',  name: 'Декоративные тарелки' },
    { id: 'coffee_set',  name: 'Кофейный набор' },
    { id: 'bowls',       name: 'Миски / Салатники' },
    { id: 'sugar_bowls', name: 'Сахарницы / Молочники' },
    { id: 'services',    name: 'Сервизы' },
    { id: 'soup_tureen', name: 'Супницы' },
    { id: 'plates',      name: 'Тарелки' },
    { id: 'figurines',   name: 'Фигурки / Статуэтки' },
    { id: 'teapots',     name: 'Чайники / Заварники' },
    { id: 'tea_set',     name: 'Чайный набор' },
    { id: 'cups',        name: 'Чашки / Кружки' },
  ],
  // ── Столовые приборы ────────────────────────────────────
  cutlery: [
    { id: 'forks',      name: 'Вилки' },
    { id: 'spoons',     name: 'Ложки' },
    { id: 'ct_sets',    name: 'Наборы' },
    { id: 'knives',     name: 'Ножи' },
    { id: 'cupholders', name: 'Подстаканники' },
    { id: 'serving',    name: 'Сервировочные' },
  ],
  // ── Электроника ─────────────────────────────────────────
  electronics: [
    { id: 'calculators', name: 'Калькуляторы' },
    { id: 'radios',      name: 'Радиоприёмники' },
    { id: 'tvs',         name: 'Телевизоры' },
    { id: 'phones',      name: 'Телефоны' },
    { id: 'cameras',     name: 'Фотоаппараты' },
    { id: 'el_other',    name: 'Другое' },
  ],
  // ── Ювелирные украшения ─────────────────────────────────
  jewelry: [
    { id: 'j_accessories', name: 'Аксессуары / Хранение' },
    { id: 'bracelets',     name: 'Браслеты' },
    { id: 'brooches',      name: 'Броши / Манжеты' },
    { id: 'rings',         name: 'Кольца' },
    { id: 'sets',          name: 'Наборы / Комплекты' },
    { id: 'necklaces',     name: 'Ожерелья / Колье' },
    { id: 'piercings',     name: 'Пирсинг' },
    { id: 'pendants',      name: 'Подвески / Charms' },
    { id: 'earrings',      name: 'Серьги' },
    { id: 'watches',       name: 'Часы' },
  ],
}

// =============================================================================
// Shipping Options
// =============================================================================

export const shippingOptions = [
  { id: 'pickup',        name: 'Самовывоз' },
  { id: 'post_kz',       name: 'Почта Казахстана' },
  { id: 'cdek',          name: 'СДЭК' },
  { id: 'courier',       name: 'Курьерская доставка' },
  { id: 'international', name: 'Международная' },
]

// =============================================================================
// Ticket Macros (Zendesk-inspired quick responses)
// =============================================================================

export const ticketMacros = [
  { id: 'shipping_status',  name: 'Статус доставки',      template: 'Здравствуйте! Ваш заказ отправлен. Номер отслеживания: [TRACKING]. Ожидаемая дата доставки: [ДАТА].' },
  { id: 'return_start',     name: 'Возврат — инструкция', template: 'Здравствуйте! Для оформления возврата, пожалуйста, отправьте товар по адресу: [АДРЕС]. Номер возврата: RMA-{ticket_id}.' },
  { id: 'defect_info',      name: 'Рекламация',           template: 'Здравствуйте! Спасибо за обращение. Пожалуйста, отправьте фото дефекта и номер заказа для обработки рекламации.' },
  { id: 'order_question',   name: 'Запрос номера заказа', template: 'Здравствуйте! Для проверки статуса, пожалуйста, укажите номер вашего заказа.' },
  { id: 'business_hours',   name: 'Нерабочее время',      template: 'Спасибо за обращение! Мы работаем Пн–Пт с 09:00 до 17:00. Ваш запрос будет обработан в ближайший рабочий день.' },
  { id: 'thank_close',      name: 'Благодарность',        template: 'Спасибо за обращение в Galerie du Temps! Если у вас появятся дополнительные вопросы, мы всегда готовы помочь.' },
]

// =============================================================================
// Business Hours
// =============================================================================

export const businessHours = {
  schedule: [
    { day: 'Пн–Пт', hours: '09:00–17:00' },
  ],
  timezone: 'Asia/Almaty',
  utcOffset: 6, // Almaty = UTC+6
}

// =============================================================================
// Sort Options
// =============================================================================

export const sortOptions = [
  { id: 'newest',     name: 'Сначала новые' },
  { id: 'oldest',     name: 'Сначала старые' },
  { id: 'price_asc',  name: 'Цена: по возрастанию' },
  { id: 'price_desc', name: 'Цена: по убыванию' },
  { id: 'popular',    name: 'Популярные' },
]

// =============================================================================
// Demo Products
// =============================================================================

export const demoProducts = [

  // --- 1: Leather briefcase ---
  {
    id: '1',
    shop_id: 'demo-shop-001',
    title: 'Кожаный портфель 1960-х',
    description:
      'Подлинный итальянский кожаный портфель из 1960-х годов. Великолепная патина, латунная фурнитура, два отделения. Идеален для ценителей классического стиля.',
    price: 320,
    category: 'accessories',
    condition: 'vintage_character',
    era_start: 1960, era_end: 1969,
    brand: 'Итальянское производство',
    special_attributes: ['unique'],
    image_url:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&h=600&fit=crop', alt_text: 'Портфель — общий вид' },
      { url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop', alt_text: 'Портфель — вид сбоку' },
      { url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop', alt_text: 'Портфель — детали фурнитуры' },
    ],
    details: {
      accessory_type: 'Сумка',
      material: 'Кожа',
      color: 'Коричневый',
    },
    status: 'active',
    views: 142,
    avgRating: 4.2,
    created_at: '2025-01-15T10:00:00Z',
  },

  // --- 2: Silk dress ---
  {
    id: '2',
    shop_id: 'demo-shop-001',
    title: 'Шёлковое платье с цветочным принтом',
    description:
      'Изящное шёлковое платье 1970-х годов с нежным цветочным принтом. Длина миди, пояс на талии. Состояние превосходное.',
    price: 180,
    category: 'clothing',
    condition: 'excellent',
    era_start: 1970, era_end: 1979,
    brand: null,
    image_url:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop', alt_text: 'Платье — общий вид' },
      { url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=600&fit=crop', alt_text: 'Платье — на фигуре' },
    ],
    details: {
      size: 'M',
      material: 'Шёлк',
      gender: 'Женское',
      color: 'Цветочный',
    },
    status: 'active',
    views: 89,
    avgRating: 4.7,
    created_at: '2025-01-20T14:30:00Z',
  },

  // --- 3: Art Deco lamp ---
  {
    id: '3',
    title: 'Настольная лампа Art Deco',
    description:
      'Латунная настольная лампа в стиле Ар-Деко. Оригинальный абажур из молочного стекла. Полностью рабочая, проводка обновлена.',
    price: 450,
    category: 'furniture',
    condition: 'excellent',
    era_start: 1930, era_end: 1939,
    brand: null,
    image_url:
      'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=600&h=600&fit=crop', alt_text: 'Лампа — выключена' },
      { url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop', alt_text: 'Лампа — при свете' },
    ],
    details: {
      furniture_type: 'Лампа',
      material: 'Латунь, стекло',
    },
    status: 'active',
    views: 203,
    avgRating: 3.8,
    is_promoted: true,
    created_at: '2025-02-01T09:15:00Z',
  },

  // --- 4: Poljot watch ---
  {
    id: '4',
    title: 'Механические часы Полёт',
    description:
      'Советские механические часы «Полёт» 1970-х годов. Позолоченный корпус, оригинальный кожаный ремешок. Ход точный.',
    price: 250,
    category: 'accessories',
    condition: 'good',
    era_start: 1970, era_end: 1979,
    brand: 'Полёт',
    image_url:
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop', alt_text: 'Часы — общий вид' },
      { url: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&h=600&fit=crop', alt_text: 'Часы — циферблат' },
    ],
    details: {
      accessory_type: 'Часы',
      material: 'Позолота, кожа',
    },
    status: 'active',
    views: 315,
    avgRating: 4.9,
    created_at: '2025-02-10T11:00:00Z',
  },

  // --- 5: Meissen vase ---
  {
    id: '5',
    title: 'Фарфоровая ваза Мейсен',
    description:
      'Коллекционная фарфоровая ваза Meissen с ручной росписью. Кобальтовый синий фон, золотая отделка. Высота 28 см.',
    price: 680,
    category: 'ceramics',
    condition: 'excellent',
    era_start: 1920, era_end: 1929,
    brand: 'Meissen',
    subcategory: 'vases',
    special_attributes: ['collectors_item', 'certified'],
    hashtags: ['мейсен', 'фарфор', 'коллекция'],
    quantity: 1,
    image_url:
      'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=600&h=600&fit=crop', alt_text: 'Ваза — общий вид' },
    ],
    details: {
      ceramic_type: 'Ваза',
      material: 'Фарфор',
      manufacturer: 'Meissen',
    },
    status: 'active',
    views: 178,
    avgRating: 4.5,
    is_promoted: true,
    created_at: '2025-02-15T16:45:00Z',
  },

  // --- 6: Harris Tweed jacket ---
  {
    id: '6',
    title: 'Твидовый пиджак Harris Tweed',
    description:
      'Классический мужской пиджак из натурального Harris Tweed. Шотландское производство, ручная выделка.',
    price: 220,
    category: 'clothing',
    condition: 'good',
    era_start: 1980, era_end: 1989,
    brand: 'Harris Tweed',
    image_url:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=600&fit=crop', alt_text: 'Пиджак — общий вид' },
    ],
    details: {
      size: 'L',
      material: 'Твид / шерсть',
      gender: 'Мужское',
      color: 'Коричневый',
    },
    status: 'active',
    views: 67,
    avgRating: 3.5,
    created_at: '2025-03-01T08:30:00Z',
  },

  // --- 7: Amethyst brooch ---
  {
    id: '7',
    title: 'Серебряная брошь с аметистом',
    description:
      'Винтажная серебряная брошь с крупным натуральным аметистом. Филигранная работа мастера. Проба 925.',
    price: 145,
    category: 'jewelry',
    condition: 'excellent',
    era_start: 1950, era_end: 1959,
    brand: null,
    subcategory: 'brooches',
    special_attributes: ['unique', 'signed'],
    hashtags: ['винтаж', 'серебро', 'аметист'],
    quantity: 1,
    shipping: [{ method: 'pickup', price: 0, note: 'Алматы' }, { method: 'post_kz', price: 500, note: '3-5 дней' }],
    contact_whatsapp: '77001234567',
    contact_telegram: 'vintageshop',
    image_url:
      'https://images.unsplash.com/photo-1515562141589-67f0d569b6e1?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6e1?w=600&h=600&fit=crop', alt_text: 'Брошь — общий вид' },
    ],
    details: {
      jewelry_type: 'Брошь',
      material: 'Серебро',
      hallmark: '925',
      stones: 'Аметист',
    },
    status: 'sold',
    views: 234,
    avgRating: 4.8,
    created_at: '2025-01-05T12:00:00Z',
  },

  // --- 8: Rattan rocking chair ---
  {
    id: '8',
    title: 'Кресло-качалка из ротанга',
    description:
      'Плетёное кресло-качалка из натурального ротанга. Богемный стиль 1970-х.',
    price: 380,
    category: 'furniture',
    condition: 'vintage_character',
    era_start: 1970, era_end: 1979,
    brand: null,
    image_url:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop', alt_text: 'Кресло-качалка' },
    ],
    details: {
      furniture_type: 'Стул / Кресло',
      material: 'Ротанг',
    },
    status: 'active',
    views: 156,
    avgRating: 4.1,
    created_at: '2025-03-05T10:20:00Z',
  },

  // --- 9: Constructivist poster ---
  {
    id: '9',
    title: 'Плакат советского конструктивизма',
    description:
      'Репродукция оригинального советского плаката 1920-х годов в стиле конструктивизм. Размер 60×80 см.',
    price: 95,
    category: 'art',
    condition: 'new',
    era_start: 1920, era_end: 1929,
    brand: null,
    image_url:
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop', alt_text: 'Плакат' },
    ],
    details: {
      art_type: 'Плакат',
      dimensions: '60×80 см',
      signed: 'Нет',
      framed: 'Без рамы',
    },
    status: 'active',
    views: 88,
    avgRating: 0,
    created_at: '2025-03-10T14:00:00Z',
  },

  // --- 10: Jazz vinyl collection ---
  {
    id: '10',
    title: 'Коллекция пластинок Jazz',
    description:
      'Набор из 12 виниловых пластинок: классический джаз 1950-60-х. Miles Davis, Coltrane, Monk.',
    price: 520,
    category: 'vinyl',
    condition: 'good',
    era_start: 1950, era_end: 1969,
    brand: 'Blue Note / Columbia',
    special_attributes: ['limited_edition', 'collectors_item'],
    image_url:
      'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1539375665275-f9de415ef9ac?w=600&h=600&fit=crop', alt_text: 'Коллекция пластинок' },
      { url: 'https://images.unsplash.com/photo-1458560871784-56d23406c091?w=600&h=600&fit=crop', alt_text: 'Пластинки — крупный план' },
    ],
    details: {
      artist: 'Miles Davis, Coltrane, Monk',
      genre: 'Джаз',
      format: 'LP 12"',
      label: 'Blue Note / Columbia',
      vinyl_condition: 'Very Good+',
    },
    status: 'active',
    views: 267,
    avgRating: 4.6,
    is_promoted: true,
    created_at: '2025-03-12T09:45:00Z',
  },

  // --- 11: Vienna apartment ---
  {
    id: '11',
    title: 'Уютная квартира в центре Вены',
    description:
      'Светлая 2-комнатная квартира в 7-м районе. Высокие потолки, паркет, винтажная кухня. Рядом метро и парк.',
    price: 1200,
    category: 'apartment',
    condition: 'good',
    era_start: null, era_end: null,
    brand: null,
    image_url:
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=600&fit=crop', alt_text: 'Гостиная' },
    ],
    details: {
      rooms: 2,
      area_m2: 55,
      floor: '3 из 5',
      address: '1070 Вена, Нойбау',
      heating: 'Центральное',
      furnished: 'С мебелью',
      balcony: 'Есть',
      available_from: 'Сразу',
      rent_or_buy: 'Аренда',
    },
    status: 'active',
    views: 412,
    avgRating: 4.3,
    created_at: '2025-03-15T08:00:00Z',
  },

  // --- 12: Vintage Corner shop ---
  {
    id: '12',
    title: 'Vintage Corner — магазин в Нашмаркт',
    description:
      'Винтажный бутик у Нашмаркт. Широкий ассортимент одежды, аксессуаров и предметов интерьера 60-80-х годов.',
    price: 0,
    category: 'shop',
    condition: null,
    era_start: null, era_end: null,
    brand: null,
    image_url:
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop',
    images: [
      { url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=600&fit=crop', alt_text: 'Магазин снаружи' },
    ],
    details: {
      shop_name: 'Vintage Corner',
      shop_type: 'Винтаж',
      owner_name: 'Анна М.',
      phone: '+43 660 123 4567',
      email: 'info@vintagecorner.at',
      address: 'Нашмаркт, 1060 Вена',
      opening_hours: 'Пн-Сб 10:00-18:00',
      specialization: 'Одежда и аксессуары 1960-1980х, предметы интерьера',
    },
    status: 'active',
    views: 89,
    avgRating: 4.0,
    created_at: '2025-03-18T10:00:00Z',
  },
]
