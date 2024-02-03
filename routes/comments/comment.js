const express = require("express");
const commentRoutes = express.Router();

const {
  createCommentCtrl,
  commentDetailsCtrl,
  deleteCommentCtrl,
  upddateCommentCtrl,
} = require("../../controllers/comments/comments");

const protected = require("../../middlewares/protected");

// POST - api/v1/comments/:post_id
commentRoutes.post("/:post_id", protected, createCommentCtrl);

// GET - api/v1/comments/:comment_id
commentRoutes.get("/:comment_id", protected, commentDetailsCtrl);

// DELETE - api/v1/comments/:comment_id
commentRoutes.delete("/:comment_id", protected, deleteCommentCtrl);

// PUT - api/v1/comments/:comment_id
commentRoutes.put("/:comment_id", protected, upddateCommentCtrl);

module.exports = commentRoutes;