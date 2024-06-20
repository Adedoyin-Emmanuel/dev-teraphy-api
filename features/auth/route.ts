import express from "express";
import AuthController from "./controller";

const authRouter = express.Router();

authRouter.post("/login/google", AuthController.login);

authRouter.post("/signup/teraphist", AuthController.teraphistSignup);
authRouter.post("/login/teraphist", AuthController.terahpistLogin);

export default authRouter;
