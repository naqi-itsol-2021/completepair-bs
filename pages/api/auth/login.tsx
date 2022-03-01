import { getSession } from "next-auth/react"
import prisma from "@lib/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import { getCsrfToken } from "next-auth/react";
import jwt from "jsonwebtoken";
import { verifyPassword } from "@lib/auth";
import sessionHandler from '../../middlewares/sessionHandler';

export async function handler(req: NextApiRequest, res: NextApiResponse) {
    if(req.method == "POST"){
        const csrfToken = await getCsrfToken({req})
        const session = await getSession({req:req})
        if(session){
            return res.status(200).json(session);
        }
        const credentials = {
            email:req.body.email,
            password:req.body.password,
        }
        if (!credentials) {
            return res.status(401).json({message:"Credentials Missing"})
        }
        if (!credentials.password) {
            return res.status(401).json({message:"Password Missing"})
        }
        const user = await prisma.user.findUnique({
            where: {
                email: credentials.email,
            }
        });
        
        if(user){
            const isCorrectPassword = await verifyPassword(credentials.password, user.password);
            if (!isCorrectPassword) {
                return res.status(401).json({message:"Password Incorrect"})
            }
            // if all fine, lets return the session 
            const userSession = {
                "id":user.id,
                "username":user.username,
                "email":user.email
            }
            const token = jwt.sign(userSession,'secret',{ algorithm: 'HS512' });
            return res.status(200).json(token)
        }
        return res.status(401).json({message:"No User found with provided email adddress"});
    }
    return res.status(405).json({message:'Method not supported on this endpoint.'});
}

export default sessionHandler(handler);