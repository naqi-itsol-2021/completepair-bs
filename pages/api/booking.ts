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
    let shopifystore:string = `${req.query.shopifystore}`;
    console.log("faraz",shopifystore);
    const Booking = await prisma.booking.findMany({
      include: { 
        user: true,
        eventType: true,
        attendees: true,
      },
      where: {
        store: shopifystore,
      },
    });

    return res.status(200).json({ Bookings: Booking });
  }

  if (req.method == "POST") {
    if(req.body.userdata){
      console.log("asa",req.body.userdata) 
    }

    const Booking = await prisma.booking.findMany({
      where: {
        userId: req.body.selectedmemberid,
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
