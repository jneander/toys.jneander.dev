import React from 'react'
import ReactDOM from 'react-dom'
import {AppContainer} from 'react-hot-loader'

import 'normalize.css'
import 'styles/index.css'

import Header from 'js/shared/components/Header'

class StaticContainer extends React.PureComponent {
  bindContainer = ref => {
    this.container = ref
  }

  componentDidMount() {
    this.props.render(this.container)
  }

  render() {
    return <div ref={this.bindContainer} />
  }
}

export function bundle(config) {
  const $sandboxHeader = document.getElementById('sandbox-header')
  const $app = document.getElementById('app')

  function render() {
    ReactDOM.render(
      <AppContainer>
        <Header />
      </AppContainer>,
      $sandboxHeader
    )

    ReactDOM.render(
      <AppContainer>
        <StaticContainer render={config.render} />
      </AppContainer>,
      $app
    )
  }

  render()

  if (module.hot) {
    module.hot.accept(render)
  }
}
