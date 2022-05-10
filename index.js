const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require('./config/database');

connectDB();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(bodyParser.json({extended:true}))
app.use(bodyParser.urlencoded({extended:true}))



app.use('/',require("./routes/verify-ownership"));

app.use('/',require("./routes/get-token"));

app.use('/',require("./routes/get-all-data"));



app.listen(PORT);