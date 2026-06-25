import type { Preview } from "../types/video-preview";

export const getYoutubePreview = (data: any) => {
  if (!data) return;

  const obj: Preview = {
    thumbnail: data.thumbnail_url,
    title: data.title,
  };

  return obj;
};

export const getTwitterPreview = (data: any) => {
  if (!data || !data.html) return;

  const pMatch = data.html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const author = data.author_name;
  let title = "";

  if (pMatch && pMatch[1]) {
    const cleanText = pMatch[1].replace(/<[^>]*>/g, "").trim();
    if (cleanText) {
      title = `${author} - ${cleanText}`;
    }
  }

  const obj: Preview = {
    title
  };

  return obj;
};
