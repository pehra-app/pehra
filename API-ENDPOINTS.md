# Pehra MVP API

Base URL: `/api`

## Public
- `GET /health`
- `POST /auth/login`

## Authenticated
- `PUT /devices/token`

## Admin
- `GET /admin/stats`
- `GET /users`
- `POST /users`
- `PATCH /users/:id/status`
- `PATCH /users/:id/password`
- `GET /vehicles`
- `GET /vehicles/:id`
- `POST /vehicles`
- `PUT /vehicles/:id`
- `DELETE /vehicles/:id`
- `GET /search?field=vehicleNumber&value=ABC-123`
- `GET /alerts`

## Dealer
- `GET /dealer/stats`
- `GET /vehicles`
- `GET /vehicles/:id`
- `POST /vehicles`
- `PUT /vehicles/:id`
- `DELETE /vehicles/:id`
- `GET /alerts`

## Agent
- `GET /search?field=vehicleNumber&value=ABC-123`
- `GET /search?field=chassisNumber&value=...`
- `GET /search?field=engineNumber&value=...`

Agent has no vehicle CRUD endpoints.
