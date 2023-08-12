import express from "express";

import { authorizeAdmin, isAuthenticated } from "../middlewares/auth.js";
import { contact, courseRequest, getDashboardStatus } from "../controllers/otherControllers.js";


const router = express.Router();

router.route("/contact").post(contact)
router.route("/courserequest").post(courseRequest)
router.route("/admin/stats").get(isAuthenticated, authorizeAdmin, getDashboardStatus)
export default router;
