import { NextPageContext } from "next";

import { getSession } from "@lib/auth";
import prisma from "@lib/prisma";

function RedirectPage() {
  return;
}

export async function getServerSideProps(context: NextPageContext) {
  const session = await getSession(context);

  if (!session?.user?.id) {
    return { redirect: { permanent: false, destination: "/auth/login" } };
  }
  let User = await prisma.user.findFirst({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      username: true,
      name: true,
      email: true,
      bio: true,
      avatar: true,
      timeZone: true,
      completedOnboarding: true,
      selectedCalendars: {
        select: {
          externalId: true,
          integration: true,
        },
      },
    },
  });
  if (User && User?.completedOnboarding) {
    console.log("FINAL_TESTTT_________________________________3", "ififi");

    return { redirect: { permanent: false, destination: "/event-types" } };
  } else {
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$444");
    return { redirect: { permanent: false, destination: "/getting-started" } };
  }
}

export default RedirectPage;
