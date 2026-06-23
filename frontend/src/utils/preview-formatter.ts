import type { Preview } from "../types/video-preview";

export const getYoutubePreview = (data: any) => {
  if (!data) return;

  const obj: Preview = {
    thumbnail: data.thumbnail_url,
    title: data.title,
  };

  return obj;
};

export const getTwitterPreview = (data: any) => {};
