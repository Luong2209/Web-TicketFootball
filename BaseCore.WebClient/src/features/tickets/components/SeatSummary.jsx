import React, { useState, useEffect } from 'react';
import { Ticket, Trash2, ShieldCheck, Timer } from 'lucide-react';

const compactSeatCode = (seat) => {
    if (seat?.code) {
        return seat.code;
    }

    if (seat?.row && seat?.seatNumber) {
        return `${seat.row}${seat.seatNumber}`;
    }

    return 'N/A';
};

function SeatSummary({
    matchTitle,
    matchMeta,
    selectedSection,
    selectedMapBlock,
    selectedTicket,
    selectedSeats,
    formatCurrency,
    isBooking,
    onClear,
    onSubmit,
}) {
    const quantity = selectedSeats.length;
    const unitPrice = Number(selectedTicket?.unitPrice || selectedSeats[0]?.price || 0);
    const total = unitPrice * quantity;

    // Countdown Timer logic
    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        if (!quantity) {
            setTimeLeft(null);
            return;
        }

        const expiresAt = selectedSeats[0]?.holdExpiresAt;
        if (!expiresAt) {
            setTimeLeft(null);
            return;
        }

        const updateTimer = () => {
            const diff = new Date(expiresAt).getTime() - Date.now();
            if (diff <= 0) {
                setTimeLeft('Hết giờ giữ ghế');
            } else {
                const minutes = Math.floor(diff / 60000);
                const seconds = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [selectedSeats, quantity]);

    return (
        <aside className="h-fit rounded-2xl border border-white/5 bg-surface-card p-5.5 shadow-xl lg:sticky lg:top-24 overflow-hidden relative">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4.5">
                <h3 className="text-base font-extrabold text-white tracking-wide">Tóm tắt đơn đặt vé</h3>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary-light border border-primary/20">
                    <Ticket className="h-4 w-4" aria-hidden="true" />
                </div>
            </div>

            {/* Match info card */}
            <div className="mt-5 rounded-xl bg-white/3 border border-white/5 p-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Trận đấu</span>
                <strong className="block text-sm text-white leading-snug">{matchTitle}</strong>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{matchMeta}</p>
            </div>

            {/* Section selected card */}
            <div className="mt-3.5 rounded-xl bg-[#1E1E38]/50 border border-white/5 p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Khán đài</span>
                <strong className="block text-sm text-primary-light mt-0.5">{selectedSection?.name || 'Chưa chọn khán đài'}</strong>
                {selectedMapBlock?.blockCode && (
                    <p className="text-[11px] text-slate-400 mt-1">
                        Block: <span className="text-white font-semibold">{selectedMapBlock.blockCode}</span>
                    </p>
                )}
                {selectedTicket && (
                    <p className="text-[11px] text-slate-400 mt-1">
                        Giá vé niêm yết: <span className="text-white font-semibold">{formatCurrency(unitPrice)}</span> / vé
                    </p>
                )}
            </div>

            {quantity ? (
                <>
                    {/* Held seats list chips */}
                    <div className="mt-3.5 rounded-xl bg-primary/5 border border-primary/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-light">Ghế đang chọn ({quantity})</span>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {selectedSeats.map((seat) => (
                                        <span className="inline-flex items-center rounded-lg bg-primary/20 border border-primary-light/30 px-2.5 py-1 text-xs font-bold text-white" key={seat.seatPlaceId}>
                                            {compactSeatCode(seat)}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timer Countdown Panel */}
                    {timeLeft && (
                        <div className="mt-4 flex items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-400">
                            <span className="flex items-center gap-1.5 font-semibold">
                                <Timer size={14} className="animate-pulse" />
                                Thời gian giữ ghế còn lại
                            </span>
                            <span className="font-mono font-extrabold text-sm tracking-wider">{timeLeft}</span>
                        </div>
                    )}

                    {/* Pricing breakdown */}
                    <div className="mt-5 space-y-3 border-t border-white/5 pt-4.5 text-xs text-slate-300">
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Số lượng vé</span>
                            <span className="font-bold text-white">{quantity} vé</span>
                        </div>
                        <div className="flex justify-between gap-4">
                            <span className="text-slate-400">Đơn giá</span>
                            <span className="font-bold text-white">{formatCurrency(unitPrice)}</span>
                        </div>
                        <div className="flex justify-between gap-4 border-t border-white/5 pt-4 text-base">
                            <span className="font-extrabold text-white">Tổng cộng</span>
                            <strong className="text-primary-light text-lg font-black">{formatCurrency(total)}</strong>
                        </div>
                    </div>

                    <div className="mt-5 flex gap-2.5">
                        <button
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-white/5 bg-white/5 px-4 py-3.5 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-95 flex-1"
                            disabled={isBooking}
                            type="button"
                            onClick={onClear}
                        >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Xóa ghế đã chọn
                        </button>
                    </div>
                </>
            ) : (
                <div className="mt-5 rounded-xl border border-dashed border-white/10 bg-white/2 p-5 text-center text-xs md:text-sm font-bold text-slate-400 leading-relaxed">
                    Vui lòng bấm chọn các ghế còn trống trên sơ đồ lưới để tiến hành giữ chỗ và thanh toán.
                </div>
            )}

            {/* Submit checkout CTA button */}
            <button
                className="mt-4.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-green to-[#059669] hover:from-emerald-400 hover:to-emerald-600 py-3.5 text-sm font-black text-white shadow-lg shadow-accent-green/20 hover:shadow-accent-green/35 transition-all duration-300 disabled:cursor-not-allowed disabled:from-white/5 disabled:to-white/5 disabled:text-slate-500 disabled:shadow-none hover:scale-[1.01]"
                type="button"
                disabled={!quantity || isBooking}
                onClick={onSubmit}
            >
                {isBooking ? (
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                        <span>Đang khởi tạo đơn hàng...</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck size={16} />
                        <span>Tiến Hành Đặt Vé</span>
                    </div>
                )}
            </button>
        </aside>
    );
}

export default SeatSummary;
