import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin } from 'lucide-react';
import { StatusBadge } from '../StateViews';

const asset = (path) => `/template-football/${path}`;

const formatKickoff = (value) => {
    if (!value) return 'Đang cập nhật';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const teamName = (team, fallback) => team?.name || fallback;

function ProductShowcase({ match, loading }) {
    const home = teamName(match?.homeTeam, 'Home Team');
    const away = teamName(match?.awayTeam, 'Away Team');
    const slug = match?.slug;

    return (
        <motion.aside
            className="relative mx-auto w-full max-w-[430px] lg:mx-0"
            initial={{ opacity: 0, y: 28, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -2 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
            whileHover={{ rotate: 0, y: -6 }}
        >
            <div className="absolute -inset-10 rounded-full border border-dashed border-violet-300/60" />
            <div className="relative overflow-hidden rounded-[2rem] border border-violet-900/10 bg-white shadow-2xl shadow-violet-950/15">
                <div className="relative aspect-[4/3] overflow-hidden bg-violet-950">
                    <img
                        className="h-full w-full object-cover opacity-95"
                        src={match?.stadium?.imageUrl || asset('images/alessio-festa-_ElVbiXREBM-unsplash.jpg')}
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-violet-950/55 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-violet-950 shadow">
                        Premier League
                    </div>
                </div>

                <div className="p-7">
                    <p className="mb-3 text-xs font-black uppercase tracking-[0.28em] text-violet-500">Trận nổi bật</p>
                    {loading ? (
                        <div className="grid gap-3">
                            <div className="h-7 animate-pulse rounded bg-violet-950/10" />
                            <div className="h-4 w-2/3 animate-pulse rounded bg-violet-950/10" />
                            <div className="h-11 animate-pulse rounded-xl bg-violet-950/10" />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-black leading-tight text-violet-950">{home} vs {away}</h2>
                            <div className="mt-4 grid gap-2 text-sm text-violet-950/65">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-violet-500" aria-hidden="true" />
                                    <span>{formatKickoff(match?.kickoffTime)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-violet-700" aria-hidden="true" />
                                    <span>{match?.stadium?.name || 'Sân vận động chưa cập nhật'}</span>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                <StatusBadge status={match?.status || 'Scheduled'} />
                                {slug ? (
                                    <Link
                                        className="rounded-full bg-violet-950 px-5 py-3 text-sm font-black text-white no-underline shadow-lg shadow-violet-950/20 transition hover:bg-violet-800"
                                        to={`/tickets/${slug}`}
                                    >
                                        Đặt vé
                                    </Link>
                                ) : (
                                    <span className="rounded-full bg-violet-950/10 px-5 py-3 text-sm font-black text-violet-950/50">
                                        Chưa mở bán
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </motion.aside>
    );
}

export default ProductShowcase;
