# Southern Savor Collective

A secure and performant recipe management application with AI-powered recipe enhancement.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env

# Edit .env and add your credentials:
# - Supabase credentials from your project dashboard
# - OpenAI API key for recipe enhancement
```

## Security Features

- 🔒 Secure Authentication
  - Rate limiting on login attempts
  - Password complexity requirements
  - Secure session management
  - Type-safe authentication flow

- 🛡️ API Security
  - Input validation and sanitization
  - Rate limiting on API calls
  - Retry mechanism with exponential backoff
  - Response validation
  - Type-safe API client

- 🔐 Edge Functions
  - Secure headers
  - CORS protection
  - Request validation
  - Rate limiting
  - Proper error handling

## Development

```bash
# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `OPENAI_API_KEY`: OpenAI API key (for Edge Functions)

## Architecture

### Client

- React + TypeScript for type safety
- Vite for fast development and building
- Zod for runtime type validation
- Proper error handling and user feedback
- Centralized API client with retry logic

### Backend (Supabase)

- Row Level Security (RLS) policies
- Edge Functions for secure processing
- Rate limiting and request validation
- Proper error handling and logging

### Database

- Secure schema design
- Proper foreign key constraints
- Row Level Security enabled
- Automated backups

## Security Best Practices

1. Environment Variables
   - Never commit .env files
   - Use proper validation
   - Keep secrets secure

2. Authentication
   - Implement rate limiting
   - Enforce password requirements
   - Handle sessions securely
   - Clear sensitive data on logout

3. API Calls
   - Validate all inputs
   - Sanitize user data
   - Implement rate limiting
   - Use proper error handling

4. Edge Functions
   - Restrict CORS
   - Validate requests
   - Sanitize inputs
   - Use secure headers

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

Please ensure your code:
- Passes all tests
- Includes proper error handling
- Has appropriate type safety
- Follows security best practices

## License

MIT
