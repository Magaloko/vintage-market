# ЭПОХА — Винтажный Маркетплейс

Русскоязычная платформа для продажи уникальных винтажных товаров. Административная панель с статистикой, управлением товарами и аналитикой.

## Технологический стек

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS (Vintage Design System)
- **Backend/DB:** Supabase (PostgreSQL + Auth + Storage)
- **Charts:** Recharts
- **Routing:** React Router v6
- **Deploy:** Vercel
- **Icons:** Lucide React

---

## 🆕 v2.0 — Новые возможности

### Supabase Storage (загрузка изображений)
- Drag & Drop загрузка прямо в админ-панель
- Валидация: JPG, PNG, WebP, GIF — до 5MB
- Работает и с внешними ссылками (Unsplash, GitHub Raw)

### Галерея изображений
- Множественные изображения на товар
- Миниатюры + навигация стрелками
- Полноэкранный просмотр (lightbox) по клику
- Drag & Drop сортировка в админ-панели

### Избранное (Favoritenliste)
- Кнопка-сердечко на каждом товаре
- Страница /favorites с коллекцией
- Счётчик в навигации
- Без регистрации: localStorage / С авторизацией: Supabase sync

### Миграция (v1 → v2)
```bash
# После schema.sql выполните в Supabase SQL Editor:
supabase/migration-v2.sql
```

---

## Быстрый старт (Демо-режим)

Проект работает **без Supabase** в демо-режиме с локальными данными.

```bash
# 1. Клонировать репозиторий
git clone https://github.com/YOUR_USERNAME/vintage-market.git
cd vintage-market

# 2. Установить зависимости
npm install

# 3. Скопировать env-файл
cp .env.example .env

# 4. Запустить dev-сервер
npm run dev
```

Открыть `http://localhost:5173`

**Демо-вход в админ-панель:**
- URL: `/admin/login`
- Email: `admin@vintage.demo`
- Пароль: `demo123`

---

## Установка с Supabase (Продакшен)

### Шаг 1: Создать проект в Supabase

1. Перейти на [supabase.com](https://supabase.com)
2. Создать новый проект
3. Скопировать **Project URL** и **anon/public key**

### Шаг 2: Настроить базу данных

1. В Supabase → SQL Editor
2. Выполнить содержимое файла `supabase/schema.sql`
3. Это создаст таблицу `products`, индексы, RLS-политики и демо-данные

### Шаг 3: Настроить аутентификацию

1. Supabase → Authentication → Users
2. Создать нового пользователя (Admin)
3. Запомнить email и пароль

### Шаг 4: Настроить environment

```bash
# .env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...your-key
```

### Шаг 5: Запустить

```bash
npm install
npm run dev
```

---

## Деплой на Vercel

### Вариант A: Через GitHub (рекомендуется)

1. Загрузить код на GitHub
2. Перейти на [vercel.com](https://vercel.com)
3. "Add New Project" → импортировать репозиторий
4. Framework Preset: **Vite**
5. В Environment Variables добавить:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Deploy

### Вариант B: Через CLI

```bash
# Установить Vercel CLI
npm i -g vercel

# Деплой
vercel

# Добавить env-переменные
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Продакшен-деплой
vercel --prod
```

---

## Структура проекта

```
vintage-market/
├── public/
│   └── vintage-icon.svg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminLayout.jsx        # Sidebar + admin chrome
│   │   └── public/
│   │       ├── PublicLayout.jsx        # Header + Footer wrapper
│   │       ├── Header.jsx             # Navigation + search
│   │       ├── Footer.jsx             # Footer
│   │       └── ProductCard.jsx        # Product card component
│   ├── data/
│   │   └── demoProducts.js            # Demo data + categories
│   ├── lib/
│   │   ├── supabase.js                # Supabase client
│   │   ├── AuthContext.jsx            # Auth provider
│   │   └── api.js                     # Data service (Supabase + demo)
│   ├── pages/
│   │   ├── Home.jsx                   # Landing page
│   │   ├── Catalog.jsx                # Product catalog + filters
│   │   ├── ProductPage.jsx            # Product detail
│   │   ├── About.jsx                  # About page
│   │   ├── Contact.jsx                # Contact form
│   │   └── admin/
│   │       ├── AdminLogin.jsx         # Admin login
│   │       ├── AdminDashboard.jsx     # Statistics dashboard
│   │       ├── AdminProducts.jsx      # Product management
│   │       └── AdminProductForm.jsx   # Create/edit product
│   ├── App.jsx                        # Router + auth
│   ├── main.jsx                       # Entry point
│   └── index.css                      # Tailwind + custom styles
├── supabase/
│   └── schema.sql                     # Database schema
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
└── vite.config.js
```

---

## Функциональность

### Публичная часть (Витрина)
- Главная с Hero, категориями и новыми поступлениями
- Каталог с фильтрами по категориям и состоянию
- Поиск по товарам
- Страница товара с характеристиками
- Контактная форма
- Страница «О нас»

### Админ-панель (`/admin`)
- Dashboard с 6 метриками + 3 графика (Recharts)
- CRUD для товаров (создание, редактирование, удаление)
- Фильтрация и поиск в списке товаров
- Предпросмотр изображений по URL
- Управление статусом (В наличии / Продано)

### Дизайн
- Vintage Design System (Beige, Brown, Cream, Gold, Green)
- Шрифты: Playfair Display, Cormorant Garamond, Outfit
- Бумажная текстура фона
- Плавные анимации и переходы
- Полностью адаптивный (mobile-first)

---

## Расширения (Roadmap)

- [ ] Supabase Storage для загрузки изображений
- [ ] Множественные изображения (галерея)
- [ ] Favoritenliste для пользователей
- [ ] SEO-мета-теги (react-helmet)
- [ ] Telegram-бот уведомления
- [ ] Multi-language (RU/DE/EN)
- [ ] Conversion tracking
- [ ] KI-генерация описаний

---

## Лицензия

MIT

## v3.0 Features

- Admin Dashboard: 8 stat cards, tabbed charts, top products rankings
- Catalog: Price filter, condition filter, sort dropdown
- Product Comparison: Compare button, floating bar, side-by-side page
- Price Analysis: Category average, price insight badge
- Similar Products: Recommendations on product page
