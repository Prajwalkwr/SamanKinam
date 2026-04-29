import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config({ path: new URL('./.env', import.meta.url).pathname })

import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'
import { seedWebsiteData } from './utils/seedWebsiteData.js'

const app = express()

//CORS configuration - allow localhost on any port for development
const corsOptions = {
    credentials: true,
    origin: function (origin, callback) {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5174',
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            process.env.FRONTEND_URL
        ].filter(Boolean)
        
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(null, allowedOrigins[0])
        }
    }
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
app.use(helmet({
    crossOriginResourcePolicy : false
}))

// Stripe webhook endpoint needs raw body
app.use('/api/order/webhook', express.raw({ type: 'application/json' }))

const PORT = Number(process.env.PORT) || 8082
const MAX_PORT_RETRIES = 5
let currentPort = PORT

app.get("/",(request,response)=>{
    response.json({
        message : "Server is running " + currentPort
    })
})

app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)

const startServer = (port, attempt = 0) => {
    if (attempt > MAX_PORT_RETRIES) {
        console.error(`Could not start server after ${MAX_PORT_RETRIES} retries. Please free a port or set PORT in server/.env.`)
        process.exit(1)
    }

    currentPort = port

    const server = app.listen(port, () => {
        console.log(`Server is running on port ${port}`)
    })

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`)
            startServer(port + 1, attempt + 1)
        } else {
            console.error('Server failed to start:', error)
            process.exit(1)
        }
    })
}

connectDB().then(async ()=>{
    await seedWebsiteData()
    startServer(PORT)
}).catch((error)=>{
    console.error('Startup failed:', error)
    process.exit(1)
})

