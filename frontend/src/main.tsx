import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.tsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./Admin/Pages/Dashboard.tsx";
import Category from "./Admin/Pages/Category.tsx";
import SubCategory from "./Admin/Pages/SubCategory.tsx";
import AdminLayout from "./Admin/Layout/AdminLayout.tsx";
import Error from "./Shared/Utils/Error.tsx";
import AddCategory from "./Admin/Pages/AddCategory.tsx";
import SignUp from "./Client/Pages/SignUp.tsx";
import Login from "./Client/Pages/Login.tsx";
import AddSubCategory from "./Admin/Pages/AddSubCategory.tsx";
import AdminLogin from "./Admin/Pages/AdminLogin.tsx";
import Admin from "./Admin/Pages/Admin.tsx";
import AddAdmin from "./Admin/Pages/AddAdmin.tsx";
import Service from "./Admin/Pages/Service.tsx";
import PendingBooking from "./Admin/Pages/Maid/MaidPendingBooking.tsx";
import ConfirmedBooking from "./Admin/Pages/Maid/MaidConfirmedBooking.tsx";
import CanceledBooking from "./Admin/Pages/Maid/MaidCanceledBooking.tsx";
import App from "./App.tsx";
import Home from "./Client/Pages/Home.tsx";
import MaidBooking from "./Client/Pages/Maid/MaidBooking.tsx";
import ClientSideService from "./Client/Pages/Maid/MaidService.tsx";
import AddMaidService from "./Client/Pages/Maid/MaidAddService.tsx";
import MaidConfirmBooking from "./Client/Pages/Maid/MaidConfirmBooking.tsx";
import Profile from "./Client/Components/Header/Profile.tsx";
import PgType from "./Admin/Pages/PgType.tsx";
import AddPgType from "./Admin/Pages/AddPgType.tsx";
import AddPg from "./Client/Pages/Pg/AddPg.tsx";
import PgService from "./Admin/Pages/PgService.tsx";
import ClientPgService from "./Client/Pages/Pg/ClientPgService.tsx";
import AllAvailablePg from "./Client/Pages/User/AllAvailablePg.tsx";
import PgProduct from "./Client/Pages/User/PgProduct.tsx";
import AboutUs from "./Client/Pages/AboutUs.tsx";
import Contact from "./Client/Pages/Contact.tsx";
import PgPendingBooking from "./Admin/Pages/Pg/PgPendingBooking.tsx";
import PgConfirmedBooking from "./Admin/Pages/Pg/PgConfirmedBooking.tsx";
import PgCanceledBooking from "./Admin/Pages/Pg/PgCanceledBooking.tsx";
import RecievedPgBooking from "./Client/Pages/Pg/RecievedPgBooking.tsx";
import HireMaid from "./Client/Pages/User/HireMaid.tsx";
import UserMaidBooking from "./Client/Pages/User/UserMaidBooking.tsx";
import UserPgBooking from "./Client/Pages/User/UserPgBooking.tsx";
import ProfileApproval from "./Admin/Pages/ProfileApproval.tsx";
import ContactUs from "./Admin/Pages/AdminContactUs.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
      {
        path: "/aboutus",
        element: <AboutUs />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/booking",
        element: <MaidBooking />,
      },
      {
        path: "/services",
        element: <ClientSideService />,
      },
      {
        path: "/pgservices",
        element: <ClientPgService />,
      },
      {
        path: "/addpg",
        element: <AddPg />, //// check api is calling so in network data seems seen
      },
      {
        path: "/recievedpgbooking",
        element: <RecievedPgBooking />,
      },
      {
        path: "/mypgbooking",
        element: <UserPgBooking />,
      },
      {
        path: "/allavailablepg",
        element: <AllAvailablePg />,
      },
      {
        path: "/pgdetail",
        element: <PgProduct />,
      },
      {
        path: "/maidbooking",
        element: <HireMaid />,
      },
      {
        path: "/mymaidbooking",
        element: <UserMaidBooking />,
      },
      {
        path: "/addmaidservice",
        element: <AddMaidService />,
      },
      {
        path: "/maidconfirmbooking",
        element: <MaidConfirmBooking />, ////////
      },
    ],
  },
  {
    path: "/adminlogin",
    element: <AdminLogin />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        path: "/admin/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/admin/profileapproval",
        element: <ProfileApproval />,
      },
      {
        path: "/admin/contactus",
        element: <ContactUs />,
      },
      {
        path: "/admin/category",
        element: <Category />,
      },
      {
        path: "/admin/addcategory",
        element: <AddCategory />,
      },
      {
        path: "/admin/subcategory",
        element: <SubCategory />,
      },
      {
        path: "/admin/addsubcategory",
        element: <AddSubCategory />,
      },
      {
        path: "/admin/pgtype",
        element: <PgType />,
      },
      {
        path: "/admin/pgservices",
        element: <PgService />,
      },
      {
        path: "/admin/addpgtype",
        element: <AddPgType />,
      },
      {
        path: "/admin/admindetail",
        element: <Admin />,
      },
      {
        path: "/admin/addadmin",
        element: <AddAdmin />,
      },
      {
        path: "/admin/service",
        element: <Service />,
      },
      {
        path: "/admin/pendingbooking",
        element: <PendingBooking />,
      },
      {
        path: "/admin/confirmedbooking",
        element: <ConfirmedBooking />,
      },
      {
        path: "/admin/canceledbooking",
        element: <CanceledBooking />,
      },
      {
        path: "/admin/pgpendingbooking",
        element: <PgPendingBooking />,
      },
      {
        path: "/admin/pgconfirmedbooking",
        element: <PgConfirmedBooking />,
      },
      {
        path: "/admin/pgcanceledbooking",
        element: <PgCanceledBooking />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
