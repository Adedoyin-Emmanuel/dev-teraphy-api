import { eventEmitter, generateOTP, prisma } from "../utils";
import { TERAPHIST_CREATED } from "../constants/app";
import sendEmail from "../services/email/sendEmail";
import dayjs from "dayjs";

eventEmitter.on(TERAPHIST_CREATED, async (data) => {
  console.log(data);

  const { email, name, teraphistId } = data;
  const OTP = generateOTP();

  await prisma.token.create({
    data: {
      token: OTP,
      userId: teraphistId,
      type: "verify",
      expiresBy: dayjs().add(1, "day").toDate(),
    },
  });

  const message = `Hi ${name}. Thanks for signing up as a teraphist, Below is your OTP
    <h1>${OTP}</h1>
    `;

  await sendEmail("Verify account", message, email);
});
