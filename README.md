# The Introverted Blog ✍️

> Books, thoughts, and quiet observations — a personal blogging site built for depth over breadth.

![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-Ready-3FCF8E?logo=supabase&logoColor=white)

---

## ✨ Features

- **Dynamic Animated Hero** — SVG scene that changes with time of day (day/sunrise/sunset/night) with an interactive analog clock
- **Rich Blog System** — Full CRUD with categories, rich-text editor, and SEO metadata per page
- **Masonry Photo Gallery** — Pinterest-style 4-column layout in the "Glimpses" section
- **Admin Dashboard** — Protected `/admin` route with post management (create, edit, delete)
- **Custom Rich Text Editor** — Built-in `contentEditable` editor (no external dependencies)
- **Supabase-Ready** — Drop-in backend swap from localStorage mock to real Supabase
- **Fully Responsive** — Optimized for mobile, tablet, and desktop
- **SEO Optimized** — Dynamic `<title>` and `<meta>` tags via `react-helmet-async`
- **Auto-Deploy** — GitHub Actions CI/CD to GitHub Pages

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 + React Router 7 |
| **Build Tool** | Vite 7 |
| **Styling** | Vanilla CSS with CSS Variables |
| **Animations** | Framer Motion + SVG |
| **Icons** | Lucide React |
| **Backend** | Supabase (or localStorage mock) |
| **Deployment** | GitHub Pages via Actions |

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/your-username/abhinomous.git
cd abhinomous

# Install dependencies
npm install

# Start dev server
npm run dev
```

The site runs on **localhost:5173** with mock data (localStorage) by default.

## 🔧 Supabase Setup (Optional)

1. Create a [Supabase](https://supabase.com) project
2. Run the schema in your SQL Editor:
   ```bash
   # Copy the contents of supabase/schema.sql and run in Supabase Dashboard → SQL Editor
   ```
3. Create your admin user in **Authentication → Users**
4. Copy your credentials:
   ```bash
   cp .env.example .env
   ```
5. Fill in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
6. Restart the dev server — the app auto-detects and switches to Supabase.

## 📁 Project Structure

```
abhinomous/
├── .github/workflows/    # CI/CD
│   └── deploy.yml
├── public/               # Static assets
│   └── assets/glimpses/  # Photo gallery images
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Hero.jsx         # Animated hero section
│   │   ├── AnalogClock.jsx  # Interactive clock widget
│   │   ├── AnimatedScene.jsx # SVG time-of-day scene
│   │   ├── BlogsSection.jsx  # Blog cards grid
│   │   ├── PhotosSection.jsx # Photo masonry gallery
│   │   ├── AboutSection.jsx  # About me section
│   │   └── RichTextEditor.jsx # Custom WYSIWYG editor
│   ├── data/
│   │   └── dummy.js      # Seed data (10 blog posts)
│   ├── pages/
│   │   ├── Home.jsx       # Landing page
│   │   ├── BlogDetail.jsx # Individual blog post
│   │   ├── Login.jsx      # Admin login
│   │   ├── AdminDashboard.jsx # Post management
│   │   ├── AdminEditor.jsx    # Create/edit posts
│   │   └── NotFound.jsx   # 404 page
│   ├── services/
│   │   ├── ApiService.js       # Abstract base class
│   │   ├── MockSupabaseService.js # localStorage mock
│   │   ├── SupabaseService.js  # Real Supabase client
│   │   └── index.js            # Auto-detect & export
│   ├── App.jsx            # Router layout
│   ├── main.jsx           # Entry point
│   └── index.css          # All styles
├── supabase/
│   └── schema.sql         # Database schema + RLS
├── .env.example           # Config template
└── vite.config.js         # Vite configuration
```

## 🔒 Admin Access

Navigate to `/login` (hidden from public UI). Default mock credentials:

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |

> When using Supabase, login uses `email + password` via Supabase Auth.

## 📦 Build for Production

```bash
npm run build    # Output → dist/
npm run preview  # Preview the production build locally
```

## 🚢 Deployment

### GitHub Pages (Automatic)

Push to `main` branch → GitHub Actions builds and deploys automatically.

To enable Supabase in production:
1. Go to **Settings → Secrets → Actions**
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Redeploy

### Manual Deploy

```bash
npm run build
# Upload the dist/ folder to any static host
```

## 🎨 Design Philosophy

- **Dark theme** with carefully tuned surfaces and borders
- **Glassmorphism** login card with backdrop blur
- **Playfair Display** + **Inter** typography pairing
- **Micro-animations** on hover states and page transitions
- **No Tailwind** — pure vanilla CSS with CSS custom properties

---

Built with quiet intention. 🌙
