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
    CHECK_EMAIL: "/check-email",
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
    GET_FILE: `/file/:${PARAMS.ID}`,
    ACCESS: `${FILES_PREFIX}/access`,
    SHARED_FILES: "/shared-files"
  }
} as const;
