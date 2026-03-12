import { NextRequest, NextResponse } from "next/server";
import { generateHash } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma";
import { toBaseResponse, toErrorResponse } from "@/lib/response-helper";
import { sendEmail } from "@/services/send-email";
import { ChangePasswordApiSchema } from "@/app/(auth)/forms/change-password-schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChangePasswordApiSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        toErrorResponse({ message: parsed.error.errors[0]?.message ?? "Invalid input." }),
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    const verificationToken = await prisma.verificationToken.findUnique({ where: { token } });
    if (!verificationToken || verificationToken.expires < new Date()) {
      return NextResponse.json(toErrorResponse({ message: "Invalid or expired token." }), {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: verificationToken.identifier } });
    if (!user) {
      return NextResponse.json(toErrorResponse({ message: "Pengguna tidak ditemukan." }), {
        status: 404,
      });
    }

    const hashedPassword = await generateHash(newPassword);

    // Update password and delete token atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({ where: { token } }),
    ]);

    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful",
      content: {
        title: `Hello, ${user.name}`,
        subtitle: "Your password has been successfully updated.",
      },
    });

    return NextResponse.json(toBaseResponse({ message: "Password reset successful." }), {
      status: 200,
    });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json(toErrorResponse({ message: "Password reset failed." }), {
      status: 500,
    });
  }
}
