# Backend API Test Result

Test date: 2026-05-27

## Environment

- Gateway: `http://localhost:5000`
- APIService: `http://localhost:5001`
- AuthService: `http://localhost:5002`
- Database: SQL Server `BaseCore`

Note: Services were run outside the sandbox because the SQL Server connection uses `Integrated Security=True`.

## Ticket Booking Flow

| Step | Endpoint | Result |
| --- | --- | --- |
| Login user | `POST /api/auth/login` | OK |
| Get matches | `GET /api/matches` | OK |
| Get match tickets | `GET /api/matches/{slug}/tickets` | OK |
| Create order | `POST /api/tickets/orders` | OK |
| Create payment | `POST /api/payments` | OK |
| Confirm payment | `POST /api/payments/{id}/confirm` | OK |
| Get e-tickets | `GET /api/tickets/etickets` | OK |
| Check in QR | `POST /api/checkins` | OK |
| Duplicate check-in | `POST /api/checkins` | `409` OK |

Sample tested result:

```json
{
  "userLogin": "OK",
  "adminLogin": "OK",
  "matchSlug": "man-utd-liverpool",
  "listingId": 1,
  "orderId": 2,
  "orderStatus": "Pending",
  "paymentId": 2,
  "paymentStatusBeforeConfirm": "Pending",
  "paymentStatusAfterConfirm": "Paid",
  "issuedTicketStatusBeforeCheckin": "Issued",
  "checkinStatus": "Success",
  "duplicateCheckin": "expected-failure: 409"
}
```

## Admin API

| Endpoint | Result |
| --- | --- |
| `GET /api/admin/matches` | OK |
| `GET /api/admin/seasons` | OK |
| `GET /api/admin/rounds?season=2026-2027` | OK |
| `GET /api/admin/stadiums` | OK |
| `GET /api/admin/stadiums/{id}/sections` | OK |
| `GET /api/admin/tickets?matchId=1` | OK |
| `GET /api/admin/orders` | OK |
| `GET /api/admin/orders/{id}` | OK |
| CRUD match | OK |
| CRUD section | OK |
| CRUD ticket | OK |

## Season And Match Round API

| Step | Endpoint / Rule | Result |
| --- | --- | --- |
| Get matches with season/round fields | `GET /api/matches` | OK |
| Filter matches by season and round | `GET /api/matches?season=2026-2027&round=1` | OK |
| Get rounds by season | `GET /api/matches/rounds?season=2026-2027` | OK |
| Admin validation: same home/away team | `POST /api/admin/matches` | `400` OK |
| Admin validation: team appears twice in same round | `POST /api/admin/matches` | `409` OK |
| Admin validation: eleventh match in same round | `POST /api/admin/matches` | `409` OK |

Sample Season/MatchRound read result:

```json
{
  "matchesCount": 3,
  "filteredCount": 3,
  "roundsCount": 1,
  "firstMatch": "man-utd-liverpool",
  "firstMatchSeason": "2026-2027",
  "firstMatchRound": "Vòng 1",
  "firstRoundMatchCount": 3
}
```

Sample validation result:

```json
{
  "homeEqualsAway": 400,
  "duplicateTeamInRound": 409,
  "createdTenMatches": [200, 200, 200, 200, 200, 200, 200, 200, 200, 200],
  "eleventhMatchWhenRoundFull": 409,
  "cleanup": {
    "testMatches": 0,
    "testRounds": 0,
    "testClubs": 0
  }
}
```

Sample admin read result:

```json
{
  "adminMatches": 3,
  "adminStadiums": 3,
  "stadium1Sections": 5,
  "match1Tickets": 5,
  "adminOrders": 2,
  "orderDetailId": 2,
  "checkins": 2
}
```

Sample admin CRUD result:

```json
{
  "createMatchId": 5,
  "updateMatchFeatured": true,
  "createSectionId": 7,
  "updateSectionCapacity": 12,
  "createTicketId": 7,
  "updateTicketPrice": 130,
  "deleteTicketStatus": 204,
  "deleteSectionStatus": 204,
  "deleteMatchStatus": 204
}
```

## Build And Package Audit

Build command:

```text
dotnet build BaseCore.sln --no-restore
```

Result:

```text
Build succeeded.
0 Warning(s)
0 Error(s)
```

Package audit command:

```text
dotnet list BaseCore.sln package --vulnerable --include-transitive
```

Result:

```text
All projects have no vulnerable packages given the current NuGet sources.
```
