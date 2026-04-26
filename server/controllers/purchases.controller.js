import { listByUser, findById, create } from "../data/store.js";
import { buildCrudControllers } from "./crudFactory.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/User.js";
import Purchase from "../models/Purchase.js";

const base = buildCrudControllers("purchases");

function getActiveSale(course) {
  const price = Number(course?.price || 0);
  const salePrice = Number(course?.salePrice || 0);
  const saleEndsAt = course?.saleEndsAt ? new Date(course.saleEndsAt) : null;
  const active = price > 0 && salePrice > 0 && salePrice < price && (!saleEndsAt || saleEndsAt > new Date());
  return {
    price,
    finalPrice: active ? salePrice : price,
    saleDiscount: active ? Number((price - salePrice).toFixed(2)) : 0,
  };
}

export async function getAllPurchases(req, res) {
  const isAdmin = req.user.role === "admin";
  const userId = isAdmin && req.query.userId ? req.query.userId : req.user.id;
  const data = await listByUser("purchases", userId);
  res.status(200).json({ success: true, count: data.length, data });
}

export async function getPurchaseById(req, res) {
  const item = await findById("purchases", req.params.id);
  if (!item) throw new ApiError(404, "Purchase not found");
  if (req.user.role !== "admin" && String(item.userId) !== String(req.user.id)) {
    throw new ApiError(403, "Forbidden");
  }
  res.status(200).json({ success: true, data: item });
}

export async function createPurchase(req, res) {
  if (!req.user?.id) throw new ApiError(401, "Authentication required");

  const {
    courseId,
    paymentMethod = "card",
    transactionId = "",
    cardLast4 = "",
    paypalEmail = "",
    discount = 0,
    promoCode = "",
    referralCode = "",
    idempotencyKey = "",
  } = req.body || {};

  if (!courseId) throw new ApiError(400, "courseId is required");

  const course = await findById("courses", courseId);
  if (!course) throw new ApiError(404, "Course not found");

  const userId = req.user.id;
  const sale = getActiveSale(course);
  const amount = sale.price;
  const totalDiscount = Math.max(0, Number(discount) || 0) + sale.saleDiscount;
  const finalAmount = Math.max(0, Number((amount - totalDiscount).toFixed(2)));

  const existingByCourse = await Purchase.findOne({
    userId,
    courseId,
  }).lean({ virtuals: true });
  if (existingByCourse) {
    res.status(200).json({ success: true, data: existingByCourse });
    return;
  }

  if (idempotencyKey) {
    const existingByKey = await Purchase.findOne({
      userId,
      idempotencyKey,
    }).lean({ virtuals: true });
    if (existingByKey) {
      res.status(200).json({ success: true, data: existingByKey });
      return;
    }
  }

  const payload = {
    userId,
    courseId,
    amount,
    discount: totalDiscount,
    finalAmount,
    status: "paid",
    paymentMethod,
    transactionId,
    cardLast4,
    paypalEmail,
    promoCode,
    referralCode,
    idempotencyKey,
    createdBy: userId,
  };

  try {
    const item = await create("purchases", payload);
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { purchasedCourseIds: item.courseId },
    });
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.code === 11000) {
      const fallback = await Purchase.findOne({
        userId,
        $or: [{ courseId }, ...(idempotencyKey ? [{ idempotencyKey }] : [])],
      }).lean({ virtuals: true });
      if (fallback) {
        res.status(200).json({ success: true, data: fallback });
        return;
      }
      throw new ApiError(409, "You have already purchased this course");
    }
    throw err;
  }
}

export const updatePurchase = base.update;
export const deletePurchase = base.delete;
