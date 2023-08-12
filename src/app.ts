import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import errorHandler from "./middleware/errorHandler"
import routes from "./routes"

process.env.TZ = "Asia/Jakarta"

dotenv.config()

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.send("Hello World")
})

app.use("/api", routes)

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})