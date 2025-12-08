# CompanyCareers - AI-Powered Company Career Page Builder

## Overview

CompanyCareers is a modern web application that enables companies to create beautiful, customizable career pages with AI-powered content enhancement. Built with React, Node.js, and Supabase, it provides an intuitive editor for companies to showcase their brand, jobs, and team while maintaining a professional public-facing career site.

## What I Built

### Core Features

1. **Company Authentication & Management**

   - Secure user registration and login
   - Company creation with unique slug-based URLs
   - Dashboard for managing multiple companies

2. **Visual Theme Editor**

   - Real-time color customization
   - Font selection and typography
   - Logo and banner image uploads
   - Live preview of changes

3. **Section-Based Content Builder**

   - Modular page sections (Hero, About, Values, Jobs, Team)
   - Drag-and-drop content organization
   - Rich text editing capabilities
   - Mobile-responsive design

4. **Job Posting Management**

   - Create, edit, and delete job postings
   - Structured job requirements and descriptions
   - Active/inactive job status toggling
   - Location and salary range specification

5. **Team Member Management**

   - Add team member profiles with photos
   - Role descriptions and LinkedIn integration
   - Drag-and-drop team member ordering
   - Professional team showcase

6. **AI-Powered Content Enhancement**

   - Google Gemini integration for text improvement
   - Context-preserving content enhancement
   - One-click content optimization
   - Maintains original meaning while improving readability

7. **Public Career Pages**
   - SEO-friendly public URLs (company.com/slug/careers)
   - Fast-loading, responsive design
   - Professional job application interface
   - Branded company presentation

### Technical Stack

**Frontend:**

- React 18 with modern hooks
- Material-UI for consistent design
- React Router for navigation
- Zustand for state management
- React Hot Toast for notifications
- React Beautiful DnD for drag-and-drop
- Axios for API communication

**Backend:**

- Node.js with Express
- Apollo Server for GraphQL API
- Google Generative AI (Gemini)
- JWT authentication
- Multer for file uploads
- CORS configured for security

**Database & Services:**

- Supabase (PostgreSQL + Auth)
- Vercel for deployment
- Environment-based configuration
- RESTful and GraphQL APIs

### Architecture Highlights

1. **Hybrid API Design**: Combines GraphQL for complex company data operations with REST endpoints for simple actions
2. **State Management**: Context API for authentication, Zustand for company data management
3. **Security**: JWT tokens, CORS protection, input validation, and Supabase RLS
4. **Performance**: Lazy loading, optimized images, efficient database queries
5. **AI Integration**: Graceful fallbacks if AI service unavailable

## How to Run

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project
- Google AI API key (for Gemini)
- Git for version control

### Environment Setup

1. **Clone the Repository**

   ```bash
   git clone https://github.com/VamshiGangadhar/CompanyCareers.git
   cd CompanyCareers
   ```

2. **Install Dependencies**

   ```bash
   # Frontend dependencies
   npm install

   # Backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Environment Configuration**

   Create `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_URL=http://localhost:5000
   ```

   Create `.env` file in the `/backend` directory:

   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GEMINI_API_KEY=your_google_ai_api_key
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```

4. **Database Setup**

   In your Supabase project, run these SQL commands:

   ```sql
   -- Create companies table
   CREATE TABLE companies (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name VARCHAR(255) NOT NULL,
     slug VARCHAR(255) UNIQUE NOT NULL,
     branding JSONB,
     sections JSONB,
     user_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create jobs table
   CREATE TABLE jobs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
     title VARCHAR(255) NOT NULL,
     description TEXT,
     requirements JSONB,
     location VARCHAR(255),
     type VARCHAR(50),
     salary_min INTEGER,
     salary_max INTEGER,
     is_active BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create team_members table
   CREATE TABLE team_members (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
     name VARCHAR(255) NOT NULL,
     role VARCHAR(255),
     bio TEXT,
     image_url VARCHAR(500),
     linkedin_url VARCHAR(500),
     order_index INTEGER DEFAULT 0,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```

5. **Start Development Servers**

   Terminal 1 (Backend):

   ```bash
   cd backend
   npm run dev
   ```

   Terminal 2 (Frontend):

   ```bash
   npm run dev
   ```

   The application will be available at:

   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Production Deployment

**Vercel Deployment:**

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on git push

## Step-by-Step User Guide

### Getting Started

1. **Create an Account**

   - Navigate to the signup page
   - Enter your email and create a secure password
   - Verify your account if email confirmation is enabled

2. **Access Your Dashboard**

   - Log in with your credentials
   - View the dashboard showing your companies (initially empty)
   - Click "Create New Company" to begin

3. **Initial Company Setup**
   - Enter your company name
   - Choose a unique slug (this becomes your career page URL)
   - Optionally add basic information
   - Click "Create Company" to proceed to the editor

### Customizing Your Career Page

4. **Theme Customization**

   - Navigate to the "Theme" tab in the editor
   - Adjust primary and secondary colors using color pickers
   - Select background and text colors for optimal contrast
   - Choose from available font families
   - Upload company logo and banner images
   - See changes reflected in real-time on the right preview

5. **Content Sections**

   - Switch to the "Sections" tab
   - Configure the Hero section with compelling headline and description
   - Add company story in the About section
   - Define company values with titles and descriptions
   - Customize section headings and content

6. **Job Management**

   - Navigate to the "Jobs" tab
   - Click "Add New Job" to create job postings
   - Fill in job details: title, description, requirements, location
   - Set salary ranges and employment type
   - Use the AI enhancement feature for better job descriptions
   - Toggle jobs active/inactive as needed

7. **Team Showcase**
   - Go to the "Team" tab
   - Add team members with names, roles, and bio descriptions
   - Upload professional headshots
   - Add LinkedIn profile links
   - Drag and drop to reorder team members
   - Use AI enhancement for compelling team bios

## Improvement Plan

### Core Enhancements

**Analytics Dashboard**

- Add Google Analytics integration
- Track career page visits and job application rates
- Provide insights on popular job postings
- Monitor user engagement metrics

**Advanced Job Features**

- Application form builder with custom fields
- Email notifications for new applications
- Application status tracking
- Integration with ATS systems
