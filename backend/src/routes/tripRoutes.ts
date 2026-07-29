import { Router } from "express";
import {
  createTrip,
  getTrips,
  getTripById,
  deleteTrip,
  addActivity,
  removeActivity,
  regenerateDay,
} from "../controllers/tripController";
import { protect } from "../middleware/auth";

const router = Router();

// All trip routes require authentication; ownership is enforced in the controller.
router.use(protect);

router.route("/").get(getTrips).post(createTrip);
router.route("/:id").get(getTripById).delete(deleteTrip);

router.post("/:id/activities", addActivity);
router.delete("/:id/days/:dayNumber/activities/:activityId", removeActivity);
router.post("/:id/days/:dayNumber/regenerate", regenerateDay);

export default router;
