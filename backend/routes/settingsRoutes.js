import express from "express";
import {
  getUserSettings,
  updateSettings,
} from "../controllers/settingsControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, getUserSettings).put(protect, updateSettings);

export default router;
