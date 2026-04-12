module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/login");
  },

  isAdmin: (req, res, next) => {
    const authorizedRoles = ["admin", "warden"];
    if (req.isAuthenticated() && authorizedRoles.includes(req.user.role)) {
      return next();
    }
    res.status(403).send("Access Denied: Administrative access required.");
  },

  isWarden: (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === "warden") {
      return next();
    }
    req.flash(
      "error_msg",
      "Authority Denied: Only the Warden can manage this section.",
    );
    res.redirect("/admin/dashboard");
  },
};
