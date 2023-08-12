import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/ErrorHandler.js";
import { sendEmail } from "../utils/sendEmail.js";
import { Stats } from "../models/Stats.js";

export const contact = catchAsyncError(async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return next(new ErrorHandler("all fields are mandatory", 400));
  }
  const to = process.env.MY_MAIL;
  const subject = "contact from courseBundler ";
  const text = `I am ${name} and my ${email}.\n${message} `;

  await sendEmail(to, subject, text);
  res
    .status(200)
    .json({ success: true, message: "your message has been sent" });
});

export const courseRequest = catchAsyncError(async (req, res, next) => {
  const { name, email, course } = req.body;
  if (!name || !email || !course) {
    return next(new ErrorHandler("all fields are mandatory", 400));
  }
  const to = process.env.MY_MAIL;
  const subject = "Request a course from courseBundler ";
  const text = `I am ${name} and my ${email}.\n${course} is `;

  await sendEmail(to, subject, text);
  res
    .status(200)
    .json({ success: true, message: "your Request has been sent" });
});

export const getDashboardStatus = catchAsyncError(async (req, res, next) => {
  const stats = await Stats.find({}).sort({ createdAt: "desc" }).limit(12);

  const statusData = [];

  for (let i = 0; i < stats.length; i++) {
    statusData.unshift(stats[i]);
  }
  const requiredSize = 12 - stats.length;
  for (let i = 0; i < requiredSize; i++) {
    statusData.unshift({
      users: 0,
      subscription: 0,
      views: 0,
    });
  }

  const userCount = statusData[11].users;
  const subscriptionCount = statusData[11].subscription;
  const viewsCount = statusData[11].views;

  let userPercentage = 0,
    viewsPercentage = 0,
    subscriptionPercentage = 0;

  let userProfit = true,
    viewsProfit = true,
    subscriptionProfit = true;

  if (statusData[10].users === 0) userPercentage = userCount * 100;
  if (statusData[10].views === 0) viewsPercentage = viewsCount * 100;
  if (statusData[10].subscription === 0)
    subscriptionPercentage = subscriptionCount * 100;
  else {
    const difference = {
      users: statusData[11].users - statusData[10].users,
      views: statusData[11].views - statusData[10].views,
      subscription: statusData[11].subscription - statusData[10].subscription,
    };
    userPercentage = (difference.users / statusData[10].users) * 100;
    viewsPercentage = (difference.views / statusData[10].views) * 100;
    subscriptionPercentage =
      (difference.subscription / statusData[10].subscription) * 100;

    if (userPercentage < 0) userProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionPercentage < 0) subscriptionProfit = false;
  }
  res.status(200).json({
    success: true,
    stats: statusData,
    userCount,
    subscriptionCount,
    viewsCount,
    subscriptionPercentage,
    viewsPercentage,
    userPercentage,
    subscriptionProfit,
    viewsProfit,
    userProfit,
  });
});
