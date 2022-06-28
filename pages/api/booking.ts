import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@lib/auth";
import prisma from "@lib/prisma";
import slugify from "@lib/slugify";
import { trpc } from "@lib/trpc";

import sessionHandler from "../middlewares/sessionHandler";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req: req });
  if (!session?.user?.id) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  // Created to fetch all teams by User ID
  if (req.method == "GET") {
    const Booking = await prisma.booking.findMany({
      include: { user: true },
      where: {
        userId: session.user.id,
      },
    });

    return res.status(200).json({ Bookings: Booking });
  }

  if (req.method == "POST") {
    const Booking = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: req.body.date,
        },
      },
    });

    return res.status(200).json({ Bookings: Booking });
  }

  res.status(404).json({ message: "Booking not found" });
}
export default sessionHandler(handler);
