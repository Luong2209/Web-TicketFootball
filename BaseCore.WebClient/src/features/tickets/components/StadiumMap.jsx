import React from 'react';
import { Minus, Plus, Ticket } from 'lucide-react';

const currency = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
});

const seatTiers = [
    { key: 'standard', label: 'Tiêu chuẩn', dotClass: 'bg-slate-400' },
    { key: 'best', label: 'Góc nhìn đẹp', dotClass: 'bg-green-400' },
    { key: 'premium', label: 'Premium', dotClass: 'bg-emerald-600' },
    { key: 'vip', label: 'VIP', dotClass: 'bg-amber-500' },
    { key: 'away', label: 'Khu khách', dotClass: 'bg-blue-600' },
];

const getSeatTier = (section) => {
    if (section.type === 'away') return 'away';
    if (section.type === 'vip' || section.price >= 5000) return 'vip';
    if (section.price >= 2500) return 'premium';
    if (section.type === 'best' || section.price >= 1000) return 'best';
    return 'standard';
};

const getSeatTierLabel = (tierKey) => seatTiers.find((tier) => tier.key === tierKey)?.label || 'Tiêu chuẩn';

function StadiumMap({
    sections,
    selectedSection,
    mapZoom,
    onSelectSection,
    onZoomChange,
}) {
    const changeMapZoom = (nextZoom) => {
        onZoomChange(Math.min(1.8, Math.max(0.72, Number(nextZoom.toFixed(2)))));
    };

    const handleMapWheel = (event) => {
        event.preventDefault();
        changeMapZoom(mapZoom + (event.deltaY > 0 ? -0.08 : 0.08));
    };

    return (
        <div className="relative grid min-h-0 flex-1 place-items-center overflow-hidden px-3 py-4 sm:px-6 lg:px-7 lg:py-5" onWheel={handleMapWheel}>
            <div className="absolute right-3 top-3 z-[8] inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 p-1 shadow-[0_8px_22px_rgba(15,23,42,0.12)] lg:right-5 lg:top-4" aria-label="Điều khiển thu phóng bản đồ sân">
                <button className="grid h-8 w-8 place-items-center rounded-full border-0 bg-slate-100 text-slate-800 hover:bg-plum-950 hover:text-white" type="button" onClick={() => changeMapZoom(mapZoom - 0.12)} aria-label="Thu nhỏ bản đồ">
                    <Minus className="h-4 w-4" aria-hidden="true" />
                </button>
                <span className="min-w-10 text-center text-xs font-black text-plum-950">{Math.round(mapZoom * 100)}%</span>
                <button className="grid h-8 w-8 place-items-center rounded-full border-0 bg-slate-100 text-slate-800 hover:bg-plum-950 hover:text-white" type="button" onClick={() => changeMapZoom(mapZoom + 0.12)} aria-label="Phóng to bản đồ">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                </button>
            </div>

            <div className="absolute left-3 top-14 z-[8] flex max-w-[calc(100%-1.5rem)] flex-wrap gap-1.5 sm:top-3 sm:max-w-[min(520px,calc(100%-180px))] lg:left-5 lg:top-4" aria-label="Phân hạng chỗ ngồi">
                {seatTiers.map((tier) => (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-2 py-1 text-[11px] font-extrabold text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.1)] sm:px-2.5 sm:py-1.5 sm:text-xs" key={tier.key}>
                        <span className={`h-2.5 w-2.5 rounded-full ${tier.dotClass}`} aria-hidden="true" />
                        {tier.label}
                    </span>
                ))}
            </div>

            <div
                className="stadium-map"
                role="img"
                aria-label="Old Trafford stadium map"
                style={{ transform: `scale(${mapZoom})` }}
            >
                <div className="stadium-bowl">
                    <div className="stadium-ring stadium-ring--outer" aria-hidden="true" />
                    <div className="stadium-ring stadium-ring--middle" aria-hidden="true" />
                    <div className="stadium-ring stadium-ring--inner" aria-hidden="true" />

                    {sections.map((section) => {
                        const tier = getSeatTier(section);
                        return (
                            <button
                                key={section.id}
                                type="button"
                                className={`stadium-section stadium-section--${section.type} stadium-section--tier-${tier} ${selectedSection === section.id ? 'stadium-section--active' : ''}`}
                                style={{
                                    left: `${section.x}%`,
                                    top: `${section.y}%`,
                                    width: `${section.w}%`,
                                    height: `${section.h}%`,
                                }}
                                onClick={() => onSelectSection(section.id)}
                                title={`${section.id} - ${getSeatTierLabel(tier)} - ${currency.format(section.price)}`}
                            >
                                <small>{section.id}</small>
                                <em>{getSeatTierLabel(tier)}</em>
                                <span>{currency.format(section.price)}</span>
                            </button>
                        );
                    })}

                    <div className="pitch">
                        <span className="stand stand--top">Sir Alex Ferguson Stand</span>
                        <span className="stand stand--left">Stretford End</span>
                        <span className="stand stand--right">East Stand</span>
                        <span className="stand stand--bottom">Sir Bobby Charlton Stand</span>
                        <div className="pitch-ticket-icon"><Ticket className="h-5 w-5" aria-hidden="true" /></div>
                        <div className="center-circle" />
                        <div className="half-line" />
                        <div className="box box--left" />
                        <div className="box box--right" />
                        <div className="six-yard six-yard--left" />
                        <div className="six-yard six-yard--right" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StadiumMap;
