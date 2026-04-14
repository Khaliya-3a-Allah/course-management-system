export function authenticateRequest(req, res, next) {
  // Member 2 integration point: verify JWT and attach req.user.
  // For now we keep routes open during Phase 2 backend scaffolding.
  next();
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    // Member 2 integration point: enforce role checks based on req.user.role.
    // Placeholder currently allows all requests.
    void allowedRoles;
    next();
  };
}
