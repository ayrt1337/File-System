import {
    faFile,
  faFileAudio,
  faFileCode,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFileVideo,
  faFileWord,
} from "@fortawesome/free-regular-svg-icons";

export const useFilesUtils = () => {
  const getFileIcon = (format: string) => {
    const fmt = format.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fmt))
      return faFileImage;
    if (["mp4", "webm", "mkv", "avi", "mov"].includes(fmt)) return faFileVideo;
    if (["mp3", "wav", "ogg", "m4a", "flac"].includes(fmt)) return faFileAudio;
    if (fmt === "pdf") return faFilePdf;
    if (["doc", "docx", "odt"].includes(fmt)) return faFileWord;
    if (["xls", "xlsx", "csv", "ods"].includes(fmt)) return faFileExcel;
    if (
      [
        "js",
        "ts",
        "html",
        "css",
        "json",
        "py",
        "go",
        "cpp",
        "c",
        "sh",
        "yml",
        "yaml",
      ].includes(fmt)
    )
      return faFileCode;
    return faFile;
  };

  const getFileBgClass = (format: string) => {
    const fmt = format.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(fmt))
      return "bg-[#60a5fa]";
    if (["mp4", "webm", "mkv", "avi", "mov"].includes(fmt))
      return "bg-[#c084fc]";
    if (["mp3", "wav", "ogg", "m4a", "flac"].includes(fmt))
      return "bg-[#f472b6]";
    if (fmt === "pdf") return "bg-[#f87171]";
    if (["doc", "docx", "odt"].includes(fmt)) return "bg-[#38bdf8]";
    if (["xls", "xlsx", "csv", "ods"].includes(fmt)) return "bg-[#34d399]";
    if (
      [
        "js",
        "ts",
        "html",
        "css",
        "json",
        "py",
        "go",
        "cpp",
        "c",
        "sh",
        "yml",
        "yaml",
      ].includes(fmt)
    )
      return "bg-[#fbbf24]";
    return "bg-[#9ca3af]";
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return {
    getFileIcon,
    getFileBgClass,
    formatSize,
    formatDate
  }
};
