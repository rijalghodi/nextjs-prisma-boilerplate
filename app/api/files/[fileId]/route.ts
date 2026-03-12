import { NextRequest, NextResponse } from "next/server";
import { FileResponse } from "@/types/file.type";
import { prisma } from "@/lib/prisma";
import { toBaseResponse, toErrorResponse } from "@/lib/response-helper";
import { getPresignedFileUrl } from "@/lib/s3-util";
import { withAuth } from "@/services/auth.service";

type Params = { params: Promise<{ fileId: string }> };

export const GET = withAuth(async (_req: NextRequest, { params }: Params) => {
  const { fileId } = await params;

  try {
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json(toErrorResponse({ message: "File tidak ditemukan." }), {
        status: 404,
      });
    }

    const fileUrl = await getPresignedFileUrl(file.path);

    const mappedFile: FileResponse = {
      id: file.id,
      name: file.name || undefined,
      path: file.path,
      url: fileUrl,
      mimeType: file.mimeType || undefined,
      size: file.size || undefined,
      createdAt: file.createdAt.toISOString(),
      updatedAt: file.updatedAt.toISOString(),
    };

    return NextResponse.json(toBaseResponse({ data: mappedFile }));
  } catch (error: any) {
    console.error("Fetch file error:", error);
    return NextResponse.json(
      toErrorResponse({ message: "Terjadi kesalahan. Mohon coba lagi. in a moment." }),
      { status: 500 }
    );
  }
});
