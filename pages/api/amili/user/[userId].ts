import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";
import { User } from ".prisma/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updateHealthCoach = async (req: NextApiRequest, res: NextApiResponse): Promise<User | any> => {
  const { userId } = req.query;
  const data = req.body;
  const { name, bio, timeZone, email } = data;

  const updateData = {};
  if (name) updateData["name"] = name;
  if (bio) updateData["bio"] = bio;
  if (timeZone) updateData["timeZone"] = timeZone;
  if (email) updateData["email"] = email;

  // Check valid method
  if (req.method !== "PATCH") res.status(405).json({});

  // Check valid email
  const existingUser = await prisma.user.findFirst({
    where: {
      id: +userId as any,
    },
  });

  if (!existingUser) return res.status(404).json({ message: "UserId is not found" });

  // Update user
  const user = await prisma.user.update({
    data: updateData,
    where: {
      id: +userId as any,
    },
  });

  return res.status(200).json({ user });
};

export default updateHealthCoach;
