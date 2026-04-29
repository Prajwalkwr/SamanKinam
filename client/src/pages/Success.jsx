import React, { useEffect, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import InvoiceCard from '../components/InvoiceCard'
import { useGlobalContext } from '../provider/GlobalProvider'
import { useSelector } from 'react-redux'

const Success = () => {
  const location = useLocation()
  const { fetchOrder } = useGlobalContext()
  const storeOrders = useSelector((state) => state.orders.order)
  const locationOrderData = location?.state?.orderData || []
  const hasLocationOrderData = Array.isArray(locationOrderData) && locationOrderData.length > 0

  useEffect(() => {
    if (!hasLocationOrderData && fetchOrder) {
      fetchOrder()
    }
  }, [fetchOrder, hasLocationOrderData])

  const ordersToShow = useMemo(() => {
    if (hasLocationOrderData) return locationOrderData
    if (Array.isArray(storeOrders) && storeOrders.length > 0) return storeOrders
    return []
  }, [hasLocationOrderData, locationOrderData, storeOrders])

  return (
    <div className='min-h-screen w-full bg-gray-50 p-4 md:p-6'>
      <div className='mx-auto max-w-4xl'>
        <div className='mb-4 rounded-lg bg-green-200 p-4 py-5 text-center'>
          <p className='text-green-800 font-bold text-lg'>
            {Boolean(location?.state?.text) ? location?.state?.text : 'Payment'} Successfully
          </p>
          <Link to='/' className='mt-3 inline-block border border-green-900 text-green-900 hover:bg-green-900 hover:text-white transition-all px-4 py-1 rounded'>
            Go To Home
          </Link>
        </div>

        {ordersToShow.length > 0 ? (
          <div className='space-y-4'>
            <div className='rounded bg-white p-4 border text-sm text-slate-700'>
              <p className='font-semibold mb-2'>Order bill</p>
              <p>Your invoice is ready below. You can print it using the button on the bill.</p>
            </div>
            <InvoiceCard orders={ordersToShow} />
          </div>
        ) : (
          <div className='rounded bg-white p-4 border text-center text-sm text-slate-600'>
            No bill available for this session, but your order was placed successfully. Your order should appear under My Orders once it is processed.
          </div>
        )}
      </div>
    </div>
  )
}

export default Success
