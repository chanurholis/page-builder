export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()

  // Redirect ke /login jika belum login
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
