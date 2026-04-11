import { Request, Response, NextFunction } from "express";
import { isTokenBlacklisted } from "../services/redis.service";
import crypto from "crypto";

// Lightweight JWT payload decode to extract `jti` without verifying token.
// This avoids adding a new dependency here; the token should already be
// verified by your auth middleware earlier in the chain.
function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (e) {
    return null;
  }
}

export const jwtBlacklistMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const auth = req.headers["authorization"] as string | undefined;
  if (!auth) return next();
  const parts = auth.split(" ");
  if (parts.length !== 2) return next();
  const token = parts[1];
  const payload = decodeJwtPayload(token);
  if (!payload) return next();
  const jti =
    payload.jti ||
    payload.jti_id ||
    payload.jtiId ||
    payload.jtiToken ||
    payload.jti_token;

  // Support blacklisting either by token `jti` claim or by a hash of the token itself
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const blockedByJti = jti ? await isTokenBlacklisted(String(jti)) : false;
    const blockedByHash = await isTokenBlacklisted(`tok:${tokenHash}`);
    if (blockedByJti || blockedByHash) {
      return res.status(401).json({ message: "Token revoked" });
    }
  } catch (e) {
    // if redis is down, prefer failing open (allow) but log the error
    // eslint-disable-next-line no-console
    console.error("Failed checking token blacklist:", e);
  }
  return next();
};

export default jwtBlacklistMiddleware;
