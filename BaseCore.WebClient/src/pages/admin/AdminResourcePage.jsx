import React, { useEffect, useMemo, useState } from 'react';

export const getRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    return [];
};

export const formatAdminDate = (value) => {
    if (!value) return '—';
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

const STATUS_MAP = {
    active:    'bg-emerald-100 text-emerald-700',
    paid:      'bg-emerald-100 text-emerald-700',
    completed: 'bg-emerald-100 text-emerald-700',
    issued:    'bg-emerald-100 text-emerald-700',
    used:      'bg-slate-100 text-slate-600',
    scheduled: 'bg-sky-100 text-sky-700',
    pending:   'bg-amber-100 text-amber-700',
    failed:    'bg-red-100 text-red-700',
    cancelled: 'bg-red-100 text-red-700',
    canceled:  'bg-red-100 text-red-700',
    inactive:  'bg-slate-100 text-slate-500',
};

export const AdminStatusBadge = ({ value }) => {
    const style = STATUS_MAP[String(value || '').toLowerCase()] ?? 'bg-indigo-100 text-indigo-700';
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}>
            {value || 'Pending'}
        </span>
    );
};

/* ─── Resource Modal (Create / Edit) ─────────────────────────────────── */
function ResourceModal({ title, fields = [], initialData = {}, onClose, onSubmit, submitting }) {
    const [form, setForm] = useState(() => {
        const defaults = {};
        fields.forEach((f) => { defaults[f.name] = initialData[f.name] ?? f.defaultValue ?? ''; });
        return defaults;
    });
    const [formError, setFormError] = useState('');

    const handleChange = (name, value) => setForm((prev) => ({ ...prev, [name]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        try {
            await onSubmit(form);
        } catch (err) {
            setFormError(err.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Modal header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h3 className="text-base font-black text-slate-900">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                        <i className="fas fa-times text-sm" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="max-h-[75vh] overflow-y-auto px-6 py-5">
                    <div className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.name}>
                                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                                    {field.label}
                                    {field.required && <span className="ml-0.5 text-rose-500">*</span>}
                                </label>

                                {field.type === 'select' ? (
                                    <select
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                        value={form[field.name]}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        required={field.required}
                                    >
                                        <option value="">-- Chọn --</option>
                                        {(field.options || []).map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                        value={form[field.name]}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        required={field.required}
                                        placeholder={field.placeholder || ''}
                                        rows={3}
                                    />
                                ) : (
                                    <input
                                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                        type={field.type || 'text'}
                                        value={form[field.name]}
                                        onChange={(e) => handleChange(field.name, e.target.value)}
                                        required={field.required}
                                        placeholder={field.placeholder || ''}
                                    />
                                )}

                                {field.hint && (
                                    <p className="mt-1 text-xs text-slate-400">{field.hint}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {formError && (
                        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                            {formError}
                        </div>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {submitting && <i className="fas fa-spinner fa-spin text-xs" />}
                            {submitting ? 'Đang lưu...' : 'Lưu'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Delete Confirm Dialog ───────────────────────────────────────────── */
function DeleteConfirm({ onClose, onConfirm, submitting }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
                    <i className="fas fa-trash text-rose-600" />
                </div>
                <h3 className="mb-2 text-base font-black text-slate-900">Xác nhận xóa</h3>
                <p className="mb-6 text-sm text-slate-500">
                    Bạn có chắc muốn xóa mục này không? Hành động này không thể hoàn tác.
                </p>
                <div className="flex justify-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                        Hủy
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={submitting}
                        className="flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-60"
                    >
                        {submitting && <i className="fas fa-spinner fa-spin text-xs" />}
                        {submitting ? 'Đang xóa...' : 'Xóa'}
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Pagination ─────────────────────────────────────────────────────── */
function Pagination({ currentPage, totalPages, onChange }) {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 2;
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    if (left > 1) {
        pages.push(1);
        if (left > 2) pages.push('...');
    }
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages) {
        if (right < totalPages - 1) pages.push('...');
        pages.push(totalPages);
    }

    const btn = (label, disabled, onClick, active = false) => (
        <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={onClick}
            className={`flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold transition ${
                active
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-3 shadow-sm">
            <span className="text-xs text-slate-500">
                Trang {currentPage}/{totalPages}
            </span>
            <div className="flex items-center gap-1">
                {btn(<i className="fas fa-angle-left" />, currentPage <= 1, () => onChange(currentPage - 1))}
                {pages.map((p, i) =>
                    p === '...'
                        ? <span key={`ellipsis-${i}`} className="flex h-8 w-6 items-center justify-center text-xs text-slate-400">…</span>
                        : btn(p, false, () => onChange(p), p === currentPage)
                )}
                {btn(<i className="fas fa-angle-right" />, currentPage >= totalPages, () => onChange(currentPage + 1))}
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────── */
const DEFAULT_PAGE_SIZE = 10;

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
    /* CRUD props (all optional) */
    formFields,     // [{name, label, type, required, options, defaultValue, placeholder, hint}]
    apiMethods,     // {create(data), update(id, data), delete(id)}
    rowKey = 'id',
    pageSize = DEFAULT_PAGE_SIZE,
}) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [keyword, setKeyword] = useState('');
    const [usingFallback, setUsingFallback] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [refreshKey, setRefreshKey] = useState(0);

    /* CRUD state */
    const [modal, setModal] = useState(null); // null | 'create' | 'edit'
    const [editRow, setEditRow] = useState(null);
    const [deleteRow, setDeleteRow] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const hasCrud = !!(formFields && apiMethods);

    /* Data load */
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            setLoading(true);
            setError('');
            setUsingFallback(false);

            try {
                const response = await loader();
                if (mounted) setRows(getRows(response.data));
            } catch (requestError) {
                if (!mounted) return;

                if (fallbackRows) {
                    try {
                        const fallback = await fallbackRows(requestError);
                        setRows(getRows(fallback));
                        setUsingFallback(true);
                    } catch {
                        setRows([]);
                        setError(pendingMessage);
                    }
                } else {
                    setRows([]);
                    setError(
                        requestError.response?.status === 404
                            ? pendingMessage
                            : requestError.response?.data?.message || pendingMessage,
                    );
                }
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const refresh = () => {
        setRefreshKey((k) => k + 1);
        setCurrentPage(1);
    };

    /* Search + filter */
    const filteredRows = useMemo(() => {
        const q = keyword.trim().toLowerCase();
        if (!q) return rows;
        return rows.filter((row) =>
            searchableFields.some((field) => {
                const val = typeof field === 'function' ? field(row) : row[field];
                return String(val ?? '').toLowerCase().includes(q);
            }),
        );
    }, [keyword, rows, searchableFields]);

    /* Reset page when keyword changes */
    useEffect(() => { setCurrentPage(1); }, [keyword]);

    /* Pagination */
    const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
    const paginatedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    /* CRUD handlers */
    const openCreate = () => setModal('create');
    const openEdit = (row) => { setEditRow(row); setModal('edit'); };
    const closeModal = () => { setModal(null); setEditRow(null); };

    const handleCreate = async (data) => {
        setSubmitting(true);
        try {
            await apiMethods.create(data);
            closeModal();
            refresh();
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (data) => {
        setSubmitting(true);
        try {
            await apiMethods.update(editRow[rowKey], data);
            closeModal();
            refresh();
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            await apiMethods.delete(deleteRow[rowKey]);
            setDeleteRow(null);
            refresh();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Modals */}
            {modal === 'create' && (
                <ResourceModal
                    title={`Thêm ${title}`}
                    fields={formFields}
                    onClose={closeModal}
                    onSubmit={handleCreate}
                    submitting={submitting}
                />
            )}
            {modal === 'edit' && editRow && (
                <ResourceModal
                    title={`Sửa ${title}`}
                    fields={formFields}
                    initialData={editRow}
                    onClose={closeModal}
                    onSubmit={handleUpdate}
                    submitting={submitting}
                />
            )}
            {deleteRow && (
                <DeleteConfirm
                    onClose={() => setDeleteRow(null)}
                    onConfirm={handleDelete}
                    submitting={submitting}
                />
            )}

            {/* Page header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-xl font-black text-slate-900">{title}</h1>
                    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <div className="relative w-full sm:w-64">
                        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400" />
                        <input
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder-slate-400 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            placeholder="Tìm kiếm..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                    {hasCrud && (
                        <button
                            type="button"
                            onClick={openCreate}
                            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
                        >
                            <i className="fas fa-plus text-xs" />
                            Thêm
                        </button>
                    )}
                </div>
            </div>

            {/* Notices */}
            {(notice || usingFallback) && (
                <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                    {notice || 'API quản lý chưa có, đang hiển thị dữ liệu từ API công khai.'}
                </div>
            )}
            {error && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                    {error}
                </div>
            )}

            {/* Table card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
                    <h2 className="text-sm font-bold text-slate-700">{title}</h2>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
                        {filteredRows.length} dòng
                    </span>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-500" />
                    </div>
                ) : paginatedRows.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    {columns.map((col) => (
                                        <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                            {col.label}
                                        </th>
                                    ))}
                                    {hasCrud && (
                                        <th className="whitespace-nowrap px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Hành động
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedRows.map((row, idx) => (
                                    <tr
                                        key={row[rowKey] || row.slug || row.ticketCode || row.paymentCode || idx}
                                        className="transition hover:bg-slate-50/80"
                                    >
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-4 py-3 text-slate-700">
                                                {col.render ? col.render(row) : (row[col.key] ?? '—')}
                                            </td>
                                        ))}
                                        {hasCrud && (
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEdit(row)}
                                                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                                                    >
                                                        <i className="fas fa-pen text-[10px]" />
                                                        Sửa
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setDeleteRow(row)}
                                                        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
                                                    >
                                                        <i className="fas fa-trash text-[10px]" />
                                                        Xóa
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center">
                        <i className="fas fa-inbox mb-3 text-3xl text-slate-300" />
                        <p className="text-sm text-slate-400">{error || emptyMessage}</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && filteredRows.length > pageSize && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onChange={setCurrentPage}
                />
            )}
        </div>
    );
}

export default AdminResourcePage;
