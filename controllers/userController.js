import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { User } from "../models/User.js";
import { sentToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Course } from "../models/Course.js";
import crypto from "crypto";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "cloudinary";
import { Stats } from "../models/Stats.js";

export const register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password || !file) {
    return next(new ErrorHandler("please enter all field", 400));
  }
  let user = await User.findOne({ email });
  if (user) return next(new ErrorHandler("User already exist", 409));

  // upload file on cloudinary

  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  sentToken(res, user, "Register Succesfully", 201);
});

export const login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  // const file = req.file;
  if (!email || !password) {
    return next(new ErrorHandler("please enter all field", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) return next(new ErrorHandler("Incorrect email or Password", 409));

  const isMatch = await user.comparePassword(password);
  if (!isMatch)
    return next(new ErrorHandler("Incorrect email or Password", 409));

  sentToken(res, user, `welcome back ${user.name}`, 200);
});

export const logout = catchAsyncError(async (req, res, next) => {
  const options = {
    expires: new Date(Date.now()),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };
  res
    .status(200)
    .cookie("token", null, options)
    .json({ success: true, message: "User lOgout succesfully" });
});

export const getMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("please enter all field", 400));
  }
  const user = await User.findById(req.user._id).select("+password");
  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler("incorrect Old password", 400));
  }
  user.password = newPassword;
  await user.save();
  res
    .status(200)
    .json({ success: true, user, message: "password change succesfully" });
});

export const updateProfiles = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;

  if (email) user.email = email;

  await user.save();
  res
    .status(200)
    .json({ success: true, user, message: "profile change succesfully" });
});
export const updateProfilesPictures = catchAsyncError(
  async (req, res, next) => {
    const file = req.file;
    const user = await User.findById(req.user._id);
    const fileUri = getDataUri(file);
    const myCloud = await cloudinary.v2.uploader.upload(fileUri.content);

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
    await user.save();
    res
      .status(200)
      .json({ success: true, user, message: "profile change succesfully" });
  }
);

export const forgetPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return next(new ErrorHandler("user not found", 400));

  const resettoken = await user.getResetToken();
  await user.save();
  const url = `${process.env.FRONTEND_URL}/resetpassword/${resettoken}`;
  const message = `Click the link to reset your password ${url} . if you are not request then please ignore`;
  await sendEmail(user.email, "Course Bundler Reset Password", message);
  res.status(200).json({ message: `reset token has sent to ${email}` });
});

export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user) {
    return next(new ErrorHandler("Token is invalid or has been expired", 401));
  }
  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();
  console.log;
  res
    .status(200)
    .json({ success: true, message: "password succesfully changed" });
});

export const addToPlayList = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const course = await Course.findById(req.body.id);
  if (!course) return next(new ErrorHandler("invalid course id", 404));

  const itemExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) return true;
  });
  if (itemExist) return next(new ErrorHandler("Item already exist", 409));

  user.playlist.push({ course: course._id, poster: course.poster.url });
  await user.save();

  res.status(200).json({ success: true, message: "Added to playlist" });
});

export const removeToPlayList = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne(req.user_id);
  const course = await Course.findById(req.query.id);
  if (!course) return next(new ErrorHandler("invalid course id", 404));

  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });
  user.playlist = newPlaylist;
  await user.save();

  res.status(200).json({ success: true, message: "Remove from playlist" });
});

// admin controllers

export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({ success: true, users });
});

export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("user not found", 400));
  }

  if (user.role === "user") {
    user.role = "admin";
  } else {
    user.role = "user";
  }

  await user.save();

  res.status(200).json({ success: true, message: "role updated" });
});

export const removeUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("user not found", 400));
  }

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  //cancel user subscription
  await user.deleteOne();

  res.status(200).json({ success: true, message: "user deleted succesfully " });
});

export const removeMyProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  await cloudinary.v2.uploader.destroy(user.avatar.public_id);
  //cancel user subscription
  await user.deleteOne();

  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
    })
    .json({ success: true, message: "user deleted succesfully " });
});

User.watch().on("change", async () => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(1);

  const subscription = await User.find({ "subscription.status": "active" });

  stats[0].users = await User.countDocuments();
  stats[0].subscription = subscription.length;
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
