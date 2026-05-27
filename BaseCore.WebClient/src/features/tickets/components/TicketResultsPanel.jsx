import React from 'react';
import TicketCard from './TicketCard';

function TicketResultsPanel({
    matchData,
    matchSlug,
    visibleTickets,
    selectedSectionData,
    sortMode,
    isBooking,
    onBookTicket,
    onClearSection,
    onSelectSection,
    onSortChange,
}) {
    return (
        <aside className="order-2 min-w-0 overflow-visible bg-white lg:order-1 lg:overflow-y-auto lg:border-r lg:border-slate-200">
            <div className="relative px-5 py-6">
                <div className="absolute right-5 top-4 flex gap-3">
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.12)] hover:text-plum-950" type="button" aria-label="Save event"><i className="far fa-heart" /></button>
                    <button className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 shadow-[0_6px_16px_rgba(15,23,42,0.12)] hover:text-plum-950" type="button" aria-label="Event info"><i className="fas fa-info-circle" /></button>
                </div>
                <h1 className="mb-2 max-w-[520px] pr-24 text-[21px] font-extrabold leading-tight">{matchData.title}</h1>
                <p className="m-0 max-w-[540px] text-[15px] leading-6 text-slate-600">{matchData.date} · {matchData.stadium} · {matchData.location}</p>
                {matchSlug !== matchData.id && <small className="mt-1 block text-slate-500">Đang hiển thị dữ liệu mẫu cho trận đấu này.</small>}
            </div>

            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 pb-4">
                <strong className="text-xl font-extrabold">{visibleTickets.length || matchData.listings} vé đang bán</strong>
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <i className="fas fa-sort" aria-hidden="true" />
                    <select className="border-0 bg-transparent outline-none" value={sortMode} onChange={(event) => onSortChange(event.target.value)}>
                        <option value="price">Giá thấp trước</option>
                        <option value="price-desc">Giá cao trước</option>
                    </select>
                </label>
            </div>

            <section className="mr-5 mt-3 flex items-center justify-between rounded-r-lg border border-l-0 border-blue-200 bg-blue-50 px-5 py-3">
                <div>
                    <strong className="block font-extrabold">Vé đã xác thực</strong>
                    <span className="mt-1 block text-sm text-slate-700">Mỗi vé được kiểm tra và giữ chỗ trước khi tạo đơn.</span>
                </div>
                <i className="fas fa-ticket-alt grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-blue-700" aria-hidden="true" />
            </section>

            {selectedSectionData && (
                <button className="mx-5 mt-3 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700" type="button" onClick={onClearSection}>
                    Đang xem khu {selectedSectionData.id} · bỏ lọc
                </button>
            )}

            <div className="pb-5">
                {visibleTickets.map((ticket) => (
                    <TicketCard
                        isBooking={isBooking}
                        key={ticket.id}
                        ticket={ticket}
                        onBookTicket={onBookTicket}
                        onSelectSection={onSelectSection}
                    />
                ))}
                {!visibleTickets.length && (
                    <div className="m-5 grid gap-1 rounded-lg border border-dashed border-slate-300 p-6 text-slate-500">
                        <strong className="text-slate-700">Không có vé phù hợp</strong>
                        <span>Thử đổi khu vực, số lượng vé hoặc khoảng giá.</span>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default TicketResultsPanel;
