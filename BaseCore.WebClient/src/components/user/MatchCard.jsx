import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { StatusBadge } from './StateViews';

const formatKickoff = (value) => {
    if (!value) return 'Đang cập nhật';
    return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const TeamLogo = ({ team, fallback }) => {
    const name = team?.name || fallback;
    if (team?.logoUrl) {
        return <img className="h-14 w-14 object-contain" src={team.logoUrl} alt={name} />;
    }

    return (
        <div className="grid h-14 w-14 place-items-center rounded-full bg-violet-100 text-lg font-black text-violet-700">
            {name.charAt(0)}
        </div>
    );
};

function MatchCard({ match }) {
    const homeTeam = match?.homeTeam || {};
    const awayTeam = match?.awayTeam || {};
    const stadiumName = match?.stadium?.name || match?.stadiumName || 'Sân vận động chưa cập nhật';
    const status = match?.status || 'Scheduled';
    const roundName = match?.roundName || 'Vòng đấu chưa cập nhật';
    const season = match?.season || 'Premier League 2026-2027';
    const slug = match?.slug;

    return (
        <motion.article
            className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
        >
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                <StatusBadge status={status} />
                <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                        {roundName}
                    </span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                        {season}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="grid justify-items-center gap-3 text-center">
                    <TeamLogo team={homeTeam} fallback="Home Team" />
                    <h3 className="mb-0 text-base font-black leading-tight text-slate-950">{homeTeam.name || 'Home Team'}</h3>
                </div>

                <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-950 text-sm font-black text-white shadow-lg shadow-slate-950/20">
                    VS
                </div>

                <div className="grid justify-items-center gap-3 text-center">
                    <TeamLogo team={awayTeam} fallback="Away Team" />
                    <h3 className="mb-0 text-base font-black leading-tight text-slate-950">{awayTeam.name || 'Away Team'}</h3>
                </div>
            </div>

            <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-violet-700" aria-hidden="true" />
                    <span>{formatKickoff(match?.kickoffTime)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                    <span>{stadiumName}</span>
                </div>
            </div>

            {slug ? (
                <Link
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-white no-underline shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-400 hover:shadow-xl"
                    to={`/tickets/${slug}`}
                >
                    Đặt vé
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
                </Link>
            ) : (
                <button
                    className="mt-5 inline-flex cursor-not-allowed items-center justify-center rounded-xl bg-slate-300 px-5 py-3 text-sm font-black text-slate-600"
                    type="button"
                    disabled
                >
                    Chưa mở đặt vé
                </button>
            )}
        </motion.article>
    );
}

export default MatchCard;
