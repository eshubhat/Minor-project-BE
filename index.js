import e from "express";
const app = e();
import DBconnection from "./src/DB/connection.js";
import cors from "cors";
const PORT = process.env.PORT || 3000;
import TeacherRoutes from "./src/routes/TeacherRoutes.js";
import StudetRoutes from "./src/routes/StudentRoutes.js";
import dotenv from "dotenv";

app.use(e.json());
app.use(cors());
dotenv.config();

app.use("/teacher", TeacherRoutes);
app.use("/student", StudetRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Example API route
app.get("/api/example", (req, res) => {
  res.json({ message: "This is an example endpoint" });
});

DBconnection();

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
