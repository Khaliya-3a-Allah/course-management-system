import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.PORT, () => {
  // Keep startup log simple and easy to read for students.
  console.log(`Courseware API running on http://localhost:${env.PORT}${env.API_PREFIX}`);
});
