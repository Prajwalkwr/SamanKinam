import '../config/env.js'
import mongoose from 'mongoose'
import { mkdirSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { catalogCollections } from '../utils/seedWebsiteData.js'

const { EJSON } = mongoose.mongo.BSON
const sourceUri = process.env.SOURCE_MONGODB_URI?.trim() || process.env.MONGODB_URI?.trim()
const outputDir = fileURLToPath(new URL('../data', import.meta.url))
const outputFile = fileURLToPath(new URL('../data/catalog.json', import.meta.url))

if (!sourceUri) {
    console.error('Set SOURCE_MONGODB_URI or MONGODB_URI in server/.env to the database you want to export.')
    process.exit(1)
}

await mongoose.connect(sourceUri, { serverSelectionTimeoutMS: 10000 })

try {
    const catalog = {}
    for (const name of catalogCollections) {
        catalog[name] = await mongoose.connection.db.collection(name).find().toArray()
        console.log(`  ${name}: ${catalog[name].length} documents`)
    }

    mkdirSync(outputDir, { recursive: true })
    writeFileSync(outputFile, EJSON.stringify(catalog, null, 2, { relaxed: false }) + '\n')
    console.log(`Wrote ${outputFile}`)
} finally {
    await mongoose.disconnect()
}
