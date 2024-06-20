import { Request, Response } from "express";
import { response, supabase, prisma, eventEmitter } from "./../../utils";
import {
  teraphistLoginSchema,
  terpahistSignupSchema,
  updateLoginSchema,
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

    return response(res, 200, authResponse.data.url);
  }

  static async updateUserLoginData(req: Request, res: Response) {
    const value = await updateLoginSchema.validateAsync(req.body);

    const { email, name, role, googleId } = value;

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
}
