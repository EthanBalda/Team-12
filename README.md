# Re:Planet
A game that teaches K-12 students about climate change by having them plan and build a city while keeping the pollution low.

## Running the Application

Re:Planet requires both the frontend and backend to run. Start the frontend first, then start the backend in a separate terminal.

### Quick Start

Assuming your environment variables are configured:

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Backend**
```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

The frontend runs using Vite, and the backend runs using Express.

---

## Repository Structure

```text
Team-12/
├── .github/                 # GitHub configuration and workflows
├── backend/                 # Express API and database
├── docs/                    # Project documentation
├── frontend/                # Konva based frontend application
├── .gitignore               # gitignore configuration
├── README.md                # Project documentation
└── UserStories.txt          # Project user stories
```

---

## Frontend

### Libraries and Technologies

- TypeScript
- Vite
- Konva
- Vitest

### Project Structure

```text
frontend/
├── public/                  # Static assets
├── src/
│   ├── screens/
│   │   ├── CreateWorldScreen/   # World creation screen
│   │   ├── LoginWorldScreen/    # World login screen
│   │   ├── StartScreen/         # Main start screen
│   │   ├── InstructionsScreen/  # Game instructions
│   │   ├── MainGameScreen/      # Main gameplay
│   │   ├── MiniGameScreen/      # Mini-game functionality
│   │   ├── ResultScreen/        # Game results
│   │   ├── CompareScreen/       # Results comparison
│   │   └── LoadingScreen/       # Loading screen
│   ├── auth.ts              # Authentication utilities
│   ├── constants.ts         # Application constants
│   ├── main.ts              # Application entry point and Konva setup
│   └── types.ts             # Shared TypeScript types
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

### Getting Started

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local Vite development URL displayed in your terminal (typically `http://localhost:5173`).

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type check and build the frontend |
| `npm run preview` | Preview the production build |
| `npm run test` | Run frontend tests |
| `npm run test:unit` | Run frontend unit tests |

---

## Backend

### Libraries and Technologies

- TypeScript
- Node.js
- Express 5
- Neon PostgreSQL
- Prisma ORM
- JWT (JSON Web Tokens)
- bcryptjs
- Vitest
- Supertest

### Project Structure

```text
backend/
├── prisma/
│   ├── generated/           # Generated Prisma Client
│   └── schema.prisma        # Database schema and models
├── src/
│   ├── middleware/          # Request and error-handling middleware
│   ├── libs/                # Shared utilities and configurations
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic
│   ├── repositories/        # Database access layer
│   └── index.ts             # Express application entry point
├── tests/
│   └── unit/                # Backend unit tests
├── .env.example             # Example environment variables
├── prisma7.config.ts        # Prisma configuration
├── package.json             # Dependencies and scripts
└── tsconfig.json            # TypeScript configuration
```

### Getting Started

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file:

   ```bash
   cp .env.example .env
   ```

4. Configure the environment variables in `.env`.

   The backend requires the following variables:

   ```env
   PORT=3001

   DATABASE_URL="your-neon-database-url"
   DATABASE_URL_POOLED="your-neon-pooled-database-url"

   JWT_SECRET="your-secret-key"
   JWT_EXPIRES_IN=1d
   ```

5. Generate the Prisma Client:

   ```bash
   npm run prisma:generate
   ```

6. Start the backend development server:

   ```bash
   npm run dev
   ```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the backend development server |
| `npm run build` | Generate Prisma Client and compile TypeScript |
| `npm start` | Start the compiled production server |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run test:unit` | Run backend unit tests |

---

## Testing

Both frontend and backend have testing support through Vitest.

**Frontend:**

```bash
cd frontend
npm run test:unit
```

**Backend:**

```bash
cd backend
npm run test:unit
```

---

## Database

The project uses Neon PostgreSQL as its database and Prisma ORM for database access.

The Prisma schema is located at:

```text
backend/prisma/schema.prisma
```

When making changes to database models, update the Prisma schema and regenerate the Prisma Client:

```bash
cd backend
npm run prisma:generate
```

Make sure your database connection variables are configured in `backend/.env`.

---

## Documentation

Additional project documentation is available in the `docs/` directory. Also internal documentation is available, but not for public.

For application setup and development instructions, refer to this README.
