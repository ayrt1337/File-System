export function isImage(format: string): boolean {
  const fmt = format.toLowerCase();
  return ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fmt);
}

export function isVideo(format: string): boolean {
  const fmt = format.toLowerCase();
  return ["mp4", "webm", "mkv", "avi", "mov"].includes(fmt);
}

export function hasPreview(format: string): boolean {
  const fmt = format.toLowerCase();
  return (isImage(fmt) || isVideo(fmt)) && fmt !== "mkv" && fmt !== "avi";
}

export function isAudio(format: string): boolean {
  const fmt = format.toLowerCase();
  return ["mp3", "wav", "ogg", "m4a", "flac"].includes(fmt);
}

export function hasView(format: string): boolean {
  const fmt = format.toLowerCase();
  return isImage(fmt) || isAudio(fmt) || (isVideo(fmt) && fmt !== "mkv" && fmt !== "avi");
}
