import { buildCrudControllers } from "./crudFactory.js";
import Lesson from "../models/Lesson.js";
import { ApiError } from "../utils/ApiError.js";
import { invalidateCachedResponses } from "../utils/responseCache.js";

const lessonsController = buildCrudControllers("lessons");

export const getAllLessons = lessonsController.getAll;
export const getLessonById = lessonsController.getById;
export const createLesson = lessonsController.create;
export const deleteLesson = lessonsController.delete;

function mergeHiddenQuizAnswers(existingQuiz, incomingQuiz) {
  if (!incomingQuiz?.questions || !existingQuiz?.questions) return incomingQuiz;

  const existingById = new Map(
    existingQuiz.questions.map((question) => [String(question._id), question])
  );

  return {
    ...incomingQuiz,
    questions: incomingQuiz.questions.map((question, index) => {
      if (question.correctOptionIndex !== undefined) return question;

      const existing =
        existingById.get(String(question.id || question._id || "")) ||
        existingQuiz.questions[index];

      if (!existing || existing.correctOptionIndex === undefined) return question;
      return {
        ...question,
        correctOptionIndex: existing.correctOptionIndex,
      };
    }),
  };
}

export async function updateLesson(req, res) {
  const existing = await Lesson.findById(req.params.id).select(
    "+quiz.questions.correctOptionIndex"
  );
  if (!existing) throw new ApiError(404, "lessons item not found");

  const payload = { ...(req.body || {}) };
  if (payload.quiz) {
    payload.quiz = mergeHiddenQuizAnswers(existing.quiz, payload.quiz);
  }

  const item = await Lesson.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).lean({ virtuals: true });

  invalidateCachedResponses(["lessons:", "courses:"]);
  res.status(200).json({ success: true, data: item });
}
