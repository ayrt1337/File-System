import database from "../config/database.js";
import { AppError } from "../errors/app-error.js";
import { FileRole } from "../types/file.js";

export async function checkFilePermission(
  userId: string,
  fileId: string,
  requiredRole: FileRole
): Promise<void> {
  const file = await database.files.findUnique({
    where: { id: fileId },
    select: {
      userId: true,
      isPublic: true,
      publicRole: true,
    },
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado!", 404);
  }

  if (file.userId === userId) {
    return;
  }

  if (file.isPublic && file.publicRole !== null && file.publicRole >= requiredRole) {
    return;
  }

  const shared = await database.sharedFiles.findUnique({
    where: {
      userId_fileId: {
        userId,
        fileId,
      },
    },
    select: {
      userRole: true,
    },
  });

  if (shared && shared.userRole >= requiredRole) {
    return;
  }

  throw new AppError("Não autorizado", 403);
}

export async function getUserFileRole(
  userId: string,
  fileId: string
): Promise<number> {
  const file = await database.files.findUnique({
    where: { id: fileId },
    select: {
      userId: true,
      isPublic: true,
      publicRole: true,
    },
  });

  if (!file) {
    throw new AppError("Arquivo não encontrado!", 404);
  }

  if (file.userId === userId) {
    return 3;
  }

  const shared = await database.sharedFiles.findUnique({
    where: {
      userId_fileId: {
        userId,
        fileId,
      },
    },
    select: {
      userRole: true,
    },
  });

  const sharedRole = shared?.userRole ?? 0;
  const publicRole = file.isPublic && file.publicRole !== null ? file.publicRole : 0;

  return Math.max(sharedRole, publicRole);
}
