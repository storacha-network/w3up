# Changelog

## [10.0.0](https://github.com/web3-storage/w3up/compare/capabilities-v9.5.0...capabilities-v10.0.0) (2023-10-12)


### ⚠ BREAKING CHANGES

* Returning the `size` means that we need to fetch the stored item beforehand, and if it does not exist throw a `StoreItemNotFound` error. This is a change from the current behaviour which returns successfully even if the item is not present in the space.

### Features

* add size to `store/remove` receipt ([#969](https://github.com/web3-storage/w3up/issues/969)) ([d2100eb](https://github.com/web3-storage/w3up/commit/d2100eb0ffa5968c326d58d583a258187f9119eb))

## [9.5.0](https://github.com/web3-storage/w3up/compare/capabilities-v9.4.0...capabilities-v9.5.0) (2023-10-10)


### Features

* revocation handler ([#960](https://github.com/web3-storage/w3up/issues/960)) ([91f52c6](https://github.com/web3-storage/w3up/commit/91f52c6d35e4aea2a98c75d8b95ff61cdffac452))


### Bug Fixes

* upgrade to latest ts ([#962](https://github.com/web3-storage/w3up/issues/962)) ([711e3f7](https://github.com/web3-storage/w3up/commit/711e3f73f6905fde0d929952fff70be845a55fa1))

## [9.4.0](https://github.com/web3-storage/w3up/compare/capabilities-v9.3.0...capabilities-v9.4.0) (2023-10-10)


### Features

* define ucan/revoke capability ([#943](https://github.com/web3-storage/w3up/issues/943)) ([5d957ef](https://github.com/web3-storage/w3up/commit/5d957ef1e644557f557dc45a048150d73894e801))
* upgrade to ucanto@9 ([#951](https://github.com/web3-storage/w3up/issues/951)) ([d72faf1](https://github.com/web3-storage/w3up/commit/d72faf1bb07dd11462ae6dff8ee0469f8ae7e9e7))

## [9.3.0](https://github.com/web3-storage/w3up/compare/capabilities-v9.2.1...capabilities-v9.3.0) (2023-09-13)


### Features

* implement `admin/upload/inspect` and `admin/store/inspect` capabilities ([#918](https://github.com/web3-storage/w3up/issues/918)) ([5616a12](https://github.com/web3-storage/w3up/commit/5616a12125500a1d5ee41f0504812d82c0451852))

## [9.2.1](https://github.com/web3-storage/w3up/compare/capabilities-v9.2.0...capabilities-v9.2.1) (2023-08-30)


### Bug Fixes

* w3filecoin spec separate capabilities to queue and enqueue ([#856](https://github.com/web3-storage/w3up/issues/856)) ([6bf9142](https://github.com/web3-storage/w3up/commit/6bf9142636fa65367faed8414c50beb9c1791726)), closes [#855](https://github.com/web3-storage/w3up/issues/855)

## [9.2.0](https://github.com/web3-storage/w3up/compare/capabilities-v9.1.0...capabilities-v9.2.0) (2023-08-22)


### Features

* change "total" to "limit" ([#867](https://github.com/web3-storage/w3up/issues/867)) ([8295070](https://github.com/web3-storage/w3up/commit/8295070c8fbbc508da2cfe6f32846090a530f282))

## [9.1.0](https://github.com/web3-storage/w3up/compare/capabilities-v9.0.1...capabilities-v9.1.0) (2023-08-22)


### Features

* add subscriptions to CustomerGetSuccess ([#863](https://github.com/web3-storage/w3up/issues/863)) ([dd2e77c](https://github.com/web3-storage/w3up/commit/dd2e77c51d84a517cb50ff05199b8eebf9223bf2))

## [9.0.1](https://github.com/web3-storage/w3up/compare/capabilities-v9.0.0...capabilities-v9.0.1) (2023-08-10)


### Bug Fixes

* upgrade data segment ([#850](https://github.com/web3-storage/w3up/issues/850)) ([fba281f](https://github.com/web3-storage/w3up/commit/fba281f8cd3ce2a0a00ffd50a4a73d7701b489ce))

## [9.0.0](https://github.com/web3-storage/w3up/compare/capabilities-v8.0.0...capabilities-v9.0.0) (2023-08-09)


### ⚠ BREAKING CHANGES

* introduce new administrative capabilities ([#832](https://github.com/web3-storage/w3up/issues/832))

### Features

* introduce new administrative capabilities ([#832](https://github.com/web3-storage/w3up/issues/832)) ([7b8037a](https://github.com/web3-storage/w3up/commit/7b8037a6ab92f830af4aa7ba07a91bc2a20c0d8c))

## [8.0.0](https://github.com/web3-storage/w3up/compare/capabilities-v7.0.0...capabilities-v8.0.0) (2023-08-09)


### ⚠ BREAKING CHANGES

* update aggregation capabilitites to use height instead of size together with client and api ([#831](https://github.com/web3-storage/w3up/issues/831))

### Features

* w3filecoin new client and api ([#848](https://github.com/web3-storage/w3up/issues/848)) ([7a58fbe](https://github.com/web3-storage/w3up/commit/7a58fbe8f6c6fbe98e700b7affd5825ddccf6547))


### Bug Fixes

* update aggregation capabilitites to use height instead of size together with client and api ([#831](https://github.com/web3-storage/w3up/issues/831)) ([31730f0](https://github.com/web3-storage/w3up/commit/31730f0cb37b16f12f778ee8d2ecb5693bb2cd23))

## [7.0.0](https://github.com/web3-storage/w3up/compare/capabilities-v6.0.1...capabilities-v7.0.0) (2023-07-06)


### ⚠ BREAKING CHANGES

* aggregate capabilities now have different nb properties and aggregate client api was simplified

### Bug Fixes

* update aggregate spec in client and api ([#824](https://github.com/web3-storage/w3up/issues/824)) ([ebefd88](https://github.com/web3-storage/w3up/commit/ebefd889a028f325690370db8043c7b9e9fdf7bb))

## [6.0.1](https://github.com/web3-storage/w3up/compare/capabilities-v6.0.0...capabilities-v6.0.1) (2023-06-09)


### Bug Fixes

* specify module types in exports ([#814](https://github.com/web3-storage/w3up/issues/814)) ([d64f1b6](https://github.com/web3-storage/w3up/commit/d64f1b6b91c87287e04fabed384041e2dff0efca))

## [6.0.0](https://github.com/web3-storage/w3up/compare/capabilities-v5.0.1...capabilities-v6.0.0) (2023-06-07)


### ⚠ BREAKING CHANGES

* merge `@web3-storage/access-api` into `@web3-storage/upload-api` ([#790](https://github.com/web3-storage/w3up/issues/790))

### Features

* merge `@web3-storage/access-api` into `@web3-storage/upload-api` ([#790](https://github.com/web3-storage/w3up/issues/790)) ([4f6ddb6](https://github.com/web3-storage/w3up/commit/4f6ddb690c365a42a3dc4c5c6898e4999bd0f868))
* w3 aggregate protocol client and api implementation ([#787](https://github.com/web3-storage/w3up/issues/787)) ([b58069d](https://github.com/web3-storage/w3up/commit/b58069d7960efe09283f3b23fed77515b62d4639))

## [5.0.1](https://github.com/web3-storage/w3up/compare/capabilities-v5.0.0...capabilities-v5.0.1) (2023-05-23)


### Bug Fixes

* upgrade remaining ucanto deps ([#798](https://github.com/web3-storage/w3up/issues/798)) ([7211501](https://github.com/web3-storage/w3up/commit/72115010663a62140127cdeed21f2dc37f59da08))
* upgrade ucanto to 8 ([#794](https://github.com/web3-storage/w3up/issues/794)) ([00b011d](https://github.com/web3-storage/w3up/commit/00b011d87f628d4b3040398ca6cba567a69713ff))

## [5.0.0](https://github.com/web3-storage/w3up/compare/capabilities-v4.0.1...capabilities-v5.0.0) (2023-05-02)


### ⚠ BREAKING CHANGES

* upgrade to ucanto7.x.x ([#774](https://github.com/web3-storage/w3up/issues/774))

### Features

* upgrade to ucanto7.x.x ([#774](https://github.com/web3-storage/w3up/issues/774)) ([0cc6e66](https://github.com/web3-storage/w3up/commit/0cc6e66a80476e05c75bea94c1bee9bd12cbacf5))

## [4.0.1](https://github.com/web3-storage/w3protocol/compare/capabilities-v4.0.0...capabilities-v4.0.1) (2023-03-27)


### Features

* allow multiple providers ([#595](https://github.com/web3-storage/w3protocol/issues/595)) ([96c5a2e](https://github.com/web3-storage/w3protocol/commit/96c5a2e5a03432d8483d044ae10f6f3e03c2710c))


### Miscellaneous Chores

* **access-client:** release 11.0.0-rc.0 ([#573](https://github.com/web3-storage/w3protocol/issues/573)) ([be4386d](https://github.com/web3-storage/w3protocol/commit/be4386d66ceea393f289adb3c79273c250542807))

## [4.0.0](https://github.com/web3-storage/w3protocol/compare/capabilities-v3.2.0...capabilities-v4.0.0) (2023-03-17)


### ⚠ BREAKING CHANGES

* implement new account-based multi-device flow ([#433](https://github.com/web3-storage/w3protocol/issues/433))

### Features

* define `access/confirm` handler and use it in ucanto-test-utils registerSpaces + validate-email handler ([#530](https://github.com/web3-storage/w3protocol/issues/530)) ([b1bbc90](https://github.com/web3-storage/w3protocol/commit/b1bbc907c96cfc7788f50fb0c154d9b54894e03e))
* implement new account-based multi-device flow ([#433](https://github.com/web3-storage/w3protocol/issues/433)) ([1ddc6a0](https://github.com/web3-storage/w3protocol/commit/1ddc6a0c53f8cdb6837a315d8aaf567100dfb8d7))
* provision provider type is now the DID of the w3s service ([#528](https://github.com/web3-storage/w3protocol/issues/528)) ([6a72855](https://github.com/web3-storage/w3protocol/commit/6a72855db4d6e838e9948f3951fdb5ef324eec95))

## [3.2.0](https://github.com/web3-storage/w3protocol/compare/capabilities-v3.1.0...capabilities-v3.2.0) (2023-03-08)


### Features

* upgrade to new ucanto ([#498](https://github.com/web3-storage/w3protocol/issues/498)) ([dcb41a9](https://github.com/web3-storage/w3protocol/commit/dcb41a9981c2b6bebbdbd29debcad9f510383680))

## [3.1.0](https://github.com/web3-storage/w3protocol/compare/capabilities-v3.0.0...capabilities-v3.1.0) (2023-03-04)


### Features

* access-api handles provider/add invocations ([#462](https://github.com/web3-storage/w3protocol/issues/462)) ([5fb56f7](https://github.com/web3-storage/w3protocol/commit/5fb56f794529f3d4de2b4597c47503002767fabb))
* includes proofs chains in the delegated authorization chain ([#467](https://github.com/web3-storage/w3protocol/issues/467)) ([5144293](https://github.com/web3-storage/w3protocol/commit/5144293deabd9d5380448ae288e089ef2652def7))

## [3.0.0](https://github.com/web3-storage/w3protocol/compare/capabilities-v2.3.0...capabilities-v3.0.0) (2023-03-01)


### ⚠ BREAKING CHANGES

* upgrade capabilities to latest ucanto ([#463](https://github.com/web3-storage/w3protocol/issues/463))

### Features

* handle access/delegate invocations without error ([#427](https://github.com/web3-storage/w3protocol/issues/427)) ([4f0bd1c](https://github.com/web3-storage/w3protocol/commit/4f0bd1c1cd3cfb1c848892ad418c6d7b2197045a))
* upgrade capabilities to latest ucanto ([#463](https://github.com/web3-storage/w3protocol/issues/463)) ([2d786ee](https://github.com/web3-storage/w3protocol/commit/2d786ee81a6eb72c4782548ad3e3796fe3947fa5))


### Bug Fixes

* allow injecting email ([#466](https://github.com/web3-storage/w3protocol/issues/466)) ([e19847f](https://github.com/web3-storage/w3protocol/commit/e19847fef804fed33f709ec8b78640fff21ca01e))

## [2.3.0](https://github.com/web3-storage/w3protocol/compare/capabilities-v2.2.0...capabilities-v2.3.0) (2023-02-10)


### Features

* add `pre` caveat to `store/list` and `upload/list` ([#423](https://github.com/web3-storage/w3protocol/issues/423)) ([a0f6d28](https://github.com/web3-storage/w3protocol/commit/a0f6d2834b900c4522fe71da473e4b43760502fd))
* add access/delegate capability parser exported from @web3-storage/capabilities ([#420](https://github.com/web3-storage/w3protocol/issues/420)) ([e8e2b1a](https://github.com/web3-storage/w3protocol/commit/e8e2b1a7606ce82bc346517d875de5244d240229))
* add support for access/authorize and update ([#392](https://github.com/web3-storage/w3protocol/issues/392)) ([9c8ca0b](https://github.com/web3-storage/w3protocol/commit/9c8ca0b385c940c8f0c21ee9edde093d2dcab8b8)), closes [#386](https://github.com/web3-storage/w3protocol/issues/386)
* define access/claim in @web3-storage/capabilities ([#409](https://github.com/web3-storage/w3protocol/issues/409)) ([4d72ba3](https://github.com/web3-storage/w3protocol/commit/4d72ba3a1ce2564cda13c62137967613b18334a7))

## [2.2.0](https://github.com/web3-storage/w3protocol/compare/capabilities-v2.1.0...capabilities-v2.2.0) (2023-01-30)


### Features

* access-api forwards store/ and upload/ invocations to upload-api ([#334](https://github.com/web3-storage/w3protocol/issues/334)) ([b773376](https://github.com/web3-storage/w3protocol/commit/b77337692d9e4580031c429c429d4055d6f6ebff))
* **capabilities:** implement access/authorize and ./update caps ([#387](https://github.com/web3-storage/w3protocol/issues/387)) ([4242ce0](https://github.com/web3-storage/w3protocol/commit/4242ce046b8e95c43dbf33a139bb98b682eeb198)), closes [#385](https://github.com/web3-storage/w3protocol/issues/385)
* embedded key resolution ([#312](https://github.com/web3-storage/w3protocol/issues/312)) ([4da91d5](https://github.com/web3-storage/w3protocol/commit/4da91d5f7f798d0d46c4df2aaf224610a8760d9e))
* update @ucanto/* to ~4.2.3 ([#405](https://github.com/web3-storage/w3protocol/issues/405)) ([50c0c80](https://github.com/web3-storage/w3protocol/commit/50c0c80789c26b777e854b7208b7391499d2ef18))
* update access-api ucanto proxy to not need a signer ([#390](https://github.com/web3-storage/w3protocol/issues/390)) ([71cbeb7](https://github.com/web3-storage/w3protocol/commit/71cbeb718d0a5132b97efa1173a5aaf9c75cbe80))


### Bug Fixes

* fix client cli service did resolve ([#292](https://github.com/web3-storage/w3protocol/issues/292)) ([6be9608](https://github.com/web3-storage/w3protocol/commit/6be9608a907665a8123938ef804bebfffc5c7232))

## [2.1.0](https://github.com/web3-storage/w3protocol/compare/capabilities-v2.0.0...capabilities-v2.1.0) (2022-12-13)


### Features

* sync encode/decode delegations ([#276](https://github.com/web3-storage/w3protocol/issues/276)) ([ab981fb](https://github.com/web3-storage/w3protocol/commit/ab981fb6e33799153022c0f6d06c282917e7af7c))


### Bug Fixes

* make d1 spaces.metadata nullable and change to kysely ([#284](https://github.com/web3-storage/w3protocol/issues/284)) ([c8a9ce5](https://github.com/web3-storage/w3protocol/commit/c8a9ce544226b3c8456d45b15e29cec84894aeb8)), closes [#280](https://github.com/web3-storage/w3protocol/issues/280)

## [2.0.0](https://github.com/web3-storage/w3protocol/compare/capabilities-v1.0.0...capabilities-v2.0.0) (2022-12-07)


### ⚠ BREAKING CHANGES

* upgrade access-api @ucanto/* and @ipld/dag-ucan major versions ([#246](https://github.com/web3-storage/w3protocol/issues/246))
* upgrade to `@ucanto/{interface,principal}`@^4.0.0 ([#238](https://github.com/web3-storage/w3protocol/issues/238))
* follow up on the capabilities extract ([#239](https://github.com/web3-storage/w3protocol/issues/239))

### Features

* **access-client:** cli and recover ([#207](https://github.com/web3-storage/w3protocol/issues/207)) ([adb3a8d](https://github.com/web3-storage/w3protocol/commit/adb3a8d61d42b31f106e86b95faa3e442f5dc2c7))
* follow up on the capabilities extract ([#239](https://github.com/web3-storage/w3protocol/issues/239)) ([ef5e779](https://github.com/web3-storage/w3protocol/commit/ef5e77922b67155f0c3e5cb37c12e32f9a56cce1))
* Revert "feat!: upgrade to `@ucanto/{interface,principal}`@^4.0.0" ([#245](https://github.com/web3-storage/w3protocol/issues/245)) ([c182bbe](https://github.com/web3-storage/w3protocol/commit/c182bbe5e8c5a7d5c74b10cbf4b7a45b51e9b184))
* upgrade access-api @ucanto/* and @ipld/dag-ucan major versions ([#246](https://github.com/web3-storage/w3protocol/issues/246)) ([5e663d1](https://github.com/web3-storage/w3protocol/commit/5e663d12ccea7d21cc8e7c36869f144a08eaa1b0))
* upgrade to `@ucanto/{interface,principal}`@^4.0.0 ([#238](https://github.com/web3-storage/w3protocol/issues/238)) ([2f3bab8](https://github.com/web3-storage/w3protocol/commit/2f3bab8924fe7f34a5db64d2521730fc85739d3a))


### Bug Fixes

* fix Access API cannot get space/info [#243](https://github.com/web3-storage/w3protocol/issues/243) ([#255](https://github.com/web3-storage/w3protocol/issues/255)) ([1bacd54](https://github.com/web3-storage/w3protocol/commit/1bacd544da803c43cf85043ecdada4dee2b3e2d3))
* generated typdefs ([#258](https://github.com/web3-storage/w3protocol/issues/258)) ([2af1b76](https://github.com/web3-storage/w3protocol/commit/2af1b76057476d2510d98a0b99a95f820cf4d344))

## 1.0.0 (2022-12-01)


### Bug Fixes

* add exports to packages/capabilities/readme.md, add workflow to check for conventional-commits names in PRs ([#233](https://github.com/web3-storage/w3protocol/issues/233)) ([da63284](https://github.com/web3-storage/w3protocol/commit/da6328467a198e3197bf20219aa2fa3bbe047d65))
