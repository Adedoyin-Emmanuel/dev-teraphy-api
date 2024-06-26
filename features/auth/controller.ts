import { Request, Response } from "express";
import {
  response,
  supabase,
  prisma,
  eventEmitter,
  generateAccessToken,
} from "./../../utils";
import {
  teraphistLoginSchema,
  terpahistSignupSchema,
  updateLoginSchema,
  verifyOtpSchema,
} from "./schema";
import bcrypt from "bcryptjs";
import { TERAPHIST_CREATED } from "../../constants/app";

class AuthController {
  static async login(req: Request, res: Response) {
    const authResponse = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/auth/callback?next=/app",
      },
    });

    if (authResponse.error) {
      return response(res, 500, authResponse.error.message);
    }

    return response(res, 200, "Login successful", authResponse.data.url);
  }

  static async updateUserLoginData(req: Request, res: Response) {
    const value = await updateLoginSchema.validateAsync(req.body);

    const { email, name, role, googleId } = value;

    const existingUser = await prisma.user.findFirst({
      where: {
        googleId,
      },
    });

    if (existingUser) {
      return response(res, 200, "User updated successfully");
    }

    const user = await prisma.user.create({
      // @ts-ignore
      data: {
        email,
        name,
        role,
        googleId,
        verified: true,
      },
    });

    return response(res, 200, "User updated successfully");
  }

  static async teraphistSignup(req: Request, res: Response) {
    const value = await terpahistSignupSchema.validateAsync(req.body);

    const { email, name, password } = value;

    const existingTeraphist = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (existingTeraphist)
      return response(res, 400, "Teraphist with this email already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const teraphist = await prisma.user.create({
      // @ts-ignore
      data: {
        email,
        name,
        role: "teraphist",
        password: hashedPassword,
      },
    });

    const teraphistId = await teraphist.id;

    eventEmitter.emit(TERAPHIST_CREATED, { email, name, teraphistId });

    return response(
      res,
      201,
      "Teraphist created successfully, An OTP has been sent to your email"
    );
  }

  static async verifyOtp(req: Request, res: Response) {
    const value = await verifyOtpSchema.validateAsync(req.body);

    const { otp } = value;

    const token = await prisma.token.findFirst({
      where: {
        token: otp,
        type: "verify",
      },
    });

    if (!token) {
      return response(res, 400, "Invalid or expired OTP");
    }

    const teraphist = await prisma.user.findFirst({
      where: {
        id: token.userId,
      },
    });

    await prisma.user.update({
      where: {
        id: teraphist?.id,
      },
      data: {
        verified: true,
      },
    });

    await prisma.token.deleteMany({
      where: {
        userId: teraphist?.id,
        type: "verify",
      },
    });

    return response(res, 200, "OTP verified successfully");
  }

  static async terahpistLogin(req: Request, res: Response) {
    const value = await teraphistLoginSchema.validateAsync(req.body);

    const { email, password } = value;

    const teraphist = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!teraphist) {
      return response(res, 400, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      teraphist.password as string
    );

    if (!isPasswordValid) {
      return response(res, 400, "Invalid credentials");
    }

    const { id, role, email: terahpistEmail } = await teraphist;

    const payload = {
      id,
      role,
      email: terahpistEmail,
    };
    const tokens = await generateAccessToken(res, payload);
    return response(res, 200, "Login successful", tokens);
  }
}

export default AuthController;
