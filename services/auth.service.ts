import { NextRequest, NextResponse } from "next/server";
import { UserRole } from "@/types";
import { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { FORBIDDEN_MESSAGE, toErrorResponse, UNAUTHORIZED_MESSAGE } from "@/lib/response-helper";
import authOptions from "@/app/api/auth/[...nextauth]/auth-options";

type RouteHandler = (
  req: NextRequest,
  context: any,
  session: Session
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: RouteHandler) {
  return async (req: NextRequest, context: any) => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(toErrorResponse({ message: UNAUTHORIZED_MESSAGE }), {
        status: 401,
      });
    }

    return handler(req, context, session);
  };
}

export function withRole(roles: UserRole[], handler: RouteHandler) {
  return async (req: NextRequest, context: any) => {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(toErrorResponse({ message: UNAUTHORIZED_MESSAGE }), {
        status: 401,
      });
    }

    if (!session.user || !roles.includes(session.user.role)) {
      return NextResponse.json(toErrorResponse({ message: FORBIDDEN_MESSAGE }), {
        status: 403,
      });
    }

    return handler(req, context, session);
  };
}
