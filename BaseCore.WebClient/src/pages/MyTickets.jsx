import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket } from 'lucide-react';
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
            className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isUsed ? 'border-slate-200 opacity-80' : 'border-violet-100'}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-70px' }}
            transition={{ ...itemTransition, delay: index * 0.04 }}
        >
            <div className={`h-2 ${isUsed ? 'bg-slate-400' : 'bg-gradient-to-r from-violet-700 via-cyan-500 to-emerald-500'}`} />
            <div className="p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <p className="mb-2 text-xs font-black uppercase text-slate-500">E-ticket</p>
                        <h2 className="mb-2 break-all text-xl font-black text-slate-950">{ticketCode}</h2>
                        <StatusBadge status={ticket.status || 'Issued'} />
                    </div>
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${isUsed ? 'bg-slate-100 text-slate-500' : 'bg-violet-100 text-violet-700'}`}>
                        <Ticket className="h-6 w-6" aria-hidden="true" />
                    </div>
                </div>

                <div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm">
                    <div>
                        <p className="mb-1 font-bold text-slate-500">Trận đấu</p>
                        <strong className="text-slate-950">{getMatchName(ticket)}</strong>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="mb-1 font-bold text-slate-500">Thời gian</p>
                            <span>{formatDate(ticket.match?.kickoffTime)}</span>
                        </div>
                        <div>
                            <p className="mb-1 font-bold text-slate-500">Sân</p>
                            <span>{getStadiumName(ticket)}</span>
                        </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                            <p className="mb-1 font-bold text-slate-500">Khu vé</p>
                            <span>{[ticket.listing?.section, ticket.listing?.rowLabel].filter(Boolean).join(' - ') || 'Đang cập nhật'}</span>
                        </div>
                        <div>
                            <p className="mb-1 font-bold text-slate-500">Đơn hàng</p>
                            <span>#{ticket.ticketOrderId || ticket.orderId || 'N/A'}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="mb-0 text-sm font-black text-slate-950">QR payload/code</p>
                            <p className="mb-0 text-xs text-slate-500">Dùng mã này tại cổng check-in.</p>
                        </div>
                        <button
                            className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-black text-white transition-all duration-300 hover:bg-violet-700"
                            type="button"
                            onClick={handleCopy}
                        >
                            {copied ? 'Đã copy' : 'Copy'}
                        </button>
                    </div>
                    <div className="break-all rounded-xl bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700">
                        {qrPayload || 'Chưa có QR payload'}
                    </div>
                </div>
            </div>
        </motion.article>
    );
}

function MyTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                    setError(requestError.response?.data?.message || 'Không tải được danh sách vé.');
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

    return (
        <UserLayout>
            <PageFade>
            <motion.div
                className="mb-8"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: '-80px' }}
                variants={revealUp}
                transition={pageTransition}
            >
                <span className="text-sm font-black uppercase text-violet-700">My tickets</span>
                <h1 className="mb-0 mt-2 text-4xl font-black text-slate-950">Vé của tôi</h1>
                <p className="mb-0 mt-3 max-w-2xl text-slate-500">Quản lý vé điện tử và mã QR check-in của bạn.</p>
            </motion.div>

            {error && <div className="mb-5"><ErrorState message={error} /></div>}

            {loading ? (
                <LoadingState title="Đang tải vé điện tử..." />
            ) : tickets.length ? (
                <motion.div className="grid gap-6 lg:grid-cols-2" initial="hidden" animate="show" variants={stagger}>
                    {tickets.map((ticket, index) => (
                        <ETicketCard ticket={ticket} index={index} key={ticket.id || ticket.ticketCode} />
                    ))}
                </motion.div>
            ) : (
                <EmptyState
                    title="Bạn chưa có vé nào"
                    message="Sau khi đặt vé và xác nhận thanh toán, vé điện tử sẽ xuất hiện tại đây."
                    actionLabel="Về trang chủ"
                    actionTo="/user"
                />
            )}
            </PageFade>
        </UserLayout>
    );
}

export default MyTickets;
