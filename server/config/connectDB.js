import mongoose from "mongoose";
import './env.js'

const rawMongoUri = process.env.MONGODB_URI?.trim()
const defaultLocalUri = 'mongodb://127.0.0.1:27017/SamanKinam'
const isServerless = Boolean(process.env.VERCEL)
const isRender = Boolean(process.env.RENDER)

const isInvalidAtlasUri = (uri) => {
  if (!uri) return false
  return uri.includes('<db_password>') || uri.includes('your_password') || uri.includes('change_me')
}

const isLocalUri = (uri) => /\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(uri || '')

const invalidAtlasUri = rawMongoUri && isInvalidAtlasUri(rawMongoUri)
const isHosted = isServerless || isRender
let mongoUri = invalidAtlasUri ? null : rawMongoUri || (isHosted ? null : defaultLocalUri)
if (isHosted && isLocalUri(mongoUri)) {
  mongoUri = null
}
if (isServerless) {
  process.env.MONGOMS_DOWNLOAD_DIR ||= '/tmp/mongodb-binaries'
  // MongoDB 8.x aborts on start inside the Vercel sandbox
  process.env.MONGOMS_VERSION ||= '7.0.14'
}
let memoryServer
let connectionPromise

async function startMemoryServer() {
  if (!memoryServer) {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    memoryServer = await MongoMemoryServer.create()
  }
  return memoryServer.getUri('SamanKinam')
}

async function connectToMemoryServer(reason) {
  console.warn(`${reason} Using a temporary in-memory MongoDB. Data resets whenever the server restarts; set MONGODB_URI to a MongoDB Atlas connection string to keep data.`)
  mongoUri = await startMemoryServer()
  await mongoose.connect(mongoUri)
  console.log('Connected to in-memory MongoDB.')
}

async function connect(){
    if (!mongoUri) {
        await connectToMemoryServer('MONGODB_URI is not set to a reachable database.')
        return
    }

    try {
        await mongoose.connect(mongoUri, isLocalUri(mongoUri) ? { serverSelectionTimeoutMS: 5000 } : {})
        console.log("Connected to MongoDB")

        if (isLocalUri(mongoUri)) {
            console.warn('Connected to local MongoDB. If this is not intended, set MONGODB_URI in server/.env.')
        } else if (mongoUri.startsWith('mongodb+srv://')) {
            console.log('Connected to Atlas MongoDB.')
        }
    } catch (error) {
        console.log("Mongodb connect error", error)

        if (!isServerless && isLocalUri(mongoUri)) {
            await connectToMemoryServer('Could not connect to local MongoDB.')
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
