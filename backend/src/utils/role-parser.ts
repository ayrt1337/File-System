import { FileRole } from "../types/file.js";
import { AppError } from "../errors/app-error.js";

const roleMap: Record<string, number> = {
  reader: FileRole.READER,
  editor: FileRole.EDITOR,
  READER: FileRole.READER,
  EDITOR: FileRole.EDITOR,
};

export function parseRole(role: any): number {
  if (typeof role === "number") {
    if (role === FileRole.READER || role === FileRole.EDITOR) {
      return role;
    }
    throw new AppError(`Cargo inválido: ${role}`, 400);
  }
  const mapped = roleMap[String(role).toLowerCase()] || roleMap[String(role)];
  if (!mapped) {
    throw new AppError(`Cargo inválido: ${role}`, 400);
  }
  return mapped;
}

export function parseRoleOptional(role: any): number | null {
  if (role === null || role === undefined) return null;
  return parseRole(role);
}
