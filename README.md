# StudioSpace

StudioSpace is a marketplace concept for finding and hosting creative spaces by the hour. This checkout currently contains the responsive React client prototype; account, studio, wishlist, and booking data are stored in the current browser with localStorage.

## Highlights

- Browse and search creative studio listings, with category filters and detail pages.
- Responsive home page with rotating hero, category discovery, booking steps, and host assurances.
- Demo account registration and sign-in screens, including password strength checks.
- Add and manage studio listings and booking requests in a browser-local demo.
- Save studios to a wishlist and switch between light and dark themes.
- Branded empty states, custom not-found page, and toast feedback.

## Tech stack

- React 19 and Vite 8
- Plain CSS with responsive layouts
- Browser History API for route handling
- Unsplash-hosted photography

## Local setup

1. Install Node.js 20.19+ or 22.12+.
2. From this directory run `npm install`.
3. Configure and start the API and MongoDB using the instructions in `C:\projects\spacestudio-server\README.md`.
4. Run `npm run dev` and open the local URL printed by Vite.
5. Run `npm run build` to create the production bundle.

## Demo account

There is no pre-seeded examiner account. Start and configure the API in `C:\projects\spacestudio-server`, then create an account from the Register screen. Google sign-in requires Google OAuth credentials in the server `.env`.

## Deployment and repositories

- Live site: not deployed yet.
- Client repository: use the Git remote configured for this checkout.
- Server project: a separate API scaffold is in `C:\projects\spacestudio-server`.

Login, registration, logout, and session restoration use the API. Studio, booking, and wishlist data still use browser-local demo behavior. The API requires MongoDB and environment configuration before it can run. Image upload and deployment are not configured. Do not use the client demo for real user data or payments.
