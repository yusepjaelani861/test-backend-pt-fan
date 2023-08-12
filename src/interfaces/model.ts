import { Request } from "express"

export interface User {
    id: number
    nama: string
    email: string
    npp: number
    npp_supervisor: number | null
    password: string
    created_at: Date
    updated_at: Date
}

export interface RequestAuth extends Request {
    user: User
}