# Technology Stack

## Framework & Runtime
- **Next.js 16.0.1** with App Router architecture
- **React 19.2.0** with React DOM
- **TypeScript 5** for type safety
- **Node.js** runtime environment

## Database & ORM
- **Prisma 6.18.0** as ORM with SQLite database
- Database migrations managed through Prisma
- Prisma Client for type-safe database queries

## Authentication & Authorization
- **NextAuth.js 4.24.13** with Prisma adapter
- Google OAuth and Email providers
- Role-based access control (COMMUNITY_LEADER, SPEAKER, ATTENDEE, COLLABORATOR)
- Session management with database strategy

## Styling & UI
- **Tailwind CSS 4** for utility-first styling
- **DaisyUI 5.3.10** component library with custom "tech-ofrenda" theme
- **Lucide React** for icons
- **Radix UI** for accessible components

## Form Handling & Validation
- **React Hook Form 7.65.0** for form management
- **Zod 4.1.12** for schema validation
- **@hookform/resolvers** for integration

## Payment & Services
- **Stripe 19.2.0** for payment processing
- **Resend 6.3.0** for email services
- **QRCode 1.5.4** for generating QR codes

## Development Tools
- **ESLint 9** with Next.js config
- **tsx** for TypeScript execution
- Path aliases configured (`@/*` → `./src/*`)

## Common Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Operations
```bash
npm run db:push      # Push schema changes to database
npm run db:reset     # Reset database with migrations
npm run db:seed      # Seed database with initial data
npm run db:studio    # Open Prisma Studio
```

### Prisma Commands
```bash
npx prisma generate  # Generate Prisma client
npx prisma migrate dev  # Create and apply migration
npx prisma studio    # Open database browser
```