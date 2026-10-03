import app from './app.js'
import connectDB from './config/connectDB.js'
import { seedWebsiteData } from './utils/seedWebsiteData.js'

const PORT = Number(process.env.PORT) || 8082
const MAX_PORT_RETRIES = 5

const startServer = (port, attempt = 0) => {
    if (attempt > MAX_PORT_RETRIES) {
        console.error(`Could not start server after ${MAX_PORT_RETRIES} retries. Please free a port or set PORT in server/.env.`)
        process.exit(1)
    }

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
