const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const userRoutes = require("./api/routes/userRoutes");
const bookRoutes = require("./api/routes/bookRoutes");
const mongoose = require("mongoose");

const app = express();
dotenv.config();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, });

//Prevent or Handling CORS Error
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

    if (req.method === 'OPTIONS') {
        res.header("Access-Control-Allow-methos", "PUT,POST,PATCH,DELETE");
        return res.status(200).json({});
    }
    next();
});

app.use('/user', userRoutes);
app.use('/', bookRoutes);

app.use((req, res, next) => {
    const error = new Error("Not found");
    error.status = 404;
    next(error);
});

module.exports = app;