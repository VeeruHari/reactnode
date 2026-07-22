import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AdminLinks from "./AdminLinks/AdminLinks";

const Sidebar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  async function handleLogout(event) {
    event.preventDefault();

    const result = await logout();

    if (result.success) {
        navigate("/login", { replace: true });
    } else {
        console.error(result.message);
    }
  }

  return (
    <aside className="sidebar">
      <ul>
        {user.role === 0 && (
          <AdminLinks />
        )}
        <li><a style={{ cursor: "pointer" }} onClick={handleLogout}>Logout</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;