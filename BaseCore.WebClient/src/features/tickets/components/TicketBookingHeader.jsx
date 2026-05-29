import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ticketAsset } from '../utils/formatters';

function TicketBookingHeader() {
    return (
        <header className="relative z-10 border-b border-slate-200 bg-white shadow-[0_6px_20px_rgba(18,24,38,0.07)]">
            <div className="grid min-h-[68px] grid-cols-1 items-center gap-3 px-4 py-3 lg:grid-cols-[auto_minmax(0,1fr)_minmax(280px,420px)] lg:gap-6 lg:px-8 lg:py-0">
                <Link className="inline-flex items-center gap-3 text-ink-900 no-underline hover:text-ink-900" to="/user">
                    <img className="h-11 w-11 object-contain lg:h-[46px] lg:w-[46px]" src={ticketAsset('images/epl-logo.png')} alt="Premier League" />
                    <strong className="max-w-none text-base font-black leading-tight lg:max-w-[180px] lg:text-[17px]">Premier League Tickets</strong>
                </Link>
                <nav className="hidden min-w-0 items-center justify-center gap-7 lg:flex">
                    <Link className="text-sm font-extrabold uppercase text-slate-800 no-underline hover:text-plum-950" to="/user">Trang chủ</Link>
                    <Link className="text-sm font-extrabold uppercase text-slate-800 no-underline hover:text-plum-950" to="/user#matches">Trận đấu</Link>
                    <Link className="text-sm font-extrabold uppercase text-slate-800 no-underline hover:text-plum-950" to="/user#team">Bảng xếp hạng</Link>
                    <Link className="text-sm font-extrabold uppercase text-slate-800 no-underline hover:text-plum-950" to="/news">Tin tức</Link>
                </nav>
                <form className="flex h-10 w-full items-center gap-3 rounded border border-slate-300 bg-slate-50 px-4 lg:justify-self-end" onSubmit={(event) => event.preventDefault()}>
                    <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <input className="w-full border-0 bg-transparent text-[15px] outline-none" type="search" placeholder="Tìm trận đấu, đội bóng, sân vận động..." />
                </form>
            </div>
        </header>
    );
}

export default TicketBookingHeader;
