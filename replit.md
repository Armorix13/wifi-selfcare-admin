# replit.md

## Overview
This is a WiFi Self-Care Platform, a full-stack web application designed for internet service providers to manage customer complaints, engineers, customers, and service plans. It features a modern admin dashboard with role-based access control, comprehensive management capabilities, and advanced analytics. The project aims to provide a robust, client-side functional platform for development and testing, leveraging dummy data for all operations without backend dependencies.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Shadcn/ui (built on Radix UI primitives)
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: Zustand (for authentication)
- **Data Fetching**: TanStack Query
- **Routing**: Wouter
- **Forms**: React Hook Form with Zod validation
- **Design Principles**: Responsive design for mobile, tablet, and desktop; modern UI components with glassmorphism and animated elements; accessible components; consistent design system across themes (Light, Dark, Crypto, Neon).

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: PostgreSQL-based sessions
- **Validation**: Zod schemas (shared)
- **Architecture**: Monorepo structure for client, server, and shared code; full TypeScript coverage for type safety.

### Core Features & Design
- **Authentication & Authorization**: Role-based access control (super-admin, admin, manager) with permission-based feature access.
- **Data Management**: Comprehensive CRUD operations for users, customers, engineers, service plans, complaints, notifications, support tickets, and leads.
- **Analytics & Reporting**: Integrated dashboards with various chart types (revenue, performance radar, heatmap, regional, status charts), metrics cards, and real-time performance monitoring.
- **User Interface**: Tabbed interfaces, responsive sidebars with hamburger menus for mobile, comprehensive notification system, user profile management, search functionality, advanced filtering, and pagination.
- **Theming**: Dynamic theme management system with 4 distinct themes, ensuring consistent styling across all components.
- **Support & Rating System**: Comprehensive ticket management with CRUD, filtering, conversation threads, customer feedback, and detailed settings panel.
- **Notification System**: Advanced composer with multi-select recipient targeting, scheduling, multi-channel delivery (Push, Email, SMS), and history tracking.
- **New Installation & Leads Management**: Unified interface for tracking installations and leads, with analytics, document upload (e.g., Aadhar, passport photos), and status management.

## External Dependencies
- **Database**: PostgreSQL (via Neon Database)
- **UI Primitives**: Radix UI
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Validation**: Zod
- **Development Tools**: TypeScript, ESLint, Prettier, Vite, PostCSS