export const getPlatformFromUrl = (url: string) => {
  const match = url.match(
    /^(?:https?:\/\/)?(?:www\.|m\.|mobile\.)?([a-zA-Z0-9-]+)\.[a-z]+/i,
  );

  const platform = match?.[1];
  if (!platform) return;

  return platform.toLowerCase();
};
