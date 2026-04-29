import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const uploadImage = async(image)=>{
    const formData = new FormData()
    formData.append('image',image)

    const response = await Axios({
        ...SummaryApi.uploadImage,
        data : formData
    })

    return response
}

export default uploadImage