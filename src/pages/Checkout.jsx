import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateEmail } from "../utils/validators";
import EmailAutocompleteInput from "../components/EmailAutocompleteInput";
import paypalIcon from "../assets/PayPal.svg";
import { getActiveSale, formatMoney } from "../utils/pricing";

function normalizeCardNumber(value) {
  return value.replace(/\D/g, "").slice(0, 19);
}

function luhnCheck(cardNumber) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
    let digit = Number(cardNumber[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function isValidExpiry(expiry) {
  if (!/^\d{2}\/\d{2}$/.test(expiry)) return false;

  const [mmRaw, yyRaw] = expiry.split("/");
  const month = Number(mmRaw);
  const year = Number(`20${yyRaw}`);

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
  return expiryDate >= now;
}

function formatCardForDisplay(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function detectCardBrand(value) {
  const number = value.replace(/\D/g, "");
  if (/^4/.test(number)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "mastercard";
  return "";
}

function maskCardNumber(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "N/A";
  const tail = digits.slice(-4).padStart(4, "*");
  return `**** **** **** ${tail}`;
}

function buildReceiptHtml({
  courseTitle,
  buyerName,
  buyerEmail,
  method,
  total,
  discount,
  price,
  transactionId,
  cardNumber,
}) {
  const paidWith = method === "paypal" ? "PayPal" : `Card (${maskCardNumber(cardNumber)})`;
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Receipt - ${courseTitle}</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 28px; color: #111827; }
      .wrap { max-width: 760px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; }
      .head { background: linear-gradient(90deg, #d97706, #f59e0b); color: #111827; padding: 18px 22px; font-weight: 700; }
      .body { padding: 22px; }
      .row { display: flex; justify-content: space-between; gap: 16px; margin: 9px 0; }
      .muted { color: #6b7280; }
      .total { border-top: 1px solid #e5e7eb; margin-top: 14px; padding-top: 14px; font-size: 18px; font-weight: 700; }
      .pill { display: inline-block; background: #fff7ed; color: #9a3412; padding: 4px 10px; border: 1px solid #fdba74; border-radius: 999px; font-size: 12px; }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="head">Courseware - Payment Receipt</div>
      <div class="body">
        <div class="row"><span class="muted">Receipt ID</span><strong>${transactionId}</strong></div>
        <div class="row"><span class="muted">Course</span><strong>${courseTitle}</strong></div>
        <div class="row"><span class="muted">Buyer</span><strong>${buyerName || "N/A"}</strong></div>
        <div class="row"><span class="muted">Email</span><strong>${buyerEmail || "N/A"}</strong></div>
        <div class="row"><span class="muted">Payment method</span><span class="pill">${paidWith}</span></div>
        <div class="row"><span class="muted">Subtotal</span><strong>$${price.toFixed(2)}</strong></div>
        <div class="row"><span class="muted">Discount</span><strong>-$${discount.toFixed(2)}</strong></div>
        <div class="row total"><span>Total paid</span><span>$${total.toFixed(2)}</span></div>
      </div>
    </div>
  </body>
</html>`;
}

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, currentUser, purchaseCourse, enrollCourse, addToast } = useAppContext();

  const course = courses.find((c) => c.id === courseId);

  const sale = getActiveSale(course);
  const regularPrice = sale.price;
  const price = sale.finalPrice;
  const isPaidCourse = price > 0;
  const alreadyOwned = currentUser?.purchasedCourseIds?.includes(courseId) ?? false;

  const [method, setMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [appliedReferral, setAppliedReferral] = useState("");
  const [referralError, setReferralError] = useState("");
  const [errors, setErrors] = useState({});
  const [isPaying, setIsPaying] = useState(false);

  const [cardForm, setCardForm] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [paypalEmail, setPaypalEmail] = useState("");
  const cardBrand = detectCardBrand(cardForm.number);
  const canPrintReceipt = isPaidCourse && (alreadyOwned || isPaying || currentUser);

  const promoDiscountRate = appliedPromo ? 0.15 : 0;
  const referralDiscountRate = appliedReferral ? 0.1 : 0;
  const discountRate = Math.min(promoDiscountRate + referralDiscountRate, 0.3);

  const totals = useMemo(() => {
    const discount = Number((price * discountRate).toFixed(2));
    const promoDiscount = Number((price * promoDiscountRate).toFixed(2));
    const referralDiscount = Number((price * referralDiscountRate).toFixed(2));
    const finalTotal = Number((price - discount).toFixed(2));
    return { discount, promoDiscount, referralDiscount, finalTotal };
  }, [discountRate, promoDiscountRate, referralDiscountRate, price]);

  if (!course) {
    return (
      <main className="min-h-[80vh] flex flex-col items-center justify-center bg-base text-text-muted p-8 text-center">
        <span className="text-[0.75rem] tracking-[0.22em] uppercase text-text-dim mb-4">Not Found</span>
        <h2 className="font-['Playfair_Display',serif] text-[1.8rem] text-text-primary mb-2">Course Not Found</h2>
        <p className="text-text-dim mb-6">This checkout link is invalid.</p>
        <Link to="/courses" className="text-[#d97706] no-underline font-semibold">← Back to Courses</Link>
      </main>
    );
  }

  const handleApplyPromo = () => {
    const normalized = promoCode.trim();
    if (!normalized) {
      setPromoError("Enter a promo code first.");
      setAppliedPromo("");
      return;
    }

    setAppliedPromo(normalized);
    setPromoError("");
    addToast(`Promo code ${normalized} applied (15% off).`, "success");
  };

  const handleApplyReferral = () => {
    const normalized = referralCode.trim();
    if (!normalized) {
      setReferralError("Enter a referral code first.");
      setAppliedReferral("");
      return;
    }

    setAppliedReferral(normalized);
    setReferralError("");
    addToast(`Referral code ${normalized} applied (10% off).`, "success");
  };

  const handleCardNumberChange = (value) => {
    setCardForm((prev) => ({ ...prev, number: normalizeCardNumber(value) }));
    if (errors.number) setErrors((prev) => ({ ...prev, number: "" }));
  };

  const handleExpiryChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setCardForm((prev) => ({ ...prev, expiry: formatted }));
    if (errors.expiry) setErrors((prev) => ({ ...prev, expiry: "" }));
  };

  const validateCardForm = () => {
    const nextErrors = {};

    if (!cardForm.name.trim()) {
      nextErrors.name = "Cardholder name is required.";
    }

    const normalizedNumber = normalizeCardNumber(cardForm.number);
    if (normalizedNumber.length < 12 || normalizedNumber.length > 19 || !luhnCheck(normalizedNumber)) {
      nextErrors.number = "Enter a valid card number.";
    }

    if (!isValidExpiry(cardForm.expiry)) {
      nextErrors.expiry = "Enter a valid future expiry date (MM/YY).";
    }

    if (!/^\d{3,4}$/.test(cardForm.cvv)) {
      nextErrors.cvv = "Enter a valid CVV (3 or 4 digits).";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validatePayPal = () => {
    const emailError = validateEmail(paypalEmail);
    if (emailError) {
      setErrors({ paypalEmail: emailError });
      return false;
    }

    setErrors({});
    return true;
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!currentUser) {
      addToast("Please sign in or create an account to complete your purchase.", "info");
      navigate("/login");
      return;
    }

    if (!isPaidCourse) {
      await enrollCourse(course.id);
      addToast("This is a free course. You are now enrolled.", "success");
      navigate(`/courses/${course.id}`);
      return;
    }

    if (alreadyOwned) {
      addToast("You already own this course.", "info");
      navigate(`/courses/${course.id}`);
      return;
    }

    const valid = method === "card" ? validateCardForm() : validatePayPal();
    if (!valid) return;

    setIsPaying(true);

    try {
      const transactionId = `CW-${Date.now()}`;
      const cardLast4 = cardForm.number.replace(/\D/g, "").slice(-4);

      await purchaseCourse(course.id, {
        paymentMethod: method,
        transactionId,
        cardLast4: method === "card" ? cardLast4 : "",
        paypalEmail: method === "paypal" ? paypalEmail : "",
        discount: totals.discount,
        promoCode: appliedPromo,
        referralCode: appliedReferral,
      });

      const receiptData = {
        courseTitle: course.title,
        buyerName: currentUser?.name,
        buyerEmail: currentUser?.email,
        method,
        total: totals.finalTotal,
        discount: totals.discount,
        price,
        transactionId,
        cardNumber: cardForm.number,
      };

      addToast("Payment successful. You now own this course!", "success");

      const receiptWin = window.open("", "_blank", "width=920,height=760");
      if (receiptWin) {
        receiptWin.document.write(buildReceiptHtml(receiptData));
        receiptWin.document.close();
        receiptWin.focus();
        receiptWin.print();
      }

      navigate(`/courses/${course.id}`);
    } catch {
      addToast("Payment failed. Please try again.", "error");
    } finally {
      setIsPaying(false);
    }
  };

  const handlePrintReceipt = () => {
    const receiptData = {
      courseTitle: course.title,
      buyerName: currentUser?.name,
      buyerEmail: currentUser?.email,
      method,
      total: totals.finalTotal,
      discount: totals.discount,
      price,
      transactionId: `CW-${Date.now()}`,
      cardNumber: cardForm.number,
    };

    const receiptWin = window.open("", "_blank", "width=920,height=760");
    if (!receiptWin) {
      addToast("Unable to open print window. Please allow pop-ups.", "error");
      return;
    }
    receiptWin.document.write(buildReceiptHtml(receiptData));
    receiptWin.document.close();
    receiptWin.focus();
    receiptWin.print();
  };

  return (
    <main className="min-h-screen bg-base text-text-secondary px-5 py-10 md:px-8">
      <div className="max-w-[980px] mx-auto grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-2xl border border-[rgba(255,255,255,0.08)] bg-surface p-5 md:p-7">
          <Link to={`/courses/${course.id}`} className="text-[#d97706] no-underline text-[0.86rem] font-semibold">← Back to Course</Link>
          <p className="mt-4 mb-2 text-[0.72rem] tracking-[0.2em] uppercase text-[#f6c56b]">Checkout</p>
          <h1 className="m-0 font-['Playfair_Display',serif] text-[1.9rem] text-text-primary">{course.title}</h1>
          <p className="mt-2 mb-0 text-text-dim text-[0.92rem]">Complete payment to unlock full access and mark this course as owned.</p>

          {!currentUser && (
            <div className="mt-6 rounded-xl border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.1)] p-4">
              <p className="m-0 text-[0.88rem] text-[#f6c56b] font-semibold">Sign in or create an account to buy this course.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg bg-[#d97706] text-[#0c0c0e] text-[0.84rem] font-bold no-underline"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.15)] text-text-secondary text-[0.84rem] font-semibold no-underline"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}

          {!isPaidCourse ? (
            <div className="mt-6 rounded-xl border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] p-4">
              <p className="m-0 text-[#22c55e] font-semibold">This course is free. No payment is needed.</p>
            </div>
          ) : alreadyOwned ? (
            <div className="mt-6 rounded-xl border border-[rgba(34,197,94,0.3)] bg-[rgba(34,197,94,0.1)] p-4">
              <p className="m-0 text-[#22c55e] font-semibold">You already own this course.</p>
            </div>
          ) : !currentUser ? null : (
            <>
              <div className="mt-6 rounded-xl border border-[rgba(255,255,255,0.1)] bg-base p-1.5 grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => { setMethod("card"); setErrors({}); }}
                  className={`px-4 h-12 rounded-lg border text-[0.86rem] font-semibold flex items-center justify-center gap-2 transition-all ${
                    method === "card"
                      ? "bg-[rgba(217,119,6,0.16)] border-[rgba(217,119,6,0.42)] text-[#f6c56b]"
                      : "bg-transparent border-[rgba(255,255,255,0.08)] text-text-dim hover:text-text-secondary"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="inline-flex items-center rounded-md border border-[rgba(37,99,235,0.35)] bg-[rgba(37,99,235,0.22)] px-1.5 py-0.5 text-[0.62rem] font-bold tracking-wide text-[#93c5fd]"
                  >
                    VISA
                  </span>
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod("paypal"); setErrors({}); }}
                  className={`px-4 h-12 rounded-lg border text-[0.86rem] font-semibold flex items-center justify-center gap-2 transition-all ${
                    method === "paypal"
                      ? "bg-[rgba(217,119,6,0.16)] border-[rgba(217,119,6,0.42)] text-[#f6c56b]"
                      : "bg-transparent border-[rgba(255,255,255,0.08)] text-text-dim hover:text-text-secondary"
                  }`}
                >
                  <img src={paypalIcon} alt="PayPal" className="w-5 h-5 object-contain" />
                  PayPal
                </button>
              </div>

              <form onSubmit={handlePayment} className="mt-5 flex flex-col gap-4" noValidate>
                {method === "card" ? (
                  <>
                    <label className="flex flex-col gap-1.5 text-[0.82rem] text-text-dim">
                      Cardholder Name
                      <input
                        type="text"
                        value={cardForm.name}
                        onChange={(e) => setCardForm((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-base border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2.5 text-text-primary"
                        placeholder="Alex Jordan"
                      />
                      {errors.name && <span className="text-[#f87171] text-[0.76rem]">{errors.name}</span>}
                    </label>

                    <label className="flex flex-col gap-1.5 text-[0.82rem] text-text-dim">
                      Card Number
                      <div className="relative">
                        <input
                          type="text"
                          value={formatCardForDisplay(cardForm.number)}
                          onChange={(e) => handleCardNumberChange(e.target.value)}
                          className="w-full bg-base border border-[rgba(255,255,255,0.12)] rounded-lg px-3 pr-20 py-2.5 text-text-primary"
                          placeholder="4242 4242 4242 4242"
                          inputMode="numeric"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          {cardBrand === "visa" && (
                            <span className="inline-flex items-center rounded-md border border-[rgba(37,99,235,0.35)] bg-[rgba(37,99,235,0.2)] px-2 py-0.5 text-[0.68rem] font-bold tracking-wide text-[#93c5fd]">
                              VISA
                            </span>
                          )}
                          {cardBrand === "mastercard" && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-[rgba(249,115,22,0.35)] bg-[rgba(249,115,22,0.18)] px-2 py-0.5 text-[0.68rem] font-bold text-[#fdba74]">
                              <span className="relative inline-flex w-4 h-2.5">
                                <span className="absolute left-0 top-0 w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                                <span className="absolute right-0 top-0 w-2.5 h-2.5 rounded-full bg-[#f59e0b] opacity-90" />
                              </span>
                              MC
                            </span>
                          )}
                        </div>
                      </div>
                      {errors.number && <span className="text-[#f87171] text-[0.76rem]">{errors.number}</span>}
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1.5 text-[0.82rem] text-text-dim">
                        Expiry (MM/YY)
                        <input
                          type="text"
                          value={cardForm.expiry}
                          onChange={(e) => handleExpiryChange(e.target.value)}
                          className="bg-base border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2.5 text-text-primary"
                          placeholder="12/29"
                          inputMode="numeric"
                        />
                        {errors.expiry && <span className="text-[#f87171] text-[0.76rem]">{errors.expiry}</span>}
                      </label>

                      <label className="flex flex-col gap-1.5 text-[0.82rem] text-text-dim">
                        CVV
                        <input
                          type="text"
                          value={cardForm.cvv}
                          onChange={(e) => {
                            const sanitized = e.target.value.replace(/\D/g, "").slice(0, 4);
                            setCardForm((prev) => ({ ...prev, cvv: sanitized }));
                            if (errors.cvv) setErrors((prev) => ({ ...prev, cvv: "" }));
                          }}
                          className="bg-base border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2.5 text-text-primary"
                          placeholder="123"
                          inputMode="numeric"
                        />
                        {errors.cvv && <span className="text-[#f87171] text-[0.76rem]">{errors.cvv}</span>}
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col gap-1.5 text-[0.82rem] text-text-dim">
                    PayPal Email
                    <EmailAutocompleteInput
                      value={paypalEmail}
                      onChange={(e) => {
                        setPaypalEmail(e.target.value);
                        if (errors.paypalEmail) setErrors({});
                      }}
                      className="bg-base border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2.5 text-text-primary"
                      placeholder="you@example.com"
                    />
                    {errors.paypalEmail && <span className="text-[#f87171] text-[0.76rem]">{errors.paypalEmail}</span>}
                  </label>
                )}

                <div className="mt-2 flex flex-col gap-1.5">
                  <label className="text-[0.82rem] text-text-dim">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-base border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2.5 text-text-primary"
                      placeholder="Enter promo code"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      className="px-4 py-2.5 rounded-lg border border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.14)] text-[#f6c56b] text-[0.82rem] font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                  {promoError && <span className="text-[#f87171] text-[0.76rem]">{promoError}</span>}
                </div>

                <div className="mt-1 flex flex-col gap-1.5">
                  <label className="text-[0.82rem] text-text-dim">Referral Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="flex-1 bg-base border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2.5 text-text-primary"
                      placeholder="Enter referral code"
                    />
                    <button
                      type="button"
                      onClick={handleApplyReferral}
                      className="px-4 py-2.5 rounded-lg border border-[rgba(34,197,94,0.34)] bg-[rgba(34,197,94,0.12)] text-[#86efac] text-[0.82rem] font-semibold"
                    >
                      Apply
                    </button>
                  </div>
                  {referralError && <span className="text-[#f87171] text-[0.76rem]">{referralError}</span>}
                </div>
              </form>
            </>
          )}
        </section>

        <aside className="h-fit rounded-2xl border border-[rgba(255,255,255,0.08)] bg-sidebar p-5 md:p-6 lg:sticky lg:top-24">
          <p className="m-0 text-[0.74rem] tracking-[0.2em] uppercase text-text-faint">Order Summary</p>

          <div className="mt-4 rounded-lg border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-3.5">
            <p className="m-0 text-[0.86rem] text-text-dim">Course</p>
            <p className="m-0 mt-1 font-semibold text-text-primary leading-snug">{course.title}</p>
          </div>

          <dl className="mt-4 space-y-2 text-[0.9rem]">
            <div className="flex items-center justify-between text-text-dim">
              <dt>Price</dt>
              <dd>
                {sale.active ? (
                  <span>
                    <span className="line-through text-text-faint">{formatMoney(regularPrice)}</span>{" "}
                    <span className="text-[#fca5a5]">{formatMoney(price)}</span>
                  </span>
                ) : (
                  formatMoney(price)
                )}
              </dd>
            </div>
            {sale.active && (
              <div className="flex items-center justify-between text-[#fca5a5]">
                <dt>Instructor Sale</dt>
                <dd>- {formatMoney(sale.discountAmount)}</dd>
              </div>
            )}
            <div className="flex items-center justify-between text-[#22c55e]">
              <dt>Promo Discount</dt>
              <dd>- ${totals.promoDiscount.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between text-[#34d399]">
              <dt>Referral Discount</dt>
              <dd>- ${totals.referralDiscount.toFixed(2)}</dd>
            </div>
            <div className="h-px bg-[rgba(255,255,255,0.08)]" />
            <div className="flex items-center justify-between text-[1rem] font-bold text-text-primary">
              <dt>Total</dt>
              <dd>${totals.finalTotal.toFixed(2)}</dd>
            </div>
          </dl>

          <button
            type="button"
            onClick={handlePayment}
            disabled={isPaying}
            className="mt-6 w-full py-3 rounded-lg border-none font-bold text-[0.9rem] bg-[#d97706] text-[#0c0c0e] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPaidCourse ? (isPaying ? "Processing..." : "Pay Now") : "Enroll Free"}
          </button>

          {canPrintReceipt && (
            <button
              type="button"
              onClick={handlePrintReceipt}
              className="mt-2 w-full py-2.5 rounded-lg font-semibold text-[0.84rem] border border-[rgba(255,255,255,0.14)] text-text-secondary hover:text-text-primary"
            >
              Print Receipt
            </button>
          )}

          <p className="m-0 mt-3 text-center text-[0.74rem] text-text-faint">
            Valid credit card numbers and valid PayPal emails are accepted.
          </p>
        </aside>
      </div>
    </main>
  );
}
