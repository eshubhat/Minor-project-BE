import mongoose from "mongoose";

const DBconnection = () => {
  mongoose.connect(
    `mongodb+srv://kartikbevoor2130:M2130k2003@cluster0.vlbnl1e.mongodb.net/minorProject`,
    console.log("DB connected")
  );
};


export default DBconnection;
