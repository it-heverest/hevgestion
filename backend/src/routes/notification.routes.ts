// src/routes/notification.routes.ts
import { Router, Response, NextFunction } from "express";
import { authenticate, AuthRequest } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 200); // Max 200 notifications

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

router.get("/unread-count", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    res.json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Error fetching unread count" });
  }
});

router.put("/:id/read", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const result = await prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true, readAt: new Date() },
    });

    if (result.count === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ message: "Notification marked as read" });
  } catch (error) {
    next(error);
  }
});

router.put("/read-all", authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Error marking all notifications as read" });
  }
});

export default router;