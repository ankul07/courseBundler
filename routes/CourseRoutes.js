import express from "express";
import {
  addLecture,
  createCourse,
  deleteCourse,
  deleteLecture,
  getAllCourses,
  getCourseLectures,
} from "../controllers/coursesController.js";
import singleUpload from "../middlewares/multer.js";
import { authorizeAdmin, isAuthenticated, authorizeSubscribers } from "../middlewares/auth.js";
const router = express.Router();

// Get all course
router.route("/courses").get(getAllCourses);

// Create courses
router
  .route("/createcourse")
  .post(isAuthenticated, authorizeAdmin, singleUpload, createCourse);

// Create courses
router
  .route("/course/:id")
  .get(isAuthenticated, authorizeSubscribers, getCourseLectures)
  .post(isAuthenticated, singleUpload, addLecture)
  .delete(isAuthenticated, authorizeAdmin, deleteCourse);

router.route("/lecture").delete(isAuthenticated, authorizeAdmin, deleteLecture);
export default router;
