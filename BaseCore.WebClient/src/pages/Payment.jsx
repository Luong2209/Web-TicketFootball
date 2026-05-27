import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Building2, Check, CreditCard, QrCode, Wallet } from 'lucide-react';
import UserLayout from '../components/user/UserLayout';
import { ErrorState, LoadingState, StatusBadge } from '../components/user/StateViews';
import { paymentApi, ticketApi } from '../services/api';

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
}).format(Number(value || 0));

const formatDate = (value) => {
    if (!value) return 'Đang cập nhật';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

const paymentMethods = [
    { id: 'QR Code', provider: 'BaseCore QR', Icon: QrCode, title: 'QR Code', description: 'Quét mã để thanh toán nhanh.' },
    { id: 'Bank Card', provider: 'BaseCore Bank', Icon: CreditCard, title: 'Thẻ ngân hàng', description: 'Thanh toán bằng thẻ nội địa/quốc tế.' },
    { id: 'Wallet', provider: 'BaseCore Wallet', Icon: Wallet, title: 'Ví điện tử', description: 'Mô phỏng ví điện tử cho demo.' },
    { id: 'Transfer', provider: 'Manual Transfer', Icon: Building2, title: 'Chuyển khoản', description: 'Xác nhận thủ công sau chuyển khoản.' },
];

function Payment() {
    const { orderId } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [payment, setPayment] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
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
                    setError('Không tìm thấy đơn hàng.');
                    return;
                }

                setOrder(foundOrder);
                setPayment(foundOrder.payments?.[0] || null);
                setTickets(foundOrder.eTickets || foundOrder.etickets || []);
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.response?.data?.message || 'Không tải được thông tin thanh toán.');
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

    const isPaid = payment?.status === 'Paid' || order?.status === 'Paid';

    const handleCreatePayment = async () => {
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const response = await paymentApi.create({
                ticketOrderId: Number(orderId),
                method: selectedMethod.id,
                provider: selectedMethod.provider,
                transactionId: `WEB-${Date.now()}`,
            });

            setPayment(response.data);
            setSuccess('Đã tạo thanh toán. Bạn có thể xác nhận để phát hành vé điện tử.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không tạo được payment.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!payment?.id) {
            setError('Cần tạo payment trước khi xác nhận.');
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
            setSuccess('Thanh toán thành công. Vé điện tử đã được phát hành.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không xác nhận được thanh toán.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <LoadingState title="Đang tải đơn thanh toán..." />
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="text-sm font-black uppercase text-violet-700">Payment</span>
                    <h1 className="mb-0 mt-2 text-4xl font-black text-slate-950">Thanh toán đơn vé</h1>
                    <p className="mb-0 mt-2 text-slate-500">Đơn #{orderId} - hoàn tất thanh toán để nhận e-ticket và mã QR check-in.</p>
                </div>
                <Link className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 no-underline transition hover:bg-slate-50" to="/user">
                    Trận đấu
                </Link>
            </div>

            {error && <div className="mb-5"><ErrorState message={error} /></div>}
            {success && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800 shadow-sm">
                    <p className="mb-1 font-black">{success}</p>
                    {isPaid && <p className="mb-0 text-sm">Vé đã sẵn sàng trong mục Vé của tôi.</p>}
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_420px]">
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <h2 className="mb-0 text-2xl font-black text-slate-950">Thông tin đơn hàng</h2>
                        <StatusBadge status={order?.status || location.state?.status || 'Pending'} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="mb-1 text-sm font-bold text-slate-500">Mã đơn</p>
                            <strong>#{orderId}</strong>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="mb-1 text-sm font-bold text-slate-500">Payment</p>
                            <StatusBadge status={payment?.status || 'Not created'} />
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="mb-1 text-sm font-bold text-slate-500">Tổng tiền</p>
                            <strong className="text-lg text-violet-700">{formatCurrency(totalAmount)}</strong>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-black text-slate-950">Vé trong đơn</h3>
                        <div className="mt-4 grid gap-3">
                            {(order?.items || []).map((item) => (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4" key={item.id}>
                                    <div>
                                        <strong className="text-slate-950">{item.listing?.title || `Ticket #${item.ticketListingId}`}</strong>
                                        <p className="mb-0 mt-1 text-sm text-slate-500">{item.listing?.section || item.listing?.rowLabel || 'Khu vé đang cập nhật'}</p>
                                    </div>
                                    <span className="font-bold text-slate-700">{item.quantity} x {formatCurrency(item.unitPrice)}</span>
                                </div>
                            ))}
                            {!order?.items?.length && (
                                <div className="rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                                    Không có item chi tiết trong response đơn hàng.
                                </div>
                            )}
                        </div>
                    </div>

                    {payment && (
                        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="mb-1 text-sm font-bold text-slate-500">Payment code</p>
                            <strong>{payment.paymentCode}</strong>
                            <p className="mb-0 mt-1 text-sm text-slate-500">
                                {payment.method} - {payment.provider} - {formatDate(payment.createdAt)}
                            </p>
                        </div>
                    )}
                </section>

                <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-lg lg:sticky lg:top-24">
                    <h2 className="text-2xl font-black text-slate-950">Phương thức thanh toán</h2>
                    <div className="mt-5 grid gap-3">
                        {paymentMethods.map((method) => {
                            const selected = selectedMethod.id === method.id;
                            return (
                                <button
                                    className={`flex items-start gap-4 rounded-2xl border p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${selected ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-100' : 'border-slate-200 bg-white'}`}
                                    type="button"
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method)}
                                    disabled={!!payment?.id}
                                >
                                    <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${selected ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                        <method.Icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <span>
                                        <span className="block font-black text-slate-950">{method.title}</span>
                                        <span className="mt-1 block text-sm text-slate-500">{method.description}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 grid gap-3">
                        <button
                            className="rounded-xl bg-slate-950 px-5 py-3 font-black text-white transition-all duration-300 hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={submitting || !!payment?.id || isPaid}
                            type="button"
                            onClick={handleCreatePayment}
                        >
                            {submitting && !payment?.id ? 'Đang tạo...' : 'Tạo thanh toán'}
                        </button>
                        <button
                            className="rounded-xl bg-emerald-500 px-5 py-3 font-black text-white shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={submitting || !payment?.id || isPaid}
                            type="button"
                            onClick={handleConfirmPayment}
                        >
                            {submitting && payment?.id ? 'Đang xác nhận...' : 'Xác nhận thanh toán'}
                        </button>
                    </div>

                    {isPaid && (
                        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                            <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white">
                                <Check className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <p className="mb-1 font-black text-emerald-800">Thanh toán thành công</p>
                            <p className="mb-4 text-sm text-emerald-700">Vé điện tử đã được phát hành.</p>
                            <Link className="inline-flex w-full justify-center rounded-xl bg-emerald-500 px-5 py-3 font-black text-white no-underline transition hover:bg-emerald-400" to="/my-tickets">
                                Xem vé của tôi
                            </Link>
                        </div>
                    )}
                </aside>
            </div>

            {!!tickets.length && (
                <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
                    <h2 className="text-xl font-black text-emerald-900">E-ticket đã phát hành</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {tickets.map((ticket) => (
                            <div className="rounded-2xl border border-emerald-200 bg-white p-4" key={ticket.id || ticket.ticketCode}>
                                <strong>{ticket.ticketCode}</strong>
                                <p className="mb-0 mt-1 text-sm text-slate-500">{ticket.status}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </UserLayout>
    );
}

export default Payment;
