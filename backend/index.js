import express from "express"
import dotenv from "dotenv"
dotenv.config()
import connectDb from "./config/db.js"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.router.js"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import cartRouter from "./routes/cart.routes.js"
import shopRouter from "./routes/chef.routes.js"
import itemRouter from "./routes/item.routes.js"
import regionRouter from "./routes/region.routes.js"
import orderRouter from "./routes/order.routes.js"
import reviewRouter from "./routes/review.routes.js"

const app = express()

const port = process.env.PORT || 5000
app.use(cors({
    origin: process.env.FRONTEND_URL || "maakhana-48ipnkak5-karthikeya1500s-projects.vercel.app",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use("/api/auth", authRouter)
app.use("/api/user", userRouter)
app.use("/api/cart", cartRouter)
app.use("/api/shop", shopRouter)
app.use("/api/item", itemRouter)
app.use("/api/region", regionRouter)
app.use("/api/order", orderRouter)
app.use("/api/review", reviewRouter)

app.listen(port, () => {
    connectDb()
    console.log(`server started at ${port}`)
})
