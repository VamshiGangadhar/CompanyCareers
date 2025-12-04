// User types
export const UserRole = {
  ADMIN: 'admin',
  USER: 'user',
};

// Company section types
export const SectionType = {
  HERO: 'hero',
  ABOUT: 'about',
  VALUES: 'values',
  BENEFITS: 'benefits',
  TEAM: 'team',
};

// Job types
export const JobType = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

// API Response types
export const ApiStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
};

// Default branding configuration
export const DefaultBranding = {
  primaryColor: '#3b82f6',
  secondaryColor: '#1f2937',
  backgroundColor: '#ffffff',
  textColor: '#374151',
  logo: null,
  banner: null,
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  COMPANIES: '/api/companies',
  JOBS: '/api/jobs',
};

// Form validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 1000,
};