import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@lib/auth";
import sessionHandler from "pages/middlewares/sessionHandler";
import prisma from "@lib/prisma";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== 'GET') return res.status(405).json({message:'Method not supported on this endpoint'});
  const session = await getSession({ req });
  if (!session || !session.user || !session.user.email) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }
  // run some conditions
  if(!req.query?.id) res.status(405).json({message:"No User ID Provided"})
  if(isNaN(req.query.id)) res.status(405).json({message:"User ID not valid, must be an integer"})
  if(req.query.id == 0) res.status(405).json({message:'User ID must not be zero'})
  const user = await prisma.user.findUnique({where: {id: parseInt(req.query.id)}})
  if(!user) res.status(404).json({message:"No User found with this ID"})

  // finally give availabilities
  const availabilities = await prisma.availability.findMany({
    where: {
        userId: parseInt(req.query.id),
    }
  })
  res.status(200).json(availabilities)
}

export default sessionHandler(handler)