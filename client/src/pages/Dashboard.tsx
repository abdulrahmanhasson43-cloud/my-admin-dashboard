import { Redirect } from "wouter";

/**
 * Legacy route. The app's signed-in home is /account, so anything that still
 * points at /dashboard lands there instead of a dead page.
 */
export default function Dashboard() {
  return <Redirect to="/account" />;
}
