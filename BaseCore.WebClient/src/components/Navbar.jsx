import React, { useState } from 'react';
import { Menu, Music, Sun, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const defaultNavItems = [
    { label: 'Trang chủ', to: '/' },
    { label: 'Trận đấu', to: '/matches' },
    { label: 'Tin tức', to: '/news' },
    { label: 'Vé của tôi', to: '/my-tickets' },
    { label: 'Hướng dẫn', to: '/guide' },
];

const themes = {
    purple: {
        page: 'border-violet-950/5 bg-white/90 text-violet-950 shadow-violet-950/5',
        logoBox: 'border-violet-900/10 bg-violet-50 text-violet-950',
        accent: 'text-violet-700',
        navActive: 'text-violet-700',
        navIdle: 'text-violet-950/70 hover:text-violet-950',
        underline: 'from-violet-700 to-violet-300',
        mobileActive: 'bg-violet-950 text-white',
        mobileIdle: 'text-violet-950 hover:bg-violet-50',
        icon: 'border-violet-900/10 bg-white text-violet-950 hover:border-violet-700/30 hover:bg-violet-50',
        pill: 'bg-violet-50 text-violet-950',
        button: 'bg-violet-950 text-white hover:bg-violet-800',
        divider: 'border-violet-950/10',
    },
    bamboo: {
        page: 'border-[#123524]/5 bg-[#fbfaf4]/90 text-[#123524] shadow-[#123524]/5',
        logoBox: 'border-[#123524]/10 bg-[#e8efdf] text-[#123524]',
        accent: 'text-[#4f8b48]',
        navActive: 'text-[#2f7a43]',
        navIdle: 'text-[#314238]/80 hover:text-[#123524]',
        underline: 'from-[#2f7a43] to-[#c58b4a]',
        mobileActive: 'bg-[#123524] text-white',
        mobileIdle: 'text-[#123524] hover:bg-[#eef4e9]',
        icon: 'border-[#123524]/10 bg-white text-[#123524] hover:border-[#2f7a43]/30 hover:bg-[#f4f7ef]',
        pill: 'bg-[#eef4e9] text-[#123524]',
        button: 'bg-[#123524] text-white hover:bg-[#1f4b34]',
        divider: 'border-[#123524]/10',
    },
};

function Navbar({
    navItems = defaultNavItems,
    brandTitle = 'Premier League',
    brandAccent = 'Tickets',
    logoSrc = '/template-football/images/epl-logo.png',
    logoText = 'PL',
    theme = 'purple',
    username,
    displayRole,
    onLogout,
}) {
    const [open, setOpen] = useState(false);
    const colors = themes[theme] || themes.purple;

    const navLinkClass = ({ isActive }) => (
        `relative px-3 py-2 text-[15px] font-semibold no-underline transition-colors duration-300 ${
            isActive ? colors.navActive : colors.navIdle
        }`
    );

    const mobileLinkClass = ({ isActive }) => (
        `rounded-2xl px-4 py-3 text-base font-semibold no-underline transition-colors duration-300 ${
            isActive ? colors.mobileActive : colors.mobileIdle
        }`
    );

    const closeMenu = () => setOpen(false);

    return (
        <header className={`sticky top-0 z-50 border-b shadow-sm backdrop-blur-xl ${colors.page}`}>
            <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
                <NavLink className="flex min-w-0 items-center gap-3 no-underline" to="/" onClick={closeMenu}>
                    <span className={`grid h-12 w-12 place-items-center rounded-2xl border shadow-sm ${colors.logoBox}`}>
                        {logoSrc ? (
                            <img className="h-8 w-8 object-contain" src={logoSrc} alt={brandTitle} />
                        ) : (
                            <span className="font-serif text-xl italic leading-none">{logoText}</span>
                        )}
                    </span>
                    <span className="hidden leading-tight sm:block">
                        <span className="block text-lg font-black">{brandTitle}</span>
                        <span className={`block font-serif text-2xl italic ${colors.accent}`}>{brandAccent}</span>
                    </span>
                </NavLink>

                <nav className="hidden items-center justify-center gap-7 lg:flex" aria-label="Main navigation">
                    {navItems.map((item) => (
                        <NavLink className={navLinkClass} to={item.to} end={item.to === '/'} key={item.to}>
                            {({ isActive }) => (
                                <>
                                    {item.label}
                                    {isActive && (
                                        <span className={`absolute inset-x-2 -bottom-3 h-0.5 bg-gradient-to-r ${colors.underline}`} />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center justify-end gap-3 lg:flex">
                    <button
                        aria-label="Bật nhạc nền"
                        className={`grid h-12 w-12 place-items-center rounded-2xl border shadow-sm transition duration-300 hover:-translate-y-0.5 ${colors.icon}`}
                        type="button"
                    >
                        <Music size={21} strokeWidth={2.2} />
                    </button>
                    <button
                        aria-label="Đổi giao diện"
                        className={`grid h-12 w-12 place-items-center rounded-2xl border shadow-sm transition duration-300 hover:-translate-y-0.5 ${colors.icon}`}
                        type="button"
                    >
                        <Sun size={21} strokeWidth={2.2} />
                    </button>
                    {username && (
                        <span className={`max-w-44 truncate rounded-full px-3 py-2 text-sm font-bold ${colors.pill}`}>
                            {username} - {displayRole || 'User'}
                        </span>
                    )}
                    {onLogout && (
                        <button
                            className={`rounded-full px-4 py-2 text-sm font-black transition ${colors.button}`}
                            type="button"
                            onClick={onLogout}
                        >
                            Logout
                        </button>
                    )}
                </div>

                <button
                    aria-label={open ? 'Đóng menu' : 'Mở menu'}
                    aria-expanded={open}
                    className={`grid h-11 w-11 place-items-center rounded-2xl border shadow-sm transition lg:hidden ${colors.icon}`}
                    type="button"
                    onClick={() => setOpen((current) => !current)}
                >
                    {open ? <X size={22} strokeWidth={2.2} /> : <Menu size={22} strokeWidth={2.2} />}
                </button>
            </div>

            {open && (
                <div className={`border-t bg-white/95 px-4 py-4 shadow-lg lg:hidden ${colors.divider}`}>
                    <nav className="mx-auto grid max-w-7xl gap-2" aria-label="Mobile navigation">
                        {navItems.map((item) => (
                            <NavLink className={mobileLinkClass} to={item.to} end={item.to === '/'} onClick={closeMenu} key={item.to}>
                                {item.label}
                            </NavLink>
                        ))}
                        <div className={`mt-3 flex flex-wrap items-center gap-3 border-t pt-4 ${colors.divider}`}>
                            <button
                                aria-label="Bật nhạc nền"
                                className={`grid h-11 w-11 place-items-center rounded-2xl border shadow-sm ${colors.icon}`}
                                type="button"
                            >
                                <Music size={20} strokeWidth={2.2} />
                            </button>
                            <button
                                aria-label="Đổi giao diện"
                                className={`grid h-11 w-11 place-items-center rounded-2xl border shadow-sm ${colors.icon}`}
                                type="button"
                            >
                                <Sun size={20} strokeWidth={2.2} />
                            </button>
                            {username && (
                                <span className={`rounded-full px-3 py-2 text-sm font-bold ${colors.pill}`}>
                                    {username} - {displayRole || 'User'}
                                </span>
                            )}
                            {onLogout && (
                                <button className={`rounded-full px-4 py-3 font-black ${colors.button}`} type="button" onClick={onLogout}>
                                    Logout
                                </button>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}

export default Navbar;
