import Route from './Route'

export default class Router {
  constructor(contexts = []) {
    this.internals = {
      contexts,
      routeList: []
    }
    this.urls = {}
  }

  add(name, path, details = {}) {
    const contextPaths = this.internals.contexts.map(context => context.path)
    const fullPath = [...contextPaths, path].join('') // maybe trim slashes to ensure presence
    const route = new Route(name, this.internals.contexts, fullPath, details)
    this.internals.routeList.push(route)
    this.urls[`${name}Url`] = route.buildUrl.bind(route)
  }

  context(name, path, defineFn) {
    const context = new Router([...this.internals.contexts, {name, path}])
    defineFn(context)
    this.internals.routeList = this.internals.routeList.concat(context.internals.routeList)
    Object.assign(this.urls, context.urls)
  }

  match(path, query) {
    for (let route of this.internals.routeList) {
      if (route.match(path)) {
        return route.buildActivity(path, query)
      }
    }
    return null
  }
}
