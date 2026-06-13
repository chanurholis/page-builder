export function useCurrentUser() {
  const { user, loggedIn, fetch: refreshSession } = useUserSession()

  const { data: me, refresh: refreshMe } = useFetch('/api/me', {
    watch: false,
    immediate: false,
  })

  async function init() {
    if (loggedIn.value) {
      await refreshMe()
    }
  }

  return {
    sessionUser: user,
    loggedIn,
    me,
    init,
    refreshSession,
    refreshMe,
  }
}
