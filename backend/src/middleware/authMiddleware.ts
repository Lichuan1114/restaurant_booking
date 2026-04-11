import { AuthenticatedRequest, JwtPayload } from "../types/index.js"; 
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
}

const SECRET_KEY = process.env.JWT_SECRET;

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) : void => {
    const token = req.cookies?.accessToken;
    if (!token) {
        res.status(401).json({ authenticated: false, message: "Not authenticated" });
        return;
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

        req.user = decoded;
        next();
        
    } catch (error) {
        console.error("JWT verification failed:", error);
        res.status(403).json({ message: "Invalid or expired token" });
    }
}