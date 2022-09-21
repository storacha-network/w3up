/* eslint-disable @typescript-eslint/indent */
import type {
  Delegation,
  Fact,
  Proof,
  RequestEncoder,
  ResponseDecoder,
  ServiceMethod,
  SigningPrincipal,
  Principal,
} from '@ucanto/interface'

import * as UCAN from '@ipld/dag-ucan'
import type {
  IdentityIdentify,
  IdentityRegister,
  IdentityValidate,
} from './capabilities-types.js'

export * from './capabilities-types.js'

export interface ClientCodec extends RequestEncoder, ResponseDecoder {}

export interface Service {
  identity: {
    validate: ServiceMethod<
      IdentityValidate,
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
      { delegation: string } | void,
      never
    >
    register: ServiceMethod<IdentityRegister, void, never>
    identify: ServiceMethod<IdentityIdentify, string | undefined, never>
  }
}

export interface ValidateOptions {
  url?: URL
  audience?: Principal
  issuer: SigningPrincipal
  with?: UCAN.DID
  caveats: {
    as: `mailto:${string}`
  }
  lifetimeInSeconds?: number
  expiration?: number
  notBefore?: number

  nonce?: string

  facts?: Fact[]
  proofs?: Proof[]
}

export interface RegisterOptions {
  url?: URL
  audience?: Principal
  issuer: SigningPrincipal
  with?: `mailto:${string}`
  caveats?: {
    as: UCAN.DID
  }
  lifetimeInSeconds?: number
  expiration?: number
  notBefore?: number

  nonce?: string

  facts?: Fact[]
  proof: Delegation<[IdentityRegister]>
}

export interface IdentifyOptions {
  url?: URL
  audience?: Principal
  issuer: SigningPrincipal
  with?: `mailto:${string}`
  caveats?: {
    as: UCAN.DID
  }
  lifetimeInSeconds?: number
  expiration?: number
  notBefore?: number

  nonce?: string

  facts?: Fact[]
  proof?: Delegation<[IdentityIdentify]>
}

export interface PullRegisterOptions {
  url?: URL
  issuer: SigningPrincipal
  signal?: AbortSignal
}
