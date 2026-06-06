import * as z from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, "Preencha o campo!")
      .min(3, "O nome deve ter no mínimo 3 caracteres!"),
  }),
});
