export function validateRequired(value, fieldName = "This field") {
  return value?.toString().trim() ? "" : `${fieldName} is required.`;
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
export function validateMinLength(value, min, fieldName = "This field") {
  if (!value?.trim()) return `${fieldName} is required.`;
  return value.trim().length >= min ? "" : `${fieldName} must be at least ${min} characters.`;
}
export function validateUrl(value) {
  if (!value?.trim()) return "URL is required.";
  try { new URL(value); return ""; } catch { return "Enter a valid URL."; }
}
export function validateCourseForm(data) {
  const errors = {
    title: validateMinLength(data.title, 3, "Title"),
    category: validateRequired(data.category, "Category"),
    level: validateRequired(data.level, "Level"),
    instructorName: validateRequired(data.instructorName, "Instructor name"),
    description: validateRequired(data.description, "Description"),
    thumbnail: data.thumbnail ? validateUrl(data.thumbnail) : "",
  };
  return { errors, isValid: Object.values(errors).every((e) => !e) };
}
export function validateLoginForm(data) {
  const errors = { email: validateEmail(data.email), password: validateRequired(data.password, "Password") };
  return { errors, isValid: Object.values(errors).every((e) => !e) };
}
export function validateRegisterForm(data) {
  const errors = {
    name: validateRequired(data.name, "Name"),
    email: validateEmail(data.email),
    password: validatePassword(data.password),
    confirmPassword: validatePasswordMatch(data.password, data.confirmPassword),
    role: validateRequired(data.role, "Role"),
  };
  return { errors, isValid: Object.values(errors).every((e) => !e) };
}
