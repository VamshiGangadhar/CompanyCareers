# Technical Specification - CompanyCareers

## Assumptions

### Business Requirements

- Companies need a platform to create and customize their career pages
- Each company will have a unique slug-based URL (e.g., slug/careers)
- AI-powered content enhancement should be optional and preserve original meaning
- User authentication is required for company management
- Public career pages should be accessible without authentication
- Companies need to manage job postings, team members, and branding

### Technical Assumptions

- Modern web browsers with JavaScript enabled
- Companies will upload images under 50MB for logos and banners
- GraphQL is preferred for backend API architecture
- Supabase provides reliable database and authentication services
- Vercel provides stable hosting for both frontend and backend
- Google's Gemini AI API will remain available and performant

### Operational Assumptions

- AI enhancement features will be used selectively
- Companies may have 1-10 team members managing content

## Architecture

### System Overview

CompanyCareers is a full-stack web application built with React frontend and Node.js backend, using Supabase as the primary database and Vercel for deployment.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │    │  Node.js API    │    │   Supabase      │
│                 │    │                 │    │                 │
│ • Company Editor│◄──►│ • GraphQL API   │◄──►│ • PostgreSQL    │
│ • Career Pages  │    │ • REST Routes   │    │ • Authentication│
│ • Authentication│    │ • AI Service    │    │ • File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│     Vercel      │    │   Google AI     │
│   (Frontend)    │    │   (Gemini API)  │
└─────────────────┘    └─────────────────┘
```

### Frontend Architecture (React)

#### Component Structure

```
src/
├── pages/              # Route components
│   ├── Login.jsx       # Authentication
│   ├── SignUp.jsx      # User registration
│   ├── Dashboard.jsx   # Company overview
│   ├── CompanySetup.jsx# Initial company creation
│   ├── CompanyEditor.jsx# Main editing interface
│   ├── CompanyPreview.jsx# Preview mode
│   └── CareersPage.jsx # Public career page
├── components/         # Reusable UI components
│   ├── ThemeEditor.jsx # Branding customization
│   ├── SectionBuilder.jsx# Page section management
│   ├── JobManager.jsx  # Job posting management
│   ├── TeamManager.jsx # Team member management
│   ├── AIEnhanced*.jsx # AI-powered content fields
│   └── Layout.jsx      # Common layout wrapper
├── context/           # Global state management
│   ├── AuthContext.jsx# Authentication state
│   └── companyStore.js# Company data (Zustand)
└── utils/             # Helper functions
    ├── apiClient.js   # API communication
    ├── validation.js  # Form validation
    └── string.js      # String utilities
```

#### State Management

- **AuthContext**: JWT-based authentication with Supabase
- **Zustand Store**: Company data, jobs, loading states
- **Local Component State**: Form inputs, UI state

#### Routing Strategy

- **Protected Routes**: `/dashboard`, `/setup`, `/company/:slug/edit`, `/company/:slug/preview`
- **Public Routes**: `/login`, `/signup`, `/:slug/careers`
- **Authentication Guard**: ProtectedRoute component wraps secured pages

### Backend Architecture (Node.js)

#### API Design

```
backend/src/
├── server.js          # Express server setup
├── config/
│   └── database.js    # Supabase client configuration
├── graphql/
│   ├── typeDefs.js    # GraphQL schema definitions
│   └── resolvers.js   # GraphQL query/mutation handlers
├── routes/
│   └── eventHandler.js# REST API endpoints
└── services/
    └── aiService.js   # Google Gemini AI integration
```

#### GraphQL Schema

```graphql
type Company {
  id: ID!
  name: String!
  slug: String!
  branding: JSON        # Theme colors, fonts, logos
  sections: JSON        # Page content structure
  createdAt: String!
  updatedAt: String!
}

type Query {
  companies: [Company!]!
  company(id: ID, slug: String): Company
}

type Mutation {
  createCompany(...): Company!
  updateCompany(...): Company!
  deleteCompany(id: ID!): Boolean!
}
```

#### AI Service Integration

- **Provider**: Google Gemini 2.5-flash model
- **Features**: Text enhancement for titles, descriptions, content
- **Safety**: Preserves original meaning and context
- **Fallback**: Graceful degradation if AI service unavailable

### Database Schema

#### Primary Tables (Supabase/PostgreSQL)

```sql
-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  branding JSONB,           -- Theme configuration
  sections JSONB,           -- Page content structure
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Jobs table (implied from JobManager component)
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  requirements JSONB,
  location VARCHAR(255),
  type VARCHAR(50),         -- full-time, part-time, contract
  salary_min INTEGER,
  salary_max INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members table (implied from TeamManager)
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

#### Relationships

- One-to-Many: Company → Jobs
- One-to-Many: Company → Team Members
- Many-to-One: Company → User (via user_id)

### Security Architecture

#### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. JWT tokens stored in localStorage and httpOnly cookies
3. Protected routes verify token presence
4. Backend validates JWT for API requests

#### Authorization

- **Row Level Security (RLS)**: Supabase policies ensure users only access their companies
- **CORS Configuration**: Restricted to known frontend domains
- **Input Validation**: Joi schemas for API payloads
- **SQL Injection Prevention**: Parameterized queries via Supabase client

#### Data Protection

- **HTTPS**: All communications encrypted in transit
- **Environment Variables**: API keys and secrets stored securely
- **File Upload Limits**: 50MB max payload size
- **XSS Prevention**: React's built-in output encoding

## Schema Details

### Company Data Structure

```typescript
interface Company {
  id: string;
  name: string;
  slug: string;
  branding: {
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    logoUrl?: string;
    bannerUrl?: string;
  };
  sections: {
    hero: {
      title: string;
      subtitle: string;
      description: string;
    };
    about: {
      title: string;
      content: string;
    };
    values: {
      title: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
    jobs: {
      title: string;
      description: string;
    };
    team: {
      title: string;
      description: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}
```

### Job Posting Structure

```typescript
interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements: {
    experience: string;
    education: string;
    skills: string[];
    qualifications: string[];
  };
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  salaryMin?: number;
  salaryMax?: number;
  isActive: boolean;
  createdAt: string;
}
```
