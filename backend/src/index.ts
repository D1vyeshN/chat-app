import app from "./app";
import connectDB from "./config/db";
import dotenv from "dotenv";
import initSocket from "./socket";
import { createServer } from "http";

dotenv.config();

// connect to database
connectDB();

// create http server
const httpServer = createServer(app);

//Init Socket.IO
initSocket(httpServer);

// start listening
const PORT = Number(process.env.PORT) || 5000;

httpServer.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});
