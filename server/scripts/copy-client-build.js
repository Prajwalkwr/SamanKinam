import { cpSync, existsSync, rmSync } from 'fs'
import { fileURLToPath } from 'url'

const source = fileURLToPath(new URL('../../client/dist', import.meta.url))
const target = fileURLToPath(new URL('../public', import.meta.url))

if (!existsSync(source)) {
    console.error(`Client build not found at ${source}. Run the client build first.`)
    process.exit(1)
}

rmSync(target, { recursive: true, force: true })
cpSync(source, target, { recursive: true })
console.log(`Copied client build to ${target}`)
