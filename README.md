# Re-Planet

## Frontend

### Libraries and Stuff

- TypeScript
- Konva

### Project Structure
frontend/
├── public/
│   └── bg.svg                                    # the background image
├── src/
│   ├── screens/
│   │   ├── CreateWorldScreen/                    # the create a new world screen stuff
│   │   │   ├── CreateWorldScreen.css 
│   │   │   ├── CreateWorldScreenController.ts 
│   │   │   ├── CreateWorldScreenModel.ts 
│   │   │   └── CreateWorldScreenView.ts 
│   │   └── MainGameScreen/ # main game screen
│   │       ├── MainGameScreenController.ts 
│   │       ├── MainGameScreenModel.ts 
│   │       └── MainGameScreenView.ts 
│   ├── constants.ts                              # constants
│   ├── main.ts                                   # main game implementation (stage, layer, etc with Konva also the screenSwitcher)
│   ├── types.ts                                  # types
├── index.html                                    # the html content
├── tsconfig.json                                 # typeScript configuration
└── package.json                                  # dependencies and scripts

### Getting Started

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your environment file:

   ```bash
   cp .env.example .env
   ```

4. Edit the environment variables in `.env` including your Neon PostgreSQL connection details.

5. Start the development server:

   ```bash
   npm run dev
   ```


## Backend

### Libraries and Stuff

- TypeScript
- Express 
- Neon PostgreSQL
- Prisma ORM

### Project Structure

```text
backend/
├── prisma/
│   ├── generated/          # generated Prisma Client (this is what allows you to use all the types)
│   └── schema.prisma       # database schema (models are defined here so if you need to change tables then modify this)
├── src/
│   ├── middleware/         # error handling and request middleware (create custom errors to through or anything for middleware)
│   ├── libs/               # shared utilities and configurations (bcrypt and prisma util files)
│   ├── routes/             # api route definitions
│   ├── services/           # business logic
│   └── repositories/       # database access layer
├── .env.example            # example environment variables
├── prisma7.config.ts        # prisma configuration
├── tsconfig.json           # typeScript configuration
└── package.json            # dependencies and scripts
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

4. Edit the environment variables in `.env` including your Neon PostgreSQL connection details.

5. Generate the Prisma Client:

   ```bash
   npx prisma generate or npm run prisma:generate
   ```

6. Start the development server:

   ```bash
   npm run dev
   ```

