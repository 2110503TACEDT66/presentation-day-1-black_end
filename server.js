const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const {xss} = require('express-xss-sanitizer');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

//Load env variables
dotenv.config({path:'./config/config.env'});

//Connect to database
connectDB();

//Route files
const companies = require('./routes/companies');
const auth = require('./routes/auth')
const interviews = require('./routes/interviews')

const app = express();

//Body Parser
app.use(express.json());

//Enable CORS
app.use(cors());

//Prevent http param pollutions
app.use(hpp());

//Rate limiting
const limiter = rateLimit({
    windowsMs: 10*60*1000,
    max: 100
});

app.use(limiter);

//Prevent xss attacks
app.use(xss());

//Set security headers
app.use(helmet());

//Sanitize data
app.use(mongoSanitize());

//Cookie Parser
app.use(cookieParser());

//Mount routers
app.use('/api/v1/companies', companies);
app.use('/api/v1/auth', auth);
app.use('/api/v1/interviews', interviews);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log('Server running in ', process.env.NODE_ENV, ' mode on port ', PORT));

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    //Close server and exit process
    server.close(() => process.exit(1));
});