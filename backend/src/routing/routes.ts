const FILES_PREFIX = "/files";

export const PARAMS = {
  ID: "id",
} as const;

export const ROUTES = {
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    RESET: "/reset",
    RESET_PASSWORD: "/reset-password",
    CONFIRM_EMAIL: "/confirm-email",
    LOGOUT: "/logout",
    ME: "/me",
  },
  USER: {
    PROFILE: "/profile",
    UPDATE: "/update",
    DELETE: "/delete",
  },
  FILE: {
    MY_FILES: "/my-files",
    DOWNLOAD_VIDEO: "/download-video",
    CONVERT: "/convert",
    UPLOAD_URL: "/upload-url",
    DOWNLOAD: `${FILES_PREFIX}/download/:${PARAMS.ID}`,
    RENAME: `${FILES_PREFIX}/rename`,
    STATUS: `${FILES_PREFIX}/status`,
    FAVORITE: `${FILES_PREFIX}/favorite`,
  }
} as const;
