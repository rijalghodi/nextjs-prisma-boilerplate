import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { z } from "zod";
import { FileResponse } from "@/types/file.type";
import { User, UserRole } from "@/types/user.type";
import { generateHash } from "@/lib/bcrypt";
import { prisma } from "@/lib/prisma";
import {
  toBaseResponse,
  toErrorResponse,
  toPaginatedResponse,
  zodIssuesToErrorDetails,
} from "@/lib/response-helper";
import { getPresignedFileUrl } from "@/lib/s3-util";
import { withRole } from "@/services/auth.service";
import { UserAddSchema, UserAddSchemaType } from "@/app/forms/user-add-schema";

const QuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).default(10),
  query: z.string().default(""),
  sort: z.string().default("name"),
  dir: z.enum(["asc", "desc"]).default("asc"),
  status: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
});

export const GET = withRole([UserRole.SUPERADMIN, UserRole.ADMIN], async (req: NextRequest) => {
  const raw = Object.fromEntries(req.nextUrl.searchParams);
  const params = QuerySchema.safeParse(raw);

  if (!params.success) {
    return NextResponse.json(
      toErrorResponse({
        message: "Parameter tidak valid",
        details: zodIssuesToErrorDetails(params.error.issues),
      }),
      { status: 400 }
    );
  }

  const { page, limit, query, sort: sortField, dir: sortDirection, status, role } = params.data;

  try {
    const whereClause: Prisma.UserWhereInput = {
      AND: [
        ...(role && role !== "all" ? [{ role: role as UserRole }] : []),
        ...(status === "active"
          ? [{ isActive: true }]
          : status === "inactive"
            ? [{ isActive: false }]
            : []),
        {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      ],
    };

    const sortMap: Record<string, Prisma.UserOrderByWithRelationInput> = {
      name: { name: sortDirection as Prisma.SortOrder },
      role: { role: sortDirection as Prisma.SortOrder },
      createdAt: { createdAt: sortDirection as Prisma.SortOrder },
      updatedAt: { updatedAt: sortDirection as Prisma.SortOrder },
      isActive: { isActive: sortDirection as Prisma.SortOrder },
    };

    const orderBy = sortMap[sortField] || { createdAt: sortDirection as Prisma.SortOrder };

    const [totalCount, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        select: {
          id: true,
          avatarFile: true,
          avatarFileId: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    const mappedUsers = await Promise.all(
      users.map(async (u: (typeof users)[number]) => {
        let avatarFile: FileResponse | null = null;
        if (u.avatarFile) {
          const fileUrl = await getPresignedFileUrl(u.avatarFile.path);
          avatarFile = {
            id: u.avatarFile.id,
            name: u.avatarFile.name || undefined,
            path: u.avatarFile.path,
            url: fileUrl,
            mimeType: u.avatarFile.mimeType || undefined,
            size: u.avatarFile.size || undefined,
            createdAt: u.avatarFile.createdAt.toISOString(),
            updatedAt: u.avatarFile.updatedAt.toISOString(),
          };
        }

        return {
          ...u,
          avatarFile: avatarFile,
        } as unknown as User;
      })
    );

    return NextResponse.json(
      toPaginatedResponse({
        data: mappedUsers,
        empty: users.length === 0,
        pagination: {
          total: totalCount,
          page,
          from: (page - 1) * limit + 1,
          to: Math.min(page * limit, totalCount),
        },
      })
    );
  } catch {
    return NextResponse.json(
      toErrorResponse({ message: "Terjadi kesalahan. Mohon coba lagi. in a moment." }),
      { status: 500 }
    );
  }
});

export const POST = withRole(
  [UserRole.SUPERADMIN, UserRole.ADMIN],
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const parsedData = UserAddSchema.safeParse(body);

      if (!parsedData.success) {
        return NextResponse.json(
          toErrorResponse({ message: parsedData.error.errors[0]?.message ?? "Invalid input." }),
          { status: 400 }
        );
      }

      const { name, email, role, password }: UserAddSchemaType = parsedData.data;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json(toErrorResponse({ message: "Email is already registered." }), {
          status: 409,
        });
      }

      const passwordHash = await generateHash(password);
      const user = await prisma.user.create({
        data: { name, email, role: role as UserRole, password: passwordHash },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        toBaseResponse({ message: "User successfully added.", data: user }),
        {
          status: 201,
        }
      );
    } catch {
      return NextResponse.json(
        toErrorResponse({ message: "Terjadi kesalahan. Mohon coba lagi. in a moment." }),
        { status: 500 }
      );
    }
  }
);
