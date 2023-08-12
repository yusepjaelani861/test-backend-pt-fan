import asyncHandler from './asyncHandler'
import { Response, NextFunction } from 'express'
import { sendError } from '../libraries/globalRest'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { RequestAuth } from '../interfaces/model'

const prisma = new PrismaClient()
const jwt_secret = process.env.JWT_SECRET || 'secret';

export const protect = asyncHandler(async (req: RequestAuth, res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }
    if (!token) {
        return next(new sendError('Not authorized to access this route', [], 'UNAUTHORIZED'));
    }
    
    if (token.split('.').length !== 3) {
        return next(new sendError('Not authorized to access this route', [], 'UNAUTHORIZED', 401));
    }

    try {
        const decoded: any  = jwt.verify(token, jwt_secret);

        const user = await prisma.user.findFirst({
            where: {
                id: decoded.id
            }
        })

        if (!user) {
            return next(new sendError('Not authorized to access this route', [], 'UNAUTHORIZED', 401));
        }

        req.user = user;

        next();
    } catch (error) {
        return next(new sendError('Not authorized to access this route', [], 'UNAUTHORIZED'));
    }

})