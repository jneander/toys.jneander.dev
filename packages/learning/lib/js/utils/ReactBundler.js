import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import 'normalize.css';
import 'styles/index.css';

export function bundle (config) {
  const $app = document.getElementById('app');

  function render () {
    ReactDOM.render(
      <AppContainer>
        <config.App />
      </AppContainer>,
      $app
    );
  }

  render();

  if (module.hot) {
    module.hot.accept(render);
  }
}
