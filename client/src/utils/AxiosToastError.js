import toast from "react-hot-toast"

const AxiosToastError = (error)=>{
    const message = error?.response?.data?.message || "Something went wrong"
    const toastId = `axios-error-${message}`

    toast.error(message, {
        id: toastId,
    })
}

export default AxiosToastError