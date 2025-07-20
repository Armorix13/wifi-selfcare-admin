# replit.md

## Overview

This is a WiFi Self-Care Platform built as a full-stack web application for managing internet service complaints, engineers, customers, and service plans. The application features a modern admin dashboard with role-based access control and comprehensive management capabilities for internet service providers.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 2025 - Perfect User Management Sidebar Tabs Interface**
- ✓ Fixed critical page unresponsiveness issue in User Management section
- ✓ Created comprehensive tabbed interface with 4 main sections (Overview, Users, Analytics, Settings)
- ✓ Enhanced user management with perfect sidebar navigation tabs functionality
- ✓ Added Overview tab with real-time statistics and user analytics dashboard
- ✓ Built Users tab with complete CRUD operations and filtering capabilities
- ✓ Implemented Analytics tab with status distribution and area coverage metrics
- ✓ Added Settings tab with display preferences and export/import options
- ✓ Responsive tab design with mobile-optimized navigation
- ✓ Perfect tab switching functionality with state management
- ✓ All sidebar tabs now open and work perfectly without page freezing

**January 2025 - Ultra-Awesome Responsive Login Page Design**
- ✓ Completely redesigned login page with stunning 100vh/100vw coverage
- ✓ Perfect responsive design for mobile, tablet, and desktop
- ✓ Split-screen layout with branding section on desktop
- ✓ Enhanced animated background with floating orbs and particles
- ✓ Interactive theme switcher with 4 themes (Light, Dark, Crypto, Neon)
- ✓ Glassmorphism card design with blur effects and glow animations
- ✓ Beautiful demo account showcase with role badges
- ✓ Enhanced form inputs with emoji labels and backdrop blur
- ✓ Password visibility toggle with smooth animations
- ✓ Gradient submit button with hover scaling effects
- ✓ Grid pattern overlay for professional appearance
- ✓ Mobile-optimized header and responsive spacing
- ✓ Perfect accessibility and color contrast for all themes
- ✓ Enterprise-grade security messaging and online status indicators

**January 2025 - Responsive Mobile Layout Implementation**
- Added responsive sidebar with hamburger menu for mobile devices
- Implemented slide-in animation with smooth transitions for mobile sidebar
- Added backdrop overlay for mobile sidebar with click-to-close functionality
- Mobile sidebar auto-closes when navigation items are selected
- Optimized header layout for mobile with responsive text sizing
- Added mobile-specific theme switcher in sidebar footer
- Enhanced mobile user experience with proper touch interactions

**January 2025 - Complete Migration & Enhanced Analytics Dashboard**
- ✓ Successfully migrated project from Replit Agent to Replit environment
- ✓ Implemented responsive sidebar with hamburger menu for mobile devices
- ✓ Added slide animations and auto-close functionality on mobile navigation
- ✓ Created comprehensive analytics dashboard with multiple chart types:
  - Revenue analytics with financial performance tracking
  - Performance radar charts with multi-dimensional KPI analysis
  - Heatmap visualizations for time-based activity patterns
  - Regional analysis with geographic performance metrics
  - Advanced status charts with trend analysis
  - Real-time network performance monitoring
- ✓ Enhanced admin panel with 8+ different chart types and visualizations
- ✓ Added advanced metrics cards with progress indicators and color-coded alerts
- ✓ Implemented interactive chart controls with time range and data type selections
- ✓ Login system works completely client-side with dummy data
- ✓ Three test accounts working perfectly:
  - admin@company.com / password123 (Super Admin)
  - manager@company.com / password123 (Manager)  
  - staff@company.com / password123 (Admin)
- ✓ Application is 100% client-side with no backend dependencies
- ✓ Mobile-responsive design with modern UI components

**January 2025 - Perfect Header Implementation with Complete Functionality**
- ✓ Enhanced header with comprehensive notification system showing unread count badges
- ✓ Added working notification dropdown with real-time mock data and categorized alerts
- ✓ Implemented complete user profile dropdown with role-based menu items
- ✓ Added responsive search functionality (desktop search bar, mobile search button)
- ✓ Created avatar system with user initials and role display
- ✓ Added functional logout, settings, and profile navigation links
- ✓ Improved responsive design for mobile, tablet, and desktop layouts
- ✓ Added smooth transitions and hover effects throughout header components
- ✓ Implemented role-based access controls in user dropdown menu
- ✓ All buttons and dropdowns fully functional with proper click interactions



**January 2025 - Perfect Support & Rating System with Complete Settings Panel**
- ✓ Created comprehensive support ticket management with complete CRUD operations
- ✓ Added advanced ticket filtering by status, priority, category with real-time search
- ✓ Built detailed ticket view with conversation threads and response management
- ✓ Implemented pagination for both tickets and ratings with configurable items per page
- ✓ Enhanced rating system with customer feedback, helpful votes, and tag management
- ✓ Added detailed analytics dashboard with multiple chart types and performance metrics
- ✓ Created tabbed interface with Analytics, Support Tickets, Ratings & Reviews, and Settings
- ✓ Built ticket creation dialog with full form validation and assignment options
- ✓ Added rating distribution visualization and customer satisfaction metrics
- ✓ Implemented comprehensive search and filtering across all data
- ✓ All buttons and features fully functional with dummy data integration
- ✓ Added SLA compliance tracking and response time monitoring
- ✓ Built complete settings panel with 8 configuration tabs including:
  - General settings (company info, departments, business hours)
  - SLA & Performance (response times, escalation rules)
  - Notifications (email, SMS, push notifications with detailed controls)
  - Ratings & Reviews (rating policies, moderation, thresholds)
  - Auto-Assignment (load balancing, skill-based routing)
  - Security (authentication, session timeout, audit logging)
  - Integrations (Slack, Teams, webhooks, API access)
  - Templates (customizable message templates)
- ✓ Professional enterprise-grade support management interface with full customization

**January 2025 - Perfect Notification System with Advanced Functionality**
- ✓ Created comprehensive notification composer with multi-select recipient targeting
- ✓ Added advanced user selection with dropdown options for users, engineers, managers
- ✓ Implemented "Select All" and individual selection for each recipient type
- ✓ Built location-based and role-based filtering systems
- ✓ Added scheduling functionality with immediate and scheduled delivery options
- ✓ Integrated multiple delivery channels (Push, Email, SMS) with toggle controls
- ✓ Created detailed notification history with performance metrics and analytics
- ✓ Enhanced notification tracking with delivery rates, read rates, and engagement metrics
- ✓ Added comprehensive search and filtering for notification history
- ✓ Modern UI design with priority badges, type indicators, and status tracking
- ✓ Multi-channel delivery visualization and advanced recipient management
- ✓ Real-time statistics dashboard for notification performance overview

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