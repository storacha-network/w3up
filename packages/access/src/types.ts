/* eslint-disable @typescript-eslint/indent */
import type {
  Capabilities,
  Failure,
  Phantom,
  RequestEncoder,
  ResponseDecoder,
  ServiceMethod,
} from '@ucanto/interface'

import type {
  IdentityIdentify,
  IdentityRegister,
  IdentityValidate,
  UploadAdd,
  UploadList,
  UploadRemove,
} from './capabilities/types'
import { VoucherClaim, VoucherRedeem } from './capabilities/types.js'

export * from './capabilities/types.js'

export interface ClientCodec extends RequestEncoder, ResponseDecoder {}

export type EncodedDelegation<C extends Capabilities = Capabilities> = string &
  Phantom<C>

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
  voucher: {
    claim: ServiceMethod<
      VoucherClaim,
      EncodedDelegation<[VoucherRedeem]> | undefined,
      Failure
    >
    redeem: ServiceMethod<VoucherRedeem, void, Failure>
  }
}

export interface AgentMeta {
  name: string
  description?: string
  url?: URL
  image?: URL
  type: 'device' | 'app' | 'service'
}
