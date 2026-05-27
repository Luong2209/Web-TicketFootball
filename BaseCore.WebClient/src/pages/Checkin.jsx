import React, { useEffect, useState } from 'react';
import { checkinApi } from '../services/api';

const formatDate = (value) => {
    if (!value) return '';
    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
};

function Checkin() {
    const [ticketCode, setTicketCode] = useState('');
    const [qrCodePayload, setQrCodePayload] = useState('');
    const [gate, setGate] = useState('A1');
    const [deviceId, setDeviceId] = useState('WEB-CHECKIN');
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [checkins, setCheckins] = useState([]);

    const loadCheckins = async () => {
        try {
            const response = await checkinApi.getAll();
            setCheckins(response.data || []);
        } catch {
            setCheckins([]);
        }
    };

    useEffect(() => {
        loadCheckins();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setMessage('');
        setError('');

        try {
            const response = await checkinApi.create({
                ticketCode: ticketCode.trim() || undefined,
                qrCodePayload: qrCodePayload.trim() || undefined,
                gate,
                deviceId,
                note,
            });

            setMessage(`Check-in thanh cong: ${response.data.checkinCode}`);
            setTicketCode('');
            setQrCodePayload('');
            setNote('');
            await loadCheckins();
        } catch (requestError) {
            const status = requestError.response?.status;
            const backendMessage = requestError.response?.data?.message;
            setError(status === 409 ? `Ve da check-in truoc do. ${backendMessage || ''}` : (backendMessage || 'Check-in that bai.'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <>
            <div className="content-header mb-3">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <div className="col-sm-6">
                            <h1 className="m-0">QR Check-in</h1>
                        </div>
                    </div>
                </div>
            </div>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row">
                <div className="col-lg-5">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title mb-0">Check-in ticket</h2>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="card-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold" htmlFor="ticketCode">Ticket code</label>
                                    <input className="form-control" id="ticketCode" placeholder="ETK-..." value={ticketCode} onChange={(event) => setTicketCode(event.target.value)} />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label fw-bold" htmlFor="qrCodePayload">QR payload</label>
                                    <textarea className="form-control" id="qrCodePayload" placeholder='{"type":"football-ticket","ticketCode":"ETK-..."}' rows={5} value={qrCodePayload} onChange={(event) => setQrCodePayload(event.target.value)} />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold" htmlFor="gate">Gate</label>
                                        <input className="form-control" id="gate" value={gate} onChange={(event) => setGate(event.target.value)} />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label fw-bold" htmlFor="deviceId">Device</label>
                                        <input className="form-control" id="deviceId" value={deviceId} onChange={(event) => setDeviceId(event.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label fw-bold" htmlFor="note">Note</label>
                                    <input className="form-control" id="note" value={note} onChange={(event) => setNote(event.target.value)} />
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn btn-primary" disabled={submitting || (!ticketCode.trim() && !qrCodePayload.trim())} type="submit">
                                    {submitting ? 'Checking...' : 'Check-in'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="col-lg-7">
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title mb-0">Recent check-ins</h2>
                        </div>
                        <div className="table-responsive">
                            <table className="table mb-0 align-middle">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Ticket</th>
                                        <th>Gate</th>
                                        <th>Status</th>
                                        <th>Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {checkins.slice(0, 10).map((item) => (
                                        <tr key={item.id}>
                                            <td><code>{item.checkinCode}</code></td>
                                            <td>{item.ticketCode}</td>
                                            <td>{item.gate}</td>
                                            <td><span className="badge text-bg-success">{item.status}</span></td>
                                            <td>{formatDate(item.checkedAt)}</td>
                                        </tr>
                                    ))}
                                    {!checkins.length && (
                                        <tr>
                                            <td className="text-muted" colSpan="5">No check-ins yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Checkin;
