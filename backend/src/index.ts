import express, { type Express, type Request, type Response } from 'express';
import 'dotenv/config';
import worldRouter from './routes/worldRoutes';
import { errorHandler } from "./middleware/errorHandler";

const app: Express = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.json());

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