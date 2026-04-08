import { Router, Request, Response } from "express";
import { setOTP, getOTP, blacklistToken } from "../services/redis.service";
import crypto from "crypto";

const router = Router();

// POST /api/debug/redis/otp-set
router.post("/otp-set", async (req: Request, res: Response) => {
  const { contact, code, ttlSeconds } = req.body;
  if (!contact || !code)
    return res.status(400).json({ error: "contact and code are required" });
  await setOTP(
    contact,
    String(code),
    typeof ttlSeconds === "number" ? ttlSeconds : 600,
  );
  res.json({ success: true });
});

// GET /api/debug/redis/otp-get?contact=...
router.get("/otp-get", async (req: Request, res: Response) => {
  const contact = String(req.query.contact || "");
  if (!contact) return res.status(400).json({ error: "contact is required" });
  const code = await getOTP(contact);
  res.json({ contact, code });
});

// POST /api/debug/redis/blacklist
// body: { token, ttlSeconds }
router.post("/blacklist", async (req: Request, res: Response) => {
  const { token, ttlSeconds } = req.body;
  if (!token || !ttlSeconds)
    return res.status(400).json({ error: "token and ttlSeconds are required" });
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  await blacklistToken(`tok:${hash}`, Number(ttlSeconds));
  res.json({ success: true });
});

export default router;
