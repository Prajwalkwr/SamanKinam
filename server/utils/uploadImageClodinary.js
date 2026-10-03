import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLODINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLODINARY_API_KEY || process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLODINARY_API_SECRET_KEY || process.env.CLOUDINARY_API_SECRET

cloudinary.config({
    cloud_name : cloudName,
    api_key : apiKey,
    api_secret : apiSecret
})

const uploadImageClodinary = async(image)=>{
    if (!cloudName || !apiKey || !apiSecret) {
        throw new Error('Missing Cloudinary environment variables. Set CLODINARY_CLOUD_NAME, CLODINARY_API_KEY, and CLODINARY_API_SECRET_KEY.')
    }

    const buffer = image?.buffer || Buffer.from(await image.arrayBuffer())

    const uploadImage = await new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream({ folder : "binkeyit"},(error,uploadResult)=>{
            if(error){
                return reject(error)
            }
            resolve(uploadResult)
        }).end(buffer)
    })

    return uploadImage
}

export default uploadImageClodinary
