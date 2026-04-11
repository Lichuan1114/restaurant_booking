import { Response } from "express";
import { AuthenticatedRequest } from "../types/index.js";

export const getCustomerHome = async (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({
        message: "customer home reached",
        user: req.user
    });
}