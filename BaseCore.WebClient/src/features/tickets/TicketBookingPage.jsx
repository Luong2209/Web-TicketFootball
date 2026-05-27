import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { EmptyState, ErrorState, LoadingState, StatusBadge } from '../../components/user/StateViews';
import { PageFade, fadeUp, itemTransition, pageTransition, stagger } from '../../components/user/UserMotion';
import { useAuth } from '../../contexts/AuthContext';
import { matchApi, ticketApi } from '../../services/api';

const ticketTypeLabels = {
    standard: 'Tiêu chuẩn',
    best: 'Chỗ ngồi đẹp',
    away: 'Khu khách',
    vip: 'VIP',
};

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

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

const normalizeListing = (listing) => ({
    id: listing.id,
    title: listing.title || listing.section?.name || 'Ticket listing',
    sectionName: listing.section?.name || listing.sectionName || listing.section?.code || 'Khu ghế',
    sectionCode: listing.section?.code || listing.sectionCode || '',
    rowLabel: listing.rowLabel || listing.row || '',
    availableQuantity: Number(listing.availableQuantity ?? listing.available ?? 0),
    unitPrice: Number(listing.unitPrice ?? listing.price ?? 0),
    ticketType: listing.ticketType || 'standard',
    deliveryMethod: listing.deliveryMethod || 'E-ticket',
    sellerName: listing.sellerName || 'Premier League Tickets',
    isVerified: !!listing.isVerified,
});

const TeamBlock = ({ team, align = 'left' }) => {
    const name = team?.name || 'Team';

    return (
        <div className={`flex items-center gap-4 ${align === 'right' ? 'justify-end text-right' : ''}`}>
            {align !== 'right' && (
                team?.logoUrl
                    ? <img className="h-16 w-16 object-contain" src={team.logoUrl} alt={name} />
                    : <div className="grid h-16 w-16 place-items-center rounded-full bg-violet-100 text-xl font-black text-violet-700">{name.charAt(0)}</div>
            )}
            <div>
                <p className="mb-1 text-sm font-bold text-slate-500">{align === 'right' ? 'Đội khách' : 'Đội nhà'}</p>
                <h2 className="mb-0 text-xl font-black text-slate-950">{name}</h2>
            </div>
            {align === 'right' && (
                team?.logoUrl
                    ? <img className="h-16 w-16 object-contain" src={team.logoUrl} alt={name} />
                    : <div className="grid h-16 w-16 place-items-center rounded-full bg-violet-100 text-xl font-black text-violet-700">{name.charAt(0)}</div>
            )}
        </div>
    );
};

function TicketBookingPage() {
    const { matchSlug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [match, setMatch] = useState(null);
    const [ticketListings, setTicketListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [bookingError, setBookingError] = useState('');
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadTicketData = async () => {
            setIsLoading(true);
            setLoadError('');

            try {
                const [matchResponse, ticketsResponse] = await Promise.all([
                    matchApi.getBySlug(matchSlug),
                    matchApi.getTickets(matchSlug),
                ]);

                if (!isMounted) return;

                const listings = Array.isArray(ticketsResponse.data)
                    ? ticketsResponse.data
                    : ticketsResponse.data?.listings || [];

                setMatch(matchResponse.data);
                setTicketListings(listings.map(normalizeListing));
            } catch (error) {
                if (isMounted) {
                    setLoadError(error.response?.data?.message || 'Không tải được dữ liệu vé từ backend.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadTicketData();

        return () => {
            isMounted = false;
        };
    }, [matchSlug]);

    const selectedTicket = useMemo(
        () => ticketListings.find((ticket) => ticket.id === selectedTicketId) || null,
        [selectedTicketId, ticketListings],
    );

    const safeQuantity = Math.min(Math.max(Number(quantity) || 1, 1), Math.max(selectedTicket?.availableQuantity || 1, 1));
    const subtotal = selectedTicket ? selectedTicket.unitPrice * safeQuantity : 0;

    const handleSelectTicket = (ticket) => {
        setSelectedTicketId(ticket.id);
        setQuantity((current) => Math.min(Math.max(Number(current) || 1, 1), Math.max(ticket.availableQuantity, 1)));
        setBookingError('');
    };

    const handleSubmitOrder = async () => {
        if (!selectedTicket) {
            setBookingError('Vui lòng chọn một khu vé trước khi tiếp tục.');
            return;
        }

        setIsBooking(true);
        setBookingError('');

        try {
            const response = await ticketApi.createOrder({
                items: [{ ticketListingId: selectedTicket.id, quantity: safeQuantity }],
                customerName: user?.name || user?.username || '',
                customerEmail: user?.email || '',
                customerPhone: user?.phone || '',
                note: `${match?.homeTeam?.name || ''} vs ${match?.awayTeam?.name || ''} - ${selectedTicket.sectionName} - ${selectedTicket.rowLabel}`,
            });

            navigate(`/payments/${response.data.id}`, {
                state: {
                    orderId: response.data.id,
                    amount: response.data.totalAmount,
                    status: response.data.status,
                },
            });
        } catch (error) {
            setBookingError(error.response?.data?.message || 'Không tạo được đơn đặt vé.');
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <UserLayout>
                <PageFade>
                    <LoadingState title="Đang tải vé trận đấu..." description="Hệ thống đang lấy khu vé và giá vé mới nhất." />
                </PageFade>
            </UserLayout>
        );
    }

    if (loadError || !match) {
        return (
            <UserLayout>
                <PageFade>
                    <ErrorState title="Không có dữ liệu trận đấu" message={loadError || 'Trận đấu không tồn tại.'} />
                </PageFade>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <PageFade>
            <motion.div className="mb-6 flex flex-wrap items-center justify-between gap-3" initial="hidden" animate="show" variants={fadeUp} transition={pageTransition}>
                <div>
                    <Link className="text-sm font-black text-violet-700 no-underline transition hover:text-violet-600" to="/user">
                        <ArrowLeft className="mr-2 inline h-4 w-4" aria-hidden="true" />
                        Trở về danh sách trận
                    </Link>
                    <h1 className="mb-0 mt-3 text-3xl font-black text-slate-950">Chọn vé trận đấu</h1>
                    <p className="mb-0 mt-2 text-sm font-bold text-slate-500">
                        {match.roundName || 'Vòng đấu chưa cập nhật'} · Premier League {match.season || '2026-2027'}
                    </p>
                </div>
                <StatusBadge status={match.status || 'Scheduled'} />
            </motion.div>

            <motion.section className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" initial="hidden" animate="show" variants={fadeUp} transition={{ ...itemTransition, delay: 0.05 }}>
                <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
                    <TeamBlock team={match.homeTeam} />
                    <div className="grid place-items-center">
                        <span className="grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-lg font-black text-white shadow-lg shadow-slate-950/20">
                            VS
                        </span>
                    </div>
                    <TeamBlock team={match.awayTeam} align="right" />
                </div>
                <div className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 md:grid-cols-3">
                    <div>
                        <p className="mb-1 text-sm font-bold text-slate-500">Kickoff</p>
                        <strong>{formatKickoff(match.kickoffTime)}</strong>
                    </div>
                    <div>
                        <p className="mb-1 text-sm font-bold text-slate-500">Sân vận động</p>
                        <strong>{match.stadium?.name || 'Đang cập nhật'}</strong>
                    </div>
                    <div>
                        <p className="mb-1 text-sm font-bold text-slate-500">Địa điểm</p>
                        <strong>{[match.stadium?.city, match.stadium?.country].filter(Boolean).join(', ') || 'Đang cập nhật'}</strong>
                    </div>
                </div>
            </motion.section>

            {bookingError && <div className="mb-5"><ErrorState title="Chưa tạo được đơn" message={bookingError} /></div>}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <motion.section className="grid gap-4" initial="hidden" animate="show" variants={stagger}>
                    {ticketListings.length ? ticketListings.map((ticket) => {
                        const soldOut = ticket.availableQuantity <= 0;
                        const isSelected = selectedTicketId === ticket.id;

                        return (
                            <motion.article
                                className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${isSelected ? 'border-violet-500 ring-2 ring-violet-100' : 'border-slate-200'}`}
                                key={ticket.id}
                                variants={fadeUp}
                                transition={itemTransition}
                                whileHover={{ y: -4, scale: 1.01 }}
                            >
                                <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
                                    <div>
                                        <div className="mb-3 flex flex-wrap items-center gap-2">
                                            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                                                {ticketTypeLabels[ticket.ticketType] || ticket.ticketType}
                                            </span>
                                            {ticket.isVerified && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Đã xác thực</span>}
                                            {soldOut && <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-600">Hết vé</span>}
                                        </div>
                                        <h2 className="mb-2 text-xl font-black text-slate-950">{ticket.sectionName}</h2>
                                        <p className="mb-0 text-sm text-slate-500">
                                            {ticket.title} {ticket.rowLabel ? `- Hàng ${ticket.rowLabel}` : ''} - {ticket.deliveryMethod}
                                        </p>
                                    </div>
                                    <div className="md:text-right">
                                        <p className="mb-1 text-sm font-bold text-slate-500">Giá vé</p>
                                        <strong className="text-2xl font-black text-slate-950">{formatCurrency(ticket.unitPrice)}</strong>
                                        <p className="mb-0 mt-1 text-sm text-slate-500">Còn {ticket.availableQuantity} vé</p>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
                                    <div className="text-sm text-slate-500">
                                        Người bán: <span className="font-bold text-slate-700">{ticket.sellerName}</span>
                                    </div>
                                    <button
                                        className={`rounded-xl px-5 py-3 text-sm font-black text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${isSelected ? 'bg-violet-700 hover:bg-violet-600' : 'bg-slate-950 hover:bg-violet-700'}`}
                                        type="button"
                                        disabled={soldOut}
                                        onClick={() => handleSelectTicket(ticket)}
                                    >
                                        {soldOut ? 'Hết vé' : isSelected ? 'Đã chọn' : 'Chọn vé'}
                                    </button>
                                </div>
                            </motion.article>
                        );
                    }) : (
                        <EmptyState title="Chưa có vé mở bán" message="Trận đấu này hiện chưa có ticket listing khả dụng." />
                    )}
                </motion.section>

                <motion.aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-lg lg:sticky lg:top-24" initial="hidden" animate="show" variants={fadeUp} transition={{ ...itemTransition, delay: 0.12 }}>
                    <h2 className="text-xl font-black text-slate-950">Tóm tắt đơn vé</h2>
                    {selectedTicket ? (
                        <>
                            <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                                <p className="mb-1 text-sm font-bold text-slate-500">Khu vé</p>
                                <strong className="block text-slate-950">{selectedTicket.sectionName}</strong>
                                <p className="mb-0 mt-1 text-sm text-slate-500">{selectedTicket.title}</p>
                            </div>

                            <label className="mt-5 block">
                                <span className="mb-2 block text-sm font-bold text-slate-600">Số lượng</span>
                                <input
                                    className="w-full rounded-xl border border-slate-300 px-4 py-3 font-bold outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                                    min="1"
                                    max={selectedTicket.availableQuantity}
                                    type="number"
                                    value={safeQuantity}
                                    onChange={(event) => setQuantity(event.target.value)}
                                />
                            </label>

                            <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Đơn giá</span>
                                    <strong>{formatCurrency(selectedTicket.unitPrice)}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Số lượng</span>
                                    <strong>{safeQuantity}</strong>
                                </div>
                                <div className="flex justify-between text-lg">
                                    <span className="font-black text-slate-950">Tạm tính</span>
                                    <strong className="text-violet-700">{formatCurrency(subtotal)}</strong>
                                </div>
                            </div>

                            <button
                                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-400 disabled:cursor-wait disabled:opacity-60"
                                type="button"
                                disabled={isBooking}
                                onClick={handleSubmitOrder}
                            >
                                {isBooking ? 'Đang tạo đơn...' : 'Tiếp tục thanh toán'}
                            </button>
                        </>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                            Chọn một khu vé ở danh sách bên trái để xem tạm tính và tiếp tục thanh toán.
                        </div>
                    )}
                </motion.aside>
            </div>
            </PageFade>
        </UserLayout>
    );
}

export default TicketBookingPage;
