// ------- Load environment variables ------- //
require("dotenv").config();

// ------- Import all dependecies ------- //
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");

// ------- Create instances if necessary ------- //
const app = express();

// ------- Import all utility functions ------- //
require("./utils/dbConnect");

// Pass JSON data
app.use(express.json());

// Pass form data
app.use(express.urlencoded({ extended: true }));

// View engine setup
app.set("view engine", "ejs");

// Static files
app.use(express.static(__dirname + "/public"));

// ------- Import error handler (MW) ------- //
const globalErrHandler = require("./middlewares/globlErrHandler");

// ------- Import all routes ------- //
const commentRoutes = require("./routes/comments/comment");
const postRoutes = require("./routes/posts/posts");
const userRoutes = require("./routes/users/users");

// ------- Import error class ------- //
const appErr = require("./utils/appErr");

// ------- Import required models ------- //
const Post = require("./models/post/Post");

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URL,
      ttl: 24 * 60 * 60, //1 day
    }),
  })
);


//??????????????
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
const { truncatePost } = require("./utils/helper");
app.locals.tuncatePost = truncatePost;
app.use((req, res, next) => {
  console.log(req.session.userAuth + ' (line 60)');
  if (req.session.userAuth) {
    res.locals.userAuth = req.session.userAuth;
  } else {
    res.locals.userAuth = null;
  }
  next();
});

//GET- / (Homepage)
app.get("/",  async (req, res) => {
  try {
    console.log("--------------------------------------- Homepage ---------------------------------------");
    console.log(req.session.userAuth);
    console.log(req.session.user_found);
    console.log(req.session);
    const posts = await Post.find().populate("user");
    res.render("index", { posts });
  } catch (error) {
    res.render("index", { error: error.message });
  }
});

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/comments", commentRoutes);

// Global error handler
app.use(globalErrHandler);

// ------- Listen ------- //
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
// URL: http://localhost:3000 
