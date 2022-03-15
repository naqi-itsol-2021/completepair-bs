import * as z from "zod"
import * as imports from "../zod-utils"
import { MembershipRole } from "@prisma/client"
import { CompleteUser, UserModel, CompleteFeilds, FeildsModel } from "./index"

export const _QuestionModel = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  Question: z.string(),
  role: z.nativeEnum(MembershipRole),
  Isactive: z.boolean(),
  createdAt: z.date(),
})

export interface CompleteQuestion extends z.infer<typeof _QuestionModel> {
  User: CompleteUser
  Feilds: CompleteFeilds[]
}

/**
 * QuestionModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const QuestionModel: z.ZodSchema<CompleteQuestion> = z.lazy(() => _QuestionModel.extend({
  User: UserModel,
  Feilds: FeildsModel.array(),
}))
