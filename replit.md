# Overview

This is a comprehensive Enterprise Resource Planning (ERP) system built specifically for public sector organizations (likely Brazilian government entities based on the Portuguese language content). The system manages personnel, schedules, allowances, armaments, and generates reports for administrative oversight. It features a modern web interface with role-based access control and real-time data management capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend uses a modern React-based stack with TypeScript for type safety:
- **React 18** with functional components and hooks
- **Vite** as the build tool and development server
- **Wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **shadcn/ui** component library with Radix UI primitives
- **Tailwind CSS** for styling with custom design tokens
- **React Hook Form** with Zod validation for form management

The application follows a modular component structure with separate pages for different business domains (personnel, schedules, allowances, armaments, reports). The UI implements a sidebar navigation pattern with protected routes based on authentication status.

## Backend Architecture
The backend is built as a REST API using Express.js:
- **Express.js** server with TypeScript
- **Drizzle ORM** for database operations with type-safe queries
- **PostgreSQL** as the primary database
- **Session-based authentication** using express-session with PostgreSQL storage
- **File-based routing** pattern for API endpoints
- **Centralized storage layer** abstracting database operations

The server implements middleware for request logging, error handling, and authentication checks. API routes are organized by business domain with consistent RESTful patterns.

## Data Storage Solutions
The system uses PostgreSQL as the primary database with the following design:
- **Normalized relational schema** with proper foreign key relationships
- **Drizzle ORM** for type-safe database operations
- **Database migrations** managed through Drizzle Kit
- **Connection pooling** using Neon's serverless PostgreSQL driver
- **Session storage** in dedicated PostgreSQL table

The schema includes comprehensive tables for personnel management (pessoas, dadosFuncionais), scheduling (escalas, afastamentos), financial tracking (diarias), and security management (armamento, controleArmamento).

## Authentication and Authorization
Authentication is handled through Replit's OpenID Connect integration:
- **OpenID Connect (OIDC)** using Replit's authentication service
- **Passport.js** strategy for OIDC integration
- **Session-based auth** with secure HTTP-only cookies
- **PostgreSQL session store** for scalable session management
- **Protected routes** with middleware-based authorization checks

User sessions are persisted in the database with configurable TTL, and the frontend implements automatic token refresh and unauthorized request handling.

## External Dependencies

- **Neon Database** - Serverless PostgreSQL hosting for production data storage
- **Replit Authentication** - OpenID Connect provider for user authentication and authorization
- **Radix UI** - Headless component primitives for accessible UI elements
- **Lucide React** - Icon library for consistent iconography throughout the interface
- **date-fns** - Date manipulation and formatting utilities
- **Zod** - Runtime type validation for form inputs and API responses