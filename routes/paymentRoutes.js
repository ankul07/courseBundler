import express from "express";
import { isAuthenticated, authorizeSubscribers } from "../middlewares/auth.js";
import { cancelSubscription, createSubscription, getRazorpayKey, paymentVerification } from "../controllers/paymentController.js";
const router = express.Router();

router.route("/subscribe").get(isAuthenticated, createSubscription)
router.route("/paymentverificatin").post(isAuthenticated, paymentVerification)
router.route("/razorpaykey").get(getRazorpayKey)
router.route("/subscribe/cancel").delete(isAuthenticated, authorizeSubscribers, cancelSubscription)

export default router;