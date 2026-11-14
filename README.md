# StreamVibe frontend

The React frontend uses the StreamVibe API for signup, login, profile retrieval, plan listing, and simulated subscription checkout.

## Local setup

1. Configure and start the backend as described in `../ott-backend/README.md`. Its database must be reachable, and its `CORS_ORIGINS` must include the frontend origin.
2. In this directory, install dependencies with `npm install`.
3. Set `VITE_API_BASE_URL=http://localhost:8000/api/v1` in `.env`. A template is available in `.env.example`; change the URL if the API runs elsewhere.
4. Run `npm run dev` and open the URL Vite prints (normally `http://localhost:5173`).

Vite exposes `VITE_` variables to the browser; do not put secrets in the frontend environment file. Restart Vite after changing the environment.

Users and subscriptions are stored by the backend database. Passwords are hashed by the backend. The browser stores the bearer token and profile in local storage; logging out removes the local session. Tokens expire according to the backend configuration. Local storage is accessible to JavaScript, so a production deployment should consider a more secure session design.

Prices come from the API. Checkout and free trials are simulations: no payment is collected and no real payment provider is connected. Yearly billing is not supported.
