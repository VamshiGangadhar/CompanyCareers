# CompanyCareers - Full-Stack Application

A full-stack careers page builder deployed on Vercel with React frontend and serverless API functions.

## 🚀 Quick Start

This application is configured for **complete Vercel deployment** with both frontend and backend running on the same platform.

### For Deployment Instructions:

👉 **See [README-VERCEL.md](./README-VERCEL.md)** for complete deployment guide

### Local Development:

```bash
# Install dependencies
npm install

# Start development server (frontend only)
npm run dev

# For full serverless testing with Vercel CLI
npm install -g vercel
vercel dev
```

## 🏗️ Architecture

- **Frontend**: React + Vite + Material-UI + Tailwind CSS
- **Backend**: Vercel Serverless Functions
- **Database**: PostgreSQL (Supabase/Neon recommended)
- **Authentication**: JWT-based auth
- **Deployment**: Single Vercel deployment

## 📁 Structure

```
├── api/           # Serverless API functions
├── lib/           # Shared utilities
├── src/           # React frontend
├── prisma/        # Database schema
└── vercel.json    # Deployment config
```

## 🚀 Features

- Company profile management with custom branding
- Job posting system
- Authentication & authorization
- Responsive design
- SEO optimized
- Real-time updates

---

**For complete deployment instructions, see [README-VERCEL.md](./README-VERCEL.md)** 📖
