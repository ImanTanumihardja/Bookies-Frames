import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const password = request.nextUrl.searchParams.get('password');
    const hasCookie = request.cookies.has('password');
    const url = request.nextUrl.clone();
    const response = NextResponse.redirect(url);

    if (password !== process.env.ADMIN_PASSWORD) {
        return new NextResponse('Unauthorized', {status: 401})
    }

    if (!hasCookie) {
        response.cookies.set(`password`, "true");
        return response;
    }
}

export const config = {
    matcher: ['/admin:path*',]
}