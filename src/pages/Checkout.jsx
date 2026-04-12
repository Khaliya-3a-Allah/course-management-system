import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { validateEmail } from "../utils/validators";

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

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, currentUser, purchaseCourse, enrollCourse, addToast } = useAppContext();

  const course = courses.find((c) => c.id === courseId);

  const price = Number(course?.price || 0);
  const isPaidCourse = price > 0;
  const alreadyOwned = currentUser?.purchasedCourseIds?.includes(courseId) ?? false;

  const [method, setMethod] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [promoError, setPromoError] = useState("");
  const [errors, setErrors] = useState({});
  const [isPaying, setIsPaying] = useState(false);

  const [cardForm, setCardForm] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
  });
  const [paypalEmail, setPaypalEmail] = useState("");

  const discountRate = appliedPromo ? 0.15 : 0;

  const totals = useMemo(() => {
    const discount = Number((price * discountRate).toFixed(2));
    const finalTotal = Number((price - discount).toFixed(2));
    return { discount, finalTotal };
  }, [discountRate, price]);

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

  const handlePayment = (event) => {
    event.preventDefault();

    if (!currentUser) {
      addToast("Please sign in or create an account to complete your purchase.", "info");
      navigate("/login");
      return;
    }

    if (!isPaidCourse) {
      enrollCourse(course.id);
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

    window.setTimeout(() => {
      purchaseCourse(course.id);
      setIsPaying(false);
      addToast("Payment successful. You now own this course!", "success");
      navigate(`/courses/${course.id}`);
    }, 700);
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
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => { setMethod("card"); setErrors({}); }}
                  className={`px-4 py-2 rounded-lg border text-[0.85rem] font-semibold ${
                    method === "card"
                      ? "bg-[rgba(217,119,6,0.14)] border-[rgba(217,119,6,0.35)] text-[#f6c56b]"
                      : "bg-transparent border-[rgba(255,255,255,0.14)] text-text-dim"
                  }`}
                >
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => { setMethod("paypal"); setErrors({}); }}
                  className={`px-4 py-2 rounded-lg border text-[0.85rem] font-semibold ${
                    method === "paypal"
                      ? "bg-[rgba(217,119,6,0.14)] border-[rgba(217,119,6,0.35)] text-[#f6c56b]"
                      : "bg-transparent border-[rgba(255,255,255,0.14)] text-text-dim"
                  }`}
                >
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
                      <input
                        type="text"
                        value={formatCardForDisplay(cardForm.number)}
                        onChange={(e) => handleCardNumberChange(e.target.value)}
                        className="bg-base border border-[rgba(255,255,255,0.12)] rounded-lg px-3 py-2.5 text-text-primary"
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                      />
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
                    <input
                      type="email"
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
              <dd>${price.toFixed(2)}</dd>
            </div>
            <div className="flex items-center justify-between text-[#22c55e]">
              <dt>Promo Discount</dt>
              <dd>- ${totals.discount.toFixed(2)}</dd>
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

          <p className="m-0 mt-3 text-center text-[0.74rem] text-text-faint">
            Valid credit card numbers and valid PayPal emails are accepted.
          </p>
        </aside>
      </div>
    </main>
  );
}
