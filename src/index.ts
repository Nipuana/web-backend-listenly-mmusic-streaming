import app from './app';
import { connectDB } from './database/mongodb';
import dotenv from 'dotenv'

dotenv.config();
console.log(process.env.PORT);
import { PORT } from "./config"


async function startServer(){
    await connectDB();
    app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});
}

startServer()



