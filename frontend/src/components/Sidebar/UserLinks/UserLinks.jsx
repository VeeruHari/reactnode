import { NavLink } from "react-router-dom";
const UserLinks = () => {

    const getLinkClassName = ({ isActive }) => (
        isActive ? "selected" : ""
    );

    return (
        <>
            <li>
                <NavLink className={getLinkClassName} to="/">Home</NavLink>
            </li>
        </>
    )
};

export default UserLinks;