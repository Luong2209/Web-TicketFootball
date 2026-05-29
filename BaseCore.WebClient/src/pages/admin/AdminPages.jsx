import React, { useEffect, useState } from 'react';
import AdminResourcePage, { AdminStatusBadge, formatAdminDate, formatMoney, getRows } from './AdminResourcePage';
import { adminApi, checkinApi, newsApi, userApi } from '../../services/api';

/* ─── Dashboard helpers ──────────────────────────────────────────────── */

const STAT_CARDS = [
    { key: 'matches',     label: 'Tổng trận đấu', icon: 'fas fa-futbol',     from: 'from-sky-500',    to: 'to-sky-600' },
    { key: 'orders',      label: 'Tổng đơn hàng', icon: 'fas fa-receipt',    from: 'from-indigo-500', to: 'to-indigo-600' },
    { key: 'soldTickets', label: 'Vé đã bán',      icon: 'fas fa-ticket-alt', from: 'from-emerald-500',to: 'to-emerald-600' },
    { key: 'revenue',     label: 'Doanh thu',      icon: 'fas fa-coins',      from: 'from-amber-500',  to: 'to-amber-600', format: formatMoney },
    { key: 'checkins',    label: 'Check-in',       icon: 'fas fa-qrcode',     from: 'from-violet-500', to: 'to-violet-600' },
];

const teamName = (value) => {
    if (!value) return 'Chưa có dữ liệu';
    if (typeof value === 'string') return value;
    return value.name || 'Chưa có dữ liệu';
};

const matchName = (match) => (
    match?.match
    || [teamName(match?.homeTeam), teamName(match?.awayTeam)].filter((n) => n !== 'Chưa có dữ liệu').join(' vs ')
    || 'Trận đấu đang cập nhật'
);

const ORDER_STATUS_COLOR = {
    paid: 'bg-emerald-100 text-emerald-700',
    completed: 'bg-emerald-100 text-emerald-700',
    pending: 'bg-amber-100 text-amber-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
};
const orderBadge = (status) => {
    const s = String(status || 'Pending').toLowerCase();
    const cls = ORDER_STATUS_COLOR[s] ?? 'bg-slate-100 text-slate-600';
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{status || 'Pending'}</span>;
};

/* ─── AdminDashboard ─────────────────────────────────────────────────── */

export function AdminDashboard() {
    const [stats, setStats] = useState({ matches: 0, orders: 0, soldTickets: 0, revenue: 0, checkins: 0 });
    const [recentMatches, setRecentMatches] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);

            const [matchesRes, ordersRes, checkinsRes] = await Promise.all([
                adminApi.getMatches().catch(() => ({ data: [] })),
                adminApi.getOrders().catch(() => ({ data: [] })),
                checkinApi.getAll().catch(() => ({ data: [] })),
            ]);

            if (!mounted) return;

            const matches  = getRows(matchesRes.data);
            const orders   = getRows(ordersRes.data);
            const checkins = getRows(checkinsRes.data);

            setStats({
                matches: matches.length,
                orders: orders.length,
                soldTickets: orders.reduce((sum, o) => sum + Number(o.eticketCount || o.itemCount || 0), 0),
                revenue: orders.reduce((sum, o) => sum + Number(o.totalAmount || 0), 0),
                checkins: checkins.length,
            });

            /* Recent 5 matches (sorted by kickoff desc) */
            const sortedMatches = [...matches].sort(
                (a, b) => new Date(b.kickoffTime || 0) - new Date(a.kickoffTime || 0)
            );
            setRecentMatches(sortedMatches.slice(0, 5));

            /* Recent 5 orders (sorted by createdAt desc) */
            const sortedOrders = [...orders].sort(
                (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            );
            setRecentOrders(sortedOrders.slice(0, 5));

            setLoading(false);
        };

        load();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="space-y-6">
            {/* Title */}
            <div>
                <h1 className="text-xl font-black text-slate-900">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-500">Tổng quan vận hành Premier League Tickets.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
                </div>
            ) : (
                <>
                    {/* Stat cards */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                        {STAT_CARDS.map((card) => (
                            <div key={card.key} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                                <div className={`bg-gradient-to-br ${card.from} ${card.to} p-4`}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="mb-1 text-xs font-semibold text-white/80">{card.label}</p>
                                            <p className="text-2xl font-black leading-none text-white">
                                                {card.format ? card.format(stats[card.key]) : stats[card.key]}
                                            </p>
                                        </div>
                                        <div className="shrink-0 rounded-lg bg-white/20 p-2">
                                            <i className={`${card.icon} text-sm text-white`} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Recent data grid */}
                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* Recent matches */}
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-futbol text-sky-500 text-sm" />
                                    <h2 className="text-sm font-bold text-slate-700">Trận đấu gần đây</h2>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                                    {recentMatches.length} trận
                                </span>
                            </div>
                            {recentMatches.length ? (
                                <div className="divide-y divide-slate-50">
                                    {recentMatches.map((match, idx) => (
                                        <div key={match.id || match.slug || idx} className="flex items-center gap-3 px-5 py-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                                                <i className="fas fa-futbol text-xs" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-800">{matchName(match)}</p>
                                                <p className="text-xs text-slate-400">
                                                    {match.stadium?.name || match.stadium || 'Chưa có sân'} · {formatAdminDate(match.kickoffTime)}
                                                </p>
                                            </div>
                                            <AdminStatusBadge value={match.status || 'Scheduled'} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-sm text-slate-400">Chưa có dữ liệu trận đấu</div>
                            )}
                        </div>

                        {/* Recent orders */}
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                    <i className="fas fa-receipt text-indigo-500 text-sm" />
                                    <h2 className="text-sm font-bold text-slate-700">Đơn hàng gần đây</h2>
                                </div>
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                                    {recentOrders.length} đơn
                                </span>
                            </div>
                            {recentOrders.length ? (
                                <div className="divide-y divide-slate-50">
                                    {recentOrders.map((order, idx) => (
                                        <div key={order.id || idx} className="flex items-center gap-3 px-5 py-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 font-bold text-xs">
                                                #{order.id || idx + 1}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                    {order.userName || order.customerName || 'Khách hàng'}
                                                </p>
                                                <p className="text-xs text-slate-400">
                                                    {formatMoney(order.totalAmount)} · {formatAdminDate(order.createdAt)}
                                                </p>
                                            </div>
                                            {orderBadge(order.paymentStatus || order.status)}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-sm text-slate-400">Chưa có đơn hàng nào</div>
                            )}
                        </div>

                    </div>
                </>
            )}
        </div>
    );
}

/* ─── AdminSeasons ───────────────────────────────────────────────────── */

export const AdminSeasons = () => (
    <AdminResourcePage
        title="Mùa giải"
        description="Danh sách mùa giải và số vòng đấu."
        loader={adminApi.getSeasons}
        searchableFields={['name']}
        columns={[
            { key: 'name', label: 'Mùa giải', render: (row) => row.name || 'Premier League 2026-2027' },
            { key: 'startDate', label: 'Bắt đầu', render: (row) => formatAdminDate(row.startDate) },
            { key: 'endDate', label: 'Kết thúc', render: (row) => formatAdminDate(row.endDate) },
            { key: 'roundCount', label: 'Số vòng', render: (row) => row.roundCount ?? 0 },
            { key: 'isActive', label: 'Trạng thái', render: (row) => <AdminStatusBadge value={row.isActive ? 'Active' : 'Inactive'} /> },
        ]}
        formFields={[
            { name: 'name', label: 'Tên mùa giải', type: 'text', required: true, placeholder: 'VD: Premier League 2027-2028' },
            { name: 'startDate', label: 'Ngày bắt đầu', type: 'date', required: false },
            { name: 'endDate', label: 'Ngày kết thúc', type: 'date', required: false },
            { name: 'roundCount', label: 'Số vòng đấu', type: 'number', required: false, placeholder: '38' },
            { name: 'isActive', label: 'Trạng thái', type: 'select', required: false, options: [{ value: true, label: 'Đang hoạt động' }, { value: false, label: 'Không hoạt động' }] },
        ]}
        apiMethods={{
            create: (data) => adminApi.createSeason(data),
            update: (id, data) => adminApi.updateSeason(id, data),
            delete: (id) => adminApi.deleteSeason(id),
        }}
    />
);

/* ─── AdminRounds ────────────────────────────────────────────────────── */

export const AdminRounds = () => (
    <AdminResourcePage
        title="Vòng đấu"
        description="Danh sách vòng theo mùa và số trận trong mỗi vòng."
        loader={() => adminApi.getRounds({ season: '2026-2027' })}
        searchableFields={['name', 'season']}
        columns={[
            { key: 'season', label: 'Mùa', render: (row) => row.season || 'Premier League 2026-2027' },
            { key: 'roundNumber', label: 'Vòng', render: (row) => row.roundNumber ?? 'Chưa có dữ liệu' },
            { key: 'name', label: 'Tên vòng', render: (row) => row.name || 'Vòng đấu chưa cập nhật' },
            { key: 'startDate', label: 'Bắt đầu', render: (row) => formatAdminDate(row.startDate) },
            { key: 'matchCount', label: 'Số trận', render: (row) => row.matchCount ?? 0 },
        ]}
        formFields={[
            { name: 'season', label: 'Mùa giải', type: 'text', required: true, placeholder: 'Premier League 2026-2027' },
            { name: 'roundNumber', label: 'Số vòng', type: 'number', required: true, placeholder: '1' },
            { name: 'name', label: 'Tên vòng', type: 'text', required: false, placeholder: 'Vòng 1' },
            { name: 'startDate', label: 'Ngày bắt đầu', type: 'date', required: false },
        ]}
        apiMethods={{
            create: (data) => adminApi.createRound(data),
            update: (id, data) => adminApi.updateRound(id, data),
            delete: (id) => adminApi.deleteRound(id),
        }}
    />
);

/* ─── AdminMatches ───────────────────────────────────────────────────── */

export const AdminMatches = () => (
    <AdminResourcePage
        title="Trận đấu"
        description="Bảng trận đấu có mùa, vòng, CLB, sân, giờ đá và trạng thái."
        loader={adminApi.getMatches}
        searchableFields={['slug', 'season', 'roundName', 'homeTeam', 'awayTeam', 'stadium', (row) => teamName(row.homeTeam), (row) => teamName(row.awayTeam)]}
        columns={[
            { key: 'season', label: 'Season', render: (row) => row.season || 'Premier League 2026-2027' },
            { key: 'roundName', label: 'Round', render: (row) => row.roundName || 'Vòng đấu chưa cập nhật' },
            { key: 'match', label: 'Trận', render: (row) => matchName(row) },
            { key: 'stadium', label: 'Sân', render: (row) => row.stadium?.name || row.stadium || 'Chưa có dữ liệu' },
            { key: 'kickoffTime', label: 'Kickoff', render: (row) => formatAdminDate(row.kickoffTime) },
            { key: 'status', label: 'Status', render: (row) => <AdminStatusBadge value={row.status || 'Scheduled'} /> },
            { key: 'isFeatured', label: 'Featured', render: (row) => row.isFeatured ? 'Có' : 'Không' },
        ]}
        formFields={[
            { name: 'homeTeam', label: 'Đội nhà', type: 'text', required: true, placeholder: 'Manchester United' },
            { name: 'awayTeam', label: 'Đội khách', type: 'text', required: true, placeholder: 'Liverpool' },
            { name: 'season', label: 'Mùa giải', type: 'text', required: false, placeholder: 'Premier League 2026-2027' },
            { name: 'roundName', label: 'Vòng đấu', type: 'text', required: false, placeholder: 'Vòng 1' },
            { name: 'stadium', label: 'Sân vận động', type: 'text', required: false, placeholder: 'Old Trafford' },
            { name: 'kickoffTime', label: 'Giờ thi đấu', type: 'datetime-local', required: false },
            { name: 'status', label: 'Trạng thái', type: 'select', required: false, options: [{ value: 'Scheduled', label: 'Scheduled' }, { value: 'Live', label: 'Live' }, { value: 'Finished', label: 'Finished' }, { value: 'Cancelled', label: 'Cancelled' }] },
            { name: 'isFeatured', label: 'Nổi bật', type: 'select', required: false, options: [{ value: false, label: 'Không' }, { value: true, label: 'Có' }] },
        ]}
        apiMethods={{
            create: (data) => adminApi.createMatch(data),
            update: (id, data) => adminApi.updateMatch(id, data),
            delete: (id) => adminApi.deleteMatch(id),
        }}
    />
);

/* ─── AdminClubs ─────────────────────────────────────────────────────── */

export const AdminClubs = () => (
    <AdminResourcePage
        title="CLB"
        description="Danh sách CLB."
        loader={adminApi.getClubs}
        searchableFields={['name']}
        columns={[
            { key: 'name', label: 'Tên CLB' },
            { key: 'logoUrl', label: 'Logo', render: (row) => row.logoUrl ? <img alt={row.name || 'Club'} className="img-thumbnail" src={row.logoUrl} style={{ width: 48, height: 48, objectFit: 'contain' }} /> : 'Chưa có dữ liệu' },
        ]}
        formFields={[
            { name: 'name', label: 'Tên CLB', type: 'text', required: true, placeholder: 'Manchester United' },
            { name: 'shortName', label: 'Tên viết tắt', type: 'text', required: false, placeholder: 'MAN UTD' },
            { name: 'logoUrl', label: 'URL Logo', type: 'text', required: false, placeholder: 'https://...' },
            { name: 'country', label: 'Quốc gia', type: 'text', required: false, placeholder: 'England' },
        ]}
        apiMethods={{
            create: (data) => adminApi.createClub(data),
            update: (id, data) => adminApi.updateClub(id, data),
            delete: (id) => adminApi.deleteClub(id),
        }}
    />
);

/* ─── AdminStadiums ──────────────────────────────────────────────────── */

export const AdminStadiums = () => (
    <AdminResourcePage
        title="Sân vận động"
        description="Danh sách sân vận động và số khu ghế."
        loader={adminApi.getStadiums}
        searchableFields={['name', 'city', 'country']}
        columns={[
            { key: 'name', label: 'Sân', render: (row) => row.name || 'Chưa có dữ liệu' },
            { key: 'city', label: 'Thành phố', render: (row) => row.city || 'Chưa có dữ liệu' },
            { key: 'country', label: 'Quốc gia', render: (row) => row.country || 'Chưa có dữ liệu' },
            { key: 'capacity', label: 'Sức chứa', render: (row) => Number(row.capacity || 0).toLocaleString('vi-VN') },
            { key: 'sectionCount', label: 'Khu ghế', render: (row) => row.sectionCount ?? 0 },
        ]}
        formFields={[
            { name: 'name', label: 'Tên sân', type: 'text', required: true, placeholder: 'Old Trafford' },
            { name: 'city', label: 'Thành phố', type: 'text', required: false, placeholder: 'Manchester' },
            { name: 'country', label: 'Quốc gia', type: 'text', required: false, placeholder: 'England' },
            { name: 'capacity', label: 'Sức chứa', type: 'number', required: false, placeholder: '74000' },
        ]}
        apiMethods={{
            create: (data) => adminApi.createStadium(data),
            update: (id, data) => adminApi.updateStadium(id, data),
            delete: (id) => adminApi.deleteStadium(id),
        }}
    />
);

/* ─── AdminTickets ───────────────────────────────────────────────────── */

export const AdminTickets = () => (
    <AdminResourcePage
        title="Vé trận đấu"
        description="Quản lý vé theo trận, khu ghế, giá và số lượng."
        loader={adminApi.getTickets}
        searchableFields={['match', 'section', 'title', 'ticketType']}
        columns={[
            { key: 'match', label: 'Trận', render: (row) => row.match || 'Trận đấu đang cập nhật' },
            { key: 'section', label: 'Khu', render: (row) => row.section || 'Đang cập nhật' },
            { key: 'title', label: 'Listing', render: (row) => row.title || 'Ticket listing' },
            { key: 'ticketType', label: 'Loại', render: (row) => row.ticketType || 'standard' },
            { key: 'unitPrice', label: 'Giá', render: (row) => formatMoney(row.unitPrice) },
            { key: 'availableQuantity', label: 'Còn lại', render: (row) => row.availableQuantity ?? 0 },
            { key: 'isVerified', label: 'Verified', render: (row) => row.isVerified ? 'Có' : 'Không' },
        ]}
        formFields={[
            { name: 'match', label: 'Trận đấu (slug)', type: 'text', required: true, placeholder: 'man-utd-vs-liverpool' },
            { name: 'section', label: 'Khu ghế', type: 'text', required: false, placeholder: 'North Stand' },
            { name: 'title', label: 'Tiêu đề listing', type: 'text', required: false, placeholder: 'Vé khu Bắc' },
            { name: 'ticketType', label: 'Loại vé', type: 'select', required: false, options: [{ value: 'standard', label: 'Standard' }, { value: 'vip', label: 'VIP' }, { value: 'premium', label: 'Premium' }] },
            { name: 'unitPrice', label: 'Giá vé (VND)', type: 'number', required: false, placeholder: '500000' },
            { name: 'availableQuantity', label: 'Số lượng', type: 'number', required: false, placeholder: '100' },
        ]}
        apiMethods={{
            create: (data) => adminApi.createTicket(data),
            update: (id, data) => adminApi.updateTicket(id, data),
            delete: (id) => adminApi.deleteTicket(id),
        }}
    />
);

/* ─── AdminOrders (read-only) ────────────────────────────────────────── */

export const AdminOrders = () => (
    <AdminResourcePage
        title="Đơn hàng"
        description="Xem đơn, user, tổng tiền và trạng thái thanh toán."
        loader={adminApi.getOrders}
        searchableFields={['userName', 'customerName', 'customerEmail', 'status', 'paymentStatus']}
        columns={[
            { key: 'id', label: 'Mã đơn', render: (row) => `#${row.id}` },
            { key: 'userName', label: 'User', render: (row) => row.userName || row.customerName || 'Chưa có dữ liệu' },
            { key: 'createdAt', label: 'Ngày tạo', render: (row) => formatAdminDate(row.createdAt) },
            { key: 'totalAmount', label: 'Tổng tiền', render: (row) => formatMoney(row.totalAmount) },
            { key: 'status', label: 'Đơn hàng', render: (row) => <AdminStatusBadge value={row.status || 'Pending'} /> },
            { key: 'paymentStatus', label: 'Thanh toán', render: (row) => <AdminStatusBadge value={row.paymentStatus || 'Pending'} /> },
            { key: 'eticketCount', label: 'E-ticket', render: (row) => row.eticketCount ?? 0 },
        ]}
    />
);

/* ─── AdminPayments (read-only) ──────────────────────────────────────── */

export const AdminPayments = () => (
    <AdminResourcePage
        title="Thanh toán"
        description="Xem payment status nếu backend cung cấp API quản lý."
        loader={adminApi.getPayments}
        searchableFields={['paymentCode', 'status', 'provider', 'method']}
        columns={[
            { key: 'paymentCode', label: 'Payment code' },
            { key: 'method', label: 'Method' },
            { key: 'provider', label: 'Provider' },
            { key: 'amount', label: 'Amount', render: (row) => formatMoney(row.amount) },
            { key: 'status', label: 'Status', render: (row) => <AdminStatusBadge value={row.status || 'Pending'} /> },
            { key: 'createdAt', label: 'Created', render: (row) => formatAdminDate(row.createdAt) },
        ]}
    />
);

/* ─── AdminETickets (read-only) ──────────────────────────────────────── */

export const AdminETickets = () => (
    <AdminResourcePage
        title="Vé điện tử"
        description="Xem ticket code và trạng thái nếu backend cung cấp API quản lý."
        loader={adminApi.getETickets}
        searchableFields={['ticketCode', 'holderName', 'status']}
        columns={[
            { key: 'ticketCode', label: 'Ticket code' },
            { key: 'holderName', label: 'Holder' },
            { key: 'status', label: 'Status', render: (row) => <AdminStatusBadge value={row.status || 'Issued'} /> },
            { key: 'issuedAt', label: 'Issued', render: (row) => formatAdminDate(row.issuedAt) },
            { key: 'usedAt', label: 'Used', render: (row) => formatAdminDate(row.usedAt) },
        ]}
    />
);

/* ─── AdminCheckins (read-only) ──────────────────────────────────────── */

export const AdminCheckins = () => (
    <AdminResourcePage
        title="Check-in QR"
        description="Lịch sử check-in từ API hiện có. Form check-in cũ vẫn giữ ở route /admin/checkin."
        loader={checkinApi.getAll}
        searchableFields={['checkinCode', 'ticketCode', 'gate', 'status']}
        columns={[
            { key: 'checkinCode', label: 'Check-in code', render: (row) => row.checkinCode || 'Chưa có dữ liệu' },
            { key: 'ticketCode', label: 'Ticket', render: (row) => row.ticketCode || 'Chưa có dữ liệu' },
            { key: 'gate', label: 'Gate', render: (row) => row.gate || 'Chưa có dữ liệu' },
            { key: 'status', label: 'Status', render: (row) => <AdminStatusBadge value={row.status || 'Completed'} /> },
            { key: 'checkedAt', label: 'Time', render: (row) => formatAdminDate(row.checkedAt) },
        ]}
    />
);

/* ─── AdminNews ──────────────────────────────────────────────────────── */

export const AdminNews = () => (
    <AdminResourcePage
        title="Tin tức"
        description="Danh sách tin tức Premier League."
        loader={adminApi.getNews}
        fallbackRows={async () => {
            const response = await newsApi.getAll();
            return response.data;
        }}
        searchableFields={['title', 'category', 'season']}
        columns={[
            { key: 'title', label: 'Tiêu đề', render: (row) => row.title || 'Tin tức Premier League' },
            { key: 'category', label: 'Category', render: (row) => row.category || 'Premier League' },
            { key: 'season', label: 'Season', render: (row) => row.season || '2026-2027' },
            { key: 'publishedAt', label: 'Published', render: (row) => formatAdminDate(row.publishedAt) },
            { key: 'isFeatured', label: 'Featured', render: (row) => row.isFeatured ? 'Có' : 'Không' },
        ]}
        formFields={[
            { name: 'title', label: 'Tiêu đề', type: 'text', required: true, placeholder: 'Tiêu đề bài viết' },
            { name: 'category', label: 'Danh mục', type: 'text', required: false, placeholder: 'Premier League' },
            { name: 'season', label: 'Mùa giải', type: 'text', required: false, placeholder: '2026-2027' },
            { name: 'publishedAt', label: 'Ngày đăng', type: 'date', required: false },
            { name: 'isFeatured', label: 'Nổi bật', type: 'select', required: false, options: [{ value: false, label: 'Không' }, { value: true, label: 'Có' }] },
            { name: 'content', label: 'Nội dung', type: 'textarea', required: false, placeholder: 'Nội dung bài viết...' },
        ]}
        apiMethods={{
            create: (data) => adminApi.createNews(data),
            update: (id, data) => adminApi.updateNews(id, data),
            delete: (id) => adminApi.deleteNews(id),
        }}
    />
);

/* ─── AdminUsers ─────────────────────────────────────────────────────── */

export const AdminUsers = () => (
    <AdminResourcePage
        title="Người dùng"
        description="Danh sách và quản lý tài khoản người dùng trong hệ thống."
        loader={() => userApi.getAll({ page: 1, pageSize: 200 })}
        searchableFields={['username', 'name', 'email', 'phone']}
        columns={[
            { key: 'username', label: 'Username', render: (row) => row.username || row.userName || 'Chưa có dữ liệu' },
            { key: 'name', label: 'Họ tên', render: (row) => row.name || 'Chưa có dữ liệu' },
            { key: 'email', label: 'Email', render: (row) => row.email || 'Chưa có dữ liệu' },
            { key: 'phone', label: 'Phone', render: (row) => row.phone || 'Chưa có dữ liệu' },
            { key: 'role', label: 'Vai trò', render: (row) => row.userType === 1 ? 'Admin' : 'User' },
            { key: 'isActive', label: 'Trạng thái', render: (row) => <AdminStatusBadge value={row.isActive === false ? 'Inactive' : 'Active'} /> },
        ]}
        formFields={[
            { name: 'username', label: 'Username', type: 'text', required: true, placeholder: 'john_doe' },
            { name: 'name', label: 'Họ và tên', type: 'text', required: true, placeholder: 'Nguyễn Văn A' },
            { name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'user@example.com' },
            { name: 'phone', label: 'Số điện thoại', type: 'text', required: false, placeholder: '0912345678' },
            { name: 'password', label: 'Mật khẩu', type: 'password', required: false, placeholder: 'Để trống nếu không thay đổi', hint: 'Bắt buộc khi tạo mới. Để trống khi chỉnh sửa nếu không đổi mật khẩu.' },
            { name: 'userType', label: 'Vai trò', type: 'select', required: false, options: [{ value: 0, label: 'User' }, { value: 1, label: 'Admin' }] },
        ]}
        apiMethods={{
            create: (data) => userApi.create(data),
            update: (id, data) => userApi.update(id, data),
            delete: (id) => userApi.delete(id),
        }}
    />
);
