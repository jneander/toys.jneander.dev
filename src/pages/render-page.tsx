import {render} from 'react-dom'

import 'normalize.css'
import '../styles/globals.css'

export function renderPage(Component: () => JSX.Element) {
  const container = document.getElementById('__next')
  render(<Component />, container)
}
