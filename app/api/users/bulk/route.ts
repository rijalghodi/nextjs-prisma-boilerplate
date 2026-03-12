import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { toBaseResponse, toErrorResponse } from "@/lib/response-helper";
import { withRole } from "@/services/auth.service";

const BulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID is required."),
});

// ─── DELETE /api/users/bulk ─────────────────────────────────────────────────

export const DELETE = withRole(
  [UserRole.SUPERADMIN],
  async (request: NextRequest, _context: any, session: any) => {
    try {
      const body = await request.json();
      const parsedData = BulkDeleteSchema.safeParse(body);

      if (!parsedData.success) {
        return NextResponse.json(
          toErrorResponse({ message: parsedData.error.errors[0]?.message ?? "Invalid input." }),
          { status: 400 }
        );
      }

      const { ids } = parsedData.data;

      // Prevent self-deletion
      const selfUser = session?.user?.email
        ? await prisma.user.findUnique({ where: { email: session.user.email } })
        : null;
      const safeIds = selfUser ? ids.filter((id) => id !== selfUser.id) : ids;

      const { count } = await prisma.user.deleteMany({
        where: { id: { in: safeIds } },
      });

      return NextResponse.json(
        toBaseResponse({ message: `${count} user(s) deleted successfully.` })
      );
    } catch {
      return NextResponse.json(
        toErrorResponse({ message: "Terjadi kesalahan. Mohon coba lagi. in a moment." }),
        { status: 500 }
      );
    }
  }
);
