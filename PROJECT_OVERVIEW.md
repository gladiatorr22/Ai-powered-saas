# Cloudinary SaaS - AI-Powered Video Management Platform

## 📋 Project Overview

This is a **SaaS (Software-as-a-Service) application** built to manage and process videos using **Cloudinary's cloud-based media management platform**. The application features **AI-powered video processing**, user authentication, and a modern Next.js architecture.

---

## 🛠 Technology Stack

### **Frontend & Framework**
- **Next.js 16.1.1** - React framework with App Router (latest version with Turbopack)
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Utility-first CSS framework
- **DaisyUI 5.5.14** - Component library for Tailwind

### **Backend & API**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma 7** - Modern ORM (Object-Relational Mapping)
- **PostgreSQL** - Relational database (via Docker)

### **Authentication**
- **Clerk** - Modern user authentication and management

### **Database & Infrastructure**
- **Docker Compose** - Container orchestration
- **PostgreSQL (Alpine)** - Lightweight database container
- **Adminer** - Database management UI (port 8080)

### **Media Management**
- **Cloudinary** - Cloud-based video/image processing and storage

---

## 🎯 Features

### Current Implementation

1. **User Authentication** (via Clerk)
   - Sign in/Sign up pages
   - Protected routes with middleware
   - Session management

2. **Video Management**
   - Video API endpoints (`/api/video`)
   - Database schema for videos with metadata
   - Video upload functionality (in development)

3. **Social Sharing**
   - Social share page (in development)

4. **Database Management**
   - PostgreSQL database with Prisma ORM
   - Docker-based database setup
   - Database migrations support

---

## 📂 Project Structure

```
ai-saas/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Protected app routes group
│   │   ├── home/                 # Home page (authenticated users)
│   │   ├── video-upload/         # Video upload feature
│   │   └── social-share/         # Social sharing feature
│   ├── (auth)/                   # Authentication routes group
│   │   ├── sign-in/              # Sign in page
│   │   └── sign-up/              # Sign up page
│   ├── api/                      # API routes
│   │   └── video/
│   │       └── route.ts          # Video CRUD operations
│   ├── layout.tsx                # Root layout with Clerk provider
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
│
├── src/
│   └── generated/                # Prisma client (old custom output)
│
├── public/                       # Static assets
├── data/                         # Docker volume data (PostgreSQL)
│
├── proxy.ts                      # Clerk middleware for route protection
├── prisma.config.ts              # Prisma 7 configuration
├── compose.yml                   # Docker Compose setup
├── .env                          # Environment variables
└── package.json                  # Dependencies
```

---

## 🔄 Complete Application Workflow

### 1. **User Journey**

```mermaid
graph LR
    A[User Visits App] --> B{Authenticated?}
    B -->|No| C[Landing Page]
    C --> D[Sign In/Sign Up]
    D --> E[Clerk Authentication]
    E --> F[Home Page]
    B -->|Yes| F
    F --> G[Dashboard Options]
    G --> H[Video Upload]
    G --> I[Social Share]
    G --> J[View Videos]
```

### 2. **Route Protection Flow**

The application uses **Clerk middleware** (`proxy.ts`) to protect routes:

```typescript
// Public routes (no authentication required)
- / (landing page)
- /sign-in
- /sign-up
- /home
- /api/videos (public API)

// Protected routes (authentication required)
- /video-upload
- /social-share
- All other routes
```

**Middleware Logic:**
1. Check if user is authenticated via Clerk
2. If authenticated + on public route (except /home) → Redirect to `/home`
3. If not authenticated + on protected route → Redirect to `/sign-in`
4. Otherwise, allow access

### 3. **Video Management Workflow**

```mermaid
graph TD
    A[User Uploads Video] --> B[Frontend: video-upload page]
    B --> C[API: POST /api/video]
    C --> D[Upload to Cloudinary]
    D --> E[Get Cloudinary metadata]
    E --> F[Save to PostgreSQL via Prisma]
    F --> G[Return video data]
    G --> H[Display in UI]
    
    I[User Views Videos] --> J[API: GET /api/video]
    J --> K[Query Prisma database]
    K --> L[Return video list]
    L --> M[Display videos]
```

### 4. **Database Schema**

The `Video` model stores video metadata:

```prisma
model Video {
    id             String   @id @default(cuid())  // Unique ID
    title          String                          // Video title
    description    String?                         // Optional description
    publicId       String                          // Cloudinary public ID
    originalSize   String                          // Original file size
    compressedSize String                          // Compressed size
    duration       Float                           // Video duration
    createdAt      DateTime @default(now())        // Upload timestamp
    updatedAt      DateTime @updatedAt             // Last update
}
```

### 5. **API Endpoints**

#### **GET /api/video**
- **Purpose:** Fetch all videos from database
- **Authentication:** Public (but can be protected)
- **Response:** Array of video objects sorted by creation date (newest first)

```typescript
// Example response
[
  {
    id: "clx1234...",
    title: "My Video",
    publicId: "cloudinary-id",
    duration: 120.5,
    createdAt: "2026-01-08T...",
    ...
  }
]
```

### 6. **Database Setup Flow**

```mermaid
graph LR
    A[Docker Compose] --> B[PostgreSQL Container]
    B --> C[Database Ready]
    C --> D[Prisma Migration]
    D --> E[Schema Applied]
    E --> F[Prisma Client Generated]
    F --> G[App Uses Prisma Client]
```

**Commands:**
```bash
# Start database
docker-compose up -d

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker Desktop
- Cloudinary account (for video processing)
- Clerk account (for authentication)

### Installation Steps

1. **Clone and Install**
   ```bash
   cd ai-saas
   npm install
   ```

2. **Setup Environment Variables**
   
   Create/update `.env` file:
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   DB_NAME=your_db_name
   DB_USER=your_db_user
   DB_PASSWORD=your_password
   DB_PORT=5432

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Start Database**
   ```bash
   docker-compose up -d
   ```
   - PostgreSQL: `localhost:5432`
   - Adminer: `http://localhost:8080`

4. **Setup Database**
   ```bash
   # Run migrations
   npx prisma migrate dev --name init

   # Generate Prisma Client
   npx prisma generate
   ```

5. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

---

## 🔐 Authentication Flow

1. User clicks "Sign In" or "Sign Up"
2. Clerk modal appears
3. User enters credentials
4. Clerk validates and creates session
5. Middleware checks session on each request
6. Protected routes accessible after authentication

---

## 📊 Database Access

### Via Adminer (Web UI)
1. Navigate to `http://localhost:8080`
2. Login with:
   - **System:** PostgreSQL
   - **Server:** db
   - **Username:** From `.env` (DB_USER)
   - **Password:** From `.env` (DB_PASSWORD)
   - **Database:** From `.env` (DB_NAME)

### Via Prisma Studio
```bash
npx prisma studio
```
Opens at `http://localhost:5555`

---

## 🎨 UI/UX Components

- **Landing Page:** Introduction and CTAs
- **Authentication Pages:** Clerk-powered sign in/up
- **Home Dashboard:** Main authenticated landing page
- **Video Upload:** Upload and process videos (in progress)
- **Social Share:** Share videos on social platforms (in progress)

---

## 🔧 Configuration Files

### **prisma.config.ts** (Prisma 7 Config)
- Defines schema path
- Sets migration path
- Configures database URL from environment

### **proxy.ts** (Middleware)
- Route protection logic
- Clerk authentication integration
- Redirect rules for authenticated/unauthenticated users

### **compose.yml** (Docker)
- PostgreSQL service configuration
- Adminer service for database management
- Health checks and volume persistence

---

## 🐛 Common Issues & Solutions

### Issue: "Module '@prisma/client' has no exported member 'PrismaClient'"
**Solution:** 
```bash
npx prisma generate
```

### Issue: Database connection error
**Solution:**
1. Ensure Docker is running: `docker-compose ps`
2. Check DATABASE_URL in `.env`
3. Restart containers: `docker-compose restart`

### Issue: Clerk authentication not working
**Solution:**
1. Verify Clerk keys in `.env`
2. Ensure ClerkProvider wraps app in `layout.tsx`
3. Check middleware is properly configured in `proxy.ts`

---

## 📈 Development Roadmap

### ✅ Completed
- Project setup with Next.js 16
- Clerk authentication integration
- PostgreSQL database with Docker
- Prisma ORM setup
- Basic API routes

### 🚧 In Progress
- Video upload functionality
- Cloudinary integration
- Social sharing features

### 📋 Planned
- Video compression and optimization
- AI-powered video analysis
- User dashboard with analytics
- Video thumbnails and previews
- Batch video processing
- Video transcoding
- Advanced search and filters

---

## 🤝 Contributing

This project is in active development. Key areas for contribution:
- Video upload implementation
- Cloudinary integration
- UI/UX improvements
- Testing coverage
- Documentation

---

## 📝 Notes

- **Prisma 7 Changes:** Database URL is now configured in `prisma.config.ts` and passed to PrismaClient constructor (not in schema.prisma)
- **Route Groups:** Using Next.js route groups `(app)` and `(auth)` for better organization
- **Middleware:** Custom proxy.ts handles all authentication and routing logic
- **Docker Data:** Database data persists in `./data/db` directory

---

## 🔗 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Last Updated:** January 8, 2026
