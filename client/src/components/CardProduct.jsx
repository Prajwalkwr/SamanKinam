import React, { useMemo } from 'react'
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
    const randomMinutes = useMemo(() => {
      const id = String(data._id || data.name || Math.random())
      let hash = 0
      for (let i = 0; i < id.length; i += 1) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash)
      }
      return Math.floor(Math.abs(hash) % 60) + 1
    }, [data._id, data.name])
  
  return (
    <Link to={url} className='border py-2 lg:p-4 flex flex-col gap-1 lg:gap-3 min-w-36 lg:min-w-52 rounded cursor-pointer bg-white h-full' >
      <div className='min-h-20 w-full max-h-24 lg:max-h-32 rounded overflow-hidden bg-slate-100'>
            <img 
                src={getFirstImage(data.image) || noImage}
                className='w-full h-full object-cover object-center'
                alt={data.name}
            />
      </div>
      <div className='flex items-center gap-1'>
        <div className='rounded text-xs w-fit p-[1px] px-2 text-red-600 bg-red-50'>
              {randomMinutes} min
        </div>
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

      <div className='px-2 lg:px-0 flex flex-col gap-2 text-sm lg:text-base mt-auto'>
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
