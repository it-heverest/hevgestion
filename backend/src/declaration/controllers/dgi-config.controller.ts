import { Response } from "express";
import { prisma } from "../../lib/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { BadRequestError, NotFoundError, ForbiddenError } from "../../lib/errors";
import { EncryptionUtil } from "../../utils/encryption";

const encryption = new EncryptionUtil();

class DGIConfigController {
  /**
   * GET /api/dgi/config/:userId
   * Returns the stored DGI config for a user.
   * Password is never returned in plain text.
   */
  async getConfig(req: AuthRequest, res: Response): Promise<void> {
    const { userId } = req.params;
    const requesterId = req.user!.userId;

    if (userId !== requesterId) {
      throw new ForbiddenError("Access denied");
    }

    const dgiConfig = await prisma.dGIConfig.findUnique({
      where: { userId },
      select: {
        id: true,
        username: true,
        // password is never returned
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!dgiConfig) {
      res.status(404).json({ success: false, message: "Configuration DGI non trouvée" });
      return;
    }

    res.json({ success: true, data: dgiConfig });
  }

  /**
   * POST /api/dgi/config
   * Creates a DGI config. Password is encrypted before storage.
   */
  async saveConfig(req: AuthRequest, res: Response): Promise<void> {
    const { username, password } = req.body;
    const userId = req.user!.userId;

    if (!username || !password) {
      throw new BadRequestError("username et password sont requis");
    }

    const encryptedPassword = encryption.encrypt(password);

    const existing = await prisma.dGIConfig.findUnique({ where: { userId } });

    let dgiConfig;
    if (existing) {
      dgiConfig = await prisma.dGIConfig.update({
        where: { userId },
        data: { username, password: encryptedPassword },
        select: { id: true, username: true, createdAt: true, updatedAt: true },
      });
    } else {
      dgiConfig = await prisma.dGIConfig.create({
        data: { username, password: encryptedPassword, userId },
        select: { id: true, username: true, createdAt: true, updatedAt: true },
      });
    }

    res.status(existing ? 200 : 201).json({ success: true, data: dgiConfig });
  }

  /**
   * PUT /api/dgi/config/:id
   * Partial update. Re-encrypts password only if provided.
   */
  async updateConfig(req: AuthRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { username, password } = req.body;

    const existing = await prisma.dGIConfig.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError("Configuration DGI non trouvée");
    if (existing.userId !== userId) throw new ForbiddenError("Access denied");

    const data: Record<string, string> = {};
    if (username) data.username = username;
    if (password) data.password = encryption.encrypt(password);

    const dgiConfig = await prisma.dGIConfig.update({
      where: { id },
      data,
      select: { id: true, username: true, createdAt: true, updatedAt: true },
    });

    res.json({ success: true, data: dgiConfig });
  }
}

export const dgiConfigController = new DGIConfigController();
