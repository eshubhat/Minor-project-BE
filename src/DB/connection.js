import mongoose from "mongoose";

console.log("Connecting to MongoDB...", process.env.MONGO_URI);

const DBconnection = () => {
  mongoose.connect(
    `mongodb://127.0.0.1:27017/Infosys_project`,
    console.log("DB connected")
  );
};

export default DBconnection;
