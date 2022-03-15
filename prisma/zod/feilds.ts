import * as z from "zod"
import * as imports from "../zod-utils"
import { CompleteQuestion, QuestionModel, CompleteValues, ValuesModel } from "./index"

export const _FeildsModel = z.object({
  id: z.number().int(),
  questionid: z.number().int(),
  type: z.string(),
  label: z.string(),
  access: z.boolean(),
  subtype: z.string(),
  createdAt: z.date(),
})

export interface CompleteFeilds extends z.infer<typeof _FeildsModel> {
  Question: CompleteQuestion
  Values: CompleteValues[]
}

/**
 * FeildsModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const FeildsModel: z.ZodSchema<CompleteFeilds> = z.lazy(() => _FeildsModel.extend({
  Question: QuestionModel,
  Values: ValuesModel.array(),
}))
