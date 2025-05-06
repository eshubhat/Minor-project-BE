import mongoose from "mongoose";

const DBconnection = () => {
  mongoose.connect(
    `${process.env.MONGO_URI}`,
    console.log("DB connected")
  );
};


export default DBconnection;
