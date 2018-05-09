import {Children, Component} from 'react'
import ReactDOM from 'react-dom'
import {func, node} from 'prop-types'

export default class ControlledView extends Component {
  static contextTypes = {
    connectView: func.isRequired,
    disconnectView: func.isRequired
  }

  static defaultProps = {
    horizontal: false,
    vertical: false
  }

  static propTypes = {
    children: node.isRequired
  }

  componentDidMount() {
    // TODO: replace ReactDOM.findDOMNode with node ref passed to child
    const node = ReactDOM.findDOMNode(this)
    this._view = {
      horizontal: this.props.horizontal,
      node,
      vertical: this.props.vertical
    }
    this.context.connectView(this._view)
  }

  componentWillUnmount() {
    this.context.disconnectView(this._view)
  }

  render() {
    return Children.only(this.props.children)
  }
}
