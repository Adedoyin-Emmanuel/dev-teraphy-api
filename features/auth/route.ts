import express from "express";

const authRouter = express.Router();

authRouter.post("/login/google");

authRouter.post("/signup/teraphist");
authRouter.post("/login/teraphist");

export default authRouter;
