# Next.js Authentication Demo

A full-featured authentication system built with Next.js 14, NextAuth.js, MongoDB, and Tailwind CSS.

## Features

- 🔐 Multiple authentication methods:
  - Email/Password
  - Google OAuth
  - Facebook OAuth
- 🛡️ Protected routes
- 💾 MongoDB database integration
- 🎨 Responsive UI with Tailwind CSS
- 🔒 JWT-based sessions
- 📱 Mobile-friendly design

## Prerequisites

- Node.js 16+ and npm
- MongoDB database (local or Atlas)
- Google OAuth credentials (for Google sign-in)
- Facebook OAuth credentials (for Facebook sign-in)

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="your-mongodb-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# OAuth providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
```

4. Initialize the database:

```bash
npm run setup
```

5. Start the development server:

```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/                 # API routes
│   ├── components/         # Reusable components
│   ├── protected/          # Protected pages
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── lib/                   # Utility functions
├── prisma/               # Database schema and migrations
├── public/              # Static files
└── types/              # TypeScript type definitions
```

## Authentication Flow

1. Users can sign up using email/password or OAuth providers
2. Credentials are validated and stored securely
3. Sessions are managed using JWT
4. Protected routes require authentication
5. Access control is handled by middleware

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:push` - Push schema changes to database

## Deployment

1. Set up environment variables in your deployment platform
2. Configure OAuth callback URLs
3. Deploy using the platform's deployment process
4. Run database migrations if needed

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for your own purposes.
# next-js-auth
