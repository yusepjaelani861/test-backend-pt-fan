import { Request, Response, NextFunction } from "express"
import asyncHandler from "../../middleware/asyncHandler"
import { PrismaClient } from "@prisma/client"
import jwt from "jsonwebtoken"
import { sendError, sendResponse } from "../../libraries/globalRest"
import bcryptjs from "bcryptjs"
import { User } from "../../interfaces/model"
import { body, validationResult } from "express-validator"

type ValidationAuth = 'login'

const prisma = new PrismaClient()
const jwt_secret = process.env.JWT_SECRET || "secret"
const jwt_expired = process.env.JWT_EXPIRED || "86400"

export default class AuthController {
    public static login = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return next(new sendError("Validation error", errors.array(), "VALIDATION_ERROR", 422))
        }

        const { email, password } = req.body

        const user = await prisma.user.findFirst({
            where: {
                email: email
            }
        })

        if (!user) {
            return next(new sendError("Invalid credentials", [], "UNAUTHORIZED", 401))
        }

        const isMatch = await bcryptjs.compare(password, user.password)

        if (!isMatch) {
            return next(new sendError("Invalid credentials", [], "UNAUTHORIZED", 401))
        }

        const token = AuthController.generateJWT(user)

        return res.json(new sendResponse({
            user: user,
            token: token,
            expired_in: +jwt_expired * 1000 * 60 * 60
        }, "Login success"))
    })

    static generateJWT = (user: User) => {
        return jwt.sign({ id: user.id }, jwt_secret, {
            expiresIn: +jwt_expired * 1000 * 60 * 60
        })
    }

    public static validator = (method: ValidationAuth) => {
        switch (method) {
            case 'login': {
                return [
                    body('email', 'Email is required').notEmpty(),
                    body('email', 'Email is not valid').isEmail(),
                    body('password', 'Password is required').notEmpty(),
                    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
                ]
            }
        }
    }
}