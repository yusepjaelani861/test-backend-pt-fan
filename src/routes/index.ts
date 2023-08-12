import express from "express";
import AuthController from "../controllers/auth/auth.controller";
import PresenceController from "../controllers/presences/presence.controller";
import { protect } from "../middleware/protectAuth";

const router = express.Router();

router
  .route("/login")
  .post(AuthController.validator("login"), AuthController.login);

router.route("/presence").get(protect, PresenceController.getPresence);

router
  .route("/presence/absence")
  .post(
    protect,
    PresenceController.validator("absence"),
    PresenceController.absence
  );

router
  .route("/presence/approve-absence")
  .post(
    protect,
    PresenceController.validator("approveAbsence"),
    PresenceController.approveAbsence
  );

// Path: src\routes\index.ts

export default router;
