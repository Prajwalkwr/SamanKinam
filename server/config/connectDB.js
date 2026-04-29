import mongoose from "mongoose";
import dotenv from 'dotenv'
import { MongoMemoryServer } from 'mongodb-memory-server'

dotenv.config()

const rawMongoUri = process.env.MONGODB_URI
const defaultLocalUri = 'mongodb://127.0.0.1:27017/SamanKinam'

const isInvalidAtlasUri = (uri) => {
  if (!uri) return false
  return uri.includes('<db_password>') || uri.includes('your_password') || uri.includes('change_me')
}

const invalidAtlasUri = rawMongoUri && isInvalidAtlasUri(rawMongoUri)
let mongoUri = invalidAtlasUri ? null : rawMongoUri || defaultLocalUri
let memoryServer

async function startMemoryServer() {
  if (!memoryServer) {
    memoryServer = await MongoMemoryServer.create()
  }
  return memoryServer.getUri()
}

async function connectDB(){
    try {
        if (!mongoUri) {
            console.warn('Invalid MONGODB_URI in server/.env. Falling back to in-memory MongoDB for development.')
            mongoUri = await startMemoryServer()
        }

        await mongoose.connect(mongoUri)
        console.log("Connected to MongoDB", mongoUri)

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
            try {
                mongoUri = await startMemoryServer()
                await mongoose.connect(mongoUri)
                console.log('Connected to in-memory MongoDB for development.', mongoUri)
                return
            } catch (memoryError) {
                console.error('Could not start in-memory MongoDB.', memoryError)
            }
        }

        console.error('Could not connect to MongoDB. Check your configured URI in server/.env or ensure MongoDB is reachable.')
        process.exit(1)
    }
}

export default connectDB