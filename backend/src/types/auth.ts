import { Request } from "express";

/* Represents the payload stored in a JSON Web Token (JWT) */

export interface JwtPayload {
    user_id: number;
    role?: string;
    iat?: number;
    exp?: number;
}

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}