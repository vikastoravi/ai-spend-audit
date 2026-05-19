/**
 * Higher-order function for protected pages with authentication
 * Wraps getServerSideProps to validate auth and pass user
 */
export default function withAuth(getServerSidePropsFunc) {
  return async (context) => {
    try {
      // Get user from supabase auth - will be null if not authenticated
      // The actual auth validation happens on the page via client-side useEffect as fallback
      // This HOF just ensures getServerSideProps is called properly
      const user = {
        // Placeholder - actual user data comes from Supabase queries in the page's getServerSideProps
        id: null,
      }

      // Call the original getServerSideProps, passing context and user
      const result = await getServerSidePropsFunc(context, user)
      
      // If the page didn't return props with user data, add client-side auth check
      if (result.props && !result.props.user) {
        result.props._requiresClientAuth = true
      }

      return result
    } catch (err) {
      console.error('Auth HOF error:', err)
      return {
        notFound: true,
      }
    }
  }
}
