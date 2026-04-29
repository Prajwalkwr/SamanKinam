import React from 'react'
import { useSelector } from 'react-redux'
import NoData from '../components/NoData'
import InvoiceCard from '../components/InvoiceCard'

const MyOrders = () => {
  const orders = useSelector(state => state.orders.order)

  return (
    <div className='space-y-4'>
      <div className='bg-white shadow-md p-3 font-semibold'>
        <h1>My Orders</h1>
      </div>
      {orders && orders.length > 0 ? (
        <InvoiceCard orders={orders} />
      ) : (
        <NoData />
      )}
    </div>
  )
}

export default MyOrders
