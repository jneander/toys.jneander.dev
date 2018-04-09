const Enzyme = require('enzyme')
const EnzymeAdapterReact = require('enzyme-adapter-react-15')

Enzyme.configure({
  adapter: new EnzymeAdapterReact()
})

class ReactTestbed {
  constructor(subject) {
    this.subject = subject

    beforeEach(this.setup.bind(this))
    afterEach(this.teardown.bind(this))
  }

  setup() {
    this.$container = document.createElement('div')
    document.body.appendChild(this.$container)
  }

  teardown() {
    if (this.instance && typeof this.instance.unmount === 'function') {
      this.instance.unmount()
      this.instance = null
    }

    this.$container && this.$container.remove()
    this.$container = null
  }

  render() {
    return (this.instance = Enzyme.mount(this.subject))
  }
}

module.exports = ReactTestbed
