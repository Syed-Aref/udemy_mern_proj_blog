// ------- Import error class ------- //
const appErr = require("../../utils/appErr");

// ------- Import required models ------- //
const User = require("../../models/user/User");

// ------- Import bcryptjs package ------- //
const bcrypt = require("bcryptjs");

// Register
const registerCtrl = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  
  // Check if field is empty
  if (!fullname || !email || !password) {
    return next(appErr("All fields are required"));
  }
  try {
    // Check if user exist (email)
    const userFound = await User.findOne({ email });

    // If exists, throw an error
    if (userFound) {
      return next(appErr("User already Exists"));
    }

    // Hash passsword
    const salt = await bcrypt.genSalt(10);
    const passswordHashed = await bcrypt.hash(password, salt);

    // Register user in DB
    const user = await User.create({
      fullname,
      email,
      password: passswordHashed,
    });

    res.redirect("/api/v1/users/login");
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Login
const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;

  // Check if field is empty
  if (!email || !password) {
    return next(appErr("Email and password fields are required"));
  }
  try {
    // Check if email exists
    const userFound = await User.findOne({ email });

    // If not exists, throw an error
    if (!userFound) {
      return next(appErr("Invalid login credentials (user not found)"));
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userFound.password);
    
    // If not verified, thrown an error
    if (!isPasswordValid) {
      return next(appErr("Invalid login credentials (wrong password)"));
    }

    // Save the user into
    req.session.userAuth = userFound._id;
    req.session.user_found = "true";
    console.log(req.session.userAuth);
    console.log(req.session.user_found);

    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return next(appErr(error.message));
  }
};


// Details
const userDetailsCtrl = async (req, res, next) => {
  try {
    // Get userId from params
    const userId = req.params.id;

    // Find the user
    const user = await User.findById(userId);
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Profile
const profileCtrl = async (req, res, next) => {
  try {
    console.log(req.session.userAuth);

    // Get userId from session
    const userID = req.session.userAuth;

    // Find the user
    let user = await User.findById(userID);

    // We can populate ObjectID fields (of a particular model) using populate method
    // user = await User.findById(userID).populate("posts");
    
    // We can also populate multiple ObjectId fields (calling chain of populate methods)
    user = await User.findById(userID).populate("posts").populate("comments");

    // Also, while chaining order will not matter
    // user = await User.findById(userID).populate("comments").populate("posts");

    res.render("users/profile", { user });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Upload profile photo
const uploadProfilePhotoCtrl = async (req, res, next) => {
  console.log(req.file);
  console.log(req.file.path);

  try {
    // Find the user to be updated
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);

    // Check if user is found
    if (!userFound) {
      return next(appErr("User not found", 403));
    }

    // Update profile photo
    const userProfilePhotoUpdated = await User.findByIdAndUpdate(
      userId, {
        profileImage: req.file.path,
      }, {
        new: true,
      }
    );

    // Redirect
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Upload cover image
const uploadCoverPhotoCtrl = async (req, res) => {
  console.log(req.file);
  console.log(req.file.path);

  try {
    // Find the user to be updated
    const userId = req.session.userAuth;
    const userFound = await User.findById(userId);

    // Check if user is found
    if (!userFound) {
      return next(appErr("User not found", 403));
    }

    // Update cover photo
    const userCoverPhotoUpdated = await User.findByIdAndUpdate(
      userId, {
        coverImage: req.file.path,
      }, {
        new: true,
      }
    );

    // Redirect
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Update password
const updatePasswordCtrl = async (req, res) => {
  const { password } = req.body;

  // Check if field is empty
  if (!password) {
    return next(appErr("All fields are required"));
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    const passswordHashed = await bcrypt.hash(password, salt);

    // Update password
    await User.findByIdAndUpdate(
      req.session.userAuth, {
        password: passswordHashed,
      }, {
        new: true,
      }
    );
    
    // Redirect
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Update user
const updateUserCtrl = async (req, res, next) => {
  const { fullname, email } = req.body;

  // Check if field is empty
  if (!fullname || !email) {
    return next(appErr("All fields are required"));
  }

  try {
    // Check if new email is not taken
    if (email) {
      const emailTaken = await User.findOne({ email });
      if (emailTaken) {
        return next(appErr("Email is taken", 400));
      }
    }
    // Update the user
    const user = await User.findByIdAndUpdate(
      req.session.userAuth, {
        fullname,
        email,
      }, {
        new: true,
        // Returns the new record
      }
    );
    
    // Redirect
    res.redirect("/api/v1/users/profile");
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Logout
const logoutCtrl = async (req, res) => {
  // Destroy session
  req.session.destroy(() => {
    res.redirect("/api/v1/users/login");
  });
};

module.exports = {
  registerCtrl,
  loginCtrl,
  userDetailsCtrl,
  profileCtrl,
  uploadProfilePhotoCtrl,
  uploadCoverPhotoCtrl,
  updatePasswordCtrl,
  updateUserCtrl,
  logoutCtrl,
};