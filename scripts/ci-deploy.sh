#!/usr/bin/env sh

./ci-setup.sh
yarn install
yarn clean
yarn build:production
