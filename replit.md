# replit.md

## Overview

This is a WiFi Self-Care Platform built as a full-stack web application for managing internet service complaints, engineers, customers, and service plans. The application features a modern admin dashboard with role-based access control and comprehensive management capabilities for internet service providers.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 2025 - Complete Schema Independence & Enhanced Service Plans**
- Completely removed all @shared/schema imports from entire codebase
- Replaced with local type definitions using Zod validation in each component
- Enhanced Service Plans section with stunning modern design:
  - 10 realistic plans from Jio Fiber, Airtel Xstream, BSNL, My Internet
  - Beautiful gradient headers with provider-specific colors
  - Feature lists with checkmarks and detailed descriptions
  - Speed icons (Zap, Globe, Wifi, Shield) based on connection speed
  - Rating badges (Crown, Award, Star) based on customer ratings
  - Subscriber counts and formatted Indian currency pricing
  - Modern card layout with hover effects and animations
  - Professional color-coded provider branding
- Disabled server dependencies for true standalone operation
- All sections now use local state management with dummy data
- Application is completely self-contained without any external dependencies

**January 2025 - Complete API Migration to Dummy Data**
- Successfully migrated all sections from API dependencies to local dummy data
- Implemented comprehensive dummy data sets for all features
- All CRUD operations work locally without backend dependencies
- Login system with 3 test accounts (admin, manager, staff - password: password123)
- Application fully functional for development and testing

**December 2024 - Enhanced Analytics Dashboard**
- Added comprehensive analytics to both complaints and engineers sections
- Implemented 4 main metric cards for each section with real-time calculations
- Added specialization/priority distribution charts with progress bars
- Created location analytics showing coverage and performance metrics
- Added top performers ranking system for engineers
- Implemented workload distribution and status overview charts
- Enhanced UI with professional gradients and color-coded indicators

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **UI Library**: Shadcn/ui components built on top of Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand for authentication state
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions with connect-pg-simple
- **Validation**: Zod schemas shared between client and server

### Development Environment
- **Monorepo Structure**: Single repository with client, server, and shared code
- **Hot Module Replacement**: Vite dev server with Express integration
- **Type Safety**: Full TypeScript coverage across the stack

## Key Components

### Authentication & Authorization
- Role-based access control (super-admin, admin, manager)
- Permission-based feature access
- Persistent authentication state with Zustand
- Mock JWT token implementation (ready for real authentication)

### Database Schema
- **Users**: Authentication and role management
- **Customers**: Service subscriber information
- **Engineers**: Field technician management
- **Service Plans**: Internet plan configurations
- **Complaints**: Customer issue tracking
- **Notifications**: System messaging
- **Support Tickets**: Customer support workflow

### UI Components
- Fully accessible components using Radix UI primitives
- Consistent design system with Tailwind CSS
- Responsive layout with mobile-first approach
- Interactive data tables with search and filtering
- Modal dialogs for forms and confirmations

### Feature Modules
- **Dashboard**: Overview statistics and metrics
- **Complaint Management**: Issue tracking and engineer assignment
- **Engineer Management**: Technician profiles and availability
- **User Management**: Customer and staff administration
- **Service Plans**: Internet package management
- **Analytics**: Performance metrics and reporting
- **Notifications**: System-wide messaging
- **Support & Rating**: Customer feedback system
- **Settings**: System configuration

## Data Flow

1. **Client Requests**: React components use TanStack Query for API calls
2. **Server Processing**: Express routes handle business logic and database operations
3. **Database Layer**: Drizzle ORM manages PostgreSQL interactions
4. **Response Flow**: JSON responses with proper error handling
5. **State Updates**: Query invalidation triggers UI updates

## External Dependencies

### Core Dependencies
- **Database**: PostgreSQL via Neon Database serverless
- **UI Components**: Radix UI primitives for accessibility
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Validation**: Zod for schema validation

### Development Tools
- **TypeScript**: Full type safety
- **ESLint/Prettier**: Code quality and formatting
- **Vite**: Fast development builds
- **PostCSS**: CSS processing with Tailwind

## Deployment Strategy

### Build Process
- Frontend: Vite builds to `dist/public` directory
- Backend: esbuild bundles server code to `dist/index.js`
- Shared schemas and utilities are bundled with both builds

### Environment Configuration
- Development: Vite dev server with Express middleware
- Production: Static file serving with Express
- Database: Environment-based connection strings

### Scripts
- `npm run dev`: Development mode with hot reloading
- `npm run build`: Production build for both client and server
- `npm run start`: Production server startup
- `npm run db:push`: Database schema deployment

### Platform Considerations
- Designed for deployment on platforms supporting Node.js
- Environment variables for database configuration
- Static asset serving capabilities required
- PostgreSQL database hosting needed

The application follows modern full-stack patterns with TypeScript throughout, emphasizing type safety, developer experience, and maintainable code architecture.