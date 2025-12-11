# GitHub Copilot Instructions

This file contains instructions and context to help GitHub Copilot provide better suggestions for this repository.

## Project Overview

This is a modern AI Interview Simulator built with:
- **Next.js** - React framework for production
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **OpenAI** - AI integration for interview simulation

## Code Style and Conventions

### TypeScript
- Always use TypeScript for all new files
- Enable strict mode in `tsconfig.json`
- Define explicit types for function parameters and return values
- Use interfaces for object shapes and types for unions/primitives
- Prefer `interface` over `type` for object definitions
- Use meaningful variable and function names that describe their purpose

### React and Next.js
- Use functional components with hooks
- Follow Next.js 13+ App Router conventions when applicable
- Use server components by default, client components only when needed
- Place page components in `app/` or `pages/` directory
- Use proper Next.js data fetching patterns (Server Components, `fetch`, etc.)
- Implement proper error boundaries and loading states

### Styling
- Use Tailwind CSS utility classes for styling
- Follow mobile-first responsive design approach
- Use Tailwind's configuration for custom colors and theme extensions
- Avoid inline styles; prefer Tailwind utilities
- Group related Tailwind classes logically (layout, spacing, colors, typography)

### File Organization
- Components go in `components/` directory
- Utility functions in `lib/` or `utils/` directory
- Type definitions in `types/` directory or co-located with components
- API routes in `app/api/` or `pages/api/`
- Group related files together (feature-based organization)

### Code Quality
- Write clean, readable, and maintainable code
- Add comments for complex logic, not obvious code
- Follow DRY (Don't Repeat Yourself) principle
- Keep functions small and focused on a single responsibility
- Use meaningful commit messages

## AI Integration

### OpenAI Best Practices
- Store API keys in environment variables (`.env.local`)
- Never commit API keys or secrets to the repository
- Implement proper error handling for API calls
- Use appropriate model selection based on use case
- Implement rate limiting and cost management
- Handle streaming responses when appropriate

### Security
- Validate and sanitize all user inputs
- Implement proper authentication and authorization
- Use environment variables for sensitive data
- Follow OWASP security guidelines
- Implement proper CORS policies

## Testing
- Write unit tests for utility functions and components
- Use React Testing Library for component tests
- Test API routes and edge cases
- Aim for meaningful test coverage, not just high percentages

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
