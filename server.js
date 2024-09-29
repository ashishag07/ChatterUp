import server from "./index.js";
import connecToMongoDB from "./src/config/connectDB.config.js";

server.listen(3000, () => {
  console.log("Server is listening at 3000 !!");
  connecToMongoDB();
});
