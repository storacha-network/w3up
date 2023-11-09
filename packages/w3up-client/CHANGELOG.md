# Changelog

## [9.3.0](https://github.com/web3-storage/w3up/compare/w3up-client-v9.2.2...w3up-client-v9.3.0) (2023-11-08)


### Features

* add usage/report capability ([#1079](https://github.com/web3-storage/w3up/issues/1079)) ([6418b4b](https://github.com/web3-storage/w3up/commit/6418b4b22329a118fb258928bd9a6a45ced5ce45))

## [9.2.2](https://github.com/web3-storage/w3up/compare/w3up-client-v9.2.1...w3up-client-v9.2.2) (2023-11-03)


### Bug Fixes

* trigger commit for release of w3up client ([#1070](https://github.com/web3-storage/w3up/issues/1070)) ([8edcbf8](https://github.com/web3-storage/w3up/commit/8edcbf827269495a112272b1e59ee6a286b5bd3b))

## [9.2.1](https://github.com/web3-storage/w3up/compare/w3up-client-v9.2.0...w3up-client-v9.2.1) (2023-10-25)


### Bug Fixes

* fix arethetypesworking errors in all packages ([#1004](https://github.com/web3-storage/w3up/issues/1004)) ([2e2936a](https://github.com/web3-storage/w3up/commit/2e2936a3831389dd13be5be5146a04e2b15553c5))

## [9.2.0](https://github.com/web3-storage/w3up/compare/w3up-client-v9.1.0...w3up-client-v9.2.0) (2023-10-20)


### Features

* add `store/get` and `upload/get` capabilities ([#942](https://github.com/web3-storage/w3up/issues/942)) ([40c79eb](https://github.com/web3-storage/w3up/commit/40c79eb8f246775b9e1828240f271fa75ef696be))

## [9.1.0](https://github.com/web3-storage/w3up/compare/w3up-client-v9.0.0...w3up-client-v9.1.0) (2023-10-19)


### Features

* add revocation to access-client and w3up-client ([#975](https://github.com/web3-storage/w3up/issues/975)) ([6c877aa](https://github.com/web3-storage/w3up/commit/6c877aac78eddb924e999dc3270cba010e48e30a))


### Bug Fixes

* update README to reflect authorize-first flow ([#961](https://github.com/web3-storage/w3up/issues/961)) ([9f59720](https://github.com/web3-storage/w3up/commit/9f59720890e38cf225794a4893b803532c916c50))

## [9.0.0](https://github.com/web3-storage/w3up/compare/w3up-client-v8.1.0...w3up-client-v9.0.0) (2023-10-18)


### ⚠ BREAKING CHANGES

* Returning the `size` means that we need to fetch the stored item beforehand, and if it does not exist throw a `StoreItemNotFound` error. This is a change from the current behaviour which returns successfully even if the item is not present in the space.

### Features

* add size to `store/remove` receipt ([#969](https://github.com/web3-storage/w3up/issues/969)) ([d2100eb](https://github.com/web3-storage/w3up/commit/d2100eb0ffa5968c326d58d583a258187f9119eb))

## [8.1.0](https://github.com/web3-storage/w3up/compare/w3up-client-v8.0.3...w3up-client-v8.1.0) (2023-10-10)


### Features

* diagrams in readme, delegated example ([#909](https://github.com/web3-storage/w3up/issues/909)) ([329354d](https://github.com/web3-storage/w3up/commit/329354d75a03c2e6281696b6b12628e0b65e27b2))
* upgrade to ucanto@9 ([#951](https://github.com/web3-storage/w3up/issues/951)) ([d72faf1](https://github.com/web3-storage/w3up/commit/d72faf1bb07dd11462ae6dff8ee0469f8ae7e9e7))


### Bug Fixes

* clarity for bring your own agent example ([#939](https://github.com/web3-storage/w3up/issues/939)) ([acaafd1](https://github.com/web3-storage/w3up/commit/acaafd160b6168d470d2cf73517b23887dee62f8))
* upgrade to latest ts ([#962](https://github.com/web3-storage/w3up/issues/962)) ([711e3f7](https://github.com/web3-storage/w3up/commit/711e3f73f6905fde0d929952fff70be845a55fa1))

## [8.0.3](https://github.com/web3-storage/w3up/compare/w3up-client-v8.0.2...w3up-client-v8.0.3) (2023-09-15)


### Bug Fixes

* add providers to space/info result type ([#911](https://github.com/web3-storage/w3up/issues/911)) ([877f1a8](https://github.com/web3-storage/w3up/commit/877f1a8cf03884dcd40f979c0974b9123be8d915))
* export missing UploadRemoveOk type ([#912](https://github.com/web3-storage/w3up/issues/912)) ([8b8353c](https://github.com/web3-storage/w3up/commit/8b8353cce7ce324bf966da75654ff8d92b3e68b0))

## [8.0.2](https://github.com/web3-storage/w3up/compare/w3up-client-v8.0.1...w3up-client-v8.0.2) (2023-09-07)


### Bug Fixes

* node version ([#907](https://github.com/web3-storage/w3up/issues/907)) ([366a940](https://github.com/web3-storage/w3up/commit/366a94049d9256e9a6b6bfcee16dcffc6a6b9c31))
* README for clarity ([#892](https://github.com/web3-storage/w3up/issues/892)) ([2e75726](https://github.com/web3-storage/w3up/commit/2e7572604664c4746303169d7173257c8a123cb3))
* types for capability specific clients ([#904](https://github.com/web3-storage/w3up/issues/904)) ([b69d4aa](https://github.com/web3-storage/w3up/commit/b69d4aa11385cd23bdcda2240f7e1ba507da44b8))

## [8.0.1](https://github.com/web3-storage/w3up/compare/w3up-client-v8.0.0...w3up-client-v8.0.1) (2023-07-21)


### Bug Fixes

* bump package number to ensure w3up-client depends on &gt;= access@15 ([#836](https://github.com/web3-storage/w3up/issues/836)) ([b095b7c](https://github.com/web3-storage/w3up/commit/b095b7cfaea30f1230b8da884fb580fdf56ec732))

## [8.0.0](https://github.com/web3-storage/w3up/compare/w3up-client-v7.0.0...w3up-client-v8.0.0) (2023-07-21)


### ⚠ BREAKING CHANGES

* stop using access.web3.storage ([#833](https://github.com/web3-storage/w3up/issues/833))

### Features

* stop using access.web3.storage ([#833](https://github.com/web3-storage/w3up/issues/833)) ([0df3f2c](https://github.com/web3-storage/w3up/commit/0df3f2c0341244b2404702e8a8878cf0f6e31bc0))

## [7.0.0](https://github.com/web3-storage/w3up/compare/w3up-client-v6.0.1...w3up-client-v7.0.0) (2023-06-08)


### ⚠ BREAKING CHANGES

* merge `@web3-storage/access-api` into `@web3-storage/upload-api` ([#790](https://github.com/web3-storage/w3up/issues/790))

### Features

* merge `@web3-storage/access-api` into `@web3-storage/upload-api` ([#790](https://github.com/web3-storage/w3up/issues/790)) ([4f6ddb6](https://github.com/web3-storage/w3up/commit/4f6ddb690c365a42a3dc4c5c6898e4999bd0f868))
* w3 aggregate protocol client and api implementation ([#787](https://github.com/web3-storage/w3up/issues/787)) ([b58069d](https://github.com/web3-storage/w3up/commit/b58069d7960efe09283f3b23fed77515b62d4639))

## [6.0.1](https://github.com/web3-storage/w3up/compare/w3up-client-v6.0.0...w3up-client-v6.0.1) (2023-05-23)


### Bug Fixes

* docs for `uploadCAR` return value ([#791](https://github.com/web3-storage/w3up/issues/791)) ([a5ceee4](https://github.com/web3-storage/w3up/commit/a5ceee4ed115bf4d784b99d814c522364fdb97e6))
* upgrade remaining ucanto deps ([#798](https://github.com/web3-storage/w3up/issues/798)) ([7211501](https://github.com/web3-storage/w3up/commit/72115010663a62140127cdeed21f2dc37f59da08))
* upgrade ucanto to 8 ([#794](https://github.com/web3-storage/w3up/issues/794)) ([00b011d](https://github.com/web3-storage/w3up/commit/00b011d87f628d4b3040398ca6cba567a69713ff))

## [6.0.0](https://github.com/web3-storage/w3up/compare/w3up-client-v5.5.1...w3up-client-v6.0.0) (2023-05-03)


### ⚠ BREAKING CHANGES

* upgrade to ucanto7.x.x ([#774](https://github.com/web3-storage/w3up/issues/774))

### Features

* upgrade to ucanto7.x.x ([#774](https://github.com/web3-storage/w3up/issues/774)) ([0cc6e66](https://github.com/web3-storage/w3up/commit/0cc6e66a80476e05c75bea94c1bee9bd12cbacf5))

## [5.5.1](https://github.com/web3-storage/w3up/compare/w3up-client-v5.5.0...w3up-client-v5.5.1) (2023-04-06)


### Bug Fixes

* add newline to space.js to test release-please 694 fix ([#696](https://github.com/web3-storage/w3up/issues/696)) ([ea18619](https://github.com/web3-storage/w3up/commit/ea186193575dc1e19d01fcecddf91c0df37376cc))

## [5.5.0](https://github.com/web3-storage/w3protocol/compare/w3up-client-v5.4.0...w3up-client-v5.5.0) (2023-03-29)


### Features

* add capabilities option type for authorize ([#687](https://github.com/web3-storage/w3protocol/issues/687)) ([bf262dd](https://github.com/web3-storage/w3protocol/commit/bf262dd4380ce2564b4d0afc6aa41b47da2fb36d))
* get `access/claim` authorization wait function working ([#666](https://github.com/web3-storage/w3protocol/issues/666)) ([83971de](https://github.com/web3-storage/w3protocol/commit/83971de683b5fccbbc7ae36b7cb34d62a9930349))


### Bug Fixes

* missing file from byo principal ([6b2384e](https://github.com/web3-storage/w3protocol/commit/6b2384e45eba08a5d7a35a052d451e1cac33ff0b))

## [5.4.0](https://github.com/web3-storage/w3protocol/compare/w3up-client-v5.3.0...w3up-client-v5.4.0) (2023-03-29)


### Features

* bring your own principal ([#672](https://github.com/web3-storage/w3protocol/issues/672)) ([4586df2](https://github.com/web3-storage/w3protocol/commit/4586df25fc8b43dab0191c77ef70620fbf276e1c))

## [5.3.0](https://github.com/web3-storage/w3protocol/compare/w3up-client-v5.2.0...w3up-client-v5.3.0) (2023-03-28)


### Features

* expose `onDirectoryEntryLink` option ([#663](https://github.com/web3-storage/w3protocol/issues/663)) ([e96c8ef](https://github.com/web3-storage/w3protocol/commit/e96c8efecc09bba5756c608a1edd4e52340cd37c))

## [5.2.0](https://github.com/web3-storage/w3protocol/compare/w3up-client-v5.1.0...w3up-client-v5.2.0) (2023-03-28)


### Features

* add w3up-client at /packages/w3up-client ([#653](https://github.com/web3-storage/w3protocol/issues/653)) ([ca921ec](https://github.com/web3-storage/w3protocol/commit/ca921ec2d6fb99d5d3db44f1d5ce77e1fe3dd7dd))


### Miscellaneous Chores

* **access-client:** release 11.0.0-rc.0 ([#573](https://github.com/web3-storage/w3protocol/issues/573)) ([be4386d](https://github.com/web3-storage/w3protocol/commit/be4386d66ceea393f289adb3c79273c250542807))

## [5.1.0](https://github.com/web3-storage/w3up-client/compare/v5.0.0...v5.1.0) (2023-03-24)


### Features

* updated README instructions for MVP ([#85](https://github.com/web3-storage/w3up-client/issues/85)) ([0d0a038](https://github.com/web3-storage/w3up-client/commit/0d0a0389f0b6b29c843d5b28c3ea2d840d38120f))

## [5.0.0](https://github.com/web3-storage/w3up-client/compare/v4.3.0...v5.0.0) (2023-03-23)


### ⚠ BREAKING CHANGES

* updated access client dep ([#89](https://github.com/web3-storage/w3up-client/issues/89))

### Features

* add HAMT sharded directories support ([#87](https://github.com/web3-storage/w3up-client/issues/87)) ([a6673e9](https://github.com/web3-storage/w3up-client/commit/a6673e98f51dc1dc93e5e40ea752a5c10e46c159))
* updated access client dep ([#89](https://github.com/web3-storage/w3up-client/issues/89)) ([35f3964](https://github.com/web3-storage/w3up-client/commit/35f39640a62eaf9a2e6a81632e32cf1851d640b4))

## [4.3.0](https://github.com/web3-storage/w3up-client/compare/v4.2.0...v4.3.0) (2023-03-21)


### Features

* add authorize to client, register no longer needs email ([c9555d9](https://github.com/web3-storage/w3up-client/commit/c9555d92edb1ded9c7db81efcdd2c83331b52106))
* expose connection id did and add email back to registerSpace ([ee1cf3a](https://github.com/web3-storage/w3up-client/commit/ee1cf3a30a79a98c21f2e897d6a26e443b41390f))
* use new claimDelegations "use case" ([1659786](https://github.com/web3-storage/w3up-client/commit/1659786fd79da6292d3605c1ca09b80d94ac83ca))


### Bug Fixes

* back to 100% test coverage ([5ae7f1e](https://github.com/web3-storage/w3up-client/commit/5ae7f1e1d19f7eb95b13ed3bc491fc99e51296d0))
* keep casting defaultProvider() ([7b8c859](https://github.com/web3-storage/w3up-client/commit/7b8c8594abd1665b0c0061ab2eef233d6a0b6cdf))
* pass registerSpace default provider inferred from connection ([224f818](https://github.com/web3-storage/w3up-client/commit/224f818f45b3fa4778a659c4f95124c92534c354))
* typos ([52c648a](https://github.com/web3-storage/w3up-client/commit/52c648a525466e1d6e0619ed4ab663164a9b6a9d))
* typos ([52c648a](https://github.com/web3-storage/w3up-client/commit/52c648a525466e1d6e0619ed4ab663164a9b6a9d))
* update package-lock ([6aa7c47](https://github.com/web3-storage/w3up-client/commit/6aa7c4785ae2bc49039c326e02d1fd042460b83d))
* use released packages to green the build ([05881fc](https://github.com/web3-storage/w3up-client/commit/05881fce652a1bc964937bec9c0cdd20aa2204b2))
* warnings about uploads being public/permanent ([187228a](https://github.com/web3-storage/w3up-client/commit/187228a828ff357f3d1083738673c6a502f2aff9))

## [4.2.0](https://github.com/web3-storage/w3up-client/compare/v4.1.0...v4.2.0) (2023-02-15)


### Features

* update to latest dependencies ([f4da59e](https://github.com/web3-storage/w3up-client/commit/f4da59ec10d8f7e96857998d34672d8848652445))

## [4.1.0](https://github.com/web3-storage/w3up-client/compare/v4.0.1...v4.1.0) (2023-01-11)


### Features

* add CAR upload method ([#72](https://github.com/web3-storage/w3up-client/issues/72)) ([8b31255](https://github.com/web3-storage/w3up-client/commit/8b31255521e6fd875fe043b9c09b347759ebf315))

## [4.0.1](https://github.com/web3-storage/w3up-client/compare/v4.0.0...v4.0.1) (2022-12-14)


### Bug Fixes

* prod access service DID ([67a5d4c](https://github.com/web3-storage/w3up-client/commit/67a5d4c77eb054f5e0075137e77daed3337f35d2))

## [4.0.0](https://github.com/web3-storage/w3up-client/compare/v3.2.0...v4.0.0) (2022-12-14)


### ⚠ BREAKING CHANGES

* The client has been re-written as a wrapper around [access-client](https://www.npmjs.com/package/@web3-storage/access) and [upload-client](https://www.npmjs.com/package/@web3-storage/upload-client) and the API has changed. 
 
Migration notes:

* `client.account()` has been removed, use `client.currentSpace()`
* `client.exportDelegation()` has been removed, use `client.createDelegation()` and then call `export()` on the returned value and encode the returned blocks as a CAR file using the [`@ipld/car`](https://www.npmjs.com/package/@ipld/car) library.
* `client.identity()` has been removed, use `client.agent()` + `client.currentSpace()` + `client.delegations()`
* `client.importDelegation()` has been removed, use `client.addProof()` (for general delegations to your agent) or `client.addSpace()` (to add a proof and _also_ add the space to your list of spaces).
* `client.insights()` has been removed - this was never working
* `client.invoke()` has been removed
* `client.list()` has been removed, use `client.capability.upload.list()`
* `client.makeDelegation()` has been renamed and signature has changed, use `client.createDelegation()`
* `client.register()` has been removed, use `client.registerSpace()`
* `client.remove()` has been removed, use `client.capability.store.remove()`
* `client.removeUpload()` has been removed, use `client.capability.upload.remove()`
* `client.stat()` has been removed, use `client.capability.store.list()`
* `client.upload()` has been removed, use `client.capability.store.add()`
* `client.uploadAdd()` has been removed, use `client.capability.upload.add()`
* `client.whoami()` has been removed, use `client.capability.space.info()`

### Features

* consume upload and access client ([#58](https://github.com/web3-storage/w3up-client/issues/58)) ([7bd91d5](https://github.com/web3-storage/w3up-client/commit/7bd91d59da2b961a4227d9c062e74169e645a0bc))


### Bug Fixes

* release please package name ([3d00586](https://github.com/web3-storage/w3up-client/commit/3d0058658d4a0e819b2da49c7cea3d084b8bba1b))
* remove pnpm reference from deploy-docs workflow ([6807f5d](https://github.com/web3-storage/w3up-client/commit/6807f5d91366e24ffe28d3177540549efbf808ca))
