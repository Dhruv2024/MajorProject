const mongoose = require("mongoose");
require('dotenv').config();

exports.dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => {
            console.log("Database has been connected successfully");
        })
        .catch((error) => {
            console.log("Connection with database is not successful");
            console.error(error);
            process.exit(1);
        })
}