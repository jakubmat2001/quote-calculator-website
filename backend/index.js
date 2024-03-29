import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser'
import cors from 'cors';
import { fileURLToPath } from 'url';

import config from './controllers/db_config.js'
import empRoutes from './controllers/emp/emp.routes.js'
import authRoutes from './controllers/auth/auth.routes.js'
import quoteRoutes from './controllers/quote/quote.routes.js';

const PORT = config.port;
const MONGOURI = config.mongoUri;

mongoose.Promise = global.Promise;
mongoose.connect(MONGOURI, {
  dbName: "employeeDB",
}).catch((error) => {
  throw new Error(`unable to connect to database: ${MONGOURI}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Database connection error: ${err}`);
});

mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB successfully');
});

var app = express();
app.use(cors());

//applied CORS to multiple routes
app.use(/^\/(api\/emps|auth\/signin|api\/quotes|api\/quotes2)/, (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true}))

app.use('/', empRoutes)
app.use('/', authRoutes)
app.use('/', quoteRoutes)

//since our ejs wasn't working with __dirname properly, I found another solution
//to join frontend with the backend 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, '../build');

app.use(express.static(buildPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ "error": err.name + ": " + err.message })
  } else if (err) {
    res.status(400).json({ "error": err.name + ": " + err.message, "stack": err.stack })
    console.log(err)
  }
})

app.use(function ( req, res, next) {
    res.send('This page does not exist!')
});

app.listen(PORT, function () {
    console.log('Listening on http://localhost:'+PORT+'/');
});