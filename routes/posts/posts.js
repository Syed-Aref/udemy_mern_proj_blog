// Required models
const Post = require("../../models/post/Post");

// Express routers
const express = require("express");
const postRoutes = express.Router();

// Controllers
const {
  createPostCtrl,
  deletePostCtrl,
  fetchPostCtrl,
  fetchPostsCtrl,
  updatepostCtrl,
} = require("../../controllers/posts/posts");

// Middlewares
const protected = require("../../middlewares/protected");

// Multer and cloudinary (storage)
const multer = require("multer");
const storage = require("../../utils/cloudinary");

// Instance of multer
const upload = multer({ storage });

// GET - api/v1/posts/get-post-form
postRoutes.get("/get-post-form", (req, res) => {
  res.render("posts/addPost", { error: "" });
});

// POST - api/v1/posts/
postRoutes.post("/", protected, upload.single("file"), createPostCtrl);

// GET - api/v1/posts/
postRoutes.get("/", fetchPostsCtrl);

// GET - api/v1/posts/:id
postRoutes.get("/:id", fetchPostCtrl);

// DELETE - api/v1/posts/:id
postRoutes.delete("/:id", protected, deletePostCtrl);


// GET - api/v1/posts/get-form-update/:id
postRoutes.get("/get-form-update/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.render("posts/updatePost", { post, error: "" });
  } catch (error) {
    res.render("posts/updatePost", { error, post: "" });
  }
});

// PUT - api/v1/posts/:id
postRoutes.put("/:id", protected, upload.single("file"), updatepostCtrl);

module.exports = postRoutes;