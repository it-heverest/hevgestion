// src/utils/folder-access.ts
import { prisma } from "../lib/prisma";

/**
 * Checks whether a user has access to a folder: either as the owner, or via
 * an explicit FolderAssignment (used for ASSISTANT accounts). ADMIN role
 * always has access. Returns false (rather than throwing) so callers can
 * respond with whatever error shape/status their endpoint already uses.
 */
export async function userHasFolderAccess(
  userId: string,
  folderId: string,
  userRole?: string,
): Promise<boolean> {
  if (userRole === "ADMIN") return true;

  const folder = await prisma.folder.findFirst({
    where: {
      id: folderId,
      OR: [{ ownerId: userId }, { assignments: { some: { userId } } }],
    },
    select: { id: true },
  });

  return !!folder;
}
