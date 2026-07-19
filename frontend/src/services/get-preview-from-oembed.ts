import axios from "axios";
import { getPlatformFromUrl } from "../utils/get-platform-from-url";
import * as previews from "../utils/preview-formatter";
import { urlFormatter } from "../utils/url-formatter";

const URL_REPLACE = "urlReplace";
const ID_IDENTIFIER = "idReplace";
const AUTHOR_IDENTIFIER = "authorReplace";

const mappingPlatforms: Record<string, any> = {
  youtube: {
    expectedUrl: `https://www.youtube.com/watch?v=${ID_IDENTIFIER}`,
    oembed: `https://noembed.com/embed?url=${URL_REPLACE}`,
    preview: previews.getYoutubePreview,
  },
  x: {
    expectedUrl: `https://x.com/${AUTHOR_IDENTIFIER}/status/${ID_IDENTIFIER}`,
    oembed: `https://publish.twitter.com/oembed?url=${URL_REPLACE}`,
    preview: previews.getTwitterPreview,
  },
  twitter: {
    expectedUrl: `https://twitter.com/${AUTHOR_IDENTIFIER}/status/${ID_IDENTIFIER}`,
    oembed: `https://publish.twitter.com/oembed?url=${URL_REPLACE}`,
    preview: previews.getTwitterPreview,
  },
};

export const getPreview = async (platform: string, url: string) => {
  const urlPlatform = getPlatformFromUrl(url);
  if (!urlPlatform || urlPlatform !== platform) return;

  const oembedUrl = mappingPlatforms[platform].oembed;
  if (!oembedUrl) return;

  const formattedUrl = urlFormatter(url, mappingPlatforms[platform].expectedUrl);
  const endpoint = oembedUrl.replace(URL_REPLACE, formattedUrl);

  const response = await axios.get(endpoint);
  const preview = mappingPlatforms[platform].preview(response.data);
  return preview;
};
