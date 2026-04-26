export function getActiveSale(course) {
  const price = Number(course?.price || 0);
  const salePrice = Number(course?.salePrice || 0);
  const saleEndsAt = course?.saleEndsAt ? new Date(course.saleEndsAt) : null;
  const hasValidEnd = !saleEndsAt || saleEndsAt.getTime() > Date.now();
  const active = price > 0 && salePrice > 0 && salePrice < price && hasValidEnd;

  return {
    active,
    price,
    salePrice: active ? salePrice : 0,
    finalPrice: active ? salePrice : price,
    saleEndsAt: active ? saleEndsAt : null,
    discountAmount: active ? Number((price - salePrice).toFixed(2)) : 0,
    discountPercent: active ? Math.round(((price - salePrice) / price) * 100) : 0,
  };
}

export function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}
