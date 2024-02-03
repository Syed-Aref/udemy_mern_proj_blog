// ------- Import error class ------- //
const appErr = require("../../utils/appErr");

// ------- Import required models ------- //
const User = require("../../models/user/User");
const Post = require("../../models/post/Post");

// Express routers
const express = require("express");
const userRoutes = express.Router();

// Controllers
const {
  registerCtrl,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverPhotoCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
} = require("../../controllers/users/users");

// Middlewares
const protected = require("../../middlewares/protected");

// Multer and cloudinary (storage)
const multer = require("multer");
const storage = require("../../utils/cloudinary");

// Instance of multer
const upload = multer({ storage });

// GET - api/v1/users/login
userRoutes.get("/login", (req, res) => {
  res.render("users/login", { error: "" });
});

// GET - api/v1/users/register
userRoutes.get("/register", (req, res) => {
  res.render("users/register", {
    error: "",
  });
});

// POST - api/v1/users/register
userRoutes.post("/register", registerCtrl);

// POST - api/v1/users/login
userRoutes.post("/login", loginCtrl);

// GET - api/v1/users/upload-profile-photo-form/
userRoutes.get("/upload-profile-photo-form", (req, res) => {
  res.render("users/uploadProfilePhoto", { error: "" });
});

// GET - api/v1/users/upload-cover-photo-form/
userRoutes.get("/upload-cover-photo-form", (req, res) => {
  res.render("users/uploadCoverPhoto", { error: "" });
});

// GET - api/v1/users/update-user-password/
userRoutes.get("/update-user-password", (req, res) => {
  res.render("users/updatePassword", { error: "" });
});

// GET - api/v1/users/update-user/
userRoutes.get("/update-user", async (req, res, next) => {
  try {
    // Get userId from session
    const userID = req.session.userAuth;

    // Find the user
    let user = await User.findById(userID);

    res.render("users/updateUser", { 
      error: "",
      user
    });
  } catch (error) {
    return next(appErr(error.message));
  }
  
});

// GET - api/v1/users/all-posts/
userRoutes.get("/all-posts", async (req, res, next) => {
  try {
    const posts = await Post.find().populate("user");
    console.log(posts);

    res.render("users/allPosts", { 
      error: "",
      posts
    });
  } catch (error) {
    return next(appErr(error.message));
  }
});

// GET - api/v1/users/all-created-posts/
userRoutes.get("/all-created-posts", protected, async (req, res, next) => {
  try {
    // Get userId from session
    const userID = req.session.userAuth;

    // Find the user
    let user = await User.findById(userID).populate({
      path: "posts",
      populate: {
        path: "user"
      }
    });

    // Retrieve the posts
    let posts = user["posts"];
    
    res.render("users/allCreatedPosts", { 
      error: "",
      posts
    });
  } catch (error) {
    return next(appErr(error.message));
  }
});

// GET - api/v1/users/:id
userRoutes.get("/user-details-public-view/:id", userDetailsCtrl);

// GET - api/v1/users/profile/
userRoutes.get("/profile", protected, profileCtrl);

// PUT - api/v1/users/profile-photo-upload/
userRoutes.put("/profile-photo-upload", protected, upload.single("profile"), uploadProfilePhotoCtrl);

// PUT - api/v1/users/cover-photo-upload/
userRoutes.put("/cover-photo-upload", protected, upload.single("cover"), uploadCoverPhotoCtrl);

// PUT - api/v1/users/update-password/
userRoutes.put("/update-password", protected, updatePasswordCtrl);

// PUT - api/v1/users/update/
userRoutes.put("/update", protected, updateUserCtrl);

// GET - api/v1/users/logout
userRoutes.get("/logout", protected, logoutCtrl);

module.exports = userRoutes;