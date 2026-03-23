import { HashRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "../context/AppContext";
import Navbar from "../components/Navbar";
import ToastContainer from "../components/Toast";
import ProtectedRoute from "../components/ProtectedRoute";
import Home from "../pages/Home";
import Courses from "../pages/Courses";
import CourseDetails from "../pages/CourseDetails";
import ModuleDetails from "../pages/ModuleDetails";
import CourseForm from "../pages/CourseForm";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Register from "../pages/Register";

export default function AppRouter() {
  return (
    <AppProvider>
      <HashRouter>
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

          {/* Protected routes — require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/course-form" element={<CourseForm />} />
            <Route path="/course-form/:courseId" element={<CourseForm />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}