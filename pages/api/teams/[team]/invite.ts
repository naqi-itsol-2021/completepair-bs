import { MembershipRole } from "@prisma/client";
import { randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

import { getSession } from "@lib/auth";
import { WEBSITE_URL } from "@lib/config/constants";
import { sendTeamInviteEmail } from "@lib/emails/email-manager";
import { TeamInvite } from "@lib/emails/templates/team-invite-email";
import prisma from "@lib/prisma";
import slugify from "@lib/slugify";

import { getTranslation } from "@server/lib/i18n";

import sessionHandler from "pages/middlewares/sessionHandler";

export async function handler(req: NextApiRequest, res: NextApiResponse) {
  const t = await getTranslation(req.body.language ?? "en", "common");
  console.log("rrr", req.body)
  if (req.method !== "POST") {
    return res.status(400).json({ message: "Bad request" });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  const team = await prisma.team.findFirst({
    where: {
      id: parseInt(req.query.team as string),
    },
  });

  if (!team) {
    return res.status(404).json({ message: "Invalid team" });
  }

  const reqBody = req.body as {
    usernameOrEmail: string;
    role: MembershipRole;
    sendEmailInvitation: boolean;
  };
  
  const { role, sendEmailInvitation } = reqBody;
  // liberal email match
  const isEmail = (str: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
  const usernameOrEmail = isEmail(reqBody.usernameOrEmail)
    ? reqBody.usernameOrEmail.toLowerCase()
    : slugify(reqBody.usernameOrEmail);

  const invitee = await prisma.user.findFirst({
    where: {
      OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    },
  });
  
  if (!invitee) {
    
    const email = isEmail(usernameOrEmail) ? usernameOrEmail : undefined;
    if (!email) {
      return res.status(400).json({
        message: `Invite failed because there is no corresponding user for ${usernameOrEmail}`,
      });
    }
    await prisma.user.create({
      data: {
        email,
        teams: {
          create: {
            team: {
              connect: {
                id: parseInt(req.query.team as string),
              },
            },
            role,
          },
        },
      },
    });

    const token: string = randomBytes(32).toString("hex");

    await prisma.verificationRequest.create({
      data: {
        identifier: usernameOrEmail,
        token,
        expires: new Date(new Date().setHours(168)), // +1 week
      },
    });
    console.log("faraz",req.body.sendEmailInvitation);
    if (session?.user?.username && team?.name) {
      const teamInviteEvent: TeamInvite = {
        language: t,
        from: session.user.username,
        to: usernameOrEmail,
        teamName: team.name,
        joinLink: `${WEBSITE_URL}/auth/signup?token=${token}&callbackUrl=${WEBSITE_URL + "/settings/teams"}`,
      };
      console.log("send invitee email");
      await sendTeamInviteEmail(teamInviteEvent);
      console.log("done invitee email");
    }

    return res.status(201).json({});
  }
  
  // create provisional membership
  try {
    console.log("farazgayaifme",req.body.sendEmailInvitation);
    await prisma.membership.create({
      data: {
        teamId: parseInt(req.query.team as string),
        userId: invitee.id,
        role,
      },
    });
  } catch (err: any) {
    if (err.code === "P2002") {
      // unique constraint violation
      return res.status(409).json({
        message: "This user is a member of this team / has a pending invitation.",
      });
    } else {
      throw err; // rethrow
    }
  }
  
  // inform user of membership by email
  console.log("farazend",sendEmailInvitation,session?.user?.username,team?.name);
  if (sendEmailInvitation && session?.user?.username && team?.name) {
    const teamInviteEvent: TeamInvite = {
      language: t,
      from: session.user.username,
      to: usernameOrEmail,
      teamName: team.name,
      joinLink: WEBSITE_URL + "/settings/teams",
    };
    console.log("send invitee email");
    await sendTeamInviteEmail(teamInviteEvent);
    console.log("after send invitee email");
  }

  res.status(201).json({});
}

export default sessionHandler(handler);