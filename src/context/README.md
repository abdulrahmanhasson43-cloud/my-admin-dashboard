# context/

Reserved for React Context providers (e.g. `AuthContext`, `CurrentUserContext`).

This is intentionally empty for now — there's no real authentication yet (see
`src/pages/LoginPage.tsx`, which currently just navigates to `/dashboard` with
no check). Once Firebase Auth is wired in during the security phase, the
logged-in user, their role, and permission checks will live here so any page
or component can read `useAuth()` instead of re-deriving auth state locally.
