import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const TopLinks = () => {
    const { isAuthenticated } = useAuth();

    const getLinkClassName = ({ isActive }) => (
        isActive ? "top-link selected" : "top-link"
    );

    return (
        <nav className="top-nav">
            {!isAuthenticated && (
                <>
                    <NavLink className={getLinkClassName} to="/">Home</NavLink>
                    <NavLink className={getLinkClassName} to="/about">About</NavLink>
                    <NavLink className={getLinkClassName} to="/contact">Contact Us</NavLink>
                    <NavLink className={getLinkClassName} to="/login">Login</NavLink>
                </>
            )}
        </nav>
    );
};

export default TopLinks;
