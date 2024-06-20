import jwt, { SignOptions } from "jsonwebtoken";
import { Response } from "express";
import { prisma, response } from "./";
import dayjs from "dayjs";

interface ITokenPayload {
  id: string;
  email: string;
  role: "user" | "teraphist";
}

const generateAccessToken = async (res: Response, data: ITokenPayload) => {
  const JWT_SECRET: any = process.env.JWT_PRIVATE_KEY;
  const tokenExpiration: string = "1hr";

  const options: SignOptions = {
    expiresIn: tokenExpiration,
  };

  const { id, email, role } = data;

  const user = await prisma.user.findFirst({
    where: {
      id,
    },
  });

  if (!user) return response(res, 404, "User not found");

  const existingToken = await prisma.token.findFirst({
    where: {
      userId: id,
      type: "refresh",
    },
  });

  if (dayjs().isAfter(dayjs(existingToken?.expiresBy))) {
    await prisma.token.deleteMany({
      where: {
        userId: id,
        type: "refresh",
      },
    });

    return response(res, 401, "Token expired");
  }
  const payload = {
    id,
    role,
    email,
  };

  const token = jwt.sign(payload, JWT_SECRET, options);

  const refreshToken =
    existingToken?.token || jwt.sign(payload, JWT_SECRET, { expiresIn: "90d" });

  if (!existingToken) {
    await prisma.token.create({
      data: {
        token: refreshToken,
        userId: id,
        type: "refresh",
        expiresBy: dayjs().add(90, "days").toISOString(),
      },
    });
  }
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: dayjs().add(1, "hour").toDate(),
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    expires: dayjs().add(90, "days").toDate(),
    path: "/",
  });
  return {
    accessToken: token,
    refreshToken,
  };
};

export default generateAccessToken;
