import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarClock, ShieldCheck, MapPin, ChevronRight, Trophy, Calendar, Clock } from 'lucide-react';
import UserLayout from '../../components/user/UserLayout';
import { ErrorState, LoadingState, StatusBadge } from '../../components/user/StateViews';
import { PageFade, fadeUp, itemTransition, pageTransition } from '../../components/user/UserMotion';
import { useAuth } from '../../contexts/AuthContext';
import { matchApi, ticketApi } from '../../services/api';
import SeatGrid from './components/SeatGrid';
import SeatSummary from './components/SeatSummary';
import StadiumSeatMap from './components/StadiumSeatMap';

const FALLBACK_SEASON = '2026-2027';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

const formatKickoff = (value) => {
    if (!value) {
        return {
            short: 'Đang cập nhật',
            date: 'Đang cập nhật',
            time: '--:--',
        };
    }

    const date = new Date(value);
    const time = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
    const day = new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);

    return { short: `${time} ${day}`, date: day, time };
};

const getInitials = (name) => String(name || 'Team')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();

const normalizeListing = (listing) => ({
    id: listing.id,
    title: listing.title || listing.section?.name || 'Ticket listing',
    sectionId: listing.section?.id || listing.sectionId || listing.stadiumSectionId,
    sectionName: listing.section?.name || listing.sectionName || listing.section?.code || 'Khu vé',
    sectionCode: listing.section?.code || listing.sectionCode || '',
    rowLabel: listing.rowLabel || listing.row || '',
    availableQuantity: Number(listing.availableQuantity ?? listing.available ?? 0),
    unitPrice: Number(listing.unitPrice ?? listing.price ?? 0),
    ticketType: listing.ticketType || 'standard',
    deliveryMethod: listing.deliveryMethod || 'E-ticket',
    sellerName: listing.sellerName || 'Premier League Tickets',
    isVerified: !!listing.isVerified,
});

const getSeatSectionId = (ticket) => {
    const type = String(ticket.ticketType || '').toLowerCase();
    const code = String(ticket.sectionCode || ticket.title || ticket.sectionName || '').toLowerCase();

    if (type === 'vip' || code.includes('vip')) return 'vip';
    if (type === 'away' || code.includes('away')) return 'away';
    if (code.includes('home')) return 'home';
    if (type === 'best' || code.startsWith('a') || code.startsWith('n') || code.includes('khán đài a') || code.includes('north')) return 'stand-a';
    if (code.startsWith('b') || code.startsWith('e') || code.includes('khán đài b') || code.includes('east')) return 'stand-b';
    if (code.startsWith('d') || code.startsWith('s') || code.includes('khán đài d') || code.includes('south')) return 'stand-d';
    if (code.startsWith('c') || code.startsWith('w') || code.includes('khán đài c') || code.includes('west')) return 'stand-c';
    return 'stand-c';
};

const seatSectionNames = {
    vip: 'VIP',
    'stand-a': 'Khán đài A',
    'stand-b': 'Khán đài B',
    'stand-c': 'Khán đài C',
    'stand-d': 'Khán đài D',
    home: 'Home',
    away: 'Away',
};

const TeamLogoOnly = ({ team, fallback }) => {
    const [imageFailed, setImageFailed] = useState(false);
    const name = team?.name || fallback;

    if (team?.logoUrl && !imageFailed) {
        return (
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-2 shadow-inner">
                <img
                    className="h-11 w-11 object-contain filter drop-shadow-md"
                    src={team.logoUrl}
                    alt={name}
                    onError={() => setImageFailed(true)}
                />
            </div>
        );
    }

    return (
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary-light/10 text-base font-black text-primary-light ring-1 ring-primary/30">
            {getInitials(name)}
        </div>
    );
};

const TeamHeroSide = ({ team, fallback, side = 'home' }) => {
    const name = team?.name || fallback;

    return (
        <div className={`flex min-w-0 items-center gap-4 ${side === 'home' ? 'justify-end text-right' : 'justify-start text-left'}`}>
            {side === 'home' && (
                <h2 className="mb-0 text-base md:text-xl font-extrabold text-white tracking-wide">
                    {name}
                </h2>
            )}
            <TeamLogoOnly team={team} fallback={fallback} />
            {side !== 'home' && (
                <h2 className="mb-0 text-base md:text-xl font-extrabold text-white tracking-wide">
                    {name}
                </h2>
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
    const [selectedSectionId, setSelectedSectionId] = useState(null);
    const [selectedMapBlock, setSelectedMapBlock] = useState(null);
    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [seatsLoading, setSeatsLoading] = useState(false);
    const [seatsError, setSeatsError] = useState('');
    const [bookingError, setBookingError] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [pendingSeatId, setPendingSeatId] = useState(null);
    const heldSeatsRef = useRef({ matchId: null, seatPlaceIds: [] });
    const submittedOrderRef = useRef(false);
    const releasedHoldKeyRef = useRef('');

    const loadTicketData = useCallback(async () => {
        setIsLoading(true);
        setLoadError('');

        try {
            const [matchResponse, ticketsResponse] = await Promise.all([
                matchApi.getBySlug(matchSlug),
                matchApi.getTickets(matchSlug),
            ]);

            const listings = Array.isArray(ticketsResponse.data)
                ? ticketsResponse.data
                : ticketsResponse.data?.listings || [];

            setMatch(matchResponse.data);
            setTicketListings(listings.map(normalizeListing));
        } catch (error) {
            setLoadError(error.response?.data?.message || 'Không tải được dữ liệu vé từ backend.');
        } finally {
            setIsLoading(false);
        }
    }, [matchSlug]);

    useEffect(() => {
        loadTicketData();
    }, [loadTicketData]);

    useEffect(() => {
        const seatPlaceIds = selectedSeats.map((seat) => seat.seatPlaceId).filter(Boolean);
        heldSeatsRef.current = {
            matchId: match?.id || null,
            seatPlaceIds,
        };
        releasedHoldKeyRef.current = '';
    }, [match?.id, selectedSeats]);

    const releaseHeldSeatsSnapshot = useCallback((useKeepalive = false) => {
        if (submittedOrderRef.current) {
            return;
        }

        const { matchId, seatPlaceIds } = heldSeatsRef.current;
        if (!matchId || !seatPlaceIds.length) {
            return;
        }

        const holdKey = `${matchId}:${seatPlaceIds.join(',')}`;
        if (releasedHoldKeyRef.current === holdKey) {
            return;
        }

        releasedHoldKeyRef.current = holdKey;
        const payload = { matchId, seatPlaceIds };

        if (useKeepalive) {
            ticketApi.cancelSeatHoldsOnUnload(payload);
            return;
        }

        ticketApi.cancelSeatHolds(payload).catch(() => {});
    }, []);

    useEffect(() => {
        const handlePageHide = () => releaseHeldSeatsSnapshot(true);

        window.addEventListener('pagehide', handlePageHide);

        return () => {
            window.removeEventListener('pagehide', handlePageHide);
            releaseHeldSeatsSnapshot();
        };
    }, [releaseHeldSeatsSnapshot]);

    const seatSections = useMemo(() => {
        const sectionOrder = ['vip', 'stand-a', 'stand-b', 'stand-c', 'stand-d', 'home', 'away'];
        const grouped = new Map(sectionOrder.map((id) => [id, {
            id,
            name: seatSectionNames[id],
            availableQuantity: 0,
            minPrice: 0,
            tickets: [],
        }]));

        ticketListings.forEach((ticket) => {
            const id = getSeatSectionId(ticket);
            const section = grouped.get(id) || {
                id,
                name: seatSectionNames[id] || ticket.sectionName,
                availableQuantity: 0,
                minPrice: 0,
                tickets: [],
            };
            const availableTickets = Math.max(ticket.availableQuantity, 0);
            section.tickets.push(ticket);
            section.availableQuantity += availableTickets;
            if (availableTickets > 0 && (!section.minPrice || ticket.unitPrice < section.minPrice)) {
                section.minPrice = ticket.unitPrice;
            }
            grouped.set(id, section);
        });

        return sectionOrder.map((id) => grouped.get(id)).filter(Boolean);
    }, [ticketListings]);

    const selectedSection = useMemo(
        () => seatSections.find((section) => section.id === selectedSectionId) || null,
        [seatSections, selectedSectionId],
    );

    const selectedTicket = useMemo(
        () => ticketListings.find((ticket) => ticket.id === selectedTicketId) || null,
        [selectedTicketId, ticketListings],
    );

    const releaseSelectedSeats = useCallback(async () => {
        if (!match?.id || !selectedSeats.length) {
            return;
        }

        await ticketApi.cancelSeatHolds({
            matchId: match.id,
            seatPlaceIds: selectedSeats.map((seat) => seat.seatPlaceId),
        });
    }, [match?.id, selectedSeats]);

    const loadSeats = useCallback(async (section, ticket, blockCode = '') => {
        if (!section || !ticket?.sectionId) {
            setSeats([]);
            return;
        }

        setSeatsLoading(true);
        setSeatsError('');

        try {
            const response = await matchApi.getSeats(matchSlug, ticket.sectionId, blockCode || undefined);
            setSeats(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setSeats([]);
            setSeatsError(error.response?.data?.message || 'Không tải được danh sách ghế.');
        } finally {
            setSeatsLoading(false);
        }
    }, [matchSlug]);

    const handleSelectSeatSection = async (section, blockMeta = null) => {
        if (!section || section.availableQuantity <= 0) {
            return;
        }

        const nextTicket = section.tickets
            .filter((ticket) => ticket.availableQuantity > 0 && ticket.sectionId)
            .sort((a, b) => a.unitPrice - b.unitPrice)[0];

        if (!nextTicket) {
            setSeatsError('Khu này chưa có ticket listing hợp lệ.');
            return;
        }

        try {
            await releaseSelectedSeats();
        } catch {
            // hold expired
        }

        setSelectedSeats([]);
        setBookingError('');
        setSelectedSectionId(section.id);
        setSelectedMapBlock(blockMeta);
        setSelectedTicketId(nextTicket.id);
        await loadSeats(section, nextTicket, blockMeta?.blockCode);
    };

    const refreshCurrentSeats = useCallback(async () => {
        if (selectedSection && selectedTicket) {
            await loadSeats(selectedSection, selectedTicket, selectedMapBlock?.blockCode);
        }
    }, [loadSeats, selectedMapBlock?.blockCode, selectedSection, selectedTicket]);

    const handleSeatClick = async (seat) => {
        if (!match?.id || !selectedTicket) {
            setBookingError('Vui lòng chọn khu ghế trước.');
            return;
        }

        const alreadySelected = selectedSeats.some((item) => item.seatPlaceId === seat.seatPlaceId);
        setPendingSeatId(seat.seatPlaceId);
        setBookingError('');

        try {
            if (alreadySelected) {
                await ticketApi.cancelSeatHolds({
                    matchId: match.id,
                    seatPlaceIds: [seat.seatPlaceId],
                });

                setSelectedSeats((current) => current.filter((item) => item.seatPlaceId !== seat.seatPlaceId));
                setSeats((current) => current.map((item) => (
                    item.seatPlaceId === seat.seatPlaceId
                        ? { ...item, status: 'Available', holdExpiresAt: null }
                        : item
                )));
                return;
            }

            const nextSeats = [...selectedSeats, seat];
            const response = await ticketApi.holdSeats({
                matchId: match.id,
                ticketListingId: selectedTicket.id,
                seatPlaceIds: nextSeats.map((item) => item.seatPlaceId),
            });

            const holdExpiresAt = response.data?.holdExpiresAt || null;
            setSelectedSeats(nextSeats.map((item) => ({ ...item, status: 'Held', holdExpiresAt })));
            setSeats((current) => current.map((item) => (
                nextSeats.some((selected) => selected.seatPlaceId === item.seatPlaceId)
                    ? { ...item, status: 'Held', holdExpiresAt }
                    : item
            )));
        } catch (error) {
            if (error.response?.status === 409) {
                setBookingError('Ghế này vừa được người khác giữ hoặc đã bán.');
                await refreshCurrentSeats();
                return;
            }

            setBookingError(error.response?.data?.message || 'Không giữ được ghế. Vui lòng thử lại.');
        } finally {
            setPendingSeatId(null);
        }
    };

    const handleClearSelection = async () => {
        if (!selectedSeats.length) {
            return;
        }

        setBookingError('');
        try {
            await releaseSelectedSeats();
            setSelectedSeats([]);
            await refreshCurrentSeats();
        } catch (error) {
            setBookingError(error.response?.data?.message || 'Không hủy được ghế đang giữ.');
        }
    };

    const handleSubmitOrder = async () => {
        if (!selectedTicket || !selectedSeats.length) {
            setBookingError('Vui lòng chọn ghế trước khi tạo đơn.');
            return;
        }

        setIsBooking(true);
        setBookingError('');

        try {
            const response = await ticketApi.createOrder({
                items: [{
                    ticketListingId: selectedTicket.id,
                    quantity: selectedSeats.length,
                    seatPlaceIds: selectedSeats.map((seat) => seat.seatPlaceId),
                }],
                customerName: user?.name || user?.username || user?.userName || '',
                customerEmail: user?.email || '',
                customerPhone: user?.phone || '',
                note: `${match?.homeTeam?.name || 'Home'} vs ${match?.awayTeam?.name || 'Away'} - ${selectedTicket.sectionName} - ${selectedSeats.map((seat) => seat.code).join(', ')}`,
            });

            submittedOrderRef.current = true;
            navigate(`/payments/${response.data.id}`, {
                state: {
                    orderId: response.data.id,
                    amount: response.data.totalAmount,
                    status: response.data.status,
                },
            });
        } catch (error) {
            if (error.response?.status === 409) {
                setBookingError('Ghế này vừa được người khác giữ hoặc đã bán.');
                await refreshCurrentSeats();
                return;
            }

            setBookingError(error.response?.data?.message || 'Không tạo được đơn đặt vé. Vui lòng thử lại.');
        } finally {
            setIsBooking(false);
        }
    };

    const kickoff = formatKickoff(match?.kickoffTime);
    const homeName = match?.homeTeam?.name || 'Đội nhà';
    const awayName = match?.awayTeam?.name || 'Đội khách';
    const roundName = match?.roundName || 'Vòng đấu chưa cập nhật';
    const season = match?.season || FALLBACK_SEASON;
    const stadiumName = match?.stadium?.name || 'Sân vận động đang cập nhật';
    const matchTitle = `${homeName} vs ${awayName}`;
    const matchMeta = `${roundName} · Premier League ${season} · ${stadiumName} · ${kickoff.short}`;

    if (isLoading) {
        return (
            <UserLayout>
                <PageFade>
                    <LoadingState title="Đang tải vé trận đấu..." description="Hệ thống đang lấy khu vé và ghế mới nhất." />
                </PageFade>
            </UserLayout>
        );
    }

    if (loadError || !match) {
        return (
            <UserLayout>
                <PageFade>
                    <ErrorState
                        title="Không có dữ liệu trận đấu"
                        message={loadError || 'Trận đấu không tồn tại.'}
                        onRetry={loadTicketData}
                    />
                </PageFade>
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <PageFade>
                <motion.div className="mb-6 flex flex-wrap items-center justify-between gap-3" initial="hidden" animate="show" variants={fadeUp} transition={pageTransition}>
                    <Link className="inline-flex items-center text-sm font-bold text-primary-light hover:text-white no-underline transition-colors" to="/matches">
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                        Trở về danh sách trận
                    </Link>
                    <StatusBadge status={match.status || 'Scheduled'} />
                </motion.div>

                {/* Match Hero Banner */}
                <motion.section
                    className="mb-8 rounded-2xl bg-gradient-to-r from-primary-dark/40 via-[#1A1A2E]/80 to-surface-card p-6 md:p-8 border border-white/5 shadow-xl relative overflow-hidden"
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    transition={{ ...itemTransition, delay: 0.05 }}
                >
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 rounded-full bg-primary/10 blur-xl pointer-events-none" />
                    
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4 text-xs font-bold text-slate-400">
                        <span className={`px-2.5 py-1 rounded-md ${selectedSectionId ? 'bg-white/5 text-slate-300' : 'bg-primary text-white glow-primary'}`}>1. Chọn khu khán đài</span>
                        <ChevronRight size={12} />
                        <span className={`px-2.5 py-1 rounded-md ${selectedSectionId && !selectedSeats.length ? 'bg-primary text-white glow-primary' : selectedSeats.length ? 'bg-white/5 text-slate-300' : 'bg-white/3 text-slate-500'}`}>2. Chọn vị trí ghế</span>
                        <ChevronRight size={12} />
                        <span className={`px-2.5 py-1 rounded-md ${selectedSeats.length ? 'bg-primary text-white glow-primary' : 'bg-white/3 text-slate-500'}`}>3. Xác nhận đặt vé</span>
                    </div>

                    <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] items-center py-4 border-b border-white/5">
                        <TeamHeroSide team={match.homeTeam} fallback="Đội nhà" side="home" />
                        <div className="flex flex-col items-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-primary to-primary-light text-xs font-black text-white shadow-lg shadow-primary/25 relative z-10">
                                VS
                            </div>
                        </div>
                        <TeamHeroSide team={match.awayTeam} fallback="Đội khách" side="away" />
                    </div>

                    {/* Meta information summary */}
                    <div className="mt-5.5 grid gap-4 grid-cols-1 sm:grid-cols-3 text-xs md:text-sm text-slate-300">
                        <div className="flex items-center gap-2.5 bg-white/2 border border-white/5 rounded-xl p-3">
                            <Calendar className="h-4.5 w-4.5 text-primary-light shrink-0" aria-hidden="true" />
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ngày thi đấu</div>
                                <span className="font-semibold text-white">{kickoff.date}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 bg-white/2 border border-white/5 rounded-xl p-3">
                            <Clock className="h-4.5 w-4.5 text-accent-cyan shrink-0" aria-hidden="true" />
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thời gian</div>
                                <span className="font-semibold text-white">{kickoff.time} (Giờ địa phương)</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2.5 bg-white/2 border border-white/5 rounded-xl p-3">
                            <MapPin className="h-4.5 w-4.5 text-accent-green shrink-0" aria-hidden="true" />
                            <div>
                                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sân vận động</div>
                                <span className="font-semibold text-white line-clamp-1">{stadiumName}</span>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {bookingError && (
                    <div className="mb-5">
                        <ErrorState title="Chưa hoàn tất thao tác" message={bookingError} />
                    </div>
                )}

                {/* Main 2 Column Booking Layout */}
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <motion.section className="min-w-0 space-y-6" initial="hidden" animate="show" variants={fadeUp} transition={itemTransition}>
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1A1A2E]/20 border border-white/5 rounded-2xl p-4 md:px-6">
                            <div>
                                <h3 className="text-base font-extrabold text-white tracking-wide">Đặt chỗ trực tiếp</h3>
                                <p className="mb-0 text-xs text-slate-400 mt-0.5">
                                    Click trực tiếp vào khán đài trên bản đồ để tải sơ đồ ghế trống.
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 shadow-sm">
                                <ShieldCheck className="mr-1.5 h-4 w-4" aria-hidden="true" />
                                100% Xác thực
                            </span>
                        </div>

                        <StadiumSeatMap
                            formatCurrency={formatCurrency}
                            onSelectSection={handleSelectSeatSection}
                            sections={seatSections}
                            selectedBlockCode={selectedMapBlock?.blockCode}
                            selectedSectionId={selectedSectionId}
                        />

                        <SeatGrid
                            error={seatsError}
                            formatCurrency={formatCurrency}
                            isLoading={seatsLoading}
                            onSeatClick={handleSeatClick}
                            pendingSeatId={pendingSeatId}
                            seats={seats}
                            selectedSeats={selectedSeats}
                            selectedMapBlock={selectedMapBlock}
                            selectedSection={selectedSection}
                            selectedTicket={selectedTicket}
                        />
                    </motion.section>

                    {/* Summary component on right column */}
                    <SeatSummary
                        formatCurrency={formatCurrency}
                        isBooking={isBooking}
                        matchMeta={matchMeta}
                        matchTitle={matchTitle}
                        onClear={handleClearSelection}
                        onSubmit={handleSubmitOrder}
                        selectedSeats={selectedSeats}
                        selectedSection={selectedSection}
                        selectedMapBlock={selectedMapBlock}
                        selectedTicket={selectedTicket}
                    />
                </div>
            </PageFade>
        </UserLayout>
    );
}

export default TicketBookingPage;
