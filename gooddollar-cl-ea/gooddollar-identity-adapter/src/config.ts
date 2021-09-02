import { Requester } from '@chainlink/external-adapter'
import { Config } from '@chainlink/types'

export const NAME = 'GOODDOLLARIDENTITY' // This should be filled in with a name corresponding to the data provider using UPPERCASE and _underscores_.

export const DEFAULT_ENDPOINT = 'ipfscid'
export const DEFAULT_BASE_URL = '' //'http://localhost:18081'

export const makeConfig = (prefix?: string): Config => {
  const config = Requester.getDefaultConfig(prefix)
  config.api.baseURL = config.api.baseURL || DEFAULT_BASE_URL
  return config
}
