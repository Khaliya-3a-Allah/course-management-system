import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { usersRouter } from "./users.routes.js";
import { coursesRouter } from "./courses.routes.js";
import { modulesRouter } from "./modules.routes.js";
import { lessonsRouter } from "./lessons.routes.js";
import { reviewsRouter } from "./reviews.routes.js";
import { enrollmentsRouter } from "./enrollments.routes.js";
import { purchasesRouter } from "./purchases.routes.js";
import { progressRouter } from "./progress.routes.js";
import { certificatesRouter } from "./certificates.routes.js";
import { supportTicketsRouter } from "./supportTickets.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/courses", coursesRouter);
router.use("/modules", modulesRouter);
router.use("/lessons", lessonsRouter);
router.use("/reviews", reviewsRouter);
router.use("/enrollments", enrollmentsRouter);
router.use("/purchases", purchasesRouter);
router.use("/progress", progressRouter);
router.use("/certificates", certificatesRouter);
router.use("/support-tickets", supportTicketsRouter);

export const apiRouter = router;
