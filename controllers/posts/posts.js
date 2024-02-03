// Required models
const Post = require("../../models/post/Post");
const User = require("../../models/user/User");

// Error function
const appErr = require("../../utils/appErr");

// Create
const createPostCtrl = async (req, res, next) => {
  console.log(req.file);
  console.log(req.body);
  const { title, description, category } = req.body;

  // Check for any empty field
  if (!title || !description || !category || !req.file) {
    return next(appErr("All fields are required"));
  }

  try {
    // Find the user
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);
    
    // Create the post
    const postCreated = await Post.create({
      title,
      description,
      category,
      user: userFound._id,
      image: req.file.path,
    });

    // Push the post created into the array of user's posts
    userFound.posts.push(postCreated._id);

    // Re-save
    await userFound.save();

    // Redirect
    res.redirect("/api/v1/users/all-created-posts");
  } catch (error) {
    return next(appErr(error.message));
  }
};

// All
const fetchPostsCtrl =  (req, res) => {
  res.redirect("/api/v1/users/all-created-posts");
};

// Details
const fetchPostCtrl = async (req, res, next) => {
  try {
    // Get the id from params
    const id = req.params.id;
    // Find the post
    const post = await Post.findById(id)
    .populate({
      path: "comments",
      populate: {
        path: "user",
      },
    })
    .populate("user");

    res.render("posts/postDetails", {
      post,
      error: "",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Delete
const deletePostCtrl = async (req, res, next) => {
  try {
    // Find the post
    const post = await Post.findById(req.params.id);

    // Check if the post belongs to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this post", 403));
    }

    // Delete post
    await Post.findByIdAndDelete(req.params.id);

    // Find the user
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);

    // Delete from user's list as well
    // Find the index of the post 
    const index = userFound.posts.indexOf(req.params.id);

    // If the post ID is found, then delete
    if (index !== -1) {
      // Remove the post ID from the user's posts array
      userFound.posts.splice(index, 1);
      
      // Save the user object to persist the changes
      await userFound.save();
    }

    // Redirect
    res.redirect("/api/v1/posts");
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Update
const updatepostCtrl = async (req, res, next) => {
  const { title, description, category } = req.body;

  // Check for any empty field
  if (!title || !description || !category || !req.file) {
    return next(appErr("All fields are required"));
  }

  try {
    // Find the post
    const post = await Post.findById(req.params.id);

    // Check if the post belongs to the user
    if (post.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this post", 403));
    }
    
    // Update
    const postUpdated = await Post.findByIdAndUpdate(
      req.params.id, {
        title,
        description,
        category,
        image: req.file.path,
      }, {
        new: true,
      }
    );

    // Redirect
    res.redirect("/api/v1/posts");
  } catch (error) {
    return next(appErr(error.message));
  }
};

module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatepostCtrl,
};