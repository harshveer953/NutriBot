import cron from "node-cron";
import User from "../models/User.js";

const startCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      await User.updateMany({}, { $set: { todayWaterMl: 0, todaySteps: 0 } });
      console.log("Daily reset cron executed");
    } catch (error) {
      console.error("Cron error:", error.message);
    }
  });
};

export default startCronJobs;