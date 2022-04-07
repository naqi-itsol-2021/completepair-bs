import { google } from "googleapis";
import type { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "@lib/auth";
import { BASE_URL } from "@lib/config/constants";
import { encodeOAuthState } from './utils';
import sessionHandler from "pages/middlewares/sessionHandler";
import prisma from "@lib/prisma";

const credentials = process.env.GOOGLE_API_CREDENTIALS!;
const scopes = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
];
export async function handler(req:NextApiRequest,res:NextApiResponse){
    if(req.method == 'GET'){
        const session = await getSession({ req: req });
        if (!session) {
            res.status(401).json({ message: "You must be logged in to do this" });
            return;
        }

        const calendarIntegrations = [];
        const { client_secret, client_id } = JSON.parse(credentials).web;
        const redirect_uri = BASE_URL + "/api/integrations/googlecalendar/callback";
        const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uri);
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: scopes,
            prompt: "consent",
            state: encodeOAuthState(req),
        });
        }
}

export default sessionHandler(handler)

