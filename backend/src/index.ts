import express, { type Express, type Request, type Response } from 'express';
import 'dotenv/config';

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Re:Planet Backend. The API is healthy!');
});

app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`)
});