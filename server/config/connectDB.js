import mongoose from "mongoose";
import './env.js'

const rawMongoUri = process.env.MONGODB_URI
const defaultLocalUri = 'mongodb://127.0.0.1:27017/SamanKinam'
const isServerless = Boolean(process.env.VERCEL)

const isInvalidAtlasUri = (uri) => {
  if (!uri) return false
  return uri.includes('<db_password>') || uri.includes('your_password') || uri.includes('change_me')
}

const invalidAtlasUri = rawMongoUri && isInvalidAtlasUri(rawMongoUri)
let mongoUri = invalidAtlasUri ? null : rawMongoUri || (isServerless ? null : defaultLocalUri)
let memoryServer
let connectionPromise

async function startMemoryServer() {
  if (!memoryServer) {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    memoryServer = await MongoMemoryServer.create()
  }
  return memoryServer.getUri()
}

async function connect(){
    if (isServerless && !mongoUri) {
        throw new Error('MONGODB_URI is missing or invalid. Set it in the Vercel project environment variables.')
    }

    try {
        if (!mongoUri) {
            console.warn('Invalid MONGODB_URI in server/.env. Falling back to in-memory MongoDB for development.')
            mongoUri = await startMemoryServer()
        }

        await mongoose.connect(mongoUri)
        console.log("Connected to MongoDB")

        if (mongoUri === defaultLocalUri) {
            console.warn('Using local MongoDB fallback. Start MongoDB at 127.0.0.1:27017 or set MONGODB_URI in server/.env to a valid Atlas connection string.')
        } else if (mongoUri.startsWith('mongodb://127.0.0.1')) {
            console.warn('Connected to local MongoDB. If this is not intended, set MONGODB_URI in server/.env.')
        } else if (mongoUri.startsWith('mongodb+srv://')) {
            console.log('Connected to Atlas MongoDB.')
        } else {
            console.log('Connected to in-memory MongoDB for development.')
        }
    } catch (error) {
        console.log("Mongodb connect error", error)

        if (mongoUri === defaultLocalUri) {
            console.warn('Could not connect to local MongoDB. Trying in-memory MongoDB for development...')
            mongoUri = await startMemoryServer()
            await mongoose.connect(mongoUri)
            console.log('Connected to in-memory MongoDB for development.')
            return
        }

        throw error
    }
}

function connectDB(){
    if (!connectionPromise) {
        connectionPromise = connect().catch((error) => {
            connectionPromise = undefined
            throw error
        })
    }
    return connectionPromise
}

export default connectDB
