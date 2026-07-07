import { NavLink } from "react-router-dom";

const TopLinks = () => {
    const getLinkClassName = ({ isActive }) => (
        isActive ? "top-link selected" : "top-link"
    );

    return (
        <nav className="top-nav">
            <NavLink className={getLinkClassName} to="/">Home</NavLink>
            <NavLink className={getLinkClassName} to="/about">About</NavLink>
            <NavLink className={getLinkClassName} to="/contact">Contact Us</NavLink>
            <NavLink className={getLinkClassName} to="/registration">Register</NavLink>
        </nav>
    );
};

export default TopLinks;
