// Lets Vercel's edge cache serve public catalog reads, including stale copies while a cold instance boots
const cachePublic = (request, response, next) => {
    response.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=86400')
    response.setHeader('Vercel-CDN-Cache-Control', 'max-age=60, stale-while-revalidate=86400')
    next()
}

export default cachePublic
