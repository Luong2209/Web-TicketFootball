import React from 'react';
import { currency } from '../utils/formatters';

function TicketCard({
    ticket,
    isBooking,
    onBookTicket,
    onSelectSection,
}) {
    return (
        <article className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 border-b border-slate-200 bg-white px-3 py-4 sm:grid-cols-[104px_minmax(0,1fr)_auto]">
            <button className="ticket-mini-map h-24 w-24 sm:h-[104px] sm:w-[104px]" type="button" onClick={() => onSelectSection(ticket.sectionId)} aria-label={`Select ${ticket.sectionId}`}>
                <span />
            </button>
            <div className="min-w-0">
                <h2 className="mb-1 mt-1 text-xl font-extrabold">{ticket.title}</h2>
                <p className="mb-3 text-base text-slate-500">{ticket.row}, {ticket.quantity} vé</p>
                <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded bg-emerald-100 px-2 py-1 text-sm font-semibold text-emerald-700">{ticket.score}</span>
                    {ticket.tags.map((tag) => (
                        <span className="rounded bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-500" key={tag}>{tag}</span>
                    ))}
                </div>
                <small className="font-bold text-slate-500">{ticket.seller}</small>
            </div>
            <div className="col-start-2 flex min-w-[92px] flex-col items-start justify-center sm:col-auto sm:items-end">
                <strong className="text-xl font-extrabold">{currency.format(ticket.price)}</strong>
                <span className="text-base text-slate-900">each</span>
                <button className="mt-3 min-w-[82px] rounded bg-plum-950 px-4 py-2 font-extrabold text-white hover:bg-ink-900 disabled:opacity-60" type="button" disabled={isBooking} onClick={() => onBookTicket(ticket)}>
                    Đặt vé
                </button>
            </div>
        </article>
    );
}

export default TicketCard;
