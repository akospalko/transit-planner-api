import { JwtPayload } from "jsonwebtoken";
import { Role } from "../enums/authentication";

export interface JwtPayloadExtended extends JwtPayload {
  id: string;
  role: Role[];
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayloadExtended;
    }
  }
}
