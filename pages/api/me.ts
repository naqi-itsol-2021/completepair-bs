import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@lib/auth";
import prisma from "@lib/prisma";
import { defaultAvatarSrc } from "@lib/profile";
import sessionHandler from '../middlewares/sessionHandler';


export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({req:req});
  const user = await prisma.user.findUnique({
    rejectOnNotFound: true,
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      bio: true,
      timeZone: true,
      weekStart: true,
      startTime: true,
      endTime: true,
      bufferTime: true,
      theme: true,
      createdDate: true,
      hideBranding: true,
      avatar: true,
    },
  });

  user.avatar = user.avatar || defaultAvatarSrc({ email: user.email });

  res.status(200).json({
    user,
  });
}

export default sessionHandler(handler);