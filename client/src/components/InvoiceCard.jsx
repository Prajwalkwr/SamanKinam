import React, { useMemo } from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { getFirstImage } from '../utils/imageHelpers'

const InvoiceCard = ({ orders }) => {
  const groupedOrders = useMemo(() => {
    return orders.reduce((acc, order) => {
      const groupId = order.invoiceId || order.orderId
      if (!acc[groupId]) {
        acc[groupId] = {
          invoiceId: groupId,
          payment_status: order.payment_status,
          delivery_address: order.delivery_address,
          createdAt: order.createdAt,
          items: [],
        }
      }

      acc[groupId].items.push(order)
      return acc
    }, {})
  }, [orders])

  const groups = Object.values(groupedOrders)

  if (!groups.length) {
    return (
      <div className='rounded bg-white border p-4 text-center text-sm text-gray-500'>
        No bill data available.
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {groups.map((group) => {
        const invoiceTotal = group.items.reduce((sum, item) => {
          return sum + (item.unitPrice || item.totalAmt || 0) * (item.quantity || 1)
        }, 0)

        return (
          <div key={group.invoiceId} className='bg-white rounded-lg border shadow-sm p-5'>
            <div className='flex flex-col md:flex-row md:justify-between gap-4'>
              <div>
                <h2 className='text-lg font-semibold'>Invoice #{group.invoiceId}</h2>
                <p className='text-sm text-gray-600'>Status: {group.payment_status}</p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Placed on: {new Date(group.createdAt).toLocaleString()}</p>
                {group.delivery_address && typeof group.delivery_address === 'object' && (
                  <div className='mt-2 text-sm text-gray-700'>
                    <p>{group.delivery_address.address_line}</p>
                    <p>{group.delivery_address.city}, {group.delivery_address.state}</p>
                    <p>{group.delivery_address.country} - {group.delivery_address.pincode}</p>
                    <p>{group.delivery_address.mobile}</p>
                  </div>
                )}
              </div>
            </div>

            <div className='mt-4 overflow-x-auto'>
              <table className='w-full text-sm border-collapse'>
                <thead>
                  <tr className='bg-slate-50'>
                    <th className='border px-3 py-2 text-left'>Item</th>
                    <th className='border px-3 py-2 text-right'>Qty</th>
                    <th className='border px-3 py-2 text-right'>Unit Price</th>
                    <th className='border px-3 py-2 text-right'>Line Total</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map((item) => {
                    const quantity = item.quantity || 1
                    const unitPrice = item.unitPrice || item.totalAmt || 0
                    const lineTotal = unitPrice * quantity

                    return (
                      <tr key={item._id} className='border-t'>
                        <td className='border px-3 py-3'>
                          <div className='flex items-center gap-3'>
                            {getFirstImage(item.product_details?.image) ? (
                              <img src={getFirstImage(item.product_details?.image)} alt={item.product_details?.name} className='w-12 h-12 object-cover rounded' />
                            ) : (
                              <div className='w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-500'>No image</div>
                            )}
                            <div>
                              <p className='font-medium'>{item.product_details?.name || 'Unknown item'}</p>
                            </div>
                          </div>
                        </td>
                        <td className='border px-3 py-3 text-right'>{quantity}</td>
                        <td className='border px-3 py-3 text-right'>{DisplayPriceInRupees(unitPrice)}</td>
                        <td className='border px-3 py-3 text-right'>{DisplayPriceInRupees(lineTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className='mt-4 flex flex-col gap-2 items-end'>
              <div className='text-right text-base font-semibold'>Total: {DisplayPriceInRupees(invoiceTotal)}</div>
              <button
                onClick={() => window.print()}
                className='inline-flex items-center justify-center rounded px-4 py-2 border border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
              >
                Print Bill
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default InvoiceCard
