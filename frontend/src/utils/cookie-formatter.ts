export function formatCookiesToNetscape(
  cookiesContent: string,
  targetUrl: string,
): string {
  if (!cookiesContent || !cookiesContent.trim()) return "";

  if (cookiesContent.includes("\t") || cookiesContent.startsWith("#")) {
    return cookiesContent.trim();
  }

  let domain = "";
  let hostDomain = "";
  if (targetUrl) {
    try {
      const parsedUrl = new URL(targetUrl);
      const hostname = parsedUrl.hostname.replace(/^www\./, "");
      if (hostname) {
        domain = `.${hostname}`;
        hostDomain = hostname;
      }
    } catch (err) {
      console.warn("Não foi possível extrair o domínio da URL fornecida:", err);
    }
  }

  const lines = ["# Netscape HTTP Cookie File"];

  const cleanContent = cookiesContent.replace(/^cookie:\s*/i, "").trim();
  const pairs = cleanContent.split(";");
  
  for (const pair of pairs) {
    const trimmed = pair.trim();
    if (!trimmed) continue;

    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;

    const name = trimmed.substring(0, eqIdx).trim();
    const value = trimmed.substring(eqIdx + 1).trim();

    if (!name) continue;

    const isSecure = name.startsWith("__Secure-") || name.startsWith("__Host-");
    const isHostOnly = name.startsWith("__Host-");

    const cookieDomain = isHostOnly ? hostDomain : domain;
    const includeSubdomains = isHostOnly ? "FALSE" : "TRUE";
    const secureFlag = isSecure ? "TRUE" : "FALSE";

    lines.push(
      `${cookieDomain}\t${includeSubdomains}\t/\t${secureFlag}\t2147483647\t${name}\t${value}`
    );
  }

  return lines.join("\n");
}
