import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NAV_GROUPS = [
    {
        title: 'Tổng quan',
        items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt', aliases: ['/admin'] },
        ],
    },
    {
        title: 'Lịch thi đấu',
        items: [
            { path: '/admin/seasons', label: 'Mùa giải', icon: 'fas fa-calendar' },
            { path: '/admin/rounds', label: 'Vòng đấu', icon: 'fas fa-layer-group' },
            { path: '/admin/matches', label: 'Trận đấu', icon: 'fas fa-futbol' },
            { path: '/admin/clubs', label: 'CLB', icon: 'fas fa-shield-alt' },
            { path: '/admin/stadiums', label: 'Sân vận động', icon: 'fas fa-map-marker-alt' },
        ],
    },
    {
        title: 'Bán vé',
        items: [
            { path: '/admin/tickets', label: 'Vé trận đấu', icon: 'fas fa-ticket-alt' },
            { path: '/admin/orders', label: 'Đơn hàng', icon: 'fas fa-receipt' },
            { path: '/admin/payments', label: 'Thanh toán', icon: 'fas fa-credit-card' },
            { path: '/admin/etickets', label: 'Vé điện tử', icon: 'fas fa-qrcode' },
            { path: '/admin/checkins', label: 'Check-in QR', icon: 'fas fa-clipboard-check', aliases: ['/admin/checkin'] },
        ],
    },
    {
        title: 'Nội dung',
        items: [
            { path: '/admin/news', label: 'Tin tức', icon: 'fas fa-newspaper' },
        ],
    },
    {
        title: 'Người dùng',
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

    const isActive = (item) =>
        location.pathname === item.path || (item.aliases?.includes(location.pathname) ?? false);

    const displayName = user?.name || user?.username || 'Administrator';
    const displayEmail = user?.email || 'admin@example.com';
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top bar */}
            <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-slate-200 bg-white px-4 shadow-sm">
                <button
                    className="mr-3 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 lg:hidden"
                    type="button"
                    onClick={() => setSidebarOpen((o) => !o)}
                    aria-label="Mở menu"
                >
                    <i className="fas fa-bars text-sm" />
                </button>

                <span className="font-black text-slate-800">Admin Console</span>

                <div className="ml-auto flex items-center gap-3">
                    <span className="hidden text-sm text-slate-500 sm:block">{displayName}</span>
                    <button
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                        type="button"
                        onClick={handleLogout}
                    >
                        <i className="fas fa-sign-out-alt text-xs" />
                        Đăng xuất
                    </button>
                </div>
            </header>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 transition-transform duration-200 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Brand */}
                <Link
                    className="flex flex-col border-b border-slate-700/50 px-5 py-4 no-underline"
                    to="/admin/dashboard"
                    onClick={() => setSidebarOpen(false)}
                >
                    <span className="text-sm font-black text-white">Premier League Tickets</span>
                    <span className="mt-0.5 text-xs text-slate-400">Admin Panel</span>
                </Link>

                {/* User info */}
                <div className="flex items-center gap-3 border-b border-slate-700/50 px-5 py-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                        {initial}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                        <p className="truncate text-xs text-slate-400">{displayEmail}</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {NAV_GROUPS.map((group) => (
                        <div className="mb-5" key={group.title}>
                            <p className="mb-1.5 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {group.title}
                            </p>
                            <ul className="space-y-0.5">
                                {group.items.map((item) => (
                                    <li key={item.path}>
                                        <Link
                                            className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium no-underline transition ${
                                                isActive(item)
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                            }`}
                                            to={item.path}
                                            onClick={() => setSidebarOpen(false)}
                                        >
                                            <i className={`${item.icon} w-4 shrink-0 text-center text-xs`} />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <button
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    type="button"
                    aria-label="Đóng menu"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div className="lg:pl-64">
                <main className="min-h-screen pt-14">
                    <div className="p-4 lg:p-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
