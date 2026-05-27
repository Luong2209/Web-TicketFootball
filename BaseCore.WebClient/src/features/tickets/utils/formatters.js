export const currency = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
});

export const ticketAsset = (path) => `/template-football/${path}`;
