import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Calendar, MapPin, Copy, Check, QrCode, User } from 'lucide-react';
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

const revealUp = fadeUp;

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
            className={`relative overflow-hidden rounded-2xl border bg-surface-card shadow-xl transition-all duration-300 ${
                isUsed 
                    ? 'border-white/5 opacity-55 grayscale' 
                    : 'border-white/5 hover:border-primary/20 hover:shadow-primary/5 hover:shadow-2xl'
            }`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ ...itemTransition, delay: index * 0.04 }}
        >
            {/* Top Stripe Indicator */}
            <div className={`h-2 ${isUsed ? 'bg-slate-600' : 'bg-gradient-to-r from-primary via-primary-light to-accent-cyan'}`} />
            
            {/* Watermark for Used ticket */}
            {isUsed && (
                <div className="absolute top-[28%] left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 border-4 border-dashed border-rose-500/30 px-6 py-2 rounded-xl text-rose-500/30 font-black text-2xl uppercase tracking-[0.25em] z-30 pointer-events-none">
                    Đã sử dụng
                </div>
            )}

            <div className="p-6 pb-24 relative">
                {/* Header Ticket Block */}
                <div className="mb-5.5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vé điện tử e-ticket</span>
                        <h3 className="mb-1 text-base md:text-lg font-black text-white font-mono break-all mt-1">{ticketCode}</h3>
                        <StatusBadge status={ticket.status || 'Issued'} />
                    </div>
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${isUsed ? 'bg-white/3 border-white/5 text-slate-500' : 'bg-primary/10 border-primary/20 text-primary-light glow-primary'}`}>
                        <Ticket className="h-5.5 w-5.5" aria-hidden="true" />
                    </div>
                </div>

                {/* Match Information Summary Details */}
                <div className="space-y-4 rounded-xl bg-white/3 border border-white/5 p-4 text-xs text-slate-300">
                    <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Trận đấu</div>
                        <strong className="text-white text-sm font-extrabold">{getMatchName(ticket)}</strong>
                    </div>

                    <div className="grid gap-3 grid-cols-2">
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <Calendar size={12} className="text-primary-light" />
                                <span>Thời gian</span>
                            </div>
                            <span className="font-semibold text-slate-200">{formatDate(ticket.match?.kickoffTime)}</span>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <MapPin size={12} className="text-accent-green" />
                                <span>Địa điểm</span>
                            </div>
                            <span className="line-clamp-1 font-semibold text-slate-200">{getStadiumName(ticket)}</span>
                        </div>
                    </div>

                    <div className="grid gap-3 grid-cols-2 pt-2 border-t border-white/5">
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Khán đài</div>
                            <span className="rounded bg-primary/10 border border-primary/20 px-2 py-0.5 font-bold text-primary-light inline-block">
                                {[ticket.listing?.section, ticket.listing?.rowLabel].filter(Boolean).join(' - ') || 'Đang cập nhật'}
                            </span>
                        </div>
                        <div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Chỗ ngồi</div>
                            <span className="rounded bg-accent-green/10 border border-accent-green/20 px-2.5 py-0.5 font-black text-accent-green inline-block">
                                {ticket.seatCode ? `Ghế: ${ticket.seatCode}` : 'Chưa định vị'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulated Ticket Stub Notch side cuts and dashes separator */}
            <div className="absolute bottom-[210px] -left-3.5 h-7 w-7 rounded-full bg-[#0F0F1A] border border-white/5 z-20" />
            <div className="absolute bottom-[210px] -right-3.5 h-7 w-7 rounded-full bg-[#0F0F1A] border border-white/5 z-20" />
            <div className="absolute bottom-[222px] left-5 right-5 h-px border-t border-dashed border-white/10 z-10 pointer-events-none" />

            {/* Bottom QR Code segment stub */}
            <div className="p-6 pt-7 bg-[#131325]/45 border-t border-white/5 flex gap-4 items-center">
                {/* stylized visual QR box placeholder */}
                <div className="relative shrink-0 w-24 h-24 bg-white rounded-xl p-2 flex items-center justify-center shadow-inner group">
                    <QrCode size={68} className="text-slate-900" />
                    {isUsed && <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-xs rounded-xl flex items-center justify-center text-white font-bold text-xs">USED</div>}
                </div>

                <div className="flex-grow min-w-0 flex flex-col justify-between h-24 py-1">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">QR CODE CHECK-IN</span>
                        <div className="text-[11px] text-slate-300 font-mono break-all mt-1 bg-[#0F0F1A] border border-white/5 rounded-lg p-2.5 max-h-[46px] overflow-hidden select-all">
                            {qrPayload}
                        </div>
                    </div>
                    <button
                        className={`mt-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-300 ${
                            copied 
                                ? 'bg-accent-green/20 text-accent-green border border-accent-green/30' 
                                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 active:scale-95'
                        }`}
                        type="button"
                        onClick={handleCopy}
                        disabled={isUsed}
                    >
                        {copied ? (
                            <>
                                <Check size={12} />
                                <span>Đã sao chép</span>
                            </>
                        ) : (
                            <>
                                <Copy size={12} />
                                <span>Sao chép mã QR</span>
                            </>
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
                if (mounted) {
                    setTickets(response.data || []);
                }
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.response?.data?.message || 'Không tải được danh sách vé điện tử.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadTickets();

        return () => {
            mounted = false;
        };
    }, []);

    const filteredTickets = useMemo(() => {
        if (filterStatus === 'all') return tickets;
        if (filterStatus === 'active') return tickets.filter(t => String(t.status || '').toLowerCase() !== 'used');
        if (filterStatus === 'used') return tickets.filter(t => String(t.status || '').toLowerCase() === 'used');
        return tickets;
    }, [tickets, filterStatus]);

    return (
        <UserLayout>
            <PageFade>
                {/* Hero Header Banner */}
                <motion.div
                    className="mb-8"
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-80px' }}
                    variants={revealUp}
                    transition={pageTransition}
                >
                    <span className="text-xs font-black uppercase tracking-wider text-primary-light">Tài khoản cá nhân</span>
                    <h1 className="mb-0 mt-2 text-3xl font-extrabold tracking-tight text-white">Vé của tôi</h1>
                    <p className="mb-0 mt-2.5 max-w-2xl text-slate-400 text-sm">Quản lý các vé điện tử đã đặt mua. Sử dụng mã QR bên dưới để làm thủ tục check-in tại sân vận động.</p>
                </motion.div>

                {/* Filter tabs */}
                <div className="mb-8 flex gap-2 border-b border-white/5 pb-4">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`rounded-xl px-4.5 py-2 text-xs font-bold transition-all duration-300 ${
                            filterStatus === 'all' 
                                ? 'bg-primary text-white shadow-md shadow-primary/20 glow-primary' 
                                : 'bg-white/3 border border-white/5 text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        Tất cả ({tickets.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('active')}
                        className={`rounded-xl px-4.5 py-2 text-xs font-bold transition-all duration-300 ${
                            filterStatus === 'active' 
                                ? 'bg-primary text-white shadow-md shadow-primary/20 glow-primary' 
                                : 'bg-white/3 border border-white/5 text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        Khả dụng ({tickets.filter(t => String(t.status || '').toLowerCase() !== 'used').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('used')}
                        className={`rounded-xl px-4.5 py-2 text-xs font-bold transition-all duration-300 ${
                            filterStatus === 'used' 
                                ? 'bg-primary text-white shadow-md shadow-primary/20 glow-primary' 
                                : 'bg-white/3 border border-white/5 text-slate-300 hover:bg-white/5'
                        }`}
                    >
                        Đã sử dụng ({tickets.filter(t => String(t.status || '').toLowerCase() === 'used').length})
                    </button>
                </div>

                {error && <div className="mb-5"><ErrorState message={error} /></div>}

                {loading ? (
                    <LoadingState title="Đang tải danh sách vé điện tử..." description="Đang xác thực thông tin vé từ hệ thống." />
                ) : filteredTickets.length ? (
                    <motion.div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2" initial="hidden" animate="show" variants={stagger}>
                        {filteredTickets.map((ticket, index) => (
                            <ETicketCard ticket={ticket} index={index} key={ticket.id || ticket.ticketCode} />
                        ))}
                    </motion.div>
                ) : (
                    <EmptyState
                        title={filterStatus === 'all' ? 'Bạn chưa có vé nào' : 'Không tìm thấy vé'}
                        message={filterStatus === 'all' ? 'Hãy khám phá các trận đấu kịch tính và tiến hành đặt vé ngay!' : 'Không có vé điện tử nào phù hợp với bộ lọc.'}
                        actionLabel="Tìm trận đấu"
                        actionTo="/matches"
                    />
                )}
            </PageFade>
        </UserLayout>
    );
}

export default MyTickets;

