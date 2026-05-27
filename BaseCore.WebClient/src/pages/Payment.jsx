import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { paymentApi, ticketApi } from '../services/api';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

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

function Payment() {
    const { orderId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [payment, setPayment] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        let mounted = true;

        const loadOrder = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await ticketApi.getMyOrders();
                const foundOrder = (response.data || []).find((item) => String(item.id) === String(orderId));

                if (!mounted) return;

                if (!foundOrder) {
                    setError('Khong tim thay don hang.');
                    return;
                }

                setOrder(foundOrder);
                setPayment(foundOrder.payments?.[0] || null);
                setTickets(foundOrder.eTickets || foundOrder.etickets || []);
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.response?.data?.message || 'Khong tai duoc thong tin thanh toan.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadOrder();

        return () => {
            mounted = false;
        };
    }, [orderId]);

    const totalAmount = useMemo(() => (
        order?.totalAmount || location.state?.amount || 0
    ), [location.state?.amount, order?.totalAmount]);

    const handleCreatePayment = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await paymentApi.create({
                ticketOrderId: Number(orderId),
                method: 'Test',
                provider: 'BaseCore',
                transactionId: `WEB-${Date.now()}`,
            });

            setPayment(response.data);
            setSuccess('Da tao payment. Ban co the xac nhan thanh toan.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Khong tao duoc payment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!payment?.id) {
            setError('Can tao payment truoc khi xac nhan.');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await paymentApi.confirm(payment.id, {
                transactionId: `PAID-${Date.now()}`,
            });

            setPayment(response.data.payment);
            setTickets(response.data.tickets || []);
            setSuccess('Thanh toan thanh cong. E-ticket da duoc phat hanh.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Khong xac nhan duoc thanh toan.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="grid min-h-screen place-items-center bg-slate-100 text-slate-700">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-plum-950" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900">
            <div className="mx-auto max-w-4xl">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="mb-1 text-sm font-bold uppercase text-plum-950">Payment</p>
                        <h1 className="mb-0 text-3xl font-black">Thanh toan don #{orderId}</h1>
                    </div>
                    <div className="flex gap-2">
                        <Link className="rounded border border-slate-300 bg-white px-4 py-2 font-bold text-slate-800 no-underline" to="/user">Tran dau</Link>
                        <Link className="rounded bg-plum-950 px-4 py-2 font-bold text-white no-underline" to="/my-tickets">Ve cua toi</Link>
                    </div>
                </div>

                {error && <div className="mb-4 rounded border border-rose-200 bg-rose-50 p-3 font-bold text-rose-700">{error}</div>}
                {success && <div className="mb-4 rounded border border-emerald-200 bg-emerald-50 p-3 font-bold text-emerald-700">{success}</div>}

                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <p className="mb-1 text-sm font-bold text-slate-500">Order status</p>
                            <strong>{order?.status || location.state?.status || 'Pending'}</strong>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-bold text-slate-500">Payment status</p>
                            <strong>{payment?.status || 'Not created'}</strong>
                        </div>
                        <div>
                            <p className="mb-1 text-sm font-bold text-slate-500">Total</p>
                            <strong>{formatCurrency(totalAmount)}</strong>
                        </div>
                    </div>

                    <div className="mt-5 border-top pt-4">
                        <h2 className="h5 fw-bold">Order items</h2>
                        <div className="list-group">
                            {(order?.items || []).map((item) => (
                                <div className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
                                    <div>
                                        <strong>{item.listing?.title || `Ticket #${item.ticketListingId}`}</strong>
                                        <div className="text-muted small">{item.listing?.rowLabel || ''}</div>
                                    </div>
                                    <span>{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {payment && (
                        <div className="mt-4 rounded border border-slate-200 bg-slate-50 p-3">
                            <strong>{payment.paymentCode}</strong>
                            <div className="text-muted small">
                                {payment.method} - {payment.provider} - {formatDate(payment.createdAt)}
                            </div>
                        </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                        <button className="rounded bg-slate-900 px-4 py-2 font-bold text-white disabled:opacity-50" disabled={submitting || !!payment?.id || payment?.status === 'Paid'} type="button" onClick={handleCreatePayment}>
                            Tao payment
                        </button>
                        <button className="rounded bg-emerald-700 px-4 py-2 font-bold text-white disabled:opacity-50" disabled={submitting || !payment?.id || payment.status === 'Paid'} type="button" onClick={handleConfirmPayment}>
                            Xac nhan thanh toan
                        </button>
                    </div>
                </section>

                {!!tickets.length && (
                    <section className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
                        <h2 className="h5 fw-bold text-emerald-800">E-ticket da phat hanh</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            {tickets.map((ticket) => (
                                <div className="rounded border border-emerald-200 bg-white p-3" key={ticket.id}>
                                    <strong>{ticket.ticketCode}</strong>
                                    <p className="mb-2 text-sm text-slate-600">{ticket.status}</p>
                                    <code className="block whitespace-pre-wrap break-all rounded bg-slate-100 p-2 text-xs">{ticket.qrCodePayload}</code>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}

export default Payment;
