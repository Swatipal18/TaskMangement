import { NavLink } from 'react-router-dom';
import { FaTasks, FaHome, FaUserFriends, FaPlus } from 'react-icons/fa';

function Navigation() {
    return (
        <nav className="main-nav">
            <div className="logo">
                <h2>TaskMaster</h2>
            </div>
            <ul className="nav-links">
                <li>
                    <NavLink to="/" className={({ isActive }) => isActive ? "active-link" : ""}>
                        <FaHome /> Dashboard
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/tasks" className={({ isActive }) => isActive ? "active-link" : ""}>
                        <FaTasks /> Tasks
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/tasks/create" className={({ isActive }) => isActive ? "active-link" : ""}>
                        <FaPlus /> New Task
                    </NavLink>
                </li>
                <li>
                    <NavLink to="/users" className={({ isActive }) => isActive ? "active-link" : ""}>
                        <FaUserFriends /> Users
                    </NavLink>
                </li>
            </ul>
        </nav>
    );
}

export default Navigation;