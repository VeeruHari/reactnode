import { useAuth } from "../../context/useAuth";
import AdminLinks from "./AdminLinks/AdminLinks";
import UserLinks from "./UserLinks/UserLinks";

const Sidebar = () => {
  const { logout, user } = useAuth();

  async function handleLogout(event) {
    event.preventDefault();
    await logout();
  }

  return (
    <aside className="sidebar">
      <ul>
        {(!user || user?.role !== 0) ? <UserLinks /> : <AdminLinks />}
        {user && <li><a style={{ cursor: "pointer" }} onClick={handleLogout}>Logout</a></li>}
      </ul>
    </aside>
  );
};

export default Sidebar;