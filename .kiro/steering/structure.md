# Project Structure

## Root Directory Organization
```
├── prisma/           # Database schema, migrations, and seed data
├── public/           # Static assets (SVG icons, images)
├── src/              # Source code
└── .kiro/            # Kiro configuration and steering files
```

## Source Code Structure (`src/`)

### App Router (`src/app/`)
- **Route Groups**: `(auth)`, `(dashboard)`, `(public)` for logical organization
- **API Routes**: RESTful endpoints in `api/` directory
- **Page Routes**: File-based routing with dynamic segments `[id]`
- **Layout Files**: `layout.tsx` for shared UI components

### Key Directories

#### API Routes (`src/app/api/`)
- **Resource-based**: `/events`, `/users`, `/usergroups`, `/speakers`, `/sponsors`
- **Nested Routes**: Dynamic segments for individual resources `[id]/route.ts`
- **Action Routes**: Specific actions like `/events/[id]/checkin`, `/events/[id]/publish`
- **Webhooks**: External service integrations in `/webhooks/`

#### Components (`src/components/`)
- **Feature-based**: Organized by domain (events, speakers, sponsors, etc.)
- **UI Components**: Reusable components in `ui/` directory
- **Form Components**: Dedicated forms directory for complex forms

#### Library Code (`src/lib/`)
- **Authentication**: NextAuth configuration and permissions
- **Database**: Prisma client and query utilities
- **Services**: External service integrations (email, calendar, QR, Stripe)
- **Validations**: Zod schemas for data validation
- **Utils**: Utility functions and helpers

## Naming Conventions

### Files & Directories
- **kebab-case** for file and directory names
- **PascalCase** for React components
- **camelCase** for TypeScript files and functions

### API Routes
- **RESTful patterns**: GET, POST, PUT, DELETE methods
- **Resource naming**: Plural nouns (`/events`, `/users`)
- **Action endpoints**: Descriptive action names (`/checkin`, `/publish`)

### Database Models
- **PascalCase** for model names
- **camelCase** for field names
- **Enum values**: SCREAMING_SNAKE_CASE

## Architecture Patterns

### Route Organization
```
/dashboard/usergroup/[id]/events/[eventId]/checkin
├── Dashboard layout
├── User group context
├── Event management
└── Specific action (checkin)
```

### Component Structure
```
src/components/
├── events/           # Event-related components
├── speakers/         # Speaker management
├── sponsors/         # Sponsorship components
├── usergroups/       # User group components
└── ui/              # Reusable UI components
```

### API Structure
```
src/app/api/
├── events/
│   ├── route.ts              # GET /api/events, POST /api/events
│   └── [id]/
│       ├── route.ts          # GET, PUT, DELETE /api/events/[id]
│       ├── checkin/route.ts  # POST /api/events/[id]/checkin
│       └── publish/route.ts  # POST /api/events/[id]/publish
```

## Import Patterns
- Use `@/` path alias for src imports
- Relative imports for same-directory files
- Absolute imports for cross-feature dependencies
- Group imports: external libraries, internal modules, relative imports