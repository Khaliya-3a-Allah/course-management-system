const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL && import.meta.env.DEV) {
  throw new Error(
    "VITE_API_URL is not set. Add it to .env.local, for example: VITE_API_URL=http://localhost:5000/api/v1"
  );
}

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function buildUrl(path) {
  if (!path.startsWith("/")) {
    throw new Error(`API path must start with "/", got "${path}"`);
  }

  return `${normalizeBaseUrl(API_BASE_URL)}${path}`;
}

function buildHeaders({ token, hasBody }) {
  const headers = {};

  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

async function parseResponse(response) {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function buildHttpError(response, payload) {
  const message =
    payload?.message ||
    response.statusText ||
    `Request failed with status ${response.status}`;

  const error = new Error(message);
  error.status = response.status;
  error.payload = payload;

  return error;
}

function buildNetworkError(cause) {
  const error = new Error(
    "Could not reach the server. Check that the backend is running and VITE_API_URL is correct."
  );

  error.status = 0;
  error.cause = cause;

  return error;
}

async function request(method, path, { body, token } = {}) {
  const hasBody = body !== undefined;

  const init = {
    method,
    headers: buildHeaders({ token, hasBody }),
  };

  if (hasBody) {
    init.body = JSON.stringify(body);
  }

  let response;

  try {
    response = await fetch(buildUrl(path), init);
  } catch (networkError) {
    throw buildNetworkError(networkError);
  }

  const payload = await parseResponse(response);

  if (!response.ok) {
    throw buildHttpError(response, payload);
  }

  return payload;
}

export function apiGet(path, options = {}) {
  return request("GET", path, options);
}

export function apiPost(path, body, options = {}) {
  return request("POST", path, { ...options, body });
}

export function apiPut(path, body, options = {}) {
  return request("PUT", path, { ...options, body });
}

export function apiDelete(path, options = {}) {
  return request("DELETE", path, options);
}