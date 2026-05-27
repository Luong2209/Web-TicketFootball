import React, { useEffect, useState } from 'react';
import AdminResourcePage, { AdminStatusBadge, formatAdminDate, formatMoney } from './AdminResourcePage';
import { adminApi, checkinApi, newsApi, userApi } from '../../services/api';

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

const teamName = (value) => {
    if (!value) return 'Chưa có dữ liệu';
    if (typeof value === 'string') return value;
    return value.name || 'Chưa có dữ liệu';
};

const matchName = (match) => (
    match?.match
    || [teamName(match?.homeTeam), teamName(match?.awayTeam)].filter((name) => name !== 'Chưa có dữ liệu').join(' vs ')
    || 'Trận đấu đang cập nhật'
);

export function AdminDashboard() {
    const [stats, setStats] = useState({
        matches: 0,
        orders: 0,
        soldTickets: 0,
        revenue: 0,
        checkins: 0,
    });
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

            const matches = getRows(matchesRes.data);
            const orders = getRows(ordersRes.data);
            const checkins = getRows(checkinsRes.data);

            setStats({
                matches: matches.length,
                orders: orders.length,
                soldTickets: orders.reduce((total, order) => total + Number(order.eticketCount || order.itemCount || 0), 0),
                revenue: orders.reduce((total, order) => total + Number(order.totalAmount || 0), 0),
                checkins: checkins.length,
            });
            setLoading(false);
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const cards = [
        { label: 'Tổng trận đấu', value: stats.matches, icon: 'fas fa-futbol', bg: 'bg-info' },
        { label: 'Tổng đơn hàng', value: stats.orders, icon: 'fas fa-receipt', bg: 'bg-primary' },
        { label: 'Tổng vé bán', value: stats.soldTickets, icon: 'fas fa-ticket-alt', bg: 'bg-success' },
        { label: 'Doanh thu', value: formatMoney(stats.revenue), icon: 'fas fa-coins', bg: 'bg-warning' },
        { label: 'Vé đã check-in', value: stats.checkins, icon: 'fas fa-qrcode', bg: 'bg-secondary' },
    ];

    return (
        <>
            <div className="content-header mb-3">
                <div className="container-fluid">
                    <h1 className="m-0">Dashboard</h1>
                    <p className="mb-0 mt-2 text-muted">Tổng quan vận hành Premier League Tickets.</p>
                </div>
            </div>

            {loading ? (
                <div className="card shadow-sm">
                    <div className="card-body py-5 text-center">
                        <div className="spinner-border text-primary" role="status" />
                    </div>
                </div>
            ) : (
                <div className="row g-3">
                    {cards.map((card) => (
                        <div className="col-xl col-md-4 col-sm-6" key={card.label}>
                            <div className={`rounded-4 p-4 text-white shadow-sm ${card.bg}`}>
                                <div className="d-flex justify-content-between gap-3">
                                    <div>
                                        <p className="mb-2 fw-bold opacity-75">{card.label}</p>
                                        <h3 className="mb-0 fw-bold">{card.value}</h3>
                                    </div>
                                    <i className={`${card.icon} fa-2x opacity-50`} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}

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
    />
);

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
    />
);

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
    />
);

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
    />
);

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
    />
);

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
    />
);

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

export const AdminNews = () => (
    <AdminResourcePage
        title="NewsArticles"
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
    />
);

export const AdminUsers = () => (
    <AdminResourcePage
        title="Người dùng"
        description="Danh sách user nếu API quản lý người dùng khả dụng."
        loader={() => userApi.getAll({ page: 1, pageSize: 100 })}
        searchableFields={['username', 'name', 'email', 'phone']}
        columns={[
            { key: 'username', label: 'Username', render: (row) => row.username || row.userName || 'Chưa có dữ liệu' },
            { key: 'name', label: 'Name', render: (row) => row.name || 'Chưa có dữ liệu' },
            { key: 'email', label: 'Email', render: (row) => row.email || 'Chưa có dữ liệu' },
            { key: 'phone', label: 'Phone', render: (row) => row.phone || 'Chưa có dữ liệu' },
            { key: 'role', label: 'Role', render: (row) => row.userType === 1 ? 'Admin' : 'User' },
            { key: 'isActive', label: 'Status', render: (row) => <AdminStatusBadge value={row.isActive === false ? 'Inactive' : 'Active'} /> },
        ]}
    />
);
