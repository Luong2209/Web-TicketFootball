# Frontend E2E Test Result

Test date: 2026-05-27

## Environment

- Frontend dev server: `http://localhost:3000/login`
- Gateway: `http://localhost:5000`
- API base URL used by frontend: `http://localhost:5000/api`
- APIService: `http://localhost:5001`
- AuthService: `http://localhost:5002`

Note: Backend services were run outside the sandbox because SQL Server uses `Integrated Security=True`.

## Frontend Route Smoke Test

Vite route rendering was checked through the dev server.

| Route | Result |
| --- | --- |
| `GET /login` | `200 OK` |
| `GET /payments/1` | `200 OK` |
| `GET /my-tickets` | `200 OK` |
| `GET /admin/checkin` | `200 OK` |

## End-To-End Flow

The E2E flow was executed against the same backend endpoints used by the frontend.

| Step | Action | Result |
| --- | --- | --- |
| 1 | Login user `user/user123` | OK |
| 2 | Load real matches from `GET /api/matches` | OK |
| 3 | Select match `man-utd-liverpool` | OK |
| 4 | Load tickets from `GET /api/matches/{slug}/tickets` | OK |
| 5 | Create order with `POST /api/tickets/orders` | OK |
| 6 | Verify order appears in `GET /api/tickets/orders` | OK |
| 7 | Create payment with `POST /api/payments` | OK |
| 8 | Confirm payment with `POST /api/payments/{id}/confirm` | OK |
| 9 | Verify e-ticket appears in `GET /api/tickets/etickets` | OK |
| 10 | Login admin `admin/admin123` | OK |
| 11 | Check-in ticket with `POST /api/checkins` | OK |
| 12 | Check-in same ticket again | `409` OK |

Test output:

```json
{
  "userLogin": "OK",
  "adminLogin": "OK",
  "matches": 3,
  "matchSlug": "man-utd-liverpool",
  "ticketListings": 5,
  "orderId": 3,
  "orderVisibleInMyOrders": true,
  "paymentId": 3,
  "paymentStatusBeforeConfirm": "Pending",
  "paymentStatusAfterConfirm": "Paid",
  "eTicketCode": "ETK-20260527010835-9b03fa674508",
  "eTicketVisibleInMyTickets": true,
  "checkinCode": "CHK-20260527010835-504082fa8e76",
  "checkinStatus": "Success",
  "duplicateCheckin": "expected-409: 409"
}
```

## Fixes Applied

No additional frontend fixes were required during this E2E pass.

The current frontend already has:

- `API_BASE_URL = http://localhost:5000/api`
- Real login through `POST /api/auth/login`
- Real match list through `GET /api/matches`
- Booking flow through `GET /api/matches/{slug}/tickets` and `POST /api/tickets/orders`
- Payment flow through `POST /api/payments` and `POST /api/payments/{id}/confirm`
- My tickets page through `GET /api/tickets/etickets`
- Admin check-in page through `POST /api/checkins`
- Duplicate check-in message handling for `409`

## Build

Command:

```text
npm run build
```

Result:

```text
vite v5.4.21 building for production...
116 modules transformed.
built in 1.62s
```

## Notes

- No `401` or `403` occurred during the tested flow.
- No `404` occurred for frontend routes or backend API routes.
- No undefined render crash was found during route smoke tests.
- Browser click automation was not available because the project does not include Playwright, Puppeteer, or Selenium. The route smoke test used the Vite dev server, and the E2E data flow used the same API calls as the frontend.
