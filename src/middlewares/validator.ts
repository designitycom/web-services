import { NextFunction } from "express";
import {
  ValidationChain,
  body,
  validationResult,
} from "express-validator";
import multer from "multer";
import * as jose from "jose";
import { Request, Response } from "express";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
export const mintParamValidator = () => [
  body("name").notEmpty(),
  body("description").notEmpty(),
];
export const ruleUser = [body("name", "name is not email").isEmail()];
export const validateUser = async () => {
  const result = validate([body("name", "name is not email").isEmail()]);
  console.log;
};
export const validateIdToken = async (
  req: Request,
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
  } catch (e) {
    return res.status(403).send({ data: {}, message: "Authorization failed" });
  }
  next();
};
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    for (let validation of validations) {
      const result = await validation.run(req);
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};
