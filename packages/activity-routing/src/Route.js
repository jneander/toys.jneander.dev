import qs from 'qs'
import UrlPattern from 'url-pattern'

export default class Route {
  constructor(name, contexts, path, details = {}) {
    this.internals = {
      urlPattern: new UrlPattern(path)
    }
    this.name = name
    this.contexts = contexts
    this.path = path
    this.details = details
  }

  buildActivity(path, query) {
    return {
      name: this.name,
      contexts: this.contexts.map(context => context.name),
      ...this.internals.urlPattern.match(path),
      query
    }
  }

  buildHelpers() {
    return {
      url(pathValues, query = {}) {
        const pathString = this.internals.urlPattern.stringify(pathValues)
        const queryString = Object.keys(query).length > 0 ? `?${qs.stringify(query)}` : ''
        return pathString + queryString
      }
    }
  }

  match(path) {
    return !!this.internals.urlPattern.match(path)
  }

  buildUrl(...args) {
    const pathValueMap = {}
    this.internals.urlPattern.names.forEach((name, index) => {
      pathValueMap[name] = args[index] || 'undefined'
      if (!args[index]) {
        console.warn(`no value given for ${name} in path ${this.internals.urlPattern.regex}`)
      }
    })
    const pathString = this.internals.urlPattern.stringify(pathValueMap)

    const query = args[this.internals.urlPattern.names.length] || {}
    const queryString = Object.keys(query).length > 0 ? `?${qs.stringify(query)}` : ''

    return pathString + queryString
  }
}
