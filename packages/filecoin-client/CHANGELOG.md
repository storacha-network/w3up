# Changelog

## [3.0.2](https://github.com/web3-storage/w3up/compare/filecoin-client-v3.0.1...filecoin-client-v3.0.2) (2023-11-08)


### Bug Fixes

* upgrade filecoin client deal tracker principal ([#1092](https://github.com/web3-storage/w3up/issues/1092)) ([cde7113](https://github.com/web3-storage/w3up/commit/cde71134ab8fdd4a72e3764da30ae0a414a8690b))

## [3.0.1](https://github.com/web3-storage/w3up/compare/filecoin-client-v3.0.0...filecoin-client-v3.0.1) (2023-11-03)


### Bug Fixes

* receipt chain has wrong CID because no expiration is set ([#1060](https://github.com/web3-storage/w3up/issues/1060)) ([dfb46d8](https://github.com/web3-storage/w3up/commit/dfb46d8185c684a18452e1325abcf74d59c48159))

## [3.0.0](https://github.com/web3-storage/w3up/compare/filecoin-client-v2.0.2...filecoin-client-v3.0.0) (2023-10-26)


### ⚠ BREAKING CHANGES

* upgrade data segment v4 ([#996](https://github.com/web3-storage/w3up/issues/996))

### Bug Fixes

* upgrade data segment v4 ([#996](https://github.com/web3-storage/w3up/issues/996)) ([348e4b0](https://github.com/web3-storage/w3up/commit/348e4b065909e48ab1e97c0eaee9fa0b5ad2e223))

## [2.0.2](https://github.com/web3-storage/w3up/compare/filecoin-client-v2.0.1...filecoin-client-v2.0.2) (2023-10-25)


### Bug Fixes

* touch filecoin-client README as fix conventional commits in order to trigger release-please patch version ([65245ef](https://github.com/web3-storage/w3up/commit/65245effd6c7e06c4d3b495e03a598e557a98c8e))

## [2.0.1](https://github.com/web3-storage/w3up/compare/filecoin-client-v2.0.0...filecoin-client-v2.0.1) (2023-10-25)


### Bug Fixes

* fix arethetypesworking errors in all packages ([#1004](https://github.com/web3-storage/w3up/issues/1004)) ([2e2936a](https://github.com/web3-storage/w3up/commit/2e2936a3831389dd13be5be5146a04e2b15553c5))
* package.json files excludes 'src' and includes .js and .js.map in dist for packages that now export their module from dist  ([#1012](https://github.com/web3-storage/w3up/issues/1012)) ([d2537de](https://github.com/web3-storage/w3up/commit/d2537deed533a39f39e312a1dfcfbd048e1d83e5))

## [2.0.0](https://github.com/web3-storage/w3up/compare/filecoin-client-v1.4.0...filecoin-client-v2.0.0) (2023-10-24)


### ⚠ BREAKING CHANGES

* see latest specs https://github.com/web3-storage/specs/blob/cbdb706f18567900c5c24d7fb16ccbaf93d0d023/w3-filecoin.md
* filecoin client to use new capabilities

### Bug Fixes

* client tests ([b0d9c3f](https://github.com/web3-storage/w3up/commit/b0d9c3f258d37701487ef02f70a93e2dd1a18775))
* upgrade ucanto in filecoin api ([c95fb54](https://github.com/web3-storage/w3up/commit/c95fb54cdb04f50ff78e5113e70d73c1cd6d8b47))


### Code Refactoring

* filecoin api services events and tests ([#974](https://github.com/web3-storage/w3up/issues/974)) ([953537b](https://github.com/web3-storage/w3up/commit/953537bcb98d94b9e9655797a7f9026643ab949f))
* filecoin client to use new capabilities ([b0d9c3f](https://github.com/web3-storage/w3up/commit/b0d9c3f258d37701487ef02f70a93e2dd1a18775))

## [1.4.0](https://github.com/web3-storage/w3up/compare/filecoin-client-v1.3.0...filecoin-client-v1.4.0) (2023-10-11)


### Features

* upgrade to ucanto@9 ([#951](https://github.com/web3-storage/w3up/issues/951)) ([d72faf1](https://github.com/web3-storage/w3up/commit/d72faf1bb07dd11462ae6dff8ee0469f8ae7e9e7))


### Bug Fixes

* upgrade to latest ts ([#962](https://github.com/web3-storage/w3up/issues/962)) ([711e3f7](https://github.com/web3-storage/w3up/commit/711e3f73f6905fde0d929952fff70be845a55fa1))

## [1.3.0](https://github.com/web3-storage/w3up/compare/filecoin-client-v1.2.2...filecoin-client-v1.3.0) (2023-08-30)


### Features

* w3filecoin new client and api ([#848](https://github.com/web3-storage/w3up/issues/848)) ([7a58fbe](https://github.com/web3-storage/w3up/commit/7a58fbe8f6c6fbe98e700b7affd5825ddccf6547))


### Bug Fixes

* upgrade data segment ([#850](https://github.com/web3-storage/w3up/issues/850)) ([fba281f](https://github.com/web3-storage/w3up/commit/fba281f8cd3ce2a0a00ffd50a4a73d7701b489ce))
* w3filecoin spec separate capabilities to queue and enqueue ([#856](https://github.com/web3-storage/w3up/issues/856)) ([6bf9142](https://github.com/web3-storage/w3up/commit/6bf9142636fa65367faed8414c50beb9c1791726)), closes [#855](https://github.com/web3-storage/w3up/issues/855)

## [1.2.1](https://github.com/web3-storage/w3up/compare/filecoin-client-v1.2.0...filecoin-client-v1.2.1) (2023-08-30)


### Bug Fixes

* w3filecoin spec separate capabilities to queue and enqueue ([#856](https://github.com/web3-storage/w3up/issues/856)) ([6bf9142](https://github.com/web3-storage/w3up/commit/6bf9142636fa65367faed8414c50beb9c1791726)), closes [#855](https://github.com/web3-storage/w3up/issues/855)

## [1.2.0](https://github.com/web3-storage/w3up/compare/filecoin-client-v1.1.0...filecoin-client-v1.2.0) (2023-08-10)


### Features

* w3filecoin new client and api ([#848](https://github.com/web3-storage/w3up/issues/848)) ([7a58fbe](https://github.com/web3-storage/w3up/commit/7a58fbe8f6c6fbe98e700b7affd5825ddccf6547))


### Bug Fixes

* upgrade data segment ([#850](https://github.com/web3-storage/w3up/issues/850)) ([fba281f](https://github.com/web3-storage/w3up/commit/fba281f8cd3ce2a0a00ffd50a4a73d7701b489ce))

## 1.0.0 (2023-08-10)


### Features

* w3filecoin new client and api ([#848](https://github.com/web3-storage/w3up/issues/848)) ([7a58fbe](https://github.com/web3-storage/w3up/commit/7a58fbe8f6c6fbe98e700b7affd5825ddccf6547))


### Bug Fixes

* upgrade data segment ([#850](https://github.com/web3-storage/w3up/issues/850)) ([fba281f](https://github.com/web3-storage/w3up/commit/fba281f8cd3ce2a0a00ffd50a4a73d7701b489ce))

## [1.1.0](https://github.com/web3-storage/w3up/compare/filecoin-client-v1.0.0...filecoin-client-v1.1.0) (2023-08-09)


### Features

* w3filecoin new client and api ([#848](https://github.com/web3-storage/w3up/issues/848)) ([7a58fbe](https://github.com/web3-storage/w3up/commit/7a58fbe8f6c6fbe98e700b7affd5825ddccf6547))
