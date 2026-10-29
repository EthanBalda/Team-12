import express, { type Express, type Request, type Response } from 'express';
import 'dotenv/config';
import worldRouter from './routes/worldRoutes';
import { errorHandler } from "./middleware/errorHandler";
import cors from 'cors';

const app: Express = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: ['http://localhost:5173'],
};

// middleware
app.use(express.json());
app.use(cors(corsOptions));

// health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Re:Planet Backend. The API is healthy!');
});

 // routes
app.use('/worlds', worldRouter);

app.use(errorHandler);

app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`)
});