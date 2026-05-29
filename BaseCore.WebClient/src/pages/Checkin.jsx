import React, { useEffect, useState } from 'react';
import { checkinApi } from '../services/api';
import { AdminStatusBadge, formatAdminDate } from './admin/AdminResourcePage';

function Checkin() {
    const [ticketCode, setTicketCode] = useState('');
    const [qrCodePayload, setQrCodePayload] = useState('');
    const [gate, setGate] = useState('A1');
    const [deviceId, setDeviceId] = useState('WEB-CHECKIN');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [checkins, setCheckins] = useState([]);

    const loadCheckins = async () => {
        try {
            const response = await checkinApi.getAll();
            setCheckins(response.data || []);
        } catch {
            setCheckins([]);
        }
    };

    useEffect(() => {
        loadCheckins();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage('');
        setError('');

        try {
            const response = await checkinApi.create({
                ticketCode: ticketCode.trim() || undefined,
                qrCodePayload: qrCodePayload.trim() || undefined,
                gate,
                deviceId,
                note,
            });

            setMessage(`Check-in thành công: ${response.data.checkinCode}`);
            setTicketCode('');
            setQrCodePayload('');
            setNote('');
            await loadCheckins();
        } catch (requestError) {
            const status = requestError.response?.status;
            const backendMessage = requestError.response?.data?.message;
            setError(
                status === 409
                    ? `Vé đã check-in trước đó. ${backendMessage || ''}`
                    : backendMessage || 'Check-in thất bại.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = !submitting && (ticketCode.trim() || qrCodePayload.trim());

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-xl font-black text-slate-900">QR Check-in</h1>
                <p className="mt-1 text-sm text-slate-500">Quét mã QR hoặc nhập ticket code để xác nhận vào cổng.</p>
            </div>

            {message && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <i className="fas fa-check-circle mr-2" />
                    {message}
                </div>
            )}
            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    <i className="fas fa-exclamation-circle mr-2" />
                    {error}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                {/* Form */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-3.5">
                        <h2 className="text-sm font-bold text-slate-700">Nhập thông tin vé</h2>
                    </div>
                    <form className="p-5 space-y-4" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="ticketCode">
                                Ticket code
                            </label>
                            <input
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                id="ticketCode"
                                placeholder="ETK-..."
                                value={ticketCode}
                                onChange={(e) => setTicketCode(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="qrCodePayload">
                                QR payload
                            </label>
                            <textarea
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                id="qrCodePayload"
                                placeholder='{"type":"football-ticket","ticketCode":"ETK-..."}'
                                rows={4}
                                value={qrCodePayload}
                                onChange={(e) => setQrCodePayload(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="gate">
                                    Cổng
                                </label>
                                <input
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    id="gate"
                                    value={gate}
                                    onChange={(e) => setGate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="deviceId">
                                    Thiết bị
                                </label>
                                <input
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                    id="deviceId"
                                    value={deviceId}
                                    onChange={(e) => setDeviceId(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wide text-slate-500" htmlFor="note">
                                Ghi chú
                            </label>
                            <input
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                        </div>

                        <button
                            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={!canSubmit}
                            type="submit"
                        >
                            {submitting ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-2" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-qrcode mr-2" />
                                    Check-in
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Recent check-ins */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-3.5">
                        <h2 className="text-sm font-bold text-slate-700">Check-in gần đây</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    {['Code', 'Vé', 'Cổng', 'Trạng thái', 'Thời gian'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {checkins.slice(0, 10).map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80">
                                        <td className="px-4 py-3">
                                            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs font-mono text-slate-700">
                                                {item.checkinCode}
                                            </code>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{item.ticketCode}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.gate || '—'}</td>
                                        <td className="px-4 py-3">
                                            <AdminStatusBadge value={item.status} />
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                            {formatAdminDate(item.checkedAt)}
                                        </td>
                                    </tr>
                                ))}
                                {!checkins.length && (
                                    <tr>
                                        <td className="px-4 py-8 text-center text-sm text-slate-400" colSpan={5}>
                                            Chưa có lịch sử check-in.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkin;
