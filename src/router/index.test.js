import { routes } from '../router/index'

describe('router configuration', () => {
  it('resolves all six application routes', () => {
    expect(routes.map(route => route.name)).toEqual([
      'dashboard', 'calendar', 'log', 'insights', 'learn', 'settings', undefined
    ])
  })

  it('maps each required path to the correct page', () => {
    const byPath = Object.fromEntries(routes.map(route => [route.path, route.name || route.redirect]))
    expect(byPath['/']).toBe('dashboard')
    expect(byPath['/calendar']).toBe('calendar')
    expect(byPath['/log']).toBe('log')
    expect(byPath['/insights']).toBe('insights')
    expect(byPath['/learn']).toBe('learn')
    expect(byPath['/settings']).toBe('settings')
  })

  it('redirects unknown paths to the dashboard', () => {
    expect(routes.find(route => route.path === '/:pathMatch(.*)*')?.redirect).toBe('/')
  })

  it('assigns page titles to all named routes', () => {
    routes.filter(route => route.name).forEach(route => expect(route.meta?.title).toBeTruthy())
  })

  it('does not require a fake local account to use the app', () => {
    expect(routes.some(route => route.path === '/login')).toBe(false)
    expect(routes.filter(route => route.name).every(route => !route.meta?.requiresAuth)).toBe(true)
  })
})
