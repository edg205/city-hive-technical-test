# City Hive Technical Test

This repo contains:

- `rails-backend/` — Rails API (Mongoid + Devise JWT) that stores SMS messages and sends them via Twilio
- `angular-frontend/` — Angular client that lists and creates messages

## Backend (Rails API)

### Prereqs

- Ruby (see `rails-backend/.ruby-version` if present)
- Bundler
- MongoDB running locally

### Setup

```bash
cd rails-backend
bundle install
cp .env.example .env   # create this file if you prefer, see ENV vars below
bundle exec rails server
```

### ENV vars

Required:

- `DEVISE_JWT_SECRET_KEY` – secret used to sign JWTs
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_FROM_NUMBER`

Optional:

- `TWILIO_STATUS_CALLBACK_URL` – URL Twilio will hit with delivery updates (e.g. `/api/twilio/status`)

### API endpoints

Auth (Devise JWT):

- `POST /signup` — create user (returns `Authorization` header with JWT)
- `POST /login` — login (returns `Authorization` header with JWT)
- `DELETE /logout` — revoke JWT (denylist)

Messages:

- `GET /api/messages` — list messages for current user (requires `Authorization`)
- `POST /api/messages` — create message + send via Twilio (requires `Authorization`)
    - body: `{ "to_number": "+15555551212", "body": "Hello" }`

Twilio webhook:

- `POST /api/twilio/status` — update message delivery status (Twilio status callback)

### Running tests

```bash
cd rails-backend
bundle exec rspec
```

Notes:
- Request specs mock Twilio calls.
- Tests set default ENV values in `spec/rails_helper.rb` for convenience.

## Frontend (Angular)

```bash
cd angular-frontend
npm install
npm start
```

Make sure the Rails API is running and that the Angular app is configured to point at it (see environment config).

## Tradeoffs / next steps

- Message sending is currently synchronous in the request cycle; in production this should be moved to a background job (Sidekiq/Resque/ActiveJob).
- Twilio webhook signature validation is not implemented (should be added for production).
- UI can be extended with better loading/error states and more robust typing.
