import express from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import { signInSchema, signUpSchema } from "../utils/schema.js";
import { signInAction, signUpAction } from "../controllers/authController.js";

const authRoutes = express.Router();

authRoutes.post("/sign-up", validateRequest(signUpSchema), signUpAction);
authRoutes.post("/sign-in", validateRequest(signInSchema), signInAction);

export default authRoutes;
