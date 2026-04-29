import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectedAddressId, setSelectedAddressId] = useState("")
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()
  const [loadingCOD, setLoadingCOD] = useState(false)
  const [loadingOnline, setLoadingOnline] = useState(false)
  const [onlineCheckoutUrl, setOnlineCheckoutUrl] = useState("")
  const [showPaymentQrPanel, setShowPaymentQrPanel] = useState(false)
  const [adminPaymentQR, setAdminPaymentQR] = useState("")
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [paymentOrderData, setPaymentOrderData] = useState(null)
  const customPaymentQR = import.meta.env.VITE_CUSTOM_PAYMENT_QR?.trim() || ""
  const customQRCodeSrc = customPaymentQR && customPaymentQR.startsWith('http')
    ? customPaymentQR
    : customPaymentQR
      ? new URL(customPaymentQR, import.meta.url).href
      : ""
  const user = useSelector(state => state?.user)

  useEffect(() => {
    if (!user?._id) {
      toast.error("Please login to access checkout")
      navigate('/login')
    }
  }, [user, navigate])

  useEffect(() => {
    const fetchAdminPaymentQR = async () => {
      try {
        const response = await Axios({
          ...SummaryApi.paymentQRCode
        })
        if (response.data.success) {
          setAdminPaymentQR(response.data.data || "")
        }
      } catch (error) {
        // Do not block checkout when admin QR fetch fails
        console.error('Failed to load admin payment QR:', error)
      }
    }

    fetchAdminPaymentQR()
  }, [])

  useEffect(() => {
    if (!selectedAddressId && Array.isArray(addressList) && addressList.length > 0) {
      const activeAddress = addressList.find((address) => address.status)
      if (activeAddress) {
        setSelectedAddressId(activeAddress._id)
        return
      }

      setSelectedAddressId(addressList[0]._id)
    }
  }, [addressList, selectedAddressId])

  const handleCashOnDelivery = async() => {
      console.log('Cash on Delivery button clicked')
      console.log('User:', user)
      console.log('Cart items:', cartItemsList)
      console.log('Address list:', addressList)
      console.log('Selected address ID:', selectedAddressId)

      if (loadingCOD) return; // Prevent multiple clicks

      if (!user?._id) {
        toast.error("Please login to place an order")
        navigate('/login')
        return
      }

      // Validation checks
      if (!cartItemsList || cartItemsList.length === 0) {
        toast.error("Your cart is empty")
        return
      }

      if (addressList.length === 0) {
        toast.error("Please add a delivery address")
        setOpenAddress(true)
        return
      }

      const selectedAddressData = addressList.find(address => address._id === selectedAddressId)
      if(!selectedAddressData){
        toast.error("Please select a delivery address")
        return
      }

      // Validate that address has complete delivery information
      if(!selectedAddressData.address_line || !selectedAddressData.city || !selectedAddressData.country){
        toast.error("Selected address is incomplete. Please ensure address line, city, and country are filled.")
        return
      }
      
      if(!selectedAddressData.mobile){
        toast.error("Phone number is required")
        return
      }

      // Validate phone number format (10 digits)
      const phoneStr = String(selectedAddressData.mobile || '').replace(/\s+/g, '').replace(/^\+977/, '')
      const phoneRegex = /^[0-9]{10}$/
      if(!phoneRegex.test(phoneStr)){
        toast.error("Please enter a valid 10-digit phone number")
        return
      }

      setLoadingCOD(true);
      try {
          const response = await Axios({
            ...SummaryApi.CashOnDeliveryOrder,
            data : {
              list_items : cartItemsList,
              addressId : selectedAddressId,
              subTotalAmt : totalPrice,
              totalAmt :  totalPrice,
            }
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              if(fetchOrder){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order",
                  orderData : responseData.data
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      } finally {
        setLoadingCOD(false);
      }
  }

  const handleOnlinePayment = async()=>{
    console.log('Online Payment button clicked')
    console.log('User:', user)
    console.log('Cart items:', cartItemsList)
    console.log('Address list:', addressList)
    console.log('Selected address ID:', selectedAddressId)

    if (loadingOnline) return; // Prevent multiple clicks

    if (!user?._id) {
      toast.error("Please login to place an order")
      navigate('/login')
      return
    }

    if (adminPaymentQR) {
      setOnlineCheckoutUrl(adminPaymentQR)
      setShowPaymentQrPanel(true)
      toast.success("Scan the admin QR code to complete payment.")
      return
    }

    // Validation checks
    if (!cartItemsList || cartItemsList.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    if (addressList.length === 0) {
      toast.error("Please add a delivery address")
      setOpenAddress(true)
      return
    }

    const selectedAddressData = addressList.find(address => address._id === selectedAddressId)
    if(!selectedAddressData){
      toast.error("Please select a delivery address")
      return
    }
    // Validate that address has complete delivery information
    if(!selectedAddressData.address_line || !selectedAddressData.city || !selectedAddressData.country){
      toast.error("Selected address is incomplete. Please ensure address line, city, and country are filled.")
      return
    }
    if(!selectedAddressData.mobile){
      toast.error("Phone number is required")
      return
    }

    // Validate phone number format (10 digits)
    const phoneStr = String(selectedAddressData.mobile || '').replace(/\s+/g, '').replace(/^\+977/, '')
    const phoneRegex = /^[0-9]{10}$/
    if(!phoneRegex.test(phoneStr)){
      toast.error("Please enter a valid 10-digit phone number")
      return
    }

    setLoadingOnline(true);
    try {
        const response = await Axios({
            ...SummaryApi.payment_url,
            data : {
              list_items : cartItemsList,
              addressId : selectedAddressId,
              subTotalAmt : totalPrice,
              totalAmt : totalPrice,
            }
        })

        const { data : responseData } = response

        const checkoutUrl = responseData?.url || responseData?.payment_link || ''
        if (checkoutUrl) {
          setOnlineCheckoutUrl(checkoutUrl)
          setShowPaymentQrPanel(true)
          toast.success("Scan to complete payment.")
        } else {
          // Generate a test QR code for demonstration purposes
          const testPaymentUrl = `https://example.com/payment?amount=${totalPrice}&order=test-${Date.now()}`
          setOnlineCheckoutUrl(testPaymentUrl)
          setShowPaymentQrPanel(true)
          toast.success("Demo QR code generated. This is for testing purposes.")
        }
    } catch (error) {
        // Even if payment API fails, generate a demo QR code
        const demoPaymentUrl = `https://example.com/demo-payment?amount=${totalPrice}&order=demo-${Date.now()}`
        setOnlineCheckoutUrl(demoPaymentUrl)
        setShowPaymentQrPanel(true)
        toast.success("Demo QR code generated for testing.")
    } finally {
        setLoadingOnline(false);
    }
  }

  const handlePaymentCompleted = async () => {
    try {
      // For demo purposes, we'll create the order directly
      // In production, this would be handled by Stripe webhooks
      const response = await Axios({
        ...SummaryApi.CashOnDeliveryOrder, // Reuse COD endpoint for demo
        data: {
          list_items: cartItemsList,
          addressId: selectedAddressId,
          subTotalAmt: totalPrice,
          totalAmt: totalPrice,
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        setPaymentCompleted(true)
        setPaymentOrderData(responseData.data)

        // Clear cart and update orders
        if (fetchCartItem) {
          fetchCartItem()
        }
        if (fetchOrder) {
          fetchOrder()
        }

        toast.success("Payment completed successfully!")

        // Auto redirect to success page after 3 seconds
        setTimeout(() => {
          navigate('/success', {
            state: {
              text: "Payment",
              orderData: responseData.data
            }
          })
        }, 3000)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }

  return (
    <section className='bg-red-50'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        <div className='w-full'>
          {/***address***/}
          <h3 className='text-lg font-semibold'>Choose your delivery address *</h3>
          <p className='text-sm text-red-600 mb-2'>Complete address with 10-digit phone number is required for delivery</p>
          <div className='bg-white p-2 grid gap-4'>
            {
              addressList.map((address, index) => {
                return (
                  <label htmlFor={"address" + index} className='block'>
                    <div className={`border rounded p-3 flex gap-3 hover:bg-red-50 ${address.status ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}>
                      <div>
                        <input
                          id={"address" + index}
                          type='radio'
                          value={address._id}
                          checked={selectedAddressId === address._id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          name='address'
                        />
                      </div>
                      <div>
                        <p>{address.address_line}</p>
                        <p>{address.city}</p>
                        <p>{address.state}</p>
                        <p>{address.country} - {address.pincode}</p>
                        <p>{address.mobile}</p>
                        {address.status && <p className='text-xs text-red-600'>Default address</p>}
                      </div>
                    </div>
                  </label>
                )
              })
            }
            <div onClick={() => setOpenAddress(true)} className='h-16 bg-red-50 border-2 border-dashed flex justify-center items-center cursor-pointer'>
              Add address
            </div>
          </div>



        </div>

        <div className='w-full max-w-md bg-white py-4 px-2'>
          {/**summary**/}
          <h3 className='text-lg font-semibold'>Summary</h3>
          <div className='bg-white p-4'>
            <h3 className='font-semibold'>Bill details</h3>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Items total</p>
              <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(totalPrice)}</span></p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Quntity total</p>
              <p className='flex items-center gap-2'>{totalQty} item</p>
            </div>
            <div className='flex gap-4 justify-between ml-1'>
              <p>Delivery Charge</p>
              <p className='flex items-center gap-2'>Free</p>
            </div>
            <div className='font-semibold flex items-center justify-between gap-4'>
              <p >Grand total</p>
              <p>{DisplayPriceInRupees(totalPrice)}</p>
            </div>
          </div>
          <div className='w-full flex flex-col gap-4'>
            <button 
              className='py-2 px-4 bg-red-600 hover:bg-red-700 rounded text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed' 
              onClick={handleOnlinePayment} 
              disabled={loadingOnline || paymentCompleted}
            >
              {paymentCompleted ? 'Payment Completed' : loadingOnline ? 'Processing...' : 'Online Payment'}
            </button>

            <button 
              className='py-2 px-4 border-2 border-red-600 font-semibold text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed' 
              onClick={handleCashOnDelivery} 
              disabled={loadingCOD}
            >
              {loadingCOD ? 'Placing Order...' : 'Cash on Delivery'}
            </button>
          </div>

          {(showPaymentQrPanel && (onlineCheckoutUrl || customPaymentQR || adminPaymentQR)) && !paymentCompleted && (
            <div className='bg-white rounded border p-4 mt-4'>
              <div className='flex justify-between items-center mb-2'>
                <h4 className='text-lg font-semibold'>Scan to Pay</h4>
                <button
                  onClick={() => setShowPaymentQrPanel(false)}
                  className='text-gray-500 hover:text-gray-700 text-xl'
                  title='Close QR code'
                >
                  ×
                </button>
              </div>
              <p className='text-sm text-gray-600 mb-4'>
                {adminPaymentQR
                  ? `Scan this code to pay ${DisplayPriceInRupees(totalPrice)}`
                  : customPaymentQR
                  ? `Scan this code to pay ${DisplayPriceInRupees(totalPrice)}`
                  : onlineCheckoutUrl.includes('demo') || onlineCheckoutUrl.includes('example')
                  ? `Pay online - Amount: ${DisplayPriceInRupees(totalPrice)}`
                  : `Scan this code to pay ${DisplayPriceInRupees(totalPrice)}`
                }
              </p>
              <div className='flex justify-center'>
                <img
                  src={adminPaymentQR || customQRCodeSrc || `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(onlineCheckoutUrl)}`}
                  alt='Payment QR code'
                  className='w-72 h-72 object-contain border rounded'
                  onError={(e) => {
                    if (!adminPaymentQR && !customQRCodeSrc) {
                      e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent('https://example.com/test-payment')}`
                    }
                  }}
                />
              </div>
              <div className='mt-4 text-center space-y-3'>
                <button
                  onClick={handlePaymentCompleted}
                  className='inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors'
                >
                  Paid
                </button>
              </div>
            </div>
          )}

          {paymentCompleted && paymentOrderData && (
            <div className='bg-white rounded border p-4 mt-4'>
              <div className='text-center'>
                <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <svg className='w-8 h-8 text-red-600' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M5 13l4 4L19 7'></path>
                  </svg>
                </div>
                <h4 className='text-lg font-semibold text-red-600 mb-2'>Payment Successful!</h4>
                <p className='text-sm text-red-600 mb-4'>Your order has been placed successfully. Redirecting to order details...</p>
                <div className='bg-red-50 p-4 rounded text-left'>
                  <h5 className='font-semibold mb-2'>Order Summary:</h5>
                  <p className='text-sm'><strong>Items:</strong> {totalQty}</p>
                  <p className='text-sm'><strong>Total Amount:</strong> {DisplayPriceInRupees(totalPrice)}</p>
                  <p className='text-sm'><strong>Order ID:</strong> {paymentOrderData[0]?.orderId || 'Processing...'}</p>
                </div>
                <button
                  onClick={() => {
                    setPaymentCompleted(false)
                    setPaymentOrderData(null)
                    setOnlineCheckoutUrl('')
                  }}
                  className='mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors'
                >
                  Make Another Payment
                </button>
              </div>
            </div>
          )}
        </div>
      </div>


      {
        openAddress && (
          <AddAddress close={() => setOpenAddress(false)} />
        )
      }
    </section>
  )
}

export default CheckoutPage
