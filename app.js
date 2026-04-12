const express = require("express");
const path = require("path");
const app = express();
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
require("dotenv").config();
const { isLoggedIn, isAdmin } = require("./middleware/auth");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/User");
const bcrypt = require("bcrypt");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Hindu Hostel Database Connected..."))
  .catch((err) => console.error("❌ DB Error:", err.message));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "hindu-hostel-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
    },
  }),
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({
          $or: [{ email: email }, { enrollmentNumber: email }],
        });

        if (!user) {
          return done(null, false, { message: "User not found in records." });
        }

        if (!user.isVerified) {
          return done(null, false, {
            message: "Please verify your email first.",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Invalid password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg") || [];
  res.locals.error_msg = req.flash("error_msg") || [];
  res.locals.error = req.flash("error") || [];
  res.locals.user = req.user || null;
  next();
});
const indexRouter = require("./routes/index");
const studentRouter = require("./routes/student");
const adminRouter = require("./routes/admin");

app.use("/", indexRouter);
app.use("/student", studentRouter);
app.use("/admin", adminRouter);

app.use((req, res) => {
  res.status(404).render("404", {
    title: "404 | Lost in Hostel",
    hostelName: "Hindu Hostel, Prayagraj",
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
