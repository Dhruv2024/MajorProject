//Importing packages
const express = require('express');
const { dbConnect } = require('./config/dbConnect');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const userRoutes = require('./routes/User');
const app = express();
//connecting with database
dbConnect();


app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))

app.use("/api/v1/auth", userRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "app started"
    })
})
app.listen(8000, () => {
    console.log("App is running at Port 8000");
})
