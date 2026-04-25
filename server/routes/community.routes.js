import { Router } from "express";
import { createLimiter } from "../utils/rateLimiters.js";
import {
  authenticateRequest,
  authorizeRoles,
} from "../middleware/authPlaceholder.js";
import {
  listThreads,
  createThread,
  getThreadById,
  addComment,
  toggleThreadUpvote,
  toggleCommentUpvote,
  acceptAnswer,
  getModerationQueue,
  moderateThread,
  moderateComment,
} from "../controllers/community.controller.js";

const router = Router();

const threadPostLimiter = createLimiter({ windowMinutes: 10, max: 12 });
const commentPostLimiter = createLimiter({ windowMinutes: 10, max: 24 });
const upvoteLimiter = createLimiter({ windowMinutes: 2, max: 60 });

router.use(authenticateRequest);

router.get("/threads", listThreads);
router.post("/threads", threadPostLimiter, createThread);
router.get("/threads/:threadId", getThreadById);
router.post("/threads/:threadId/comments", commentPostLimiter, addComment);
router.post("/threads/:threadId/upvote", upvoteLimiter, toggleThreadUpvote);
router.post("/comments/:commentId/upvote", upvoteLimiter, toggleCommentUpvote);
router.post("/comments/:commentId/accept", acceptAnswer);

router.get("/moderation/queue", authorizeRoles("admin", "instructor"), getModerationQueue);
router.post("/moderation/threads/:threadId", authorizeRoles("admin", "instructor"), moderateThread);
router.post("/moderation/comments/:commentId", authorizeRoles("admin", "instructor"), moderateComment);

export { router as communityRouter };
