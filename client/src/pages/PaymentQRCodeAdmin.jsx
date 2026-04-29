import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import uploadImage from '../utils/UploadImage'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'

const PaymentQRCodeAdmin = () => {
  const [currentQr, setCurrentQr] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchPaymentQRCode = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.paymentQRCode
      })

      if (response.data.success) {
        setCurrentQr(response.data.data || '')
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const response = await uploadImage(file)
      const data = response?.data?.data || {}
      const uploadUrl = data?.url || data?.secure_url || data?.secureUrl || ''

      if (!uploadUrl) {
        throw new Error('Image upload failed')
      }

      setPreviewUrl(uploadUrl)
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    if (!previewUrl) {
      toast.error('Please upload a QR image first')
      return
    }

    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.setPaymentQRCode,
        data: { qrUrl: previewUrl }
      })

      if (response.data.success) {
        setCurrentQr(response.data.data)
        toast.success(response.data.message)
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.setPaymentQRCode,
        data: { qrUrl: '' }
      })

      if (response.data.success) {
        setCurrentQr('')
        setPreviewUrl('')
        toast.success('Payment QR image has been cleared')
      }
    } catch (error) {
      AxiosToastError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentQRCode()
  }, [])

  return (
    <section>
      <div className='p-2 bg-white shadow-md flex items-center justify-between'>
        <h2 className='font-semibold'>Online Payment QR</h2>
      </div>

      <div className='grid gap-6 md:grid-cols-[1fr,320px] mt-4'>
        <div className='bg-white p-4 rounded shadow-sm'>
          <h3 className='font-semibold mb-4'>Upload a QR image</h3>

          <div className='grid gap-4'>
            <label className='grid gap-2'>
              <span className='font-medium'>QR Image</span>
              <input
                type='file'
                accept='image/*'
                onChange={handleFileChange}
                className='block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded file:bg-white file:text-sm file:font-semibold hover:file:bg-gray-100'
              />
            </label>

            {uploading && (
              <div className='text-sm text-gray-600'>Uploading image...</div>
            )}

            {previewUrl && (
              <div className='border rounded p-2'>
                <p className='text-sm text-slate-500 mb-2'>Preview</p>
                <img src={previewUrl} alt='QR preview' className='w-full h-auto object-contain rounded' />
              </div>
            )}

            <div className='flex gap-3'>
              <button
                type='button'
                onClick={handleSave}
                disabled={loading || uploading}
                className={`py-2 px-4 rounded text-white ${loading ? 'bg-gray-500' : 'bg-green-700 hover:bg-green-600'}`}
              >
                {loading ? 'Saving...' : 'Save QR Image'}
              </button>
              <button
                type='button'
                onClick={handleClear}
                disabled={loading}
                className='py-2 px-4 rounded border border-gray-300 text-gray-700 hover:bg-gray-100'
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        <div className='bg-white p-4 rounded shadow-sm'>
          <h3 className='font-semibold mb-4'>Current active QR</h3>
          {loading ? (
            <div className='text-sm text-neutral-500'>Loading...</div>
          ) : currentQr ? (
            <div className='space-y-3'>
              <img src={currentQr} alt='Current payment QR' className='w-full h-auto object-contain rounded border' />
              <p className='text-sm text-gray-600'>This QR image is now used in checkout for online payment.</p>
            </div>
          ) : (
            <div className='text-sm text-neutral-500'>No QR image has been uploaded yet.</div>
          )}
        </div>
      </div>
    </section>
  )
}

export default PaymentQRCodeAdmin
