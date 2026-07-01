# Prompt per Lovable — DevShelf

---

Build a full-stack web app called **DevShelf** — a developer portfolio platform where users can sign up, create a profile, and showcase their projects as interactive browser window cards.

## Core concept

Each project is displayed as a **Browser Card**: a miniature browser window with colored dots (red/yellow/green), a fake URL bar, and a screenshot preview. Clicking a card opens a **Browser Modal** — a fullscreen overlay that simulates a real browser window showing the project screenshot. A privacy banner appears if the project contains fake/blurred data.

## Pages to build

### 1. Homepage (`/`)
- Hero section with headline "Showcase your projects like a pro" and two CTAs: "Get started free" (primary) and "Explore profiles" (secondary)
- Featured developers grid: avatar, name, username, number of projects, tech stack badges
- Clean navbar: logo left, "Explore" + "Login" + "Sign up" right
- Dark/light mode support

### 2. Register page (`/auth/register`)
- Form fields: Full name, Username, Email, Password
- Link to login page
- Clean centered card layout

### 3. Login page (`/auth/login`)
- Form fields: Email, Password
- "Forgot password?" link
- Link to register page

### 4. Dashboard (`/dashboard`) — authenticated users only
- Top bar: user avatar, username, link to public profile
- Grid of Browser Cards (the user's projects)
- Floating action button "+" bottom-right to add a project
- Each card has a context menu (⋮): Edit, Delete, Copy link, Toggle public/private
- Empty state: illustration + "Add your first project" CTA

### 5. New project wizard (`/projects/new`) — 4 steps with progress bar
- Step 1: Title, Description (textarea), Category (dropdown: Web App, Mobile, API/Backend, Design System, Tool/Script, Other)
- Step 2: Screenshot upload (drag & drop zone with live preview)
- Step 3: Tech stack tags (type + Enter to add, click X to remove)
- Step 4: Project URL (optional), Visibility toggle (Public/Private), Fake data toggle (shows privacy banner)
- Back/Next navigation, "Publish project" on final step

### 6. Public profile page (`/profile/[username]`)
- Cover area + large avatar + name + username + bio
- Social links row: GitHub, LinkedIn, personal website (icons)
- Tech stack badges (colored pills)
- Filter bar: filter projects by technology
- Grid of Browser Cards (public projects only)

## Key components

### BrowserCard component
```
┌─────────────────────────────────┐
│ ● ● ●  [  localhost:3000     ]  │  ← gray browser bar
├─────────────────────────────────┤
│                                 │
│     [project screenshot]        │
│     16:9 aspect ratio           │
│                                 │
└─────────────────────────────────┘
  Project Title                  ⋮
  React · Node · PostgreSQL
```
- Hover: slight scale up (1.03) + elevated shadow
- Click → opens BrowserModal

### BrowserModal component
- Full overlay with dark blurred backdrop
- Browser chrome at top: colored dots, back/forward/refresh icons, URL bar, external link icon, close X
- Project screenshot fills the modal (16:9)
- Amber privacy banner below browser bar if fake data is enabled: "The data shown in this preview has been replaced with fictional values"
- Spring animation on open/close

## Design style
- Modern, minimal, developer-focused
- Dark mode first, with light mode support
- Font: Inter or Geist
- Accent color: indigo/violet
- Rounded corners (rounded-xl), subtle borders
- Smooth Framer Motion animations throughout

## Tech stack
- Next.js 14 App Router + TypeScript
- Tailwind CSS + Shadcn/ui components
- Framer Motion for animations
- Prisma + PostgreSQL for database
- NextAuth.js v5 for authentication (credentials + Google OAuth)
- Uploadthing for image uploads
- Zod + React Hook Form for validation

## Database models
- **User**: id, name, username, email, password, bio, avatarUrl, githubUrl, linkedinUrl, websiteUrl, techStack (string[])
- **Project**: id, title, description, screenshotUrl, projectUrl, techStack (string[]), category, isPublic, fakeData (JSON), userId

## Auth & security
- Protected routes: /dashboard, /projects/*
- Redirect to /auth/login if not authenticated
- Users can only edit/delete their own projects
