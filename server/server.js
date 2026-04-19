import app from "./app.js";
import { env } from "./config/env.js";
import { connectDB } from "./db/connection.js";

// Connect to MongoDB first, then start the HTTP server
connectDB().then(() => {
  app.listen(env.PORT, () => {
    console.log(`Courseware API running on http://localhost:${env.PORT}${env.API_PREFIX}`);
  });
});
