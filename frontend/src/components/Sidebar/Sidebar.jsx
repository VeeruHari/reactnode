import { useAuth } from "../../context/useAuth";
import AdminLinks from "./AdminLinks/AdminLinks";

const Sidebar = ({ onMenuClick }) => {
  const { logout, user } = useAuth();

  async function handleLogout(event) {
    event.preventDefault();
    await logout();
  }

  const clickHandler = (menu) => {
      //console.log(menu);
      onMenuClick?.(menu);
  }

  return (
    <aside className="sidebar">
      <ul>
        {user?.role === 0 && (
          <AdminLinks clickHandler={clickHandler} />
        )}
        <li><a style={{ cursor: "pointer" }} onClick={handleLogout}>Logout</a></li>
      </ul>
    </aside>
  );
};

export default Sidebar;