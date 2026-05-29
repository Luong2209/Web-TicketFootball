import React from 'react';

function BookingStatus({ bookingError, bookingId }) {
    if (!bookingId && !bookingError) {
        return null;
    }

    return (
        <div className={`mx-7 mb-6 rounded-lg px-4 py-3 font-bold ${bookingError ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {bookingError || `Đã gửi yêu cầu đặt vé. Order: ${bookingId}`}
        </div>
    );
}

export default BookingStatus;
