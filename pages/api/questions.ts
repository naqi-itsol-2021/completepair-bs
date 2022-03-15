import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@lib/auth";
import prisma from "@lib/prisma";
import slugify from "@lib/slugify";
import { trpc } from "@lib/trpc";

import sessionHandler from "../middlewares/sessionHandler";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req: req });
  if (!session?.user?.id) {
    res.status(401).json({ message: "questions Not authenticated" });
    return;
  }

  // Created to fetch all teams by User ID
  if (req.method == "GET") {
    const questions = await prisma.question.findMany({
      where: {
        userId: session.user.id,
      },
      include: { Feilds: { include: { Values: true } } },
    });
    // const teams = await prisma.team.findMany({
    //   where: {
    //     id: {
    //       in: memberships.map((membership) => membership.teamId),
    //     },
    //   },
    // });
    return res.status(200).json({ questions: questions });
  }

  if (req.method === "POST") {
    let Answer = [];
    Answer = req.body.Question;
    console.log("uhu", req.body);
    const questionCollisions = await prisma.question.count({
      where: {
        Question: req.body.Answer.Question,
      },
    });

    if (questionCollisions > 0) {
      return res.status(409).json({ errorCode: "QuestionCollision", message: "Question already Exist." });
    }

    const createQuestion = await prisma.question.create({
      data: {
        userId: session.user.id,
        Question: req.body.Answer[0],
        role: "OWNER",
        Isactive: true,
      },
    });

    const createFeilds = await prisma.feilds.create({
      data: {
        questionid: createQuestion.id,
        type: req.body.type,
        label: req.body.label,
        subtype: req.body.subtype,
        access: true,
      },
    });
    Answer.shift();
    const createManyPosts = await Answer.map((ans) =>
      prisma.values.create({
        data: {
          feildid: createFeilds.id,
          Label: ans,
          value: ans,
          selected: true,
        },
      })
    );

    return res.status(201).json({ message: "Question created" });
  }

  res.status(404).json({ message: "Team not found" });
}
export default sessionHandler(handler);
