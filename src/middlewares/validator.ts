import { NextFunction } from "express";
import * as jose from "jose";
import { Request, Response } from "express";
import { publicKeyFromBn } from "../services/solana";
export interface CustomRequest extends Request {
  email?: string;
  publicKey?: string;
}
export const validateIdToken = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const jwks = jose.createRemoteJWKSet(
      new URL("https://api.openlogin.com/jwks")
    );
    const idToken = req.headers["id-token"]!;
    const jwtDecoded = await jose.jwtVerify(idToken.toString(), jwks, {
      algorithms: ["ES256"],
    });
    req.publicKey = publicKeyFromBn(
      (jwtDecoded.payload as any).wallets[0].public_key
    ).toBase58();
    req.email = (jwtDecoded.payload as any).email;
  } catch (e) {
    return res.status(403).send({ data: {}, message: "Authorization failed" });
  }
  next();
};
