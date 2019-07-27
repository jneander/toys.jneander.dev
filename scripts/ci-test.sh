#!/usr/bin/env sh

yarn install
yarn clean
yarn build:production
yarn clean
yarn test
