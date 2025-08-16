# PMU Pro

A professional PMU (Permanent Makeup) management system built with Next.js, Prisma, and Radix UI.

## Features

- Client Management
- Appointment Scheduling
- Modern UI with Radix UI components
- Database management with Prisma
- TypeScript support
- Tailwind CSS for styling

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up the database:
\`\`\`bash
npm run db:generate
npm run db:push
npm run db:seed
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: Prisma with SQLite
- **UI**: Radix UI + Tailwind CSS
- **Icons**: Lucide React
