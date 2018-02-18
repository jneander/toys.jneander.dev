module.exports = function bundleReactPage(page) {
  return `
import React from 'react'
import ReactDOM from 'react-dom'
import {AppContainer} from 'react-hot-loader'

import Page from '../${page.sourcePath}'

const $app = document.getElementById('app')

function render() {
  ReactDOM.render(
    <AppContainer>
      <Page />
    </AppContainer>,
    $app
  )
}

render()

if (module.hot) {
  module.hot.accept(render)
}
`
}
