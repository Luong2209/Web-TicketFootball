import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../Navbar';

const userNavItems = [
    { to: '/', label: 'Trang chủ' },
    { to: '/matches', label: 'Trận đấu' },
    { to: '/news', label: 'Tin tức' },
    { to: '/my-tickets', label: 'Vé của tôi' },
    { to: '/guide', label: 'Hướng dẫn' },
];

function UserLayout({ children, fullBleed = false, headerVariant = 'landing' }) {
    const navigate = useNavigate();
    const { logout, user, role } = useAuth();
    const username = user?.username || user?.userName || user?.name || localStorage.getItem('username') || 'user';
    const displayRole = role || 'User';

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isLandingHeader = headerVariant === 'landing';

    return (
        <div className={isLandingHeader ? 'min-h-screen bg-white text-violet-950' : 'min-h-screen bg-slate-100 text-slate-950'}>
            <Navbar
                navItems={userNavItems}
                brandTitle="Premier League"
                brandAccent="Tickets"
                logoSrc="/template-football/images/epl-logo.png"
                theme="purple"
                username={username}
                displayRole={displayRole}
                onLogout={handleLogout}
            />

            <main className={fullBleed ? '' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}>
                {children}
            </main>

            <footer className={isLandingHeader ? 'border-t border-violet-950/10 bg-white px-4 py-8 text-violet-950' : 'border-t border-slate-800 bg-slate-950 px-4 py-8 text-white'}>
                <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
                    <div>
                        <p className="mb-1 font-black">Premier League Tickets</p>
                        <p className={isLandingHeader ? 'mb-0 text-sm text-violet-950/60' : 'mb-0 text-sm text-slate-400'}>
                            Mùa giải 2026-2027 - BaseCore Ticket Platform
                        </p>
                    </div>
                    <p className={isLandingHeader ? 'mb-0 text-sm text-violet-950/50' : 'mb-0 text-sm text-slate-500'}>
                        © 2026 Premier League Tickets
                    </p>
                </div>
            </footer>
        </div>
    );
}

export default UserLayout;
