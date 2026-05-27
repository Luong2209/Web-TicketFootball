import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ticketApi } from '../services/api';

const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

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
                    setError(requestError.response?.data?.message || 'Khong tai duoc danh sach ve.');
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
        <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
            <div className="mx-auto max-w-6xl">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="mb-1 text-sm font-bold uppercase text-plum-950">My tickets</p>
                        <h1 className="mb-0 text-3xl font-black">Ve cua toi</h1>
                    </div>
                    <Link className="rounded bg-plum-950 px-4 py-2 font-bold text-white no-underline" to="/user">Ve trang chu</Link>
                </div>

                {error && <div className="mb-4 rounded border border-rose-200 bg-rose-50 p-3 font-bold text-rose-700">{error}</div>}

                {loading ? (
                    <div className="rounded border border-slate-200 bg-white p-5 text-slate-600">Dang tai ve...</div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {tickets.map((ticket) => (
                            <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" key={ticket.id}>
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <strong className="block text-lg">{ticket.ticketCode}</strong>
                                        <span className={`badge ${ticket.status === 'Used' ? 'text-bg-secondary' : 'text-bg-success'}`}>{ticket.status}</span>
                                    </div>
                                    <i className="fas fa-ticket-alt text-2xl text-plum-950" />
                                </div>

                                <div className="mb-3 text-sm text-slate-600">
                                    <div><strong>Match:</strong> {ticket.match?.homeTeam} vs {ticket.match?.awayTeam}</div>
                                    <div><strong>Kickoff:</strong> {formatDate(ticket.match?.kickoffTime)}</div>
                                    <div><strong>Seat:</strong> {ticket.listing?.section} - {ticket.listing?.rowLabel}</div>
                                </div>

                                <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-3">
                                    <div className="mb-2 text-xs font-bold uppercase text-slate-500">QR payload</div>
                                    <code className="block whitespace-pre-wrap break-all text-xs">{ticket.qrCodePayload}</code>
                                </div>
                            </article>
                        ))}

                        {!tickets.length && (
                            <div className="rounded border border-dashed border-slate-300 bg-white p-6 text-slate-500 md:col-span-2">
                                Ban chua co e-ticket. Hay dat ve va xac nhan thanh toan truoc.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

export default MyTickets;
