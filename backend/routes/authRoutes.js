import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// TEMPORARY — just to test the middleware. We'll remove or repurpose this later.
router.get("/profile", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
