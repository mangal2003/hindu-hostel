const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { isAdmin, isLoggedIn, isWarden } = require("../middleware/auth");
const crypto = require("crypto");
const { sendVerificationEmail } = require("../utils/mailer");
const Complaint = require("../models/Complaint");
const multer = require("multer");
const path = require("path");
const Event = require("../models/Event");
const fs = require("fs");
const Announcement = require("../models/Announcement");
const Resource = require("../models/Resource");

const storage = multer.diskStorage({
  destination: "./public/images/events",
  filename: (req, file, cb) => {
    cb(null, "hostel-event-" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5000000 },
}).array("images", 10);

router.post("/announcements/new", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { category, content, link } = req.body;

    const newNotice = new Announcement({
      category,
      content,
      link: link && link.trim() !== "" ? link : null,
    });

    await newNotice.save();

    req.flash("success_msg", `${category} announcement has been broadcasted.`);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Broadcast Error:", err);
    req.flash("error_msg", "Failed to dispatch announcement.");
    res.redirect("/admin/dashboard");
  }
});

router.get("/resources/new", isLoggedIn, isAdmin, (req, res) => {
  res.render("admin/new-resource", { title: "Dispatch Academic Material" });
});

router.post("/resources/new", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { subject, studyMaterial, resources, previousPapers } = req.body;

    const newResource = new Resource({
      subject: subject.trim(),
      studyMaterial: studyMaterial || null,
      resources: resources || null,
      previousPapers: previousPapers || null,
    });

    await newResource.save();
    req.flash(
      "success_msg",
      `Subject: ${subject} has been added to the Vault.`,
    );
    res.redirect("/admin/dashboard");
  } catch (err) {
    if (err.code === 11000) {
      req.flash("error_msg", "This subject already exists in the Vault.");
    } else {
      req.flash("error_msg", "Failed to archive subject material.");
    }
    res.redirect("back");
  }
});

router.post("/resources/delete/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Subject removed from the Academic Vault.");
    res.redirect("/student/academic-vault");
  } catch (err) {
    req.flash("error_msg", "Failed to delete resource.");
    res.redirect("/student/academic-vault");
  }
});
router.get("/resources/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    res.render("admin/edit-resource", { title: "Update Subject", resource });
  } catch (err) {
    res.redirect("/student/academic-vault");
  }
});

router.post("/resources/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { subject, studyMaterial, resources, previousPapers } = req.body;
    await Resource.findByIdAndUpdate(req.params.id, {
      subject: req.body.subject,
      studyMaterial: req.body.studyMaterial || null,
      resources: req.body.resources || null,
      previousPapers: req.body.previousPapers || null,
    });
    req.flash("success_msg", "Academic records updated.");
    res.redirect("/student/academic-vault");
  } catch (err) {
    req.flash("error_msg", "Update failed.");
    res.redirect("/student/academic-vault");
  }
});

router.get("/events/new", isLoggedIn, isWarden, (req, res) => {
  res.render("admin/new-event", { title: "New Chronicle Entry" });
});

router.post("/events/new", isLoggedIn, isAdmin, (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.send("Error uploading files.");

    try {
      const { title, description, winners, chiefGuests } = req.body;

      const imagePaths = req.files.map(
        (file) => `/images/events/${file.filename}`,
      );

      const newEvent = new Event({
        title,
        description,
        images: imagePaths,
        winners: winners ? winners.split(",").map((w) => w.trim()) : [],
        chiefGuests: chiefGuests
          ? chiefGuests.split(",").map((g) => g.trim())
          : [],
      });

      await newEvent.save();
      req.flash("success_msg", "Event archived in History.");
      res.redirect("/hostel-events");
    } catch (error) {
      console.log(error);
      res.redirect("back");
    }
  });
});

router.get("/events/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
  const event = await Event.findById(req.params.id);
  res.render("admin/edit-event", { title: "Edit Chronicle", event });
});

router.post("/events/edit/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { title, description, winners, chiefGuests } = req.body;
    await Event.findByIdAndUpdate(req.params.id, {
      title,
      description,
      winners: winners ? winners.split(",").map((w) => w.trim()) : [],
      chiefGuests: chiefGuests
        ? chiefGuests.split(",").map((g) => g.trim())
        : [],
    });
    req.flash("success_msg", "Chronicle updated.");
    res.redirect("/hostel-events");
  } catch (err) {
    res.redirect("back");
  }
});

router.post("/events/delete/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    event.images.forEach((img) => {
      const filePath = `./public${img}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    });

    await Event.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Event removed from history.");
    res.redirect("/hostel-events");
  } catch (err) {
    res.redirect("/hostel-events");
  }
});

router.get("/dashboard", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const [studentCount, complaints, pendingCount, adminsCount] =
      await Promise.all([
        User.countDocuments({ role: "student" }),
        Complaint.find()
          .populate("student", "name")
          .sort("-createdAt")
          .limit(5),
        Complaint.countDocuments({ status: "Pending" }),
        User.countDocuments({ role: { $ne: "student" } }),
      ]);
    const allAdmins = await User.find({ role: { $in: ["admin", "warden"] } });
    const allStudents = await User.find({ role: "student" }).sort("name");
    res.render("admin/dashboard", {
      title: "Warden Desk",
      studentCount,
      complaints,
      pendingCount,
      adminsCount,
      allAdmins,
      allStudents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Dashboard Load Error");
  }
});

router.get("/manage-admins", isLoggedIn, isWarden, async (req, res) => {
  try {
    const admins = await User.find({
      role: { $in: ["admin", "warden"] },
    });
    res.render("admin/manage-admins", {
      title: "Staff Authority",
      admins,
    });
  } catch (err) {
    res.status(500).send("Error loading staff list.");
  }
});

router.post("/add-role", isLoggedIn, isWarden, async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { enrollmentNumber: identifier }],
    });

    if (!user) {
      req.flash("error_msg", "User not found in records.");
      return res.redirect("/admin/manage-admins");
    }

    user.role = "admin";
    await user.save();
    req.flash("success_msg", `${user.name} is now an Admin.`);
    res.redirect("/admin/manage-admins");
  } catch (err) {
    res.redirect("/admin/manage-admins");
  }
});

router.post("/remove-role/:id", isLoggedIn, isWarden, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      req.flash("error_msg", "You cannot remove your own admin status.");
      return res.redirect("/admin/manage-admins");
    }

    await User.findByIdAndUpdate(req.params.id, { role: "student" });
    req.flash("success_msg", "Admin privileges revoked.");
    res.redirect("/admin/manage-admins");
  } catch (err) {
    res.redirect("/admin/manage-admins");
  }
});
router.post("/update-role", isWarden, async (req, res) => {
  try {
    const { adminId, newRole } = req.body;
    const currentUserId = req.user._id;

    if (adminId === currentUserId.toString() && newRole !== "warden") {
      req.flash(
        "error_msg",
        "Security Protocol: You cannot revoke your own Warden status from this desk.",
      );
      return res.redirect("/admin/dashboard");
    }

    const updatedUser = await User.findByIdAndUpdate(
      adminId,
      { role: newRole },
      { new: true },
    );

    if (!updatedUser) {
      req.flash("error_msg", "Staff record not found.");
      return res.redirect("/admin/dashboard");
    }

    req.flash(
      "success_msg",
      `Authority for ${updatedUser.name} has been updated to ${newRole.toUpperCase()}.`,
    );
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("Role Update Error:", error);
    req.flash(
      "error_msg",
      "Administrative Error: Failed to update authority levels.",
    );
    res.redirect("/admin/dashboard");
  }
});

router.get("/complaints/:id", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      "student",
      "name email enrollmentNumber roomNumber",
    );

    if (!complaint) {
      req.flash("error_msg", "Complaint not found.");
      return res.redirect("/admin/dashboard");
    }

    res.render("admin/complaint-detail", {
      title: `Detail: ${complaint.subject}`,
      complaint,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/complaints", isLoggedIn, isAdmin, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("student", "name")
      .sort("-createdAt");
    res.render("admin/complaints", { title: "Manage Complaints", complaints });
  } catch (err) {
    res.status(500).send("Error fetching complaints");
  }
});
router.post(
  "/complaints/update-status",
  isLoggedIn,
  isAdmin,
  async (req, res) => {
    try {
      const { complaintId, status } = req.body;
      await Complaint.findByIdAndUpdate(complaintId, { status });
      req.flash("success_msg", `Complaint marked as ${status}`);
      res.redirect("/admin/dashboard");
    } catch (err) {
      req.flash("error_msg", "Failed to update status.");
      res.redirect("back");
    }
  },
);

router.get("/register-student", isAdmin, (req, res) => {
  res.render("admin/register-student", {
    title: "Register Resident | Warden Office",
  });
});

router.post("/register-student", isAdmin, async (req, res) => {
  try {
    const { name, email, enrollmentNumber, roomNumber } = req.body;

    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 24 * 60 * 60 * 1000;

    const newStudent = new User({
      name,
      email,
      password: "temporary_locked_pass",
      enrollmentNumber,
      roomNumber,
      role: "student",
      verificationToken: token,
      tokenExpires: expires,
    });

    await newStudent.save();

    await sendVerificationEmail(email, name, token);

    req.flash("success_msg", "Student registered! Verification email sent.");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.status(500).send("Registration error.");
  }
});

router.post("/remove-resident/:id", isLoggedIn, isWarden, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    req.flash("success_msg", "Resident record purged from the registry.");
    res.redirect("/admin/dashboard");
  } catch (err) {
    req.flash("error_msg", "Failed to remove resident.");
    res.redirect("/admin/dashboard");
  }
});

router.post("/change-password", isLoggedIn, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      req.flash("error_msg", "Current password does not match our records.");
      return res.redirect("back");
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    req.flash("success_msg", "Password updated successfully.");
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    req.flash("error_msg", "System error during password update.");
    res.redirect("back");
  }
});

module.exports = router;
