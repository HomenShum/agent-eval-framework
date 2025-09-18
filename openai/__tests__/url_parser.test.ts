/** @jest-environment node */

import { parseUrls, extractDomains } from "../../lib/url";

describe("URL parser utility", () => {
  it("extracts and normalizes URLs from mixed text", () => {
    const text = [
      "Check https://example.com/a?x=1#h and http://sub.domain.co.uk/path,",
      "also www.github.com/owner/repo and openai.com/research.",
      "Ignore not_a_url and plain text.",
    ].join(" ");

    const urls = parseUrls(text);
    const hrefs = urls.map((u) => u.href);
    expect(hrefs.some((h) => h.startsWith("https://example.com/a"))).toBe(true);
    expect(hrefs.some((h) => h.startsWith("http://sub.domain.co.uk/path"))).toBe(true);
    expect(hrefs.some((h) => h.startsWith("https://www.github.com/owner/repo") || h.startsWith("https://github.com/owner/repo"))).toBe(true);
    expect(hrefs.some((h) => h.startsWith("https://openai.com/research"))).toBe(true);

    // Basic shape
    for (const u of urls) {
      expect(typeof u.protocol).toBe("string");
      expect(typeof u.host).toBe("string");
      expect(typeof u.domain).toBe("string");
      expect(typeof u.path).toBe("string");
    }

    // Domains helper drops leading www.
    const domains = extractDomains(text);
    expect(domains).toEqual(expect.arrayContaining(["example.com", "sub.domain.co.uk", "github.com", "openai.com"]));
  });
});

