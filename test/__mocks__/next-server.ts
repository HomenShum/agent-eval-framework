export class NextResponse {
  headers: Headers;
  status: number;
  body: any;
  constructor(body?: any, init?: { status?: number; headers?: Record<string, string> }) {
    this.body = body ?? null;
    this.status = init?.status ?? 200;
    this.headers = new Headers(init?.headers || {});
  }
  get ok(): boolean {
    return this.status >= 200 && this.status < 300;
  }
  static json(obj: any, init?: { status?: number }) {
    const res = new NextResponse(JSON.stringify(obj), {
      status: init?.status,
      headers: { "Content-Type": "application/json" },
    });
    return res as any;
  }
  async text(): Promise<string> {
    if (typeof this.body === "string") return this.body;
    if (this.body && typeof (this.body as any)[Symbol.asyncIterator] === "function") {
      // Async iterable (like streamed chunks)
      let out = "";
      for await (const chunk of this.body as any) {
        out += typeof chunk === "string" ? chunk : new TextDecoder().decode(chunk);
      }
      return out;
    }
    if (this.body && typeof (this.body as any).getReader === "function") {
      // Web ReadableStream
      const reader = (this.body as ReadableStream).getReader();
      const decoder = new TextDecoder();
      let out = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        out += decoder.decode(value);
      }
      return out;
    }
    if (this.body == null) return "";
    try {
      return String(this.body);
    } catch {
      return "";
    }
  }
  async json(): Promise<any> {
    if (this.headers.get("Content-Type")?.includes("application/json")) {
      const t = await this.text();
      try {
        return JSON.parse(t);
      } catch {
        return {};
      }
    }
    // If body is already an object
    if (this.body && typeof this.body === "object") return this.body;
    const t = await this.text();
    try {
      return JSON.parse(t);
    } catch {
      return {};
    }
  }
}

export class NextRequest {}

export default { NextResponse };

