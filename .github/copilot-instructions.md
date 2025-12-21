# GitHub Copilot Instructions

This file contains instructions and context to help GitHub Copilot provide better suggestions for this repository.

## Project Overview

This is a modern AI Interview Simulator built with:
- **Next.js 14** - React framework with App Router
- **TypeScript 5.3** - For type safety and better developer experience
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **OpenAI GPT-3.5** - AI integration for interview simulation
- **Supabase** - Backend for authentication and database

## Build, Test, and Lint Commands

### Development
```bash
npm run dev        # Start development server on http://localhost:3000
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint to check code quality
```

### Installation
```bash
npm install        # Install all dependencies
```

### Environment Setup
- Copy `.env.example` to `.env.local` before running the app
- Required environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `OPENAI_API_KEY` - OpenAI API key (server-side only)

## Code Style and Conventions

### TypeScript
- Always use TypeScript for all new files
- Strict mode is enabled in `tsconfig.json` - maintain type safety
- Define explicit types for function parameters and return values
- Use interfaces for object shapes (see `lib/types.ts` for examples)
- Prefer `interface` over `type` for object definitions
- Use `type` for unions, primitives, and utility types
- Use meaningful variable and function names that describe their purpose
- Import types from `@/lib/types` for shared domain models (User, Interview, Question, etc.)
- Use path aliases with `@/` prefix (configured in `tsconfig.json`)

### TypeScript Examples
```typescript
// Define interfaces for object shapes
export interface Interview {
  id: string
  user_id: string
  title: string
  position: string
  status: 'pending' | 'in_progress' | 'completed'  // Use literal types for enums
  score?: number  // Use optional properties when appropriate
  created_at: string
}

// Use type for component props that extend HTML attributes
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
}
```

### React and Next.js
- Use functional components with hooks
- Follow modern Next.js App Router conventions (prefer App Router over Pages Router)
- Use server components by default, client components only when needed (mark with `'use client'`)
- Place page components in `app/` directory for App Router
- Use proper Next.js data fetching patterns (Server Components, `fetch`, etc.)
- Implement proper error boundaries and loading states
- Use Next.js API routes for backend endpoints (in `app/api/`)
- Follow RESTful conventions for API routes

### API Route Patterns
```typescript
// Import types and dependencies
import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types'

// Use proper HTTP methods (GET, POST, PUT, DELETE)
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request data
    const { field1, field2 } = await request.json()
    
    if (!field1 || !field2) {
      return NextResponse.json(
        { success: false, error: 'Required fields missing' } as ApiResponse,
        { status: 400 }
      )
    }
    
    // Process request
    const result = await processData(field1, field2)
    
    // Return success response
    return NextResponse.json({
      success: true,
      data: result,
    } as ApiResponse)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Error message' } as ApiResponse,
      { status: 500 }
    )
  }
}
```

### API Response Format
All API routes return a consistent `ApiResponse<T>` structure:
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T        // Present when success is true
  error?: string  // Present when success is false
}
```

### Styling
- Use Tailwind CSS utility classes for styling
- Follow mobile-first responsive design approach
- Use Tailwind's configuration for custom colors (primary and secondary color scales defined in `tailwind.config.ts`)
- Avoid inline styles; prefer Tailwind utilities
- Group related Tailwind classes logically (layout, spacing, colors, typography)
- Use the `cn()` utility from `lib/utils.ts` for conditional className merging
- Use gradient backgrounds for primary buttons: `bg-gradient-to-r from-primary-600 to-secondary-600`

### Component Patterns
```typescript
// Use cn() for conditional classes
import { cn } from '@/lib/utils'

<button className={cn(
  'base-classes',
  {
    'conditional-class': condition,
  },
  className // Allow prop-based overrides
)} />

// Define component props extending HTML element props
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

// Use React.forwardRef for components that need ref support
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    // Component implementation
  }
)
```

### File Organization
- Components go in `components/` directory
  - Reusable UI components in `components/ui/` (Button, Card, Input, etc.)
  - Feature-specific components in `components/` root (CVUpload, InterviewCard, etc.)
- Utility functions in `lib/` directory
  - `lib/openai.ts` - OpenAI client configuration
  - `lib/supabase.ts` - Supabase client configuration
  - `lib/types.ts` - Shared TypeScript type definitions
  - `lib/utils.ts` - General utility functions (includes `cn()` for className merging)
- API routes in `app/api/` directory following Next.js App Router conventions
  - `app/api/auth/` - Authentication endpoints
  - `app/api/interview/` - Interview management endpoints
  - `app/api/openai/` - OpenAI integration endpoints
- Pages in `app/` directory (App Router pattern)
- Group related files together (feature-based organization)

### Code Quality
- Write clean, readable, and maintainable code
- Add JSDoc comments for complex logic and public APIs (see examples in `lib/` files)
- Follow DRY (Don't Repeat Yourself) principle
- Keep functions small and focused on a single responsibility
- Use meaningful commit messages
- Always export types and interfaces that are used across multiple files

### Naming Conventions
- Use PascalCase for component files and component names (e.g., `Button.tsx`, `CVUpload.tsx`)
- Use camelCase for variables, functions, and file names (e.g., `openai.ts`, `utils.ts`)
- Use descriptive names that indicate purpose (e.g., `getOpenAI()`, `analyzeCV()`)
- Prefix type/interface files with their domain (e.g., types in `lib/types.ts`)

## AI Integration

### OpenAI Best Practices
- Store API keys in environment variables (`.env.local`)
- Never commit API keys or secrets to the repository
- Implement proper error handling for API calls
- Use GPT-3.5-turbo model for cost efficiency (current standard in this project)
- Implement rate limiting and cost management
- Handle streaming responses when appropriate
- Use lazy-loaded singleton pattern for OpenAI client (see `lib/openai.ts`)
- Always parse JSON responses with proper error handling

### OpenAI Usage Patterns
```typescript
// Import the client
import { openai } from '@/lib/openai'

// Make API calls in try-catch blocks
try {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [...],
    temperature: 0.7,
    max_tokens: 1000,
  })
} catch (error) {
  console.error('OpenAI error:', error)
  // Handle error appropriately
}
```

### Supabase Integration

- Use lazy-loaded singleton pattern for Supabase client (see `lib/supabase.ts`)
- Access Supabase client via `getSupabase()` or the `supabase` proxy
- Environment variables use `NEXT_PUBLIC_` prefix for client-side access
- Implement Row Level Security (RLS) policies for all database tables
- Use Supabase Auth for authentication (email/password)

### Supabase Usage Patterns
```typescript
// Import the client
import { getSupabase } from '@/lib/supabase'

// Use in server components or API routes
const supabase = getSupabase()
const { data, error } = await supabase
  .from('interviews')
  .select('*')
  .eq('user_id', userId)
```

### Database Schema
The application uses the following main tables in Supabase:

**interviews table:**
- `id` (UUID, primary key)
- `user_id` (UUID, references auth.users)
- `title` (TEXT)
- `position` (TEXT)
- `cv_text` (TEXT, optional)
- `status` (TEXT: 'pending' | 'in_progress' | 'completed')
- `score` (INTEGER, optional)
- `created_at`, `updated_at` (TIMESTAMP)

**questions table:**
- `id` (UUID, primary key)
- `interview_id` (UUID, references interviews)
- `question_text` (TEXT)
- `order_num` (INTEGER)
- `answer_text` (TEXT, optional)
- `score` (INTEGER, optional)
- `feedback` (TEXT, optional)
- `created_at` (TIMESTAMP)

Row Level Security (RLS) is enabled on all tables.

### Security
- Validate and sanitize all user inputs
- Implement proper authentication and authorization
- Use environment variables for sensitive data
- Follow OWASP security guidelines
- Implement proper CORS policies

## Testing
- Write unit tests for utility functions and components
- Use React Testing Library for component tests (when test infrastructure is added)
- Test API routes and edge cases
- Aim for meaningful test coverage, not just high percentages
- Note: Test infrastructure is not yet set up in this project

## Performance
- Optimize images using Next.js Image component
- Implement code splitting and lazy loading
- Minimize bundle size
- Use proper caching strategies
- Optimize API calls and reduce unnecessary re-renders

## Accessibility
- Use semantic HTML elements
- Implement proper ARIA labels and roles
- Ensure keyboard navigation works properly
- Maintain proper color contrast ratios
- Test with screen readers when possible

## Documentation
- Update README.md with setup instructions
- Document API endpoints and their usage
- Add JSDoc comments for complex functions
- Keep documentation in sync with code changes

## Environment Setup
- Node.js version should be specified in `.nvmrc` or `package.json`
- Dependencies should be locked with `package-lock.json` or `yarn.lock`
- Include example environment variables in `.env.example`

## Git Workflow
- Use descriptive branch names (feature/, bugfix/, etc.)
- Write clear commit messages
- Keep commits focused and atomic
- Review changes before committing

## Common Patterns and Best Practices

### Error Handling
- Always wrap API calls in try-catch blocks
- Log errors with `console.error()` for debugging
- Return user-friendly error messages in API responses
- Use appropriate HTTP status codes (400 for client errors, 500 for server errors)

### Import Aliases
- Use `@/` prefix for all imports (configured in `tsconfig.json`)
- Example: `import { Button } from '@/components/ui/Button'`
- Example: `import { openai } from '@/lib/openai'`

### Client vs Server Components
- By default, components in `app/` directory are Server Components
- Add `'use client'` directive at the top of files that need client-side features:
  - useState, useEffect, or other React hooks
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Third-party libraries that use browser APIs

### PDF Handling
- Use `pdf-parse` library for extracting text from PDF files
- Maximum file size: 5MB
- Only PDF format is supported for CV uploads

## Important Notes
- This project uses Next.js 14 with the App Router (not Pages Router)
- ESLint is configured with `next/core-web-vitals` preset
- The app uses lazy-loaded singletons for OpenAI and Supabase clients to optimize resource usage
- All environment variables for Supabase use `NEXT_PUBLIC_` prefix for client access
- OpenAI API key is server-side only (no `NEXT_PUBLIC_` prefix)
