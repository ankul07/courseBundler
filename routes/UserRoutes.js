import express from "express";
import {
  login,
  logout,
  register,
  getMyProfile,
  changePassword,
  updateProfiles,
  updateProfilesPictures,
  forgetPassword,
  resetPassword,
  addToPlayList,
  removeToPlayList,
  getAllUsers,
  updateUserRole,
  removeUser,
  removeMyProfile,
} from "../controllers/userController.js";
import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/register").post(singleUpload, register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated, getMyProfile);
// delte my profile
router.route("/me").delete(isAuthenticated, removeMyProfile);
router.route("/changepassword").put(isAuthenticated, changePassword);
router.route("/updateprofile").put(isAuthenticated, updateProfiles);
router
  .route("/updateprofilepicture")
  .put(isAuthenticated, singleUpload, updateProfilesPictures);
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);
router.route("/addtoplaylist").post(isAuthenticated, addToPlayList);
router.route("/removefromplaylist").delete(isAuthenticated, removeToPlayList);

//admin routes here

router.route("/admin/users").get(isAuthenticated, authorizeAdmin, getAllUsers)
router.route("/admin/user/:id").put(isAuthenticated, authorizeAdmin, updateUserRole).delete(isAuthenticated, authorizeAdmin, removeUser)
export default router;
