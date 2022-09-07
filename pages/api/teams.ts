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
    const memberships = await prisma.membership.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: { role: "desc" },
    });
    const teams = await prisma.team.findMany({
      where: {
        id: {
          in: memberships.map((membership) => membership.teamId),
        },
      },
    });
    return res.status(200).json({ teams: teams });
  }

  if (req.method === "POST") {
    const slug = slugify(req.body.name);

    const nameCollisions = await prisma.team.count({
      where: {
        OR: [{ name: req.body.name }, { slug: slug }],
      },
    });

    if (nameCollisions > 0) {
      return res.status(409).json({ errorCode: "TeamNameCollision", message: "Team name already taken." });
    }

    const createTeam = await prisma.team.create({
      data: {
        name: req.body.name,
        slug: slug,
        bio:  req.body.bio,
      },
    });

    await prisma.membership.create({
      data: {
        teamId: createTeam.id,
        userId: session.user.id,
        role: "OWNER",
        accepted: true,
      },
    });

    return res.status(201).json({ message: "Team created" });
  }

  res.status(404).json({ message: "Team not found" });
}
export default sessionHandler(handler);
