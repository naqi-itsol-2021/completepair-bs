import * as z from "zod"
import * as imports from "../zod-utils"
import { CompleteFeilds, FeildsModel } from "./index"

export const _ValuesModel = z.object({
  id: z.number().int(),
  feildid: z.number().int(),
  Label: z.string(),
  value: z.string(),
  selected: z.boolean(),
  createdAt: z.date(),
})

export interface CompleteValues extends z.infer<typeof _ValuesModel> {
  Feilds: CompleteFeilds
}

/**
 * ValuesModel contains all relations on your model in addition to the scalars
 *
 * NOTE: Lazy required in case of potential circular dependencies within schema
 */
export const ValuesModel: z.ZodSchema<CompleteValues> = z.lazy(() => _ValuesModel.extend({
  Feilds: FeildsModel,
}))
