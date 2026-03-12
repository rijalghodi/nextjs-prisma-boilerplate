import { z } from "zod";

export const UserEditSchema = z.object({
  name: z
    .string()
    .nonempty({ message: "Wajib diisi." })
    .max(50, { message: "Panjang maksimal 50 karakter." }),

  email: z.string().email({ message: "Email tidak valid." }),

  role: z.enum(["ADMIN", "GUEST", "SUPERADMIN"]),

  password: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 8, {
      message: "Password must be at least 8 characters long.",
    }),

  avatarFileId: z.string().optional(),
});

export type UserEditSchemaType = z.infer<typeof UserEditSchema>;
