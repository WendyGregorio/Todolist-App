# Cloud-Synced Task App 🚀

A modern, responsive, and beautiful task management application built with **React**, **Vite**, **Tailwind CSS**, and **Supabase**. This app features real-time cloud synchronization, secure authentication, and premium UI aesthetics.

## Key Features

- **User Authentication**: Secure Login/Register flows powered by Supabase Auth.
- **Real-Time Sync**: Add, edit, toggle, or delete a task on one device and watch it instantly update on all other devices in real-time.
- **CRUD Operations**: Full Create, Read, Update, and Delete capabilities for tasks.
- **Search & Filter**: Quickly find tasks by searching titles and descriptions, or filter by active/completed status.
- **Premium UX/UI**: Beautiful design using Tailwind CSS with glassmorphism effects, dynamic ambient backgrounds, and smooth micro-animations.
- **Fully Responsive**: Optimized for seamless use on both mobile and desktop screens.

## Tech Stack

- **Frontend Framework**: [React.js](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Realtime)
- **Deployment**: [Vercel](https://vercel.com/)

---

## Getting Started

### Prerequisites

To run this project locally, you need:
- Node.js installed (v16+ recommended).
- A free Supabase account.

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd cloud-task-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Create a new project in your Supabase dashboard.
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open the `supabase_schema.sql` file provided in this repository, copy its contents, and run it in the SQL Editor. This script will:
   - Create the `tasks` table.
   - Setup Row Level Security (RLS) policies to ensure users only see their own tasks.
   - Enable Realtime subscriptions for the `tasks` table.

### 4. Configure Environment Variables

1. Rename the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open the `.env` file and add your Supabase Project URL and Anon Key (found in your Supabase Project Settings > API).

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run Locally

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## Deployment on Vercel

This application is ready to be deployed to Vercel and includes a `vercel.json` file to properly handle client-side routing on a Single Page Application (SPA).

1. Push your code to a GitHub repository.
2. Log in to [Vercel](https://vercel.com/) and click **Add New** > **Project**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, add your Supabase credentials:
   - `VITE_SUPABASE_URL` 
   - `VITE_SUPABASE_ANON_KEY`
5. Click **Deploy**.

Vercel will build the project using `npm run build` and deploy it automatically.
