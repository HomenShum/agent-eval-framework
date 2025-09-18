declare module "next/server" {
  export class NextResponse {
    constructor(body?: any, init?: { status?: number; headers?: Record<string, string> });
    static json(body: any, init?: { status?: number }): any;
    headers: Headers;
    status: number;
    body: any;
  }
  export class NextRequest {}
}

