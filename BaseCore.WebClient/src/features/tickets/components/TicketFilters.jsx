import React from 'react';
import { currency } from '../utils/formatters';

function TicketFilters({
    activeFilter,
    filterOptions,
    maxPrice,
    ticketCount,
    onActiveFilterChange,
    onMaxPriceChange,
    onTicketCountChange,
}) {
    return (
        <div className="flex min-h-[58px] items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white p-3">
            <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-700 shadow-[0_5px_14px_rgba(15,23,42,0.12)]"><i className="fas fa-sync-alt" /></button>
            <button type="button" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-slate-700 shadow-[0_5px_14px_rgba(15,23,42,0.12)]"><i className="fas fa-sliders-h" /></button>
            <label className="inline-flex h-11 shrink-0 items-center rounded-full bg-pink-50 px-4 font-semibold text-plum-950 shadow-[inset_0_0_0_1px_#f0c9e8,0_5px_14px_rgba(15,23,42,0.1)]">
                <select className="border-0 bg-transparent outline-none" value={ticketCount} onChange={(event) => onTicketCountChange(Number(event.target.value))}>
                    <option value={1}>1 vé</option>
                    <option value={2}>2 vé</option>
                    <option value={3}>3 vé</option>
                    <option value={4}>4 vé</option>
                </select>
            </label>
            <label className="inline-flex h-11 shrink-0 items-center gap-3 rounded-full bg-white px-4 text-slate-700 shadow-[0_5px_14px_rgba(15,23,42,0.12)]">
                <span>{currency.format(590)} - {currency.format(maxPrice)}</span>
                <input className="w-[120px] accent-plum-950" type="range" min="590" max="8000" step="50" value={maxPrice} onChange={(event) => onMaxPriceChange(Number(event.target.value))} />
            </label>
            <label className="inline-flex h-11 shrink-0 items-center rounded-full bg-white px-4 text-slate-700 shadow-[0_5px_14px_rgba(15,23,42,0.12)]">
                <select className="border-0 bg-transparent outline-none" value={activeFilter} onChange={(event) => onActiveFilterChange(event.target.value)}>
                    <option value="">Loại vé</option>
                    {filterOptions.map((option) => (
                        <option value={option.value} key={option.value}>{option.label}</option>
                    ))}
                </select>
            </label>
            {filterOptions.map((option) => (
                <button key={option.value} type="button" className={`h-11 shrink-0 rounded-full px-4 font-semibold shadow-[0_5px_14px_rgba(15,23,42,0.12)] ${activeFilter === option.value ? 'bg-pink-50 text-plum-950 ring-1 ring-pink-200' : 'bg-white text-slate-700'}`} onClick={() => onActiveFilterChange(activeFilter === option.value ? '' : option.value)}>
                    {option.label}
                </button>
            ))}
            <button type="button" className="h-11 shrink-0 rounded-full bg-white px-4 font-semibold text-slate-700 shadow-[0_5px_14px_rgba(15,23,42,0.12)]">Sau khung thành</button>
        </div>
    );
}

export default TicketFilters;
