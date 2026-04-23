// ── Sanitizer ──────────────────────────────────────────────

/**
 * Strips HTML tags, trims whitespace, and collapses multiple spaces.
 * Use on all text fields before storage to prevent XSS.
 */
export function sanitizeInput(value) {
  if (!value || typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, "")
    .trim()
    .replace(/\s+/g, " ");
}

// ── Individual validators ──────────────────────────────────

export function validateRequired(value, fieldName = "This field") {
  return value?.toString().trim() ? "" : `${fieldName} is required.`;
}

export function validateName(value) {
  if (!value?.trim()) return "Name is required.";
  const trimmed = value.trim();
  if (trimmed.length < 2) return "Name must be at least 2 characters.";
  if (trimmed.length > 50) return "Name must be 50 characters or fewer.";
  if (!/^[a-zA-ZÀ-ÿ\s\-']+$/.test(trimmed)) {
    return "Name can only contain letters, spaces, hyphens, and apostrophes.";
  }
  return "";
}

export function validateEmail(value) {
  if (!value?.trim()) return "Email is required.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Enter a valid email address.";
}

export function validatePassword(value) {
  if (!value) return "Password is required.";
  return value.length >= 6 ? "" : "Password must be at least 6 characters.";
}

export function validatePasswordMatch(password, confirm) {
  if (!confirm) return "Please confirm your password.";
  return password === confirm ? "" : "Passwords do not match.";
}

export function validatePhone(value) {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (!/^\+?[\d\s\-()]+$/.test(trimmed)) {
    return "Phone can only contain digits, spaces, dashes, and parentheses.";
  }
  const digitCount = trimmed.replace(/\D/g, "").length;
  if (digitCount < 7) return "Phone number must have at least 7 digits.";
  if (digitCount > 15) return "Phone number must have 15 digits or fewer.";
  return "";
}

export function validateBio(value) {
  if (!value?.trim()) return "";
  if (value.trim().length > 300) return "Bio must be 300 characters or fewer.";
  return "";
}

export function validateExpertise(value) {
  if (!value?.trim()) return "";
  const trimmed = value.trim();
  if (trimmed.length > 100) return "Expertise must be 100 characters or fewer.";
  if (!/^[a-zA-ZÀ-ÿ0-9\s\-&.,/()]+$/.test(trimmed)) {
    return "Expertise contains invalid characters.";
  }
  return "";
}

export function validateOptionalUrl(value) {
  if (!value?.trim()) return "";
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "URL must use http or https protocol.";
    }
    return "";
  } catch {
    return "Enter a valid URL (e.g., https://example.com).";
  }
}

export function validateTermsAccepted(value) {
  return value ? "" : "You must accept the Terms & Conditions.";
}

export function validateMinLength(value, min, fieldName = "This field") {
  if (!value?.trim()) return `${fieldName} is required.`;
  return value.trim().length >= min ? "" : `${fieldName} must be at least ${min} characters.`;
}

export function validateUrl(value) {
  if (!value?.trim()) return "URL is required.";
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "URL must use http or https protocol.";
    }
    return "";
  } catch {
    return "Enter a valid URL.";
  }
}

export function validateTwoFactorCode(value) {
  if (!value?.trim()) return "Verification code is required.";
  if (!/^\d{6}$/.test(value.trim())) return "Code must be exactly 6 digits.";
  return "";
}

// ── Composed form validators ───────────────────────────────

export function validateLoginForm(data) {
  const errors = {
    email: validateEmail(data.email),
    password: validateRequired(data.password, "Password"),
  };
  return { errors, isValid: Object.values(errors).every((e) => !e) };
}

export function validateRegisterForm(data) {
  const errors = {
    name: validateName(data.name),
    email: validateEmail(data.email),
    password: validatePassword(data.password),
    confirmPassword: validatePasswordMatch(data.password, data.confirmPassword),
    role: validateRequired(data.role, "Role"),
    phone: validatePhone(data.phone),
    bio: validateBio(data.bio),
    acceptTerms: validateTermsAccepted(data.acceptTerms),
  };

  if (data.role === "instructor") {
    errors.expertise = validateExpertise(data.expertise);
    errors.website = validateOptionalUrl(data.website);
  }

  return { errors, isValid: Object.values(errors).every((e) => !e) };
}

export function validateCourseForm(data) {
  const errors = {
    title: validateMinLength(data.title, 3, "Title"),
    category: validateRequired(data.category, "Category"),
    level: validateRequired(data.level, "Level"),
    description: validateRequired(data.description, "Description"),
    thumbnail: data.thumbnail ? validateUrl(data.thumbnail) : "",
  };
  return { errors, isValid: Object.values(errors).every((e) => !e) };
}

export function validateModules(modules) {
  const errors = {};
  let isValid = true;

  modules.forEach((mod, modIndex) => {
    const modErrors = {};

    const titleErr = validateRequired(mod.title, "Module title");
    if (titleErr) {
      modErrors.title = titleErr;
      isValid = false;
    }

    const lessonErrors = {};
    (mod.lessons || []).forEach((lesson, lesIndex) => {
      const lesErr = {};

      const lesTitleErr = validateRequired(lesson.title, "Lesson title");
      if (lesTitleErr) {
        lesErr.title = lesTitleErr;
        isValid = false;
      }

      const durErr = validateRequired(lesson.duration, "Duration");
      if (durErr) {
        lesErr.duration = durErr;
        isValid = false;
      }

      const urlErr = lesson.videoUrl ? validateOptionalUrl(lesson.videoUrl) : "";
      if (urlErr) {
        lesErr.videoUrl = urlErr;
        isValid = false;
      }

      if (Object.keys(lesErr).length > 0) {
        lessonErrors[lesIndex] = lesErr;
      }
    });

    if (Object.keys(lessonErrors).length > 0) {
      modErrors.lessons = lessonErrors;
    }
    if (Object.keys(modErrors).length > 0) {
      errors[modIndex] = modErrors;
    }
  });

  return { errors, isValid };
}
