import React, { useEffect, useMemo, useState } from 'react';

const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

export const formatAdminDate = (value) => {
    if (!value) return 'Đang cập nhật';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

export const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

export const AdminStatusBadge = ({ value }) => {
    const normalized = String(value || 'Pending').toLowerCase();
    const className = {
        active: 'text-bg-success',
        paid: 'text-bg-success',
        completed: 'text-bg-success',
        issued: 'text-bg-success',
        used: 'text-bg-secondary',
        scheduled: 'text-bg-info',
        pending: 'text-bg-warning',
        failed: 'text-bg-danger',
        cancelled: 'text-bg-danger',
        canceled: 'text-bg-danger',
    }[normalized] || 'text-bg-primary';

    return <span className={`badge ${className}`}>{value || 'Pending'}</span>;
};

function AdminResourcePage({
    title,
    description,
    loader,
    columns,
    searchableFields = [],
    emptyMessage = 'Chưa có dữ liệu',
    pendingMessage = 'Module này đang chờ API quản lý.',
    fallbackRows,
    notice,
}) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [usingFallback, setUsingFallback] = useState(false);

    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError('');
            setUsingFallback(false);

            try {
                const response = await loader();
                if (mounted) {
                    setRows(getRows(response.data));
                }
            } catch (requestError) {
                if (!mounted) return;

                if (fallbackRows) {
                    try {
                        const fallback = await fallbackRows(requestError);
                        setRows(getRows(fallback));
                        setUsingFallback(true);
                        setError('');
                    } catch {
                        setRows([]);
                        setError(pendingMessage);
                    }
                } else {
                    setRows([]);
                    setError(requestError.response?.status === 404 ? pendingMessage : (requestError.response?.data?.message || pendingMessage));
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            mounted = false;
        };
    }, []);

    const filteredRows = useMemo(() => {
        const normalizedKeyword = keyword.trim().toLowerCase();
        if (!normalizedKeyword) return rows;

        return rows.filter((row) => searchableFields.some((field) => {
            const value = typeof field === 'function' ? field(row) : row[field];
            return String(value || '').toLowerCase().includes(normalizedKeyword);
        }));
    }, [keyword, rows, searchableFields]);

    return (
        <>
            <div className="content-header mb-3">
                <div className="container-fluid">
                    <div className="row g-3 align-items-end">
                        <div className="col-lg-7">
                            <h1 className="m-0">{title}</h1>
                            {description && <p className="mb-0 mt-2 text-muted">{description}</p>}
                        </div>
                        <div className="col-lg-5">
                            <div className="input-group">
                                <span className="input-group-text"><i className="fas fa-search" /></span>
                                <input
                                    className="form-control"
                                    placeholder="Tìm kiếm..."
                                    value={keyword}
                                    onChange={(event) => setKeyword(event.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {(notice || usingFallback) && (
                <div className="alert alert-info">
                    {notice || 'API quản lý chưa có, đang hiển thị dữ liệu đọc từ API công khai.'}
                </div>
            )}

            {error && <div className="alert alert-warning">{error}</div>}

            <div className="card shadow-sm">
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h2 className="card-title mb-0">{title}</h2>
                    <span className="badge text-bg-light">{filteredRows.length} dòng</span>
                </div>
                <div className="card-body p-0">
                    {loading ? (
                        <div className="py-5 text-center">
                            <div className="spinner-border text-primary" role="status" />
                        </div>
                    ) : filteredRows.length ? (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        {columns.map((column) => (
                                            <th key={column.key}>{column.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRows.map((row, index) => (
                                        <tr key={row.id || row.slug || row.ticketCode || row.paymentCode || index}>
                                            {columns.map((column) => (
                                                <td key={column.key}>
                                                    {column.render ? column.render(row) : (row[column.key] ?? 'Chưa có dữ liệu')}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-5 text-center text-muted">{error || emptyMessage}</div>
                    )}
                </div>
            </div>
        </>
    );
}

export default AdminResourcePage;
