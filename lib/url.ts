export type ParsedUrl = {
  href: string;
  protocol: string;
  host: string;
  domain: string; // hostname without leading www.
  path: string;
  query?: string;
  hash?: string;
};

const URL_REGEX = /(?:(https?:)\/\/)?(?:www\.)?([a-zA-Z0-9.-]+)\.[a-zA-Z]{2,}(?:\/[\w\-\.~%/?#=&:+]*)?/g;

function unique<T>(arr: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = key(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function toAbsolute(urlLike: string): string {
  if (/^https?:\/\//i.test(urlLike)) return urlLike;
  if (/^www\./i.test(urlLike)) return `https://${urlLike}`;
  return `https://${urlLike}`;
}

export function parseUrls(text: string): ParsedUrl[] {
  if (!text) return [];
  const matches: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(URL_REGEX);
  while ((m = re.exec(text)) !== null) {
    matches.push(m[0]);
  }
  const normalized = unique(matches, (s) => s.toLowerCase()).map(toAbsolute);
  const parsed: ParsedUrl[] = [];
  for (const href of normalized) {
    try {
      const u = new URL(href);
      const domain = u.hostname.replace(/^www\./i, "");
      parsed.push({
        href: u.href,
        protocol: u.protocol.replace(/:$/, ""),
        host: u.hostname,
        domain,
        path: u.pathname,
        query: u.search ? u.search.slice(1) : undefined,
        hash: u.hash ? u.hash.slice(1) : undefined,
      });
    } catch {}
  }
  return parsed;
}

export function extractDomains(text: string): string[] {
  return unique(parseUrls(text).map((p) => p.domain.toLowerCase()), (s) => s);
}

