import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { notFound } from "./middleware/notFound.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));

if (env.ENABLE_REQUEST_LOGS) {
  app.use(morgan("dev"));
}

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Courseware API server",
    docsHint: `Use ${env.API_PREFIX}/health to test the API`,
  });
});

app.use(env.API_PREFIX, apiRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
