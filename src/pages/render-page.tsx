import {render} from 'react-dom'

export function renderPage(Component: () => JSX.Element) {
  const container = document.getElementById('__next')
  render(<Component />, container)
}
