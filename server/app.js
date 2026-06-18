import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))

app.use(express.json({ limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(cookieParser())

/* import statements of routes */
import userRouter from './src/routes/user.routes.js'
import algorithmRouter from './src/routes/algorithm.routes.js'
import topologyRouter from './src/routes/topology.routes.js'
import runRouter from './src/routes/run.routes.js'
import shareRouter from './src/routes/share.routes.js'

app.use("/api/v1/users", userRouter);
app.use("/api/v1/topologies", topologyRouter);
app.use("/api/v1/algorithms", algorithmRouter);
app.use("/api/v1/run", runRouter);
app.use("/api/v1/share", shareRouter);

export { app }