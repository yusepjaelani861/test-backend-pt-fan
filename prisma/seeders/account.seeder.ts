import { PrismaClient } from "@prisma/client"
import bcryptjs from "bcryptjs"

const prisma = new PrismaClient()
const salt = bcryptjs.genSaltSync(10)

const main = async () => {
    await prisma.user.create({
        data: {
            nama: "Ananda Bayu",
            email: "bayu@email.com",
            npp: 12345,
            npp_supervisor: 11111,
            password: bcryptjs.hashSync("password", salt)
        }
    })

    await prisma.user.create({
        data: {
            nama: "Supervisor",
            email: "spv@email.com",
            npp: 11111,
            npp_supervisor: null,
            password: bcryptjs.hashSync("password", salt)
        }
    })
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })