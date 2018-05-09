/*
 * MIT License
 *
 * Copyright (c) 2016 Andrey Okonetchnikov
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Forked from https://github.com/okonet/react-scroll-sync/
 */

import React, {Component} from 'react'
import {func} from 'prop-types'

export default class ScrollSync extends Component {
  static propTypes = {
    children: func.isRequired
  }

  static childContextTypes = {
    registerPane: func,
    unregisterPane: func
  }

  constructor(props) {
    super(props)

    this.panes = []

    this.addEvents = this.addEvents.bind(this)
    this.findPane = this.findPane.bind(this)
    this.registerPane = this.registerPane.bind(this)
    this.removeEvents = this.removeEvents.bind(this)
    this.syncScrollPositions = this.syncScrollPositions.bind(this)
    this.unregisterPane = this.unregisterPane.bind(this)

    this.handlePaneScroll = node => {
      window.requestAnimationFrame(() => {
        this.syncScrollPositions(node)
      })
    }
  }

  addEvents(node) {
    // For some reason element.addEventListener doesnt work with document.body
    node.onscroll = this.handlePaneScroll.bind(this, node) // eslint-disable-line
  }

  getChildContext() {
    return {
      registerPane: this.registerPane,
      unregisterPane: this.unregisterPane
    }
  }

  registerPane(node, columns, rows) {
    if (!this.findPane(node)) {
      const newPane = {columns, node, rows}
      const primaryPane = this.panes.find(pane => pane.columns && pane.rows)
      if (primaryPane) {
        this.syncScrollPosition(primaryPane.node, newPane)
      }
      this.addEvents(node)
      this.panes.push(newPane)
    }
  }

  unregisterPane(node) {
    if (this.findPane(node)) {
      this.removeEvents(node)
      const index = this.panes.findIndex(pane => pane.node === node)
      this.panes.splice(index, 1)
    }
  }

  removeEvents(node) {
    // For some reason element.removeEventListener doesnt work with document.body
    node.onscroll = null // eslint-disable-line
  }

  findPane(node) {
    return this.panes.find(pane => pane.node === node)
  }

  syncScrollPosition(scrolledNode, pane) {
    const {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollLeft,
      scrollWidth,
      clientWidth
    } = scrolledNode

    const scrollTopOffset = scrollHeight - clientHeight
    const scrollLeftOffset = scrollWidth - clientWidth

    // Calculate the actual pane height
    const paneHeight = pane.node.scrollHeight - clientHeight
    const paneWidth = pane.node.scrollWidth - clientWidth

    // Adjust the scrollTop position of it accordingly
    if (pane.rows && scrollTopOffset > 0) {
      pane.node.scrollTop = scrollTop // eslint-disable-line
    }
    if (pane.columns && scrollLeftOffset > 0) {
      pane.node.scrollLeft = scrollLeft // eslint-disable-line
    }
  }

  syncScrollPositions(node) {
    this.panes.forEach(pane => {
      // For all panes beside the currently scrolling one
      if (node !== pane.node) {
        // Remove event listeners from the node that we'll manipulate
        this.removeEvents(pane.node)
        this.syncScrollPosition(node, pane)

        // Re-attach event listeners after we're done scrolling
        window.requestAnimationFrame(() => {
          this.addEvents(pane.node)
        })
      }
    })
  }

  render() {
    return this.props.children()
  }
}
