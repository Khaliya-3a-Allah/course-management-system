import mongoose from "mongoose";
import Lesson from "../models/Lesson.js";
import Progress from "../models/Progress.js";
import AssessmentAttempt from "../models/AssessmentAttempt.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Purchase from "../models/Purchase.js";
import { ApiError } from "../utils/ApiError.js";

function toId(value) {
  return String(value?._id || value?.id || value || "");
}

function normalizeAnswerMap(answers = []) {
  const map = new Map();
  answers.forEach((answer) => {
    const questionId = String(answer.questionId || "");
    if (!questionId) return;
    const selected = Number(answer.selectedOptionIndex);
    map.set(questionId, Number.isInteger(selected) ? selected : null);
  });
  return map;
}

function getQuiz(lesson) {
  const quiz = lesson?.quiz;
  if (!quiz?.enabled) throw new ApiError(404, "No quiz is available for this lesson.");
  if (!Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new ApiError(400, "This lesson quiz has no questions yet.");
  }
  return quiz;
}

async function assertLessonAccess({ lesson, user }) {
  if (user.role === "admin") return;

  const courseId = lesson.courseId;
  const course = courseId ? await Course.findById(courseId).lean() : null;
  const isCreator = course?.instructorId && toId(course.instructorId) === String(user.id);
  if (isCreator) return;

  const [enrollment, purchase] = await Promise.all([
    Enrollment.findOne({ userId: user.id, courseId }).lean(),
    Purchase.findOne({ userId: user.id, courseId, status: "paid" }).lean(),
  ]);

  const isFree = Number(course?.price || 0) <= 0;
  if (!enrollment && !purchase && !isFree) {
    throw new ApiError(403, "You need access to this course before taking its quiz.");
  }
}

async function markLessonPassed({ userId, courseId, lessonId }) {
  const totalLessons = await Lesson.countDocuments({ courseId });
  const existing = await Progress.findOne({ userId, courseId });
  const completedLessonIds = new Set(
    (existing?.completedLessonIds || []).map((id) => String(id))
  );
  completedLessonIds.add(String(lessonId));

  const nextIds = [...completedLessonIds].filter((id) =>
    mongoose.isValidObjectId(id)
  );
  const percentage = totalLessons
    ? Math.round((nextIds.length / totalLessons) * 100)
    : existing?.percentage || 0;

  return Progress.findOneAndUpdate(
    { userId, courseId },
    {
      userId,
      courseId,
      completedLessonIds: nextIds,
      percentage,
      completed: totalLessons > 0 && nextIds.length >= totalLessons,
      createdBy: userId,
    },
    { new: true, upsert: true, runValidators: true }
  );
}

export async function listLessonAttempts(req, res) {
  const { lessonId } = req.params;
  if (!mongoose.isValidObjectId(lessonId)) {
    throw new ApiError(400, "Invalid lesson ID.");
  }

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) throw new ApiError(404, "Lesson not found.");
  await assertLessonAccess({ lesson, user: req.user });

  const attempts = await AssessmentAttempt.find({
    lessonId,
    userId: req.user.id,
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean({ virtuals: true });

  res.status(200).json({
    success: true,
    count: attempts.length,
    data: attempts,
  });
}

export async function submitLessonAttempt(req, res) {
  const { lessonId } = req.params;
  if (!mongoose.isValidObjectId(lessonId)) {
    throw new ApiError(400, "Invalid lesson ID.");
  }

  const lesson = await Lesson.findById(lessonId).select(
    "+quiz.questions.correctOptionIndex"
  );
  if (!lesson) throw new ApiError(404, "Lesson not found.");
  await assertLessonAccess({ lesson, user: req.user });

  const quiz = getQuiz(lesson);
  const maxAttempts = Math.max(1, Number(quiz.maxAttempts || 1));
  const attemptCount = await AssessmentAttempt.countDocuments({
    lessonId,
    userId: req.user.id,
  });
  if (attemptCount >= maxAttempts) {
    throw new ApiError(403, "You have used all attempts for this quiz.");
  }

  const answerMap = normalizeAnswerMap(req.body?.answers);
  let pointsAwarded = 0;
  let pointsPossible = 0;

  const answers = quiz.questions.map((question) => {
    const questionId = String(question._id);
    const selectedOptionIndex = answerMap.get(questionId);
    const points = Number(question.points || 1);
    const correctOptionIndex = Number(question.correctOptionIndex || 0);
    const isCorrect = selectedOptionIndex === correctOptionIndex;

    pointsPossible += points;
    if (isCorrect) pointsAwarded += points;

    return {
      questionId,
      selectedOptionIndex,
      correctOptionIndex,
      isCorrect,
      pointsAwarded: isCorrect ? points : 0,
      pointsPossible: points,
    };
  });

  const score = pointsPossible
    ? Math.round((pointsAwarded / pointsPossible) * 100)
    : 0;
  const passed = score >= Number(quiz.passingScore || 70);
  const startedAt = req.body?.startedAt ? new Date(req.body.startedAt) : new Date();
  const submittedAt = new Date();
  const rawDuration = Number(req.body?.durationSeconds);
  const durationSeconds = Number.isFinite(rawDuration)
    ? Math.max(0, Math.round(rawDuration))
    : Math.max(0, Math.round((submittedAt.getTime() - startedAt.getTime()) / 1000));

  const attempt = await AssessmentAttempt.create({
    userId: req.user.id,
    lessonId: lesson._id,
    courseId: lesson.courseId,
    moduleId: lesson.moduleId,
    answers,
    score,
    pointsAwarded,
    pointsPossible,
    passed,
    startedAt,
    submittedAt,
    durationSeconds,
    antiCheat: {
      blurCount: Number(req.body?.antiCheat?.blurCount || 0),
      pasteCount: Number(req.body?.antiCheat?.pasteCount || 0),
      visibilityHiddenCount: Number(req.body?.antiCheat?.visibilityHiddenCount || 0),
      userAgent: String(req.body?.antiCheat?.userAgent || "").slice(0, 500),
    },
  });

  const progress = passed
    ? await markLessonPassed({
        userId: req.user.id,
        courseId: lesson.courseId,
        lessonId: lesson._id,
      })
    : null;

  const questionLookup = new Map(
    quiz.questions.map((question) => [String(question._id), question])
  );
  const review = attempt.answers.map((answer) => {
    const question = questionLookup.get(answer.questionId);
    return {
      questionId: answer.questionId,
      prompt: question?.prompt || "",
      options: question?.options || [],
      selectedOptionIndex: answer.selectedOptionIndex,
      correctOptionIndex: answer.correctOptionIndex,
      isCorrect: answer.isCorrect,
      explanation: question?.explanation || "",
    };
  });

  res.status(201).json({
    success: true,
    data: {
      ...attempt.toJSON(),
      review,
      progress,
      attemptsRemaining: Math.max(0, maxAttempts - attemptCount - 1),
    },
  });
}
