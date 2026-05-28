import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

const standLayout = [
    {
        id: 'home',
        title: 'Khán đài Nhà',
        shortTitle: 'NHÀ',
        className: 'absolute left-[3%] top-[6%] h-[23%] w-[30%]',
        tier: 'KHÁN ĐÀI NHÀ',
        blocks: ['H101', 'H102', 'H103', 'H104', 'H105', 'H201', 'H202', 'H203', 'H204', 'H205'],
        miniGrid: 'grid-cols-5',
        blockTextClass: 'text-[5px] sm:text-[6px] lg:text-[7px]',
        palette: {
            idle: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-200',
            active: 'border-cyan-300 bg-cyan-400/25 text-white ring-2 ring-cyan-400/25 shadow-cyan-500/25',
            chip: 'bg-cyan-300/15 text-cyan-100 border-cyan-300/20',
            glow: 'from-cyan-400/18 via-blue-500/8 to-transparent',
        },
    },
    {
        id: 'vip',
        title: 'VIP',
        shortTitle: 'VIP',
        className: 'absolute left-[34%] right-[34%] top-[6%] h-[25%]',
        tier: 'KHU CAO CẤP',
        blocks: ['VIP1', 'VIP2', 'VIP3', 'VIP4', 'VIP5', 'VIP6', 'VIP7', 'VIP8', 'VIP9', 'VIP10', 'VIP11', 'VIP12', 'VIP13', 'VIP14', 'VIP15', 'VIP16'],
        miniGrid: 'grid-cols-8',
        blockTextClass: 'text-[4px] sm:text-[4.5px] lg:text-[5px]',
        palette: {
            idle: 'border-amber-500/35 bg-amber-500/10 text-amber-200',
            active: 'border-amber-300 bg-amber-400/25 text-white ring-2 ring-amber-400/25 shadow-amber-500/25',
            chip: 'bg-amber-300/15 text-amber-100 border-amber-300/20',
            glow: 'from-amber-400/20 via-yellow-300/8 to-transparent',
        },
    },
    {
        id: 'away',
        title: 'Khán đài Khách',
        shortTitle: 'KHÁCH',
        className: 'absolute right-[3%] top-[6%] h-[23%] w-[30%]',
        tier: 'KHÁN ĐÀI KHÁCH',
        blocks: ['AW101', 'AW102', 'AW103', 'AW104', 'AW105', 'AW201', 'AW202', 'AW203', 'AW204', 'AW205'],
        miniGrid: 'grid-cols-5',
        blockTextClass: 'text-[4px] sm:text-[4.5px] lg:text-[5px]',
        palette: {
            idle: 'border-rose-500/35 bg-rose-500/10 text-rose-200',
            active: 'border-rose-300 bg-rose-400/25 text-white ring-2 ring-rose-400/25 shadow-rose-500/25',
            chip: 'bg-rose-300/15 text-rose-100 border-rose-300/20',
            glow: 'from-rose-400/18 via-red-500/8 to-transparent',
        },
    },
    {
        id: 'stand-b',
        title: 'Khán đài B',
        shortTitle: 'B',
        className: 'absolute left-[3%] top-[31%] h-[45%] w-[25%]',
        tier: 'KHÁN ĐÀI B',
        blocks: ['B101', 'B102', 'B103', 'B104', 'B105', 'B106', 'B201', 'B202', 'B203', 'B204', 'B205', 'B206', 'B301', 'B302', 'B303', 'B304', 'B305', 'B306'],
        miniGrid: 'grid-cols-6',
        blockTextClass: 'text-[4.5px] sm:text-[5px] lg:text-[5.5px]',
        palette: {
            idle: 'border-primary/35 bg-primary/10 text-primary-light',
            active: 'border-primary-light bg-primary/30 text-white ring-2 ring-primary/30 shadow-primary/25',
            chip: 'bg-primary/15 text-primary-light border-primary/25',
            glow: 'from-primary/22 via-primary-dark/8 to-transparent',
        },
    },
    {
        id: 'stand-c',
        title: 'Khán đài C',
        shortTitle: 'C',
        className: 'absolute right-[3%] top-[31%] h-[45%] w-[26%]',
        tier: 'KHÁN ĐÀI C',
        blocks: ['C101', 'C102', 'C103', 'C104', 'C105', 'C106', 'C201', 'C202', 'C203', 'C204', 'C205', 'C206', 'C301', 'C302', 'C303', 'C304', 'C305', 'C306'],
        miniGrid: 'grid-cols-6',
        blockTextClass: 'text-[4.5px] sm:text-[5px] lg:text-[5.5px]',
        palette: {
            idle: 'border-violet-400/35 bg-violet-500/10 text-violet-200',
            active: 'border-violet-300 bg-violet-400/25 text-white ring-2 ring-violet-400/25 shadow-violet-500/25',
            chip: 'bg-violet-300/15 text-violet-100 border-violet-300/20',
            glow: 'from-violet-400/18 via-primary/8 to-transparent',
        },
    },
    {
        id: 'stand-a',
        title: 'Khán đài A',
        shortTitle: 'A',
        className: 'absolute left-[29%] right-[29%] bottom-[18%] h-[23%]',
        tier: 'KHÁN ĐÀI A',
        blocks: ['A101', 'A102', 'A103', 'A104', 'A105', 'A106', 'A107', 'A108', 'A201', 'A202', 'A203', 'A204', 'A205', 'A206', 'A207', 'A208'],
        miniGrid: 'grid-cols-8',
        blockTextClass: 'text-[5px] sm:text-[5.5px] lg:text-[6px]',
        palette: {
            idle: 'border-slate-400/30 bg-slate-400/10 text-slate-200',
            active: 'border-primary-light bg-primary/25 text-white ring-2 ring-primary/25 shadow-primary/25',
            chip: 'bg-white/8 text-slate-100 border-white/10',
            glow: 'from-white/8 via-primary/8 to-transparent',
        },
    },
    {
        id: 'stand-d',
        title: 'Khán đài D',
        shortTitle: 'D',
        className: 'absolute left-[20%] right-[18%] bottom-[1%] h-[23%]',
        tier: 'KHÁN ĐÀI D',
        blocks: ['D101', 'D102', 'D103', 'D104', 'D105', 'D106', 'D107', 'D108', 'D201', 'D202', 'D203', 'D204', 'D205', 'D206', 'D207', 'D208'],
        miniGrid: 'grid-cols-8',
        blockTextClass: 'text-[4.5px] sm:text-[5px] lg:text-[5.5px]',
        palette: {
            idle: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
            active: 'border-emerald-300 bg-emerald-400/25 text-white ring-2 ring-emerald-400/25 shadow-emerald-500/25',
            chip: 'bg-emerald-300/15 text-emerald-100 border-emerald-300/20',
            glow: 'from-emerald-400/18 via-green-600/8 to-transparent',
        },
    },
];

function PitchGraphic() {
    return (
        <div className="absolute inset-x-[35%] top-[39%] bottom-[46%] overflow-hidden rounded-xl border-[3px] border-emerald-300/70 bg-gradient-to-br from-emerald-500 via-emerald-700 to-emerald-900 shadow-lg shadow-emerald-950/35">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.07)_0,rgba(255,255,255,0.07)_30px,rgba(0,0,0,0.07)_30px,rgba(0,0,0,0.07)_60px)]" />
            <div className="absolute inset-[7%] rounded-lg border border-white/40" />
            <div className="absolute left-1/2 top-[7%] h-[86%] w-px -translate-x-1/2 bg-white/40" />
            <div className="absolute left-1/2 top-1/2 aspect-square h-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/40" />
            <div className="absolute left-[7%] top-[31%] h-[38%] w-[14%] border border-l-0 border-white/40" />
            <div className="absolute right-[7%] top-[31%] h-[38%] w-[14%] border border-r-0 border-white/40" />
            <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[1.55rem] rounded border border-white/15 bg-[#0F0F1A]/75 px-2 py-0.5 text-[7px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur">
                SÂN CỎ
            </span>
        </div>
    );
}

function StandBlock({
    layout,
    section,
    selected,
    selectedBlockCode,
    disabled,
    onSelectSection,
}) {
    const displayName = section?.name || layout.title;
    const panelState = selected ? layout.palette.active : layout.palette.idle;
    const selectSection = (blockCode) => {
        if (!disabled) {
            onSelectSection(section, {
                blockCode,
                standId: layout.id,
                standName: displayName,
            });
        }
    };

    return (
        <div className={layout.className}>
            <div
                className={[
                    'group relative h-full w-full overflow-hidden rounded-xl border p-1.5 text-left shadow-md transition-all duration-300',
                    'bg-gradient-to-br backdrop-blur-sm',
                    panelState,
                    selected ? 'scale-[1.01] shadow-xl' : '',
                    disabled ? 'opacity-30 grayscale' : 'hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110',
                ].join(' ')}
            >
                <span className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${layout.palette.glow}`} />
                <span className="pointer-events-none absolute inset-1 rounded-lg border border-white/5" />

                <span className="relative z-10 flex h-full flex-col gap-1">
                    <span className="flex shrink-0 items-start justify-between gap-1.5">
                        <span className="min-w-0">
                            <span className="block truncate text-[8px] font-black uppercase tracking-[0.1em] text-white">
                                {displayName}
                            </span>
                            <span className="mt-0.5 block truncate text-[7px] font-bold uppercase tracking-wider text-white/55">
                                {layout.tier}
                            </span>
                        </span>
                        <span
                            className={[
                                'shrink-0 rounded-md border px-1.5 py-0.5 text-[8px] font-black leading-none',
                                selected ? 'border-white/30 bg-white/20 text-white' : layout.palette.chip,
                            ].join(' ')}
                        >
                            {layout.shortTitle}
                        </span>
                    </span>

                    <span className={`grid flex-1 content-center ${layout.miniGrid} gap-1`}>
                        {layout.blocks.map((block) => {
                            const blockSelected = selected && selectedBlockCode === block;

                            return (
                                <button
                                    className={[
                                        'grid aspect-square min-h-0 place-items-center overflow-hidden rounded border px-px font-extrabold leading-none tracking-[-0.04em] transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-primary-light/60',
                                        layout.blockTextClass || 'text-[5px] sm:text-[5.5px] lg:text-[6px]',
                                        blockSelected
                                            ? 'border-white/70 bg-white/35 text-white shadow-md shadow-white/10'
                                            : selected
                                                ? 'border-white/20 bg-white/12 text-white/80'
                                                : 'border-white/10 bg-white/8 text-white/75 hover:border-primary-light/60 hover:bg-primary/25 hover:text-white',
                                        disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95',
                                    ].join(' ')}
                                    disabled={disabled}
                                    key={block}
                                    type="button"
                                    onClick={() => selectSection(block)}
                                    title={`${block} - ${displayName}`}
                                >
                                    {block}
                                </button>
                            );
                        })}
                    </span>
                </span>
            </div>
        </div>
    );
}

function StadiumSeatMap({
    sections,
    selectedSectionId,
    selectedBlockCode,
    onSelectSection,
}) {
    const sectionMap = new Map((sections || []).map((section) => [section.id, section]));

    return (
        <motion.section
            className="overflow-hidden rounded-2xl border border-white/5 bg-surface-card shadow-xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-white/2 p-5">
                <div>
                    <h3 className="flex items-center gap-2 text-base font-extrabold tracking-wide text-white">
                        <Trophy size={16} className="text-primary-light" />
                        <span>Sơ đồ sân vận động</span>
                    </h3>
                    <p className="mb-0 mt-1 text-xs text-slate-400">Chọn khu khán đài để xem danh sách ghế còn trống.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3.5 text-[11px] font-bold text-slate-400">
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-white/10 border border-white/20" /> Còn vé</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-primary/40 border border-primary-light" /> Đang chọn</span>
                    <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-white/5 opacity-30" /> Hết vé</span>
                </div>
            </div>

            <div className="bg-[#07070F] p-3 md:p-5">
                <div className="relative mx-auto aspect-[1200/820] w-full max-w-[1120px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0C0C16] p-4 shadow-2xl sm:p-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(108,60,225,0.1),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_48%)]" />

                    <PitchGraphic />

                    {standLayout.map((layout) => {
                        const section = sectionMap.get(layout.id);
                        const disabled = !section || section.availableQuantity <= 0;
                        const selected = selectedSectionId === layout.id;

                        return (
                            <StandBlock
                                disabled={disabled}
                                key={layout.id}
                                layout={layout}
                                onSelectSection={onSelectSection}
                                section={section}
                                selected={selected}
                                selectedBlockCode={selectedBlockCode}
                            />
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
}

export default StadiumSeatMap;
