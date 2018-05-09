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

import {Component} from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

export default class ScrollSyncPane extends Component {
  static defaultProps = {
    columns: false,
    rows: false
  }

  static propTypes = {
    children: PropTypes.node.isRequired,
    attachTo: PropTypes.object
  }

  static contextTypes = {
    registerPane: PropTypes.func.isRequired,
    unregisterPane: PropTypes.func.isRequired
  }

  componentDidMount() {
    this.node = this.props.attachTo || ReactDOM.findDOMNode(this)
    this.context.registerPane(this.node, this.props.columns, this.props.rows)
  }

  componentWillUnmount() {
    this.context.unregisterPane(this.node)
  }

  render() {
    return this.props.children
  }
}
