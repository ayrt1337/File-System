import * as z from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Preencha o campo!").email("Email inválido!"),
    password: z
      .string()
      .min(1, "Preencha o campo!")
      .min(6, "A senha deve ter no mínimo 6 caracteres!"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z
      .string()
      .min(1, "Preencha o campo!")
      .min(6, "A senha deve ter no mínimo 6 caracteres!"),
  }),
});

export const sendEmailSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Preencha o campo!").email("Email inválido!"),
  }),
});
