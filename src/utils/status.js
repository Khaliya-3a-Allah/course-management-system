/**
 * RESOURCE_STATUS — shared enum for data-fetching lifecycle states.
 *
 * Single source of truth imported by AppContext, TwoFactorEnroll, and any
 * future component that tracks loading/success/error.
 */
export const RESOURCE_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};
