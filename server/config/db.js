const mongoose = require("mongoose");

const DB_CONNECT = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected");
    }
    catch (error){
        console.error(error.message);
        process.exit(1);
        
    }
};

module.exports = DB_CONNECT;