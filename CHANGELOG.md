# changelog

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [2.0.0](#200)
- [1.0.1](#101)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## [2.1.0](https://github.com/graasp/etherpad-api/compare/v2.0.1...v2.1.0) (2023-04-17)


### Features

* replace request-promise-native with axios, use POST for set content methods, sanitize HTML ([#5](https://github.com/graasp/etherpad-api/issues/5)) ([6fee4e8](https://github.com/graasp/etherpad-api/commit/6fee4e843f4ad32ef879db2e2431e91f71b4df7f))

## 2.0.1 (2023-03-28)


### Features

* update API to match Etherpad v1.8.18 (API v1.2.14), add return types ([0738680](https://github.com/graasp/etherpad-api/commit/07386804ed97280084678507ba3020f10802582f))


### Bug Fixes

* nullable session types for listSessions calls ([29d0100](https://github.com/graasp/etherpad-api/commit/29d0100447421addf6c72a49ea3d84ee2a89d76d))
* type typo ([6b7f284](https://github.com/graasp/etherpad-api/commit/6b7f284e447ec3cfac387c7c0bf151a89f630fd7))
* use built-in URL checking ([e894c74](https://github.com/graasp/etherpad-api/commit/e894c74c3f02f54461d538c64b32d80bce411f86))


### chore

* release v2.0.1 ([e118a88](https://github.com/graasp/etherpad-api/commit/e118a8828807140a1a51ba60f16332f50e76cfca))

## 2.0.0

- expose `Etherpad` class
- prefix “private” methods with underscore
- better typings
- support NodeJs >= 6

## 1.0.1

- first release
