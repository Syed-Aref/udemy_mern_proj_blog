// Required models
const User = require("../../models/user/User");
const Post = require("../../models/post/Post");
const Comment = require("../../models/comment/Comment");

// Error function
const appErr = require("../../utils/appErr");

// Create
const createCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  
  console.log(message);
  console.log(req.body);

  // Check for empty field
  if(!message) return next(appErr("Comment is not valid"));
  
  try {
    // Find the user
    const user = await User.findById(req.session.userAuth);

    // Find the post
    const post = await Post.findById(req.params.post_id);

    // Create the comment
    const comment = await Comment.create({
      user: req.session.userAuth, 
      post: req.params.post_id, 
      message,
    });

    // Push the comment to post
    post.comments.push(comment._id);
    // Push the comment into
    user.comments.push(comment._id);

    // Disable validation
    // Save
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });

    // Redirect
    res.redirect(`/api/v1/posts/${post._id}`);
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Single
const commentDetailsCtrl = async (req, res, next) => {
  try {
    // Find the comment
    const comment = await Comment.findById(req.params.comment_id);
    
    res.render("comments/updateComment", {
      comment,
      error: "",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Delete
const deleteCommentCtrl = async (req, res, next) => {
  try {
    // Find the comment
    const comment = await Comment.findById(req.params.comment_id);

    // Check if the comment belongs to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to delete this comment", 403));
    }

    // Find the user
    const user = await User.findById(req.session.userAuth);

    // Find the post
    const post = await Post.findById(comment.post);

    // Delete comment
    await Comment.findByIdAndDelete(req.params.comment_id);

    // Delete from user's list as well
    // Find the index of the comment 
    var index = user.comments.indexOf(req.params.comment_id);

    // If the post ID is found, then delete
    if (index !== -1) {
      // Remove the post ID from the user's posts array
      user.comments.splice(index, 1);
      
      // Save the user object to persist the changes
      await user.save();
    }

    // Delete from post's list as well
    // Find the index of the comment 
    var index = post.comments.indexOf(req.params.comment_id);

    // If the post ID is found, then delete
    if (index !== -1) {
      // Remove the post ID from the user's posts array
      post.comments.splice(index, 1);
      
      // Save the user object to persist the changes
      await post.save();
    }

    // Redirect
    res.redirect(`/api/v1/posts/${comment.post}`);
  } catch (error) {
    res.json(error);
  }
};

// Update
const upddateCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  
  // Check for empty field
  if(!message) return next(appErr("Comment is not valid"));

  try {
    // Find the comment
    const comment = await Comment.findById(req.params.comment_id);

    // Check if the post belongs to the user
    if (comment.user.toString() !== req.session.userAuth.toString()) {
      return next(appErr("You are not allowed to update this comment", 403));
    }

    // Update
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.comment_id,
      {
        message: req.body.message,
      },
      {
        new: true,
      }
    );

    // Redirect
    res.redirect(`/api/v1/posts/${comment.post}`);
  } catch (error) {
    res.json(error);
  }
};

module.exports = {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  upddateCommentCtrl,
};