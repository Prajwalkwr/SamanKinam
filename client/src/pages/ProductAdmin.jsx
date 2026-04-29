import React, { useEffect, useState } from 'react'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import Loading from '../components/Loading'
import ProductCardAdmin from '../components/ProductCardAdmin'
import { IoSearchOutline } from "react-icons/io5";
import EditProductAdmin from '../components/EditProductAdmin'

const ProductAdmin = () => {
  const [productData,setProductData] = useState([])
  const [page,setPage] = useState(1)
  const [loading,setLoading] = useState(false)
  const [totalPageCount,setTotalPageCount] = useState(1)
  const [search,setSearch] = useState("")
  const [summaryData, setSummaryData] = useState({
    totalProducts: 0,
    totalStock: 0,
    outOfStockCount: 0,
    lowStockCount: 0
  })
  
  const fetchProductData = async()=>{
    try {
        setLoading(true)
        const response = await Axios({
           ...SummaryApi.getProduct,
           data : {
              page : page,
              limit : 12,
              search : search 
           }
        })

        const { data : responseData } = response 

        if(responseData.success){
          setTotalPageCount(responseData.totalNoPage)
          setProductData(responseData.data)
        }

    } catch (error) {
      AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

  const fetchProductSummary = async()=>{
    try {
      const response = await Axios({
        ...SummaryApi.getProductSummary
      })

      if(response?.data?.success){
        setSummaryData(response.data.data)
      }
    } catch (error) {
      AxiosToastError(error)
    }
  }
  
  useEffect(() => {
    fetchProductData()
    fetchProductSummary()
  }, [page])

  const handleNext = ()=>{
    if(page !== totalPageCount){
      setPage(preve => preve + 1)
    }
  }
  const handlePrevious = ()=>{
    if(page > 1){
      setPage(preve => preve - 1)
    }
  }

  const handleOnChange = (e)=>{
    const { value } = e.target
    setSearch(value)
    setPage(1)
  }

  useEffect(()=>{
    let flag = true 

    const interval = setTimeout(() => {
      if(flag){
        fetchProductData()
        flag = false
      }
    }, 300);

    return ()=>{
      clearTimeout(interval)
    }
  },[search])
  
  const totalProducts = productData.length
  const totalStock = productData.reduce((sum, product) => sum + (Number(product.stock) || 0), 0)
  const outOfStockCount = productData.filter(product => !product?.stock || product.stock <= 0).length
  const lowStockCount = productData.filter(product => product.stock > 0 && product.stock <= 5).length

  return (
    <section className=''>
        <div className='p-2 bg-white shadow-md flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                <h2 className='font-semibold'>Product Inventory</h2>
                <div className='h-full min-w-24 max-w-56 w-full md:w-auto bg-blue-50 px-4 flex items-center gap-3 py-2 rounded border focus-within:border-primary-200'>
                  <IoSearchOutline size={25}/>
                  <input
                    type='text'
                    placeholder='Search product here ...' 
                    className='h-full w-full outline-none bg-transparent'
                    value={search}
                    onChange={handleOnChange}
                  />
                </div>
          <button
            type='button'
            onClick={fetchProductData}
            className='bg-slate-100 text-slate-800 px-3 py-2 rounded border border-slate-300 hover:bg-slate-200'
          >
            Refresh
          </button>
        </div>
        {
          loading && (
            <Loading/>
          )
        }

        <div className='grid grid-cols-1 md:grid-cols-4 gap-3 mt-4'>
          <div className='bg-white rounded p-4 shadow-sm border border-slate-200'>
            <p className='text-sm text-slate-500'>Products on page</p>
            <p className='text-2xl font-semibold'>{productData.length}</p>
          </div>
          <div className='bg-white rounded p-4 shadow-sm border border-slate-200'>
            <p className='text-sm text-slate-500'>Total products</p>
            <p className='text-2xl font-semibold'>{summaryData.totalProducts}</p>
          </div>
          <div className='bg-white rounded p-4 shadow-sm border border-slate-200'>
            <p className='text-sm text-slate-500'>Total inventory stock</p>
            <p className='text-2xl font-semibold'>{summaryData.totalStock}</p>
          </div>
          <div className='bg-white rounded p-4 shadow-sm border border-slate-200'>
            <div className='flex items-center justify-between gap-2'>
              <div>
                <p className='text-sm text-slate-500'>Out of stock products</p>
                <p className='text-2xl font-semibold'>{summaryData.outOfStockCount}</p>
              </div>
              <div className='text-xs px-2 py-1 rounded-full bg-red-100 text-red-700'>
                {(summaryData.outOfStockCount > 0 || summaryData.lowStockCount > 0) ? 'Review' : 'Good'}
              </div>
            </div>
            <div className='mt-3 text-sm text-slate-500'>Low stock: {summaryData.lowStockCount}</div>
          </div>
        </div>

        <div className='p-4 bg-blue-50'>


            <div className='min-h-[55vh]'>
              <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                {
                  productData.map((p,index)=>{
                    return(
                      <ProductCardAdmin key={p._id + "productAdmin" + index} data={p} fetchProductData={fetchProductData}  />
                    )
                  })
                }
              </div>

              {
                !loading && productData.length === 0 && (
                  <div className='text-center text-neutral-500 py-10'>No products found.</div>
                )
              }
            </div>
            
            <div className='flex justify-between my-4'>
              <button onClick={handlePrevious} className="border border-primary-200 px-4 py-1 hover:bg-primary-200">Previous</button>
              <button className='w-full bg-slate-100'>{page}/{totalPageCount}</button>
              <button onClick={handleNext} className="border border-primary-200 px-4 py-1 hover:bg-primary-200">Next</button>
            </div>

        </div>
          

      
    </section>
  )
}

export default ProductAdmin
