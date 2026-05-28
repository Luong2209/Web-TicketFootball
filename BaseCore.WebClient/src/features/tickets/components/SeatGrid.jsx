import React from 'react';
import { Armchair, Loader2 } from 'lucide-react';

const sectionMeta = {
    vip: {
        title: 'VIP',
        orientation: 'top',
        accent: 'amber',
        guide: 'Phía sân cỏ nằm bên dưới khu VIP',
    },
    home: {
        title: 'Home',
        orientation: 'top',
        accent: 'cyan',
        guide: 'Phía sân cỏ nằm bên dưới khu cổ động viên nhà',
    },
    away: {
        title: 'Away',
        orientation: 'top',
        accent: 'rose',
        guide: 'Phía sân cỏ nằm bên dưới khu cổ động viên khách',
    },
    'stand-a': {
        title: 'Khán đài A',
        orientation: 'bottom',
        accent: 'primary',
        guide: 'Hướng nhìn ra sân ở phía trên',
    },
    'stand-b': {
        title: 'Khán đài B',
        orientation: 'left',
        accent: 'primary',
        guide: 'Sân cỏ nằm bên phải khu B',
    },
    'stand-c': {
        title: 'Khán đài C',
        orientation: 'right',
        accent: 'violet',
        guide: 'Sân cỏ nằm bên trái khu C',
    },
    'stand-d': {
        title: 'Khán đài D',
        orientation: 'bottom',
        accent: 'emerald',
        guide: 'Hướng nhìn ra sân ở phía trên',
    },
};

const statusClassName = {
    Available: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300 hover:border-primary-light hover:bg-primary/25 hover:text-white',
    Held: 'cursor-not-allowed border-amber-500/30 bg-amber-500/10 text-amber-400',
    Sold: 'cursor-not-allowed border-white/5 bg-white/2 text-slate-600 line-through',
};

const selectedClassName = {
    amber: 'border-amber-300 bg-amber-400/30 text-white shadow-md shadow-amber-500/20',
    cyan: 'border-cyan-300 bg-cyan-400/30 text-white shadow-md shadow-cyan-500/20',
    rose: 'border-rose-300 bg-rose-400/30 text-white shadow-md shadow-rose-500/20',
    violet: 'border-violet-300 bg-violet-400/30 text-white shadow-md shadow-violet-500/20',
    emerald: 'border-emerald-300 bg-emerald-400/30 text-white shadow-md shadow-emerald-500/20',
    primary: 'border-primary-light bg-primary text-white shadow-md shadow-primary/20',
};

const pitchGuideClassName = {
    amber: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200',
    rose: 'border-rose-400/30 bg-rose-400/10 text-rose-200',
    violet: 'border-violet-400/30 bg-violet-400/10 text-violet-200',
    emerald: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200',
    primary: 'border-primary/30 bg-primary/10 text-primary-light',
};

const normalizeSeatCode = (seat) => {
    if (seat?.code) {
        return seat.code;
    }

    const row = seat?.row || '';
    const seatNumber = seat?.seatNumber || '';
    if (row && seatNumber) {
        return `${row}${seatNumber}`;
    }

    return 'N/A';
};

const getSeatLabel = (seat) => {
    if (seat?.seatNumber !== undefined && seat?.seatNumber !== null && seat?.seatNumber !== '') {
        return String(seat.seatNumber).padStart(2, '0');
    }

    return normalizeSeatCode(seat);
};

const formatSeatStatus = (status) => {
    if (status === 'Available') return 'Còn trống';
    if (status === 'Held') return 'Đang giữ';
    if (status === 'Sold') return 'Đã bán';
    return status || 'Không xác định';
};

function PitchGuide({ meta, position = 'top' }) {
    const vertical = position === 'left' || position === 'right';

    return (
        <div
            className={[
                'flex shrink-0 items-center justify-center rounded-xl border text-[10px] font-black uppercase tracking-[0.22em]',
                pitchGuideClassName[meta.accent] || pitchGuideClassName.primary,
                vertical ? 'min-h-[260px] w-12 [writing-mode:vertical-rl]' : 'h-10 w-full',
            ].join(' ')}
        >
            <span>{position === 'left' || position === 'right' ? 'Phía sân cỏ' : 'Hướng nhìn ra sân'}</span>
        </div>
    );
}

function SeatGrid({
    seats,
    selectedSeats,
    selectedSection,
    selectedMapBlock,
    selectedTicket,
    formatCurrency,
    isLoading,
    error,
    pendingSeatId,
    onSeatClick,
}) {
    const selectedIds = new Set(selectedSeats.map((seat) => seat.seatPlaceId));
    const meta = sectionMeta[selectedSection?.id] || {
        title: selectedSection?.name || 'Khán đài',
        orientation: 'top',
        accent: 'primary',
        guide: 'Hướng nhìn ra sân',
    };
    const sectionName = selectedSection?.name || meta.title;
    const displaySectionName = selectedMapBlock?.standName || sectionName;
    const selectedBlockCode = selectedMapBlock?.blockCode || '';
    const availableSeats = (seats || []).filter((seat) => seat.status === 'Available').length;
    const unitPrice = Number(selectedTicket?.unitPrice || selectedSection?.minPrice || 0);

    const groupedRows = (seats || []).reduce((rows, seat) => {
        const row = seat?.row || 'A';
        rows[row] = rows[row] || [];
        rows[row].push(seat);
        return rows;
    }, {});

    const rowNames = Object.keys(groupedRows).sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
    const maxSeatsInRow = Math.max(10, ...Object.values(groupedRows).map((rowSeats) => rowSeats.length));
    const seatGridMinWidth = Math.max(560, maxSeatsInRow * 48 + 52);
    const sidePitch = meta.orientation === 'left' || meta.orientation === 'right';

    const renderRows = () => (
        <div className="overflow-x-auto pb-2 custom-scrollbar">
            <div className="space-y-3" style={{ minWidth: `${seatGridMinWidth}px` }}>
                {rowNames.map((rowName) => {
                    const rowSeats = groupedRows[rowName]
                        .slice()
                        .sort((a, b) => Number(a.seatNumber) - Number(b.seatNumber));

                    return (
                        <div
                            className="grid items-center gap-2.5"
                            key={rowName}
                            style={{ gridTemplateColumns: `42px repeat(${maxSeatsInRow}, minmax(38px, 1fr))` }}
                        >
                            <div className="grid h-9 place-items-center rounded-lg border border-white/5 bg-white/3 text-xs font-black uppercase tracking-wider text-slate-400">
                                {rowName}
                            </div>

                            {rowSeats.map((seat) => {
                                const selected = selectedIds.has(seat.seatPlaceId);
                                const disabled = seat.status !== 'Available' && !selected;
                                const busy = pendingSeatId === seat.seatPlaceId;
                                const className = selected
                                    ? selectedClassName[meta.accent] || selectedClassName.primary
                                    : statusClassName[seat.status] || statusClassName.Sold;

                                return (
                                    <button
                                        className={`grid aspect-square min-h-9 place-items-center rounded-lg border text-[11px] font-black transition-all duration-300 disabled:opacity-60 ${className}`}
                                        disabled={disabled || busy}
                                        key={seat.seatPlaceId}
                                        type="button"
                                        onClick={() => onSeatClick(seat)}
                                        title={`${normalizeSeatCode(seat)} - ${formatSeatStatus(seat.status)}`}
                                    >
                                        {busy ? <Loader2 className="h-4 w-4 animate-spin text-white" aria-hidden="true" /> : getSeatLabel(seat)}
                                    </button>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );

    const renderSeatMap = () => {
        if (!selectedSection) {
            return (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#1A1A2E]/20 p-8 text-center text-xs font-bold text-slate-400 md:text-sm">
                    Chọn một khán đài trên sơ đồ để xem ghế.
                </div>
            );
        }

        if (isLoading) {
            return (
                <div className="grid min-h-[240px] place-items-center rounded-2xl bg-white/2">
                    <div className="flex flex-col items-center gap-3 text-sm font-bold text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-light" aria-hidden="true" />
                        <span>Đang tải danh sách ghế...</span>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4.5 text-xs font-bold text-rose-300 md:text-sm">
                    {error}
                </div>
            );
        }

        if (!rowNames.length) {
            return (
                <div className="rounded-2xl border border-dashed border-white/10 bg-[#1A1A2E]/20 p-8 text-center text-xs font-bold text-slate-400 md:text-sm">
                    Khu này chưa có dữ liệu ghế để hiển thị hoặc hiện đã hết vé.
                </div>
            );
        }

        if (sidePitch) {
            return (
                <div className={`flex gap-4 ${meta.orientation === 'right' ? 'flex-row-reverse' : ''}`}>
                    <PitchGuide meta={meta} position={meta.orientation} />
                    <div className="min-w-0 flex-1">{renderRows()}</div>
                </div>
            );
        }

        return (
            <div className="space-y-5">
                {meta.orientation === 'top' && <PitchGuide meta={meta} position="top" />}
                {renderRows()}
                {meta.orientation === 'bottom' && <PitchGuide meta={meta} position="bottom" />}
            </div>
        );
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-white/5 bg-surface-card shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-white/2 p-5">
                <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary-light">
                            <Armchair className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <h3 className="mb-0 text-base font-extrabold tracking-wide text-white">
                            {selectedSection
                                ? `Sơ đồ ghế - ${selectedBlockCode ? `Block ${selectedBlockCode} - ` : ''}${displaySectionName}`
                                : 'Sơ đồ ghế'}
                        </h3>
                    </div>
                    <p className="mb-0 text-xs text-slate-400">
                        {selectedSection
                            ? meta.guide
                            : 'Chọn một khán đài trên sơ đồ để xem ghế.'}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                    {selectedSection && (
                        <>
                            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-slate-300">
                                Còn {availableSeats} ghế
                            </span>
                            <span className="rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary-light">
                                {unitPrice ? formatCurrency(unitPrice) : 'Đang cập nhật giá'}
                            </span>
                        </>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-emerald-300"><span className="h-2 w-2 rounded bg-emerald-400" /> Còn trống</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-2.5 py-1 text-primary-light"><span className="h-2 w-2 rounded bg-primary-light" /> Đang chọn</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/5 px-2.5 py-1 text-amber-300"><span className="h-2 w-2 rounded bg-amber-400" /> Đang giữ</span>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/3 px-2.5 py-1 text-slate-400"><span className="h-2 w-2 rounded bg-slate-600" /> Đã bán</span>
                </div>
            </div>

            <div className="p-5 md:p-6">
                {renderSeatMap()}
            </div>
        </section>
    );
}

export default SeatGrid;
