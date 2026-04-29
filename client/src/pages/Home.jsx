import React from 'react'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import { useNavigate } from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import bannerImage from '../assets/banner-mobile.jpg'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()

  const handleRedirectProductListpage = (id,cat)=>{
      const subcategory = subCategoryData.find(sub =>{
        const filterData = sub.category.some(c => {
          return c._id == id
        })

        return filterData ? true : null
      })

      if(!subcategory){
          navigate(`/search?q=${encodeURIComponent(cat)}`)
          return
      }

      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`

      navigate(url)
  }


  return (
   <section className='bg-white'>
      <div className='container mx-auto px-4 my-6'>
        <div className='rounded-[2rem] overflow-hidden shadow-xl'>
          <img src={bannerImage} alt='4.4 mega sale banner' className='w-full object-cover' />
        </div>
      </div>
      <div className='container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                    <div className='bg-blue-100 min-h-24 rounded'></div>
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.length > 0 ? categoryData.map((cat,index)=>{
                return(
                  <div key={cat._id+"displayCategory"} className='w-full h-full cursor-pointer' onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}>
                    <div className='bg-white rounded shadow-sm p-2 h-full flex flex-col items-center justify-center gap-2'>
                        <div className='w-full h-32 flex items-center justify-center'>
                          <img 
                            src={cat.image}
                            className='max-w-full max-h-full object-contain'
                            alt={cat.name}
                          />
                        </div>
                        <p className='text-sm font-medium text-center text-gray-700'>{cat.name}</p>
                    </div>
                  </div>
                )
              }) : (
                <div className='col-span-full text-center py-10 text-neutral-500'>
                  <p className='text-sm md:text-base'>No categories available.</p>
                  <p className='text-xs text-neutral-400 mt-2'>Please contact the administrator to add categories.</p>
                </div>
              )
            )
          }
      </div>

      {/***display category product */}
      {
        categoryData?.map((c,index)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?._id+"CategorywiseProduct"} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }



   </section>
  )
}

export default Home
