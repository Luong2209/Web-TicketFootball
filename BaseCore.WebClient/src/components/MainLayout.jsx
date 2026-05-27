import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../contexts/AuthContext';

const navGroups = [
    {
        title: 'Tổng quan',
        items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', aliases: ['/admin'] },
        ],
    },
    {
        title: 'Quản lý lịch thi đấu',
        items: [
            { path: '/admin/seasons', label: 'Mùa giải', icon: 'fas fa-calendar' },
            { path: '/admin/rounds', label: 'Vòng đấu', icon: 'fas fa-layer-group' },
            { path: '/admin/matches', label: 'Trận đấu', icon: 'fas fa-futbol' },
            { path: '/admin/clubs', label: 'CLB', icon: 'fas fa-shield-alt' },
            { path: '/admin/stadiums', label: 'Sân vận động', icon: 'fas fa-map-marker-alt' },
        ],
    },
    {
        title: 'Quản lý bán vé',
        items: [
            { path: '/admin/tickets', label: 'Vé trận đấu', icon: 'fas fa-ticket-alt' },
            { path: '/admin/orders', label: 'Đơn hàng', icon: 'fas fa-receipt' },
            { path: '/admin/payments', label: 'Thanh toán', icon: 'fas fa-credit-card' },
            { path: '/admin/etickets', label: 'Vé điện tử', icon: 'fas fa-qrcode' },
            { path: '/admin/checkins', label: 'Check-in QR', icon: 'fas fa-clipboard-check', aliases: ['/admin/checkin'] },
        ],
    },
    {
        title: 'Quản lý nội dung',
        items: [
            { path: '/admin/news', label: 'NewsArticles', icon: 'fas fa-newspaper' },
        ],
    },
    {
        title: 'Quản lý người dùng',
        items: [
            { path: '/admin/users', label: 'Người dùng', icon: 'fas fa-users' },
        ],
    },
];

const MainLayout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (item) => location.pathname === item.path || item.aliases?.includes(location.pathname);

    return (
        <div className="min-vh-100 bg-light">
            <nav className="navbar navbar-expand border-bottom bg-white shadow-sm sticky-top" style={{ marginLeft: 0, zIndex: 1020 }}>
                <div className="container-fluid">
                    <button
                        className="btn btn-outline-secondary d-lg-none me-2"
                        type="button"
                        onClick={() => setSidebarOpen((open) => !open)}
                        aria-label="Toggle admin menu"
                    >
                        <i className="fas fa-bars" />
                    </button>
                    <span className="navbar-brand mb-0 fw-bold">Admin Console</span>
                    <div className="ms-auto d-flex align-items-center gap-2">
                        <span className="d-none d-sm-inline text-muted">{user?.name || user?.username || 'Admin'}</span>
                        <button className="btn btn-outline-secondary btn-sm" type="button" onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt me-1" />
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <aside
                className={`position-fixed top-0 start-0 min-vh-100 bg-dark text-white shadow ${sidebarOpen ? 'd-block' : 'd-none d-lg-block'}`}
                style={{ width: 280, zIndex: 1030 }}
            >
                <Link to="/admin/dashboard" className="d-block border-bottom border-secondary px-3 py-3 text-white text-decoration-none" onClick={() => setSidebarOpen(false)}>
                    <span className="fs-5 fw-bold">Premier League Tickets</span>
                    <small className="d-block text-secondary">Admin</small>
                </Link>

                <div className="border-bottom border-secondary px-3 py-3">
                    <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-user-circle fa-2x text-secondary" />
                        <div className="text-truncate">
                            <span className="d-block text-white">{user?.name || user?.username || 'Administrator'}</span>
                            <small className="text-secondary">{user?.email || 'Administrator'}</small>
                        </div>
                    </div>
                </div>

                <nav className="p-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 132px)' }}>
                    {navGroups.map((group) => (
                        <div className="mb-3" key={group.title}>
                            <p className="mb-2 px-2 small fw-bold text-uppercase text-secondary">{group.title}</p>
                            <div className="nav nav-pills flex-column gap-1">
                                {group.items.map((item) => (
                                    <Link
                                        className={`nav-link rounded-3 text-white ${isActive(item) ? 'active bg-primary' : 'bg-transparent'}`}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        key={item.path}
                                    >
                                        <i className={`${item.icon} me-2`} />
                                        {item.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>

            {sidebarOpen && (
                <button
                    className="position-fixed top-0 start-0 h-100 w-100 border-0 bg-dark bg-opacity-50 d-lg-none"
                    style={{ zIndex: 1025 }}
                    type="button"
                    aria-label="Close admin menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="admin-content bg-light">
                <section className="p-3 p-lg-4">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default MainLayout;
