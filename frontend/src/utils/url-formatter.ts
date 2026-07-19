export const urlFormatter = (url: string, platformConfig: string ) => {
  if (!url || !platformConfig || !platformConfig) return url;

  const expectedUrl = platformConfig;

  if (expectedUrl.includes("youtube.com")) {
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
          if (paths.includes("shorts") || paths.includes("embed") || paths.includes("live")) {
            videoId = paths[paths.length - 1] || "";
          }
        }
      }
    } catch (e) {
      const match = url.match(/(?:v=|\/embed\/|\/shorts\/|\/live\/|youtu\.be\/)([^#\&\?]+)/);
      if (match && match[1]) videoId = match[1];
    }

    if (videoId) {
      const cleanVideoId = videoId.split(/[?#&]/)[0] || "";
      return expectedUrl.replace("idReplace", cleanVideoId);
    }
  }

  if (expectedUrl.includes("twitter.com") || expectedUrl.includes("x.com")) {
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
      return expectedUrl.replace("authorReplace", author).replace("idReplace", cleanTweetId);
    }
  }

  return url;
};

