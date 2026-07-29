import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/useAuth";

import Header from "./components/Header/Header";
import Sidebar from "./components/Sidebar/Sidebar";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import GalleryPanel from "./pages/admin/GalleryPanel/GalleryPanel";

import Registration from "./pages/Registration";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";

import { ToastContainer } from "react-toastify";

import "./App.css";
import "react-toastify/dist/ReactToastify.css";

function App() {
    const { loading, user } = useAuth();

    if (loading) {
        return <div>Please wait...</div>;
    }

    return (
        <>
            <ToastContainer />

            <div className="app-shell">
                <Header />

                <div className="app-body">
                    {/* Show sidebar only for logged-in users */}
                    {user && (
                        <Sidebar />
                    )}

                    <main className="content">
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<Home />} />
                            <Route path="/about" element={<About />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/registration" element={<Registration />} />
                            <Route path="/verify-email" element={<VerifyEmail />} />
                            <Route path="/login" element={<Login />} />

                            {/* Admin Routes */}
                            <Route
                                path="/admin/gallery"
                                element={
                                    <ProtectedRoute role={0}>
                                        <GalleryPanel />
                                    </ProtectedRoute>
                                }
                            />
                        </Routes>
                    </main>
                </div>

                <Footer />
            </div>
        </>
    );
}

export default App;