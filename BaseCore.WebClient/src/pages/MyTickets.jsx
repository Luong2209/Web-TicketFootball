import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Copy, Check, QrCode } from 'lucide-react';
import UserLayout from '../components/user/UserLayout';
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '../components/user/StateViews';
import { PageFade, fadeUp, itemTransition, pageTransition, stagger } from '../components/user/UserMotion';
import { ticketApi } from '../services/api';

const formatDate = (value) => {
    if (!value) return 'Đang cập nhật';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const getMatchName = (ticket) => {
    const home = ticket.match?.homeTeam || ticket.match?.homeTeamName;
    const away = ticket.match?.awayTeam || ticket.match?.awayTeamName;
    return [home, away].filter(Boolean).join(' vs ') || 'Trận đấu đang cập nhật';
};

const getStadiumName = (ticket) => (
    ticket.match?.stadium?.name
    || ticket.match?.stadium
    || ticket.match?.stadiumName
    || 'Sân vận động chưa cập nhật'
);

function ETicketCard({ ticket, index = 0 }) {
    const [copied, setCopied] = useState(false);
    const isUsed = String(ticket.status || '').toLowerCase() === 'used';
    const ticketCode = ticket.ticketCode || `ETK-${ticket.id || 'N/A'}`;
    const qrPayload = ticket.qrCodePayload || ticket.qrPayload || ticketCode;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(qrPayload);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1800);
        } catch {
            setCopied(false);
        }
    };

    return (
        <motion.article
            className={`relative overflow-hidden rounded-2xl border bg-white shadow-md transition-all duration-300 ${
                isUsed
                    ? 'border-slate-200 opacity-60 grayscale'
                    : 'border-violet-100 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100/60'
            }`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ ...itemTransition, delay: index * 0.04 }}
        >
            {/* Top accent stripe */}
            <div className={`h-1.5 ${isUsed ? 'bg-slate-300' : 'bg-gradient-to-r from-violet-700 via-violet-500 to-violet-400'}`} />

            {/* Used watermark */}
            {isUsed && (
                <div className="pointer-events-none absolute left-1/2 top-1/3 z-30 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-xl border-4 border-dashed border-rose-400/30 px-6 py-2 font-black text-2xl uppercase tracking-widest text-rose-400/30">
                    Đã sử dụng
                </div>
            )}

            {/* Main section */}
            <div className="p-5">
                {/* Card header */}
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vé điện tử e-ticket</span>
                        <h3 className="mt-0.5 break-all font-mono text-sm font-black text-slate-900">{ticketCode}</h3>
                        <div className="mt-1.5">
                            <StatusBadge status={ticket.status || 'Issued'} />
                        </div>
                    </div>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                        isUsed ? 'border-slate-200 bg-slate-100 text-slate-400' : 'border-violet-200 bg-violet-50 text-violet-700'
                    }`}>
                        <Ticket className="h-5 w-5" aria-hidden="true" />
                    </div>
                </div>

                {/* Match info block */}
                <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trận đấu</span>
                        <p className="mt-0.5 font-extrabold text-slate-900">{getMatchName(ticket)}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <Calendar size={11} className="text-violet-500" />
                                <span>Thời gian</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-700">{formatDate(ticket.match?.kickoffTime)}</span>
                        </div>
                        <div>
                            <div className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <MapPin size={11} className="text-emerald-500" />
                                <span>Địa điểm</span>
                            </div>
                            <span className="line-clamp-1 text-xs font-semibold text-slate-700">{getStadiumName(ticket)}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khán đài</span>
                            <div className="mt-0.5">
                                <span className="inline-block rounded-lg bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-700">
                                    {[ticket.listing?.section, ticket.listing?.rowLabel].filter(Boolean).join(' - ') || 'Đang cập nhật'}
                                </span>
                            </div>
                        </div>
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chỗ ngồi</span>
                            <div className="mt-0.5">
                                <span className="inline-block rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                                    {ticket.seatCode ? `Ghế: ${ticket.seatCode}` : 'Chưa định vị'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket stub notch separator */}
            <div className="relative">
                <div className="absolute -left-3.5 top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-100" />
                <div className="absolute -right-3.5 top-1/2 z-20 h-7 w-7 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-100" />
                <div className="mx-3 border-t border-dashed border-slate-200" />
            </div>

            {/* QR stub */}
            <div className="flex gap-4 bg-slate-50/60 p-5 pt-4">
                <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-white p-1.5 shadow-sm">
                    <QrCode size={58} className="text-slate-800" />
                    {isUsed && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-200/60 text-xs font-bold text-slate-600 backdrop-blur-sm">
                            USED
                        </div>
                    )}
                </div>

                <div className="flex h-20 min-w-0 flex-grow flex-col justify-between py-0.5">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">QR Check-in</span>
                        <div className="mt-1 max-h-[44px] select-all overflow-hidden rounded-lg border border-slate-100 bg-white p-2 font-mono text-[11px] text-slate-600 break-all">
                            {qrPayload}
                        </div>
                    </div>
                    <button
                        className={`mt-1.5 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                            copied
                                ? 'border-emerald-200 bg-emerald-100 text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700'
                        }`}
                        type="button"
                        onClick={handleCopy}
                        disabled={isUsed}
                    >
                        {copied ? (
                            <><Check size={11} /><span>Đã sao chép</span></>
                        ) : (
                            <><Copy size={11} /><span>Sao chép mã</span></>
                        )}
                    </button>
                </div>
            </div>
        </motion.article>
    );
}

function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        let mounted = true;

        const loadTickets = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await ticketApi.getMyETickets();
                if (mounted) setTickets(response.data || []);
            } catch (requestError) {
                if (mounted) setError(requestError.response?.data?.message || 'Không tải được danh sách vé điện tử.');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadTickets();
        return () => { mounted = false; };
    }, []);

    const activeCount = useMemo(() => tickets.filter(t => String(t.status || '').toLowerCase() !== 'used').length, [tickets]);
    const usedCount = useMemo(() => tickets.filter(t => String(t.status || '').toLowerCase() === 'used').length, [tickets]);

    const filteredTickets = useMemo(() => {
        if (filterStatus === 'active') return tickets.filter(t => String(t.status || '').toLowerCase() !== 'used');
        if (filterStatus === 'used') return tickets.filter(t => String(t.status || '').toLowerCase() === 'used');
        return tickets;
    }, [tickets, filterStatus]);

    const tabs = [
        { value: 'all', label: `Tất cả (${tickets.length})` },
        { value: 'active', label: `Khả dụng (${activeCount})` },
        { value: 'used', label: `Đã dùng (${usedCount})` },
    ];

    return (
        <UserLayout>
            <PageFade>
                {/* Hero banner */}
                <motion.div
                    className="mb-8 rounded-2xl bg-slate-950 p-8 text-white shadow-lg"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={fadeUp}
                    transition={pageTransition}
                >
                    <span className="text-xs font-black uppercase text-violet-300">Tài khoản cá nhân</span>
                    <h1 className="mb-0 mt-3 text-4xl font-black">Vé của tôi</h1>
                    <p className="mb-0 mt-3 max-w-2xl text-sm text-slate-300">
                        Quản lý các vé điện tử đã đặt mua. Sử dụng mã QR bên dưới để làm thủ tục check-in tại sân vận động.
                    </p>
                </motion.div>

                {/* Filter tabs */}
                <div className="mb-6 flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.value}
                            type="button"
                            onClick={() => setFilterStatus(tab.value)}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                                filterStatus === tab.value
                                    ? 'bg-slate-950 text-white shadow-lg'
                                    : 'bg-white text-slate-700 shadow-sm hover:bg-slate-100'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {error && <div className="mb-5"><ErrorState message={error} /></div>}

                {loading ? (
                    <LoadingState title="Đang tải danh sách vé..." description="Đang xác thực thông tin vé từ hệ thống." />
                ) : filteredTickets.length ? (
                    <motion.div
                        className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
                        initial="hidden"
                        animate="show"
                        variants={stagger}
                    >
                        {filteredTickets.map((ticket, index) => (
                            <ETicketCard ticket={ticket} index={index} key={ticket.id || ticket.ticketCode} />
                        ))}
                    </motion.div>
                ) : (
                    <EmptyState
                        title={filterStatus === 'all' ? 'Bạn chưa có vé nào' : 'Không tìm thấy vé'}
                        message={
                            filterStatus === 'all'
                                ? 'Hãy khám phá các trận đấu kịch tính và tiến hành đặt vé ngay!'
                                : 'Không có vé điện tử nào phù hợp với bộ lọc hiện tại.'
                        }
                        actionLabel="Tìm trận đấu"
                        actionTo="/matches"
                    />
                )}
            </PageFade>
        </UserLayout>
    );
}

export default MyTickets;
