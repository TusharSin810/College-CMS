import z from "zod"

export const SignupSchema = z.object({
    email: z.string(),
    password: z.string()
});

export const CreateUserSchema = z.object({
    email: z.string(),
    password: z.string(),
    phone: z.number()
})

export const SendSchema = z.object({
    to: z.string(),
    amount: z.number(),
});