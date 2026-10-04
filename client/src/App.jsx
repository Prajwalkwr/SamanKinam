import { Outlet, useLocation } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import toast, { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory,setAllSubCategory,setLoadingCategory } from './store/productSlice';
import catalogSnapshot from './data/catalogSnapshot.json';
import { useDispatch } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import { handleAddItemCart } from './store/cartProduct'
import GlobalProvider from './provider/GlobalProvider';
import { FaCartShopping } from "react-icons/fa6";
import CartMobileLink from './components/CartMobile';

function App() {
  const dispatch = useDispatch()
  const location = useLocation()
  

  const fetchUser = async()=>{
      try {
        const userData = await fetchUserDetails()
        if(userData?.data){
          dispatch(setUserDetails(userData.data))
        }
      } catch (error) {
        console.log(error)
      }
  }

  const fetchCategory = async()=>{
    const seeded = catalogSnapshot.categories?.length > 0
    try {
        if (!seeded) dispatch(setLoadingCategory(true))
        const response = await Axios({
            ...SummaryApi.getCategory
        })
        const { data : responseData } = response

        if(responseData.success){
           dispatch(setAllCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name)))) 
        } else if (!seeded) {
          toast.error("Failed to load categories")
        }
    } catch (error) {
        if (!seeded) toast.error("Failed to load categories")
        console.log("Category fetch error:", error)
    }finally{
      dispatch(setLoadingCategory(false))
    }
  }

  const fetchSubCategory = async()=>{
    try {
        const response = await Axios({
            ...SummaryApi.getSubCategory
        })
        const { data : responseData } = response

        if(responseData.success){
           dispatch(setAllSubCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name)))) 
        }
    } catch (error) {
        console.log("SubCategory fetch error:", error)
    }finally{
    }
  }

  

  useEffect(()=>{
    if (catalogSnapshot.categories?.length) {
      dispatch(setAllCategory([...catalogSnapshot.categories].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))))
      dispatch(setAllSubCategory([...(catalogSnapshot.subcategories || [])].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))))
      dispatch(setLoadingCategory(false))
    }
    fetchUser()
    fetchCategory()
    fetchSubCategory()
    // fetchCartItem()
  },[])

  return (
    <GlobalProvider> 
      <Header/>
      <main className='min-h-[78vh]'>
          <Outlet/>
      </main>
      <Footer/>
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        limit={1}
        toastOptions={{
          style: {
            minWidth: '250px',
          },
        }}
      />
      {
        location.pathname !== '/checkout' && (
          <CartMobileLink/>
        )
      }
    </GlobalProvider>
  )
}

export default App
