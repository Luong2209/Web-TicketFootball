import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { matchApi, ticketApi } from '../../services/api';
import BookingStatus from './components/BookingStatus';
import StadiumMap from './components/StadiumMap';
import TicketBookingHeader from './components/TicketBookingHeader';
import TicketFilters from './components/TicketFilters';
import TicketResultsPanel from './components/TicketResultsPanel';
import './TicketBooking.css';

const ticketTypeLabels = {
    standard: 'Tieu chuan',
    best: 'Cho ngoi dep',
    away: 'Khu khach',
    vip: 'VIP',
};

const formatKickoff = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('vi-VN', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const mapSection = (section) => ({
    id: section.code,
    dbId: section.id,
    name: section.name,
    x: Number(section.mapX),
    y: Number(section.mapY),
    w: Number(section.mapWidth),
    h: Number(section.mapHeight),
    price: Number(section.basePrice),
    type: section.tier,
});

const mapListing = (listing) => ({
    id: listing.id,
    sectionId: listing.section.code,
    title: listing.title,
    row: listing.rowLabel,
    quantity: listing.availableQuantity,
    price: Number(listing.unitPrice),
    score: listing.isVerified ? 'Da xac thuc' : 'Dang kiem tra',
    tags: [listing.deliveryMethod, ticketTypeLabels[listing.ticketType] || listing.ticketType].filter(Boolean),
    seller: listing.sellerName,
    type: listing.ticketType,
});

function TicketBookingPage() {
    const { matchSlug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [matchData, setMatchData] = useState(null);
    const [stadiumSections, setStadiumSections] = useState([]);
    const [ticketListings, setTicketListings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [selectedSection, setSelectedSection] = useState(null);
    const [ticketCount, setTicketCount] = useState(1);
    const [maxPrice, setMaxPrice] = useState(0);
    const [activeFilter, setActiveFilter] = useState('');
    const [sortMode, setSortMode] = useState('price');
    const [mapZoom, setMapZoom] = useState(1);
    const [bookingId, setBookingId] = useState(null);
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

                const match = matchResponse.data;
                const sections = ticketsResponse.data.sections.map(mapSection);
                const listings = ticketsResponse.data.listings.map(mapListing);
                const highestPrice = listings.reduce((current, ticket) => Math.max(current, ticket.price), 0);

                setMatchData({
                    id: match.slug,
                    title: `${match.homeTeam.name} vs ${match.awayTeam.name}`,
                    date: formatKickoff(match.kickoffTime),
                    stadium: match.stadium.name,
                    location: `${match.stadium.city}, ${match.stadium.country}`,
                    listings: listings.length,
                });
                setStadiumSections(sections);
                setTicketListings(listings);
                setMaxPrice(highestPrice || 8000);
                setSelectedSection(null);
            } catch (error) {
                if (isMounted) {
                    setLoadError(error.response?.data?.message || 'Khong tai duoc du lieu ve tu backend.');
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

    const filterOptions = useMemo(() => {
        const types = [...new Set(ticketListings.map((ticket) => ticket.type).filter(Boolean))];
        return types.map((type) => ({ label: ticketTypeLabels[type] || type, value: type }));
    }, [ticketListings]);

    const selectedSectionData = stadiumSections.find((section) => section.id === selectedSection);

    const visibleTickets = useMemo(() => {
        const filtered = ticketListings.filter((ticket) => (
            (!selectedSection || ticket.sectionId === selectedSection)
            && ticket.quantity >= ticketCount
            && ticket.price <= maxPrice
            && (!activeFilter || ticket.type === activeFilter)
        ));

        return [...filtered].sort((a, b) => (sortMode === 'price-desc' ? b.price - a.price : a.price - b.price));
    }, [activeFilter, maxPrice, selectedSection, sortMode, ticketCount, ticketListings]);

    const resetBookingStatus = () => {
        setBookingError('');
        setBookingId(null);
    };

    const handleSelectSection = (sectionId) => {
        setSelectedSection((current) => (current === sectionId ? null : sectionId));
        resetBookingStatus();
    };

    const handleClearSection = () => {
        setSelectedSection(null);
        resetBookingStatus();
    };

    const handleBookTicket = async (ticket) => {
        setIsBooking(true);
        resetBookingStatus();

        try {
            const response = await ticketApi.createOrder({
                items: [{ ticketListingId: ticket.id, quantity: ticketCount }],
                customerName: user?.name || user?.username || '',
                customerEmail: user?.email || '',
                customerPhone: user?.phone || '',
                note: `${matchData.title} - ${ticket.sectionId} - ${ticket.row}`,
            });

            setBookingId(response.data?.id || 'pending');
            setTicketListings((current) => current
                .map((item) => (item.id === ticket.id ? { ...item, quantity: item.quantity - ticketCount } : item))
                .filter((item) => item.quantity > 0));
            navigate(`/payments/${response.data.id}`, {
                state: {
                    orderId: response.data.id,
                    amount: response.data.totalAmount,
                    status: response.data.status,
                },
            });
        } catch (error) {
            setBookingError(error.response?.data?.message || 'Khong tao duoc don dat ve.');
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-700">
                <div className="grid gap-3 text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-plum-950" />
                    <strong>Dang tai du lieu ve...</strong>
                </div>
            </div>
        );
    }

    if (loadError || !matchData) {
        return (
            <div className="min-h-screen bg-slate-100 text-slate-900">
                <TicketBookingHeader />
                <div className="mx-auto mt-10 max-w-xl rounded-lg border border-rose-200 bg-white p-6 text-rose-700 shadow-sm">
                    <strong>Khong co du lieu tran dau</strong>
                    <p className="mb-0 mt-2">{loadError || 'Tran dau khong ton tai.'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen overflow-x-hidden bg-slate-100 font-sans text-ink-900">
            <TicketBookingHeader />

            <main className="grid overflow-visible lg:h-[calc(100vh-68px)] lg:grid-cols-[minmax(380px,35%)_minmax(0,65%)] lg:overflow-hidden">
                <TicketResultsPanel
                    isBooking={isBooking}
                    matchData={matchData}
                    matchSlug={matchSlug}
                    selectedSectionData={selectedSectionData}
                    sortMode={sortMode}
                    visibleTickets={visibleTickets}
                    onBookTicket={handleBookTicket}
                    onClearSection={handleClearSection}
                    onSelectSection={handleSelectSection}
                    onSortChange={setSortMode}
                />

                <section className="order-1 flex min-h-[560px] min-w-0 flex-col bg-slate-50 lg:order-2">
                    <TicketFilters
                        activeFilter={activeFilter}
                        filterOptions={filterOptions}
                        maxPrice={maxPrice}
                        ticketCount={ticketCount}
                        onActiveFilterChange={setActiveFilter}
                        onMaxPriceChange={setMaxPrice}
                        onTicketCountChange={setTicketCount}
                    />

                    <StadiumMap
                        mapZoom={mapZoom}
                        sections={stadiumSections}
                        selectedSection={selectedSection}
                        onSelectSection={handleSelectSection}
                        onZoomChange={setMapZoom}
                    />

                    <BookingStatus bookingError={bookingError} bookingId={bookingId} />
                </section>
            </main>
        </div>
    );
}

export default TicketBookingPage;
