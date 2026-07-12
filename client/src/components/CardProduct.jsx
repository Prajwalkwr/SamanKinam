import React from 'react'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { Link } from 'react-router-dom'
import { valideURLConvert } from '../utils/valideURLConvert'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import { getFirstImage } from '../utils/imageHelpers'
import noImage from '../assets/nothing here yet.webp'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import toast from 'react-hot-toast'
import { useGlobalContext } from '../provider/GlobalProvider'
import AddToCartButton from './AddToCartButton'

const CardProduct = ({data}) => {
    const url = `/product/${valideURLConvert(data.name)}-${data._id}`
  
  return (
    <Link to={url} className='border p-2 lg:p-4 flex flex-col gap-2 lg:gap-3 rounded cursor-pointer bg-white h-full w-full min-h-[430px]' >
      <div className='aspect-[4/3] w-full rounded overflow-hidden bg-slate-100'>
            <img 
                src={getFirstImage(data.image) || noImage}
                className='w-full h-full object-cover object-center'
                alt={data.name}
            />
      </div>
      <div className='flex items-center gap-1'>
        <div>
            {
              Boolean(data.discount) && (
                <p className='text-red-600 bg-red-100 px-2 w-fit text-xs rounded-full'>{data.discount}% discount</p>
              )
            }
        </div>
      </div>
      <div className='px-2 lg:px-0 font-medium text-ellipsis text-sm lg:text-base line-clamp-2'>
        {data.name}
      </div>
      <div className='w-fit gap-1 px-2 lg:px-0 text-sm lg:text-base'>
        {data.unit}
      </div>

      <div className='px-2 lg:px-0 flex flex-col gap-2 text-sm lg:text-base'>
        <div className='flex items-center justify-between gap-1'>
          <div className='font-semibold'>
              {DisplayPriceInRupees(pricewithDiscount(data.price,data.discount))} 
          </div>
          {
            !data?.stock || data?.stock <= 0 || data?.publish === false ? (
              <p className='text-red-500 text-sm text-center'>Out of stock</p>
            ) : (
              <span className='rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800'>
                {data.stock} available
              </span>
            )
          }
        </div>
        <div>
          {
            !data?.stock || data?.stock <= 0 || data?.publish === false ? null : (
              <AddToCartButton data={data} />
            )
          }
        </div>
      </div>

    </Link>
  )
}

export default CardProduct
