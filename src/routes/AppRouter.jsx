import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import ToastContainer from "../components/Toast";
import ColdStartBanner from "../components/ColdStartBanner";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import Courses from "../pages/Courses";
import CourseDetails from "../pages/CourseDetails";
import ModuleDetails from "../pages/ModuleDetails";
import CourseForm from "../pages/CourseForm";
import Dashboard from "../pages/Dashboard";
import Certificates from "../pages/Certificates";
import Community from "../pages/Community";
import VerifyCertificate from "../pages/VerifyCertificate";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import Support from "../pages/Support";
import Checkout from "../pages/Checkout";

export default function AppRouter() {
  return (
    <AppProvider>
      <HashRouter>
        <ColdStartBanner />
        <Navbar />
        <ToastContainer />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetails />} />
          <Route path="/courses/:courseId/modules/:moduleId" element={<ModuleDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/support" element={<Support />} />
          <Route path="/checkout/:courseId" element={<Checkout />} />
          <Route path="/verify/:certId" element={<VerifyCertificate />} />

          {/* Protected routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/community" element={<Community />} />
            <Route path="/course-form" element={<CourseForm />} />
            <Route path="/course-form/:courseId" element={<CourseForm />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}