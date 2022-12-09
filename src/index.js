//__________________________ Import : Necessary Package and Modules ___________________________________________

const express = require("express")
// const bodyParser = require("body-parser")
const route = require("./routes/route")
const mongoose = require("mongoose")
const app = express();
//const multer = require("multer")

app.use(express.json());
app.use(multer().any())
// app.use(bodyParser.json());


//__________________________ Connection : MongoDB Cluster ___________________________________________


mongoose.connect("mongodb+srv://aliabbasbackendcohort:AMMIabbu321@cluster67.6fp98uh.mongodb.net/database3?retryWrites=true&w=majority")

    .then(() => console.log("mongoDb is connected"))
    .catch(err => console.log(err))

app.use("/", route);

//__________________________ Listen : Port ___________________________________________

app.listen( 3001, function () {
    console.log("express app running on port" + ( 3001))
})