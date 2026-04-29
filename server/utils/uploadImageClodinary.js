import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLODINARY_CLOUD_NAME || !process.env.CLODINARY_API_KEY || !process.env.CLODINARY_API_SECRET_KEY) {
    throw new Error('Missing Cloudinary environment variables. Set CLODINARY_CLOUD_NAME, CLODINARY_API_KEY, and CLODINARY_API_SECRET_KEY in server/.env')
}

cloudinary.config({
    cloud_name : process.env.CLODINARY_CLOUD_NAME,
    api_key : process.env.CLODINARY_API_KEY,
    api_secret : process.env.CLODINARY_API_SECRET_KEY
})

const uploadImageClodinary = async(image)=>{
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
