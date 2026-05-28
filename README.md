# My Pazhonic Mobile React

Mobile-first React frontend for the Pazhonic panel application. The UI is designed to run inside an Android WebView in production, while browser development can continue without the Android project by using a local development bridge.

## Current Features

- Authentication screens: login and registration.
- Protected mobile application layout with bottom navigation.
- Panel list similar to a chat list, including search, categories, details, edit, and delete confirmation.
- Panel creation form with icon selection, connection information, location selection, and serial-number retrieval.
- Connection views for SMS, internet, and Wi-Fi flows.
- Settings page with biometric preference and folder management.
- Settings and profile detail screens backed by native preferences and actions in production.
- Profile page with authenticated-only light/dark theme switching and session logout.
- Browser-only bridge implementation for developing the full frontend without Android.

## Technology

- React 19 and TypeScript
- Vite 7
- Tailwind CSS 4
- React Router with hash routing
- Framer Motion
- `react-swipeable-list`
- `react-hot-toast`
- `react-icons`

## Requirements

- Node.js and npm
- A browser viewport or Android WebView for frontend development
- Android host application only when testing native integration or producing the final WebView package

## Install And Run

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal. The authenticated UI is optimized for phone and tablet WebView widths, with a constrained reading/control column on larger screens.

Available commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start frontend development mode with the browser-backed debug bridge. |
| `npm run build` | Type-check and build production assets into `dist/`. |
| `npm run preview` | Preview the production bundle locally. |
| `npm run lint` | Run ESLint over the project. |

On Windows PowerShell systems that block `npm.ps1`, use `npm.cmd run dev`, `npm.cmd run build`, and similar commands.

## Routes

The application uses `createHashRouter`, which is suitable for WebView-hosted static assets.

| Route | Screen | Access |
| --- | --- | --- |
| `/#/` | Login | Public; redirects to home when signed in. |
| `/#/register` | Registration | Public; redirects to home when signed in. |
| `/#/app/home` | Panel list and panel actions | Authenticated |
| `/#/app/panel/connect/:way` | Connection flow; `sms`, `internet`, or `wifi` | Authenticated |
| `/#/app/explore` | Native-backed overview and quick actions | Authenticated |
| `/#/app/settings` | Application settings and panel folders | Authenticated |
| `/#/app/settings/:section` | Support, logs, storage, cache, privacy details | Authenticated |
| `/#/app/profile` | Profile and logout | Authenticated |
| `/#/app/profile/:section` | Profile editing, privacy, security, storage, sharing | Authenticated |

## Theme And WebView Layout

- The light/dark toggle on the profile screen themes only authenticated `/app` screens. Login and registration styling remains unchanged.
- Theme choice is persisted locally under `pazhonic_app_theme`.
- Authenticated screens use the exact brand primary `#09a1a4`, with a restrained blue accent and teal-tinted neutral surfaces; dark mode keeps the same brand identity on deep surfaces.
- The viewport supports device safe areas using `viewport-fit=cover` and `env(safe-area-inset-*)` padding for the shell, bottom navigation, and sheets.
- Authenticated routes use lazy loading so public authentication startup does not preload every application screen.
- User actions use a shared compact RTL notification surface with distinct success, error, warning, information, and loading presentations. Examples include welcome after login, panel CRUD results, serial retrieval, folder operations, profile updates, and native share/support actions.

## Frontend Development Without Android

In Vite development mode, native calls do not reach Android. [src/utils/androidBridge.ts](src/utils/androidBridge.ts) selects [src/utils/developmentBridge.ts](src/utils/developmentBridge.ts), which implements the native contract in the browser with `localStorage`.

The debug bridge supports:

- Login, registration, session restoration, and logout.
- Biometric toggle and mock biometric login.
- Seeded folders and panels plus create, edit, assign-folder, and delete actions.
- Seeded province and city selections.
- Mock panel serial-number lookup.
- Profile editing, password update, settings persistence, activity logs, storage counts, support/share/clipboard/cache actions.

Use this seeded debug login:

```text
Phone:    09120000000
Password: debug
```

Entering any unregistered phone number and a password on the login page also creates a temporary debug user. Debug state remains in browser local storage under `pazhonic_development_bridge`; remove that entry in browser developer tools to reset the seeded state.

## Panel Delete Behavior

On the home panel list, swipe a row to reveal its actions. Selecting delete opens a confirmation dialog first. The row remains in the list unless the user confirms and the bridge deletion request succeeds.

## Android Bridge Integration

Production builds use the Android-injected `window.AndroidBridge` object. Native access is centralized in [src/utils/androidBridge.ts](src/utils/androidBridge.ts); page components should use its exported functions rather than calling `window.AndroidBridge` directly.

The current bridge contract covers:

| Domain | Methods |
| --- | --- |
| Authentication | `registerUser`, `login`, `getSessionToken`, `getLatestUser`, `logout` |
| Biometrics | `setBiometricEnabled`, `getBiometricEnabled`, `loginWithBiometric` |
| Locations | `getLocationsByType`, `getLocationsByParentId`, `getLocationsByTypeAndParent`, `getCitiesByStateId` |
| Panels | `getPanelsForUser`, `getPanelsByFolder`, `createPanel`, `updatePanel`, `deletePanel`, `setPanelFolder`, `setPanelLastStatus` |
| Folders | `getFolders`, `createFolder`, `updateFolder`, `deleteFolder` |
| Device connection | `getSerialNumber` |
| Profile and settings | `updateProfile`, `changePassword`, `getPreference`, `setPreference` |
| Android actions | `sendSupportTicket`, `clearAppCache`, `copyText`, `shareText`, `shareBackup` |
| Local data reporting | `getStorageSummary`, `getActivityLogs` |

Native bridge methods return JSON strings, which the TypeScript adapter parses into application-friendly results.

## Production Build For Android

```bash
npm run build
```

The build output is generated in `dist/`. The Vite configuration uses `base: './'` so asset URLs are relative when hosted as local WebView files.

Production behavior:

- The development bridge is not used in the built Android path.
- The WebView must inject `window.AndroidBridge` before screens that require native data are used.
- Copy or integrate the contents of `dist/` into `app/src/main/assets/reactapp/` in the Android project.

The Android host used with this frontend is currently located at `C:\Users\ASUS\AndroidStudioProjects\MyPazhonicTest`.

## Project Structure

```text
src/
  app/router.tsx                 Route definitions and protected screens
  components/                    Shared sheets, navigation, and UI controls
  contexts/AuthContext.tsx       Session state used by route guards and pages
  contexts/AppThemeProvider.tsx  Persisted authenticated light/dark mode
  layouts/MobileLayout.tsx       Authenticated mobile shell
  pages/auth/                    Login and registration
  pages/panel/                   Home, connection, settings, and profile screens
  utils/androidBridge.ts         Production/native integration boundary
  utils/developmentBridge.ts     Browser-only development bridge implementation
```

## Current Development Notes

- The UI is primarily Persian and right-to-left, designed for mobile and tablet WebView viewports.
- The frontend can now be completed and navigated independently of Android during development.
- `npm run build` succeeds.
- Production assets have been synced into the Android host asset directory.
- Connection pages under `/app/panel/connect/:way` remain intentionally outside the completed native-operation scope.
- `npm run lint` currently reports existing React Hooks and Fast Refresh rule issues in several UI/context files; these are separate cleanup work from the bridge workflow.
