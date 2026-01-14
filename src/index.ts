import express,{Application,Request,Response} from 'express';
import cors from 'cors';
import { connectDB } from './database/mongodb';
import dotenv from 'dotenv'
import bodyParser = require('body-parser');
dotenv.config();
console.log(process.env.PORT);
import { PORT } from "./config"
//.env->PORT = 5050
import authRoutes from './routes/auth.route'
import adminRoutes from './routes/admin/admin.route'

const app:Application = express();
// const PORT:number = 3000;
let corsOptions = {
  origin: [ "http://localhost:3000", "http://localhost:3030" ],
  // list of domains allowed access the server
  // frontend domain/url 
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// req.body can be json or formdata as well body parser makes sure our application takes and rusn that input

app.get('/',(req:Request,res:Response)=>{
    res.send('Hello world');
});
app.use('/api/auth',authRoutes)
app.use('/api/admin',adminRoutes)

async function startServer(){
    await connectDB();
    app.listen(PORT,()=>{
    console.log(`Server is running at http://localhost:${PORT}`);
});
}

startServer()



