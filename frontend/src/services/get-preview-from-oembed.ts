import axios from "axios";
import { getPlatformFromUrl } from "../utils/get-platform-from-url";
import * as previews from "../utils/preview-formatter";

const URL_REPLACE = "urlReplace";

const mappingPlatforms: Record<string, any> = {
  youtube: {
    oembed: `https://noembed.com/embed?url=${URL_REPLACE}`,
    preview: previews.getYoutubePreview,
  },
  x: {
    oembed: `https://publish.twitter.com/oembed?url=${URL_REPLACE}`,
    preview: previews.getTwitterPreview,
  },
  twitter: {
    oembed: `https://publish.twitter.com/oembed?url=${URL_REPLACE}`,
    preview: previews.getTwitterPreview,
  },
};

export const getPreview = async (platform: string, url: string) => {
  const urlPlatform = getPlatformFromUrl(url);
  if (!urlPlatform || urlPlatform !== platform) return;

  const oembedUrl = mappingPlatforms[platform].oembed;
  if (!oembedUrl) return;

  const endpoint = oembedUrl.replace(URL_REPLACE, url);

  const response = await axios.get(endpoint);
  const preview = mappingPlatforms[platform].preview(response.data);
  return preview;
};
