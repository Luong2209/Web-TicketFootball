import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Building2, Check, CreditCard, QrCode, Wallet, Trophy, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';
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
    { id: 'QR Code', provider: 'BaseCore QR', Icon: QrCode, title: 'QR Code', description: 'Quét mã để thanh toán nhanh trực tuyến.' },
    { id: 'Bank Card', provider: 'BaseCore Bank', Icon: CreditCard, title: 'Thẻ ngân hàng', description: 'Thanh toán bằng thẻ nội địa hoặc quốc tế.' },
    { id: 'Wallet', provider: 'BaseCore Wallet', Icon: Wallet, title: 'Ví điện tử', description: 'Cổng ví điện tử liên kết (Momo, VNPAY, v.v.)' },
    { id: 'Transfer', provider: 'Manual Transfer', Icon: Building2, title: 'Chuyển khoản ngân hàng', description: 'Xác nhận giao dịch thủ công sau chuyển khoản.' },
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
                    setError('Không tìm thấy đơn hàng trên hệ thống.');
                    return;
                }

                setOrder(foundOrder);
                setPayment(foundOrder.payments?.[0] || null);
                setTickets(foundOrder.eTickets || foundOrder.etickets || []);
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.response?.data?.message || 'Không tải được thông tin đơn hàng.');
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
            setSuccess('Khởi tạo giao dịch thành công. Vui lòng bấm Xác nhận thanh toán để hoàn tất.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Không khởi tạo được thanh toán.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!payment?.id) {
            setError('Cần tạo giao dịch thanh toán trước.');
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
            setSuccess('Đơn hàng của bạn đã được thanh toán thành công và vé điện tử đã được phát hành.');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Xác nhận thanh toán thất bại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <LoadingState title="Đang tải thông tin đơn hàng..." description="Vui lòng chờ hệ thống truy xuất dữ liệu." />
            </UserLayout>
        );
    }

    return (
        <UserLayout>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4 text-xs font-bold text-slate-400">
                <span className="text-slate-500">1. Chọn vị trí ghế</span>
                <ChevronRight size={12} />
                <span className={`px-2.5 py-1 rounded-md ${isPaid ? 'bg-white/5 text-slate-300' : 'bg-primary text-white glow-primary'}`}>2. Thanh toán hóa đơn</span>
                <ChevronRight size={12} />
                <span className={`px-2.5 py-1 rounded-md ${isPaid ? 'bg-primary text-white glow-primary' : 'bg-white/3 text-slate-500'}`}>3. Hoàn tất & nhận vé</span>
            </div>

            {/* Header info */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <span className="text-xs font-black uppercase tracking-wider text-primary-light flex items-center gap-1">
                        <ShieldCheck size={14} />
                        Cổng thanh toán an toàn
                    </span>
                    <h1 className="mb-0 mt-2 text-3xl font-extrabold tracking-tight text-white">Thanh toán đơn hàng</h1>
                    <p className="mb-0 mt-2 text-slate-400 text-sm">Mã đơn hàng: #{orderId} · Đặt giữ ghế tự động bảo mật.</p>
                </div>
                <Link className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-bold text-white no-underline transition" to="/matches">
                    Quay lại lịch thi đấu
                </Link>
            </div>

            {error && <div className="mb-5"><ErrorState message={error} /></div>}
            
            {success && (
                <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-emerald-300 shadow-lg flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="mb-1 font-bold text-base text-emerald-200">{success}</p>
                        {isPaid && <p className="mb-0 text-sm text-slate-400">Hệ thống đã gửi thông tin. Bạn có thể xem vé điện tử bất kỳ lúc nào.</p>}
                    </div>
                </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
                {/* Order detail info column */}
                <section className="rounded-2xl border border-white/5 bg-surface-card p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="mb-6 flex items-center justify-between gap-3 border-b border-white/5 pb-4">
                        <h3 className="text-base font-extrabold text-white tracking-wide">Chi tiết đơn hàng</h3>
                        <StatusBadge status={order?.status || location.state?.status || 'Pending'} />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-xl bg-white/3 border border-white/5 p-4">
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Mã số đơn</p>
                            <strong className="text-white">#{orderId}</strong>
                        </div>
                        <div className="rounded-xl bg-white/3 border border-white/5 p-4">
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái gd</p>
                            <StatusBadge status={payment?.status || 'Chưa khởi tạo'} />
                        </div>
                        <div className="rounded-xl bg-white/3 border border-white/5 p-4">
                            <p className="mb-1 text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng cộng</p>
                            <strong className="text-lg text-primary-light font-black">{formatCurrency(totalAmount)}</strong>
                        </div>
                    </div>

                    <div className="mt-6.5">
                        <h4 className="text-sm font-bold text-white tracking-wide mb-3.5">Danh sách vé đặt</h4>
                        <div className="grid gap-3">
                            {(order?.items || []).map((item) => (
                                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/3 border border-white/5 p-4" key={item.id}>
                                    <div>
                                        <strong className="text-white font-bold text-sm">{item.listing?.title || `Khán đài ${item.listing?.sectionName || 'Khu vé'}`}</strong>
                                        <p className="mb-0 mt-1 text-xs text-slate-400">
                                            Khán đài: {item.listing?.sectionName || 'N/A'} · Hàng ghế: {item.listing?.rowLabel || 'N/A'}
                                        </p>
                                    </div>
                                    <span className="font-bold text-xs md:text-sm text-slate-200">{item.quantity} vé x {formatCurrency(item.unitPrice)}</span>
                                </div>
                            ))}
                            {!order?.items?.length && (
                                <div className="rounded-xl border border-dashed border-white/10 p-5 text-center text-xs text-slate-500">
                                    Không tìm thấy dữ liệu chi tiết vé.
                                </div>
                            )}
                        </div>
                    </div>

                    {payment && (
                        <div className="mt-6 rounded-xl bg-[#1E1E38]/40 border border-white/5 p-4 space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mã giao dịch (Transaction)</p>
                            <strong className="text-white text-sm font-mono">{payment.paymentCode}</strong>
                            <p className="mb-0 text-xs text-slate-400 mt-1.5">
                                Phương thức: {payment.method} · Cổng: {payment.provider} · Khởi tạo lúc: {formatDate(payment.createdAt)}
                            </p>
                        </div>
                    )}
                </section>

                {/* Payments options sidebar column */}
                <aside className="h-fit rounded-2xl border border-white/5 bg-surface-card p-5.5 shadow-xl lg:sticky lg:top-24">
                    <h3 className="text-base font-extrabold text-white tracking-wide mb-4">Phương thức thanh toán</h3>
                    
                    <div className="grid gap-3">
                        {paymentMethods.map((method) => {
                            const selected = selectedMethod.id === method.id;
                            return (
                                <button
                                    className={`flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all duration-300 ${
                                        selected 
                                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20 glow-primary' 
                                            : 'border-white/5 bg-white/2 hover:bg-white/5'
                                    }`}
                                    type="button"
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method)}
                                    disabled={!!payment?.id}
                                >
                                    <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg ${selected ? 'bg-primary text-white' : 'bg-white/5 text-slate-400'}`}>
                                        <method.Icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                    <div>
                                        <span className="block font-bold text-white text-sm">{method.title}</span>
                                        <span className="mt-1 block text-xs text-slate-400 leading-normal">{method.description}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-6.5 grid gap-3">
                        <button
                            className="rounded-xl bg-gradient-to-r from-primary to-primary-dark hover:from-primary-light hover:to-primary px-5 py-3.5 text-sm font-extrabold text-white transition-all duration-300 shadow-md shadow-primary/25 disabled:cursor-not-allowed disabled:from-white/5 disabled:to-white/5 disabled:text-slate-500 hover:scale-[1.01]"
                            disabled={submitting || !!payment?.id || isPaid}
                            type="button"
                            onClick={handleCreatePayment}
                        >
                            {submitting && !payment?.id ? 'Đang tạo giao dịch...' : 'Khởi Tạo Thanh Toán'}
                        </button>
                        <button
                            className="rounded-xl bg-gradient-to-r from-accent-green to-[#059669] hover:from-emerald-400 hover:to-emerald-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-accent-green/20 hover:shadow-accent-green/35 transition-all duration-300 disabled:cursor-not-allowed disabled:from-white/5 disabled:to-white/5 disabled:text-slate-500 hover:scale-[1.01]"
                            disabled={submitting || !payment?.id || isPaid}
                            type="button"
                            onClick={handleConfirmPayment}
                        >
                            {submitting && payment?.id ? 'Đang xác nhận...' : 'Xác Nhận Đã Thanh Toán (Demo)'}
                        </button>
                    </div>

                    {/* Paid Success Panel */}
                    {isPaid && (
                        <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4.5 text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-green">
                                <Check className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <h4 className="text-sm font-bold text-white tracking-wide">Đặt vé thành công!</h4>
                            <p className="mb-4 text-xs text-slate-400 mt-1 leading-relaxed">Vé điện tử e-ticket của bạn đã được khởi tạo thành công.</p>
                            <Link className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-accent-green to-[#059669] hover:from-emerald-400 hover:to-emerald-600 py-3.5 text-xs font-extrabold text-white no-underline transition hover:scale-[1.01]" to="/my-tickets">
                                Xem danh sách vé của tôi
                            </Link>
                        </div>
                    )}
                </aside>
            </div>

            {/* Issued E-tickets display panel */}
            {!!tickets.length && (
                <section className="mt-8 rounded-2xl border border-white/5 bg-[#1A1A2E]/30 p-6 shadow-lg">
                    <h3 className="text-base font-extrabold text-white tracking-wide mb-4">Mã số vé điện tử đã phát hành</h3>
                    <div className="grid gap-3.5 sm:grid-cols-2">
                        {tickets.map((ticket) => (
                            <div className="rounded-xl border border-white/5 bg-white/2 p-4 flex justify-between items-center" key={ticket.id || ticket.ticketCode}>
                                <div>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mã vé điện tử</div>
                                    <strong className="text-primary-light font-mono text-sm">{ticket.ticketCode}</strong>
                                </div>
                                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                                    {ticket.status || 'Issued'}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </UserLayout>
    );
}

export default Payment;

