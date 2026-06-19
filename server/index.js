import dotenv from "dotenv";
import dns from 'dns';
import connectDB from "./src/db/index.js";
import { app } from "./app.js";
dns.setServers(["1.1.1.1", "8.8.8.8"]);

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.on("error", (err) => {
        console.error("ERROR : ", err)
    })
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed", err);
    process.exit(1);
  });