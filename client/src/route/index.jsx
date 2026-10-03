import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import AdminPermision from "../layouts/AdminPermision";

const page = (load) => async () => {
    const { default: Component } = await load()
    return { Component }
}

const adminPage = (load) => async () => {
    const { default: Component } = await load()
    return { element : <AdminPermision><Component/></AdminPermision> }
}

const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : "search",
                lazy : page(() => import("../pages/SearchPage"))
            },
            {
                path : 'login',
                lazy : page(() => import("../pages/Login"))
            },
            {
                path : "register",
                lazy : page(() => import("../pages/Register"))
            },
            {
                path : "forgot-password",
                lazy : page(() => import("../pages/ForgotPassword"))
            },
            {
                path : "verification-otp",
                lazy : page(() => import("../pages/OtpVerification"))
            },
            {
                path : "reset-password",
                lazy : page(() => import("../pages/ResetPassword"))
            },
            {
                path : "user",
                lazy : page(() => import("../pages/UserMenuMobile"))
            },
            {
                path : "dashboard",
                lazy : page(() => import("../layouts/Dashboard")),
                children : [
                    {
                        path : "profile",
                        lazy : page(() => import("../pages/Profile"))
                    },
                    {
                        path : "myorders",
                        lazy : page(() => import("../pages/MyOrders"))
                    },
                    {
                        path : "address",
                        lazy : page(() => import("../pages/Address"))
                    },
                    {
                        path : 'category',
                        lazy : adminPage(() => import("../pages/CategoryPage"))
                    },
                    {
                        path : "subcategory",
                        lazy : adminPage(() => import("../pages/SubCategoryPage"))
                    },
                    {
                        path : 'upload-product',
                        lazy : adminPage(() => import("../pages/UploadProduct"))
                    },
                    {
                        path : 'product',
                        lazy : adminPage(() => import("../pages/ProductAdmin"))
                    },
                    {
                        path : 'sales-report',
                        lazy : adminPage(() => import("../pages/SalesReport"))
                    },
                    {
                        path : 'payment-qr',
                        lazy : adminPage(() => import("../pages/PaymentQRCodeAdmin"))
                    },
                    {
                        path : 'admin-users',
                        lazy : adminPage(() => import("../pages/AdminUsers"))
                    }
                ]
            },
            {
                path : ":category",
                children : [
                    {
                        path : ":subCategory",
                        lazy : page(() => import("../pages/ProductListPage"))
                    }
                ]
            },
            {
                path : "product/:product",
                lazy : page(() => import("../pages/ProductDisplayPage"))
            },
            {
                path : 'cart',
                lazy : page(() => import("../pages/CartMobile"))
            },
            {
                path : "checkout",
                lazy : page(() => import("../pages/CheckoutPage"))
            },
            {
                path : "success",
                lazy : page(() => import("../pages/Success"))
            },
            {
                path : 'cancel',
                lazy : page(() => import("../pages/Cancel"))
            }
        ]
    }
])

export default router
