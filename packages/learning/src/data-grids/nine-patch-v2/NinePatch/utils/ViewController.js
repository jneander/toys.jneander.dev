import React, {Component} from 'react'
import {func} from 'prop-types'

function syncScrollPosition(node, view) {
  const {clientHeight, clientWidth, scrollHeight, scrollLeft, scrollTop, scrollWidth} = node

  const scrollTopOffset = scrollHeight - clientHeight
  const scrollLeftOffset = scrollWidth - clientWidth

  if (view.vertical && scrollTopOffset > 0) {
    view.node.scrollTop = scrollTop
  }

  if (view.horizontal && scrollLeftOffset > 0) {
    view.node.scrollLeft = scrollLeft
  }
}

export default class ViewController extends Component {
  static childContextTypes = {
    connectView: func,
    disconnectView: func
  }

  static propTypes = {
    children: func.isRequired
  }

  constructor(props) {
    super(props)

    this._views = []

    this.connectView = this.connectView.bind(this)
    this.disconnectView = this.disconnectView.bind(this)
    this.syncScrollPositions = this.syncScrollPositions.bind(this)

    this._handleNodeScroll = event => {
      const node = event.target
      window.requestAnimationFrame(() => {
        this.syncScrollPositions(node)
      })
    }
  }

  connectView(view) {
    const viewIndex = this._views.findIndex(connectedView => connectedView.node === view.node)
    if (viewIndex === -1) {
      const primaryView = this._views.find(view => view.horizontal && view.vertical)
      if (primaryView) {
        syncScrollPosition(primaryView.node, view)
      }
      view.node.addEventListener('scroll', this._handleNodeScroll)
      this._views.push(view)
    }
  }

  disconnectView(view) {
    const viewIndex = this._views.findIndex(connectedView => connectedView.node === view.node)
    if (viewIndex !== -1) {
      const view = this._views[viewIndex]
      view.node.removeEventListener('scroll', this._handleNodeScroll)
      this._views.splice(viewIndex, 1)
    }
  }

  getChildContext() {
    return {
      connectView: this.connectView,
      disconnectView: this.disconnectView
    }
  }

  syncScrollPositions(node) {
    for (let i = 0; i < this._views.length; i++) {
      const view = this._views[i]

      if (node !== view.node) {
        view.node.removeEventListener('scroll', this._handleNodeScroll)
        syncScrollPosition(node, view)

        window.requestAnimationFrame(() => {
          view.node.addEventListener('scroll', this._handleNodeScroll)
        })
      }
    }
  }

  render() {
    return this.props.children()
  }
}
