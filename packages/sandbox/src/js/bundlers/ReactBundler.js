import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import 'normalize.css';
import 'styles/index.css';

import Header from 'js/shared/components/Header';

export function bundle (config) {
  const $sandboxHeader = document.getElementById('sandbox-header');
  const $app = document.getElementById('app');

  function render () {
    ReactDOM.render(
      <AppContainer>
        <Header />
      </AppContainer>,
      $sandboxHeader
    );

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
