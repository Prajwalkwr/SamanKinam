import app from '../app.js'
import connectDB from '../config/connectDB.js'
import { seedWebsiteData } from '../utils/seedWebsiteData.js'

let ready

export default async function handler(req, res) {
    try {
        if (!ready) {
            ready = connectDB().then(seedWebsiteData)
        }
        await ready
    } catch (error) {
        ready = undefined
        console.error('Database unavailable:', error)
        res.statusCode = 503
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({
            message: 'Database unavailable. Check MONGODB_URI in the Vercel environment variables.',
            error: true,
            success: false
        }))
        return
    }

    return app(req, res)
}
