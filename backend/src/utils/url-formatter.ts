import { AppError } from "../errors/app-error.js";

const ID_IDENTIFIER = "idReplace";
const AUTHOR_IDENTIFIER = "authorReplace";

interface PlatformConfig {
  expectedUrl: string;
  platform: string;
  domains: string[];
  parse: (url: string, platform: string) => string | null;
}

const parseYoutube = (url: string, platform: string) => {
  let videoId = "";
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.slice(1);
    } else {
      const vParam = urlObj.searchParams.get("v");
      if (vParam) {
        videoId = vParam;
      } else {
        const paths = urlObj.pathname.split("/").filter(Boolean);
        if (
          paths.includes("shorts") ||
          paths.includes("embed") ||
          paths.includes("live")
        ) {
          videoId = paths[paths.length - 1] || "";
        }
      }
    }
  } catch (e) {
    const match = url.match(
      /(?:v=|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/)([^#\&\?]+)/,
    );
    if (match && match[1]) videoId = match[1];
  }

  if (videoId) {
    const cleanVideoId = videoId.split(/[?#&]/)[0] || "";
    const formattedUrl = mappingPlatforms[platform].expectedUrl.replace(
      ID_IDENTIFIER,
      cleanVideoId,
    );
    return formattedUrl;
  }
  return null;
};

const parseTwitterOrX = (url: string, platform: string) => {
  let author = "";
  let tweetId = "";
  try {
    const urlObj = new URL(url);
    const paths = urlObj.pathname.split("/").filter(Boolean);
    const statusIndex = paths.indexOf("status");
    if (statusIndex !== -1 && statusIndex > 0 && paths[statusIndex + 1]) {
      author = paths[statusIndex - 1] || "";
      tweetId = paths[statusIndex + 1] || "";
    }
  } catch (e) {
    const match = url.match(/(?:twitter|x)\.com\/([^\/]+)\/status\/(\d+)/i);
    if (match && match[1] && match[2]) {
      author = match[1];
      tweetId = match[2];
    }
  }

  if (author && tweetId) {
    const cleanTweetId = tweetId.split(/[?#&]/)[0] || "";
    const formattedUrl = mappingPlatforms[platform].expectedUrl
      .replace(AUTHOR_IDENTIFIER, author)
      .replace(ID_IDENTIFIER, cleanTweetId);
    return formattedUrl;
  }
  return null;
};

const mappingPlatforms: Record<string, PlatformConfig> = {
  youtube: {
    expectedUrl: `https://www.youtube.com/watch?v=${ID_IDENTIFIER}`,
    platform: "youtube",
    domains: ["youtube.com", "youtu.be"],
    parse: parseYoutube,
  },
  x: {
    expectedUrl: `https://x.com/${AUTHOR_IDENTIFIER}/status/${ID_IDENTIFIER}`,
    platform: "x",
    domains: ["x.com"],
    parse: parseTwitterOrX,
  },
  twitter: {
    expectedUrl: `https://twitter.com/${AUTHOR_IDENTIFIER}/status/${ID_IDENTIFIER}`,
    platform: "twitter",
    domains: ["twitter.com"],
    parse: parseTwitterOrX,
  },
};

export function formatAndValidateUrl(url: string): string {
  if (!url) {
    throw new AppError("Endereço inválido!", 400);
  }

  let hostname = "";
  try {
    const urlObj = new URL(url);
    hostname = urlObj.hostname.toLowerCase();
  } catch (e) {
    hostname = url.toLowerCase();
  }

  const platformEntry = Object.values(mappingPlatforms).find((entry) =>
    entry.domains.some((domain) => hostname.includes(domain)),
  );

  if (!platformEntry) {
    throw new AppError("URL ou plataforma não suportada!", 400);
  }

  const result = platformEntry.parse(url, platformEntry.platform);
  if (!result) {
    throw new AppError(
      `ID/Parâmetros não encontrados na URL!`,
      400,
    );
  }

  return result;
}
