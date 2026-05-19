/**
 * Simple HOF for guest-only pages (login, signup, forgot-password)
 * Since we're using client-side auth, this just passes through
 * Auth check happens in useEffect on the page
 */
export default function withGuest(getServerSidePropsFunc) {
  return getServerSidePropsFunc
}
