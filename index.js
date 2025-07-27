import express from 'express';
import { connectDB} from './db/connectDB.js';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
})); // Enable CORS for the client URL

app.use(express.json());// Middleware to parse JSON request body
app.use(cookieParser());
app.use("/api/auth/",authRoutes)


app.listen(PORT, () =>{
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});

