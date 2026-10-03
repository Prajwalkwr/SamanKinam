import '../config/env.js'
import mongoose from 'mongoose'

const sourceUri = process.env.SOURCE_MONGODB_URI?.trim() || process.env.MONGODB_URI?.trim()
const targetUri = process.env.TARGET_MONGODB_URI?.trim()
const dryRun = !targetUri

if (!sourceUri) {
    console.error('Set SOURCE_MONGODB_URI or MONGODB_URI in server/.env to the database you want to copy.')
    process.exit(1)
}

const source = await mongoose.createConnection(sourceUri, { serverSelectionTimeoutMS: 10000 }).asPromise()
const target = dryRun ? null : await mongoose.createConnection(targetUri, { serverSelectionTimeoutMS: 20000 }).asPromise()

try {
    const collections = (await source.db.listCollections().toArray())
        .filter((collection) => collection.type !== 'view' && !collection.name.startsWith('system.'))

    console.log(`${dryRun ? 'Dry run, no TARGET_MONGODB_URI set. ' : ''}Copying ${collections.length} collections from "${source.db.databaseName}"${dryRun ? '' : ` to "${target.db.databaseName}"`}`)

    for (const { name } of collections) {
        const documents = await source.db.collection(name).find().toArray()

        if (dryRun || documents.length === 0) {
            console.log(`  ${name}: ${documents.length} documents`)
            continue
        }

        const result = await target.db.collection(name).bulkWrite(
            documents.map((document) => ({
                replaceOne: { filter: { _id: document._id }, replacement: document, upsert: true }
            })),
            { ordered: false }
        )

        console.log(`  ${name}: ${documents.length} documents (${result.upsertedCount} added, ${result.modifiedCount} updated)`)
    }
} finally {
    await source.close()
    await target?.close()
}
