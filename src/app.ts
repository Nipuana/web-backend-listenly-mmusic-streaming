import express,{Application,Request,Response} from 'express';
import cors from 'cors';
import bodyParser = require('body-parser');

import path from 'path';
//.env->PORT = 5050
import authRoutes from './routes/auth.route'
import adminRoutes from './routes/admin/admin.route'
import userInfoRoutes from './routes/userInfo.route'
import songRoutes from './routes/song.route'
import playlistRoutes from './routes/playlist.route'

const app:Application = express();
// const PORT:number = 3000;
let corsOptions = {
  origin: [ "http://localhost:3000", "http://localhost:3030" ],
  // list of domains allowed access the server
  // frontend domain/url 
};
app.use(cors(corsOptions));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// req.body can be json or formdata as well body parser makes sure our application takes and rusn that input

app.get('/',(req:Request,res:Response)=>{
    res.send('Hello world');
});
app.use('/api/auth',authRoutes)
app.use('/api/admin',adminRoutes)
app.use('/api/userInfo',userInfoRoutes)
app.use('/api/songs',songRoutes)
app.use('/api/playlists',playlistRoutes)

export default app;