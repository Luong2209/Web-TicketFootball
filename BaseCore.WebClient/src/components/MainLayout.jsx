import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/admin/checkin', label: 'Check-in', icon: 'fas fa-qrcode', adminOnly: true },
    { path: '/admin/users', label: 'Users', icon: 'fas fa-users', adminOnly: true },
];

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="wrapper bg-light min-vh-100">
            <nav className="main-header navbar navbar-expand navbar-white navbar-light border-bottom bg-white shadow-sm" style={{ marginLeft: 250 }}>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <span className="nav-link fw-semibold">Admin Console</span>
                    </li>
                </ul>
                <ul className="navbar-nav ms-auto">
                    <li className="nav-item d-none d-sm-inline-block">
                        <span className="nav-link">{user?.name || user?.username}</span>
                    </li>
                    <li className="nav-item">
                        <button className="btn btn-outline-secondary btn-sm mt-1 me-3" type="button" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt me-1" />
                            Logout
                        </button>
                    </li>
                </ul>
            </nav>

            <aside className="main-sidebar sidebar-dark-primary elevation-4 position-fixed top-0 start-0 min-vh-100 bg-dark text-white" style={{ width: 250, zIndex: 1030 }}>
                <Link to="/admin" className="brand-link d-block border-bottom border-secondary px-3 py-3 text-white text-decoration-none">
                    <span className="brand-text fs-5"><b>BaseCore</b> Tickets</span>
                </Link>

                <div className="sidebar">
                    <div className="user-panel d-flex align-items-center border-bottom border-secondary px-3 py-3">
                        <div className="image me-2">
                            <i className="fas fa-user-circle fa-2x text-secondary" />
                        </div>
                        <div className="info text-truncate">
                            <span className="d-block text-white">{user?.name || user?.username}</span>
                            <small className="text-secondary">{user?.email || 'Administrator'}</small>
                        </div>
                    </div>

                    <nav className="mt-3 px-2">
                        <ul className="nav nav-pills nav-sidebar flex-column">
                            {navItems.filter((item) => !item.adminOnly || isAdmin()).map((item) => (
                                <li className="nav-item mb-1" key={item.path}>
                                    <Link className={`nav-link text-white ${location.pathname === item.path ? 'active bg-primary' : ''}`} to={item.path}>
                                        <i className={`nav-icon ${item.icon} me-2`} />
                                        <p className="d-inline mb-0">{item.label}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>

            <div className="content-wrapper bg-light" style={{ marginLeft: 250, minHeight: 'calc(100vh - 57px)' }}>
                <section className="content p-3 p-lg-4">
                    {children}
                </section>
            </div>
        </div>
    );
};

export default MainLayout;
