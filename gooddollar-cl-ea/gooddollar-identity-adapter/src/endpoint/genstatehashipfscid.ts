import { Requester, Validator } from '@chainlink/external-adapter'
import { ExecuteWithConfig, Config } from '@chainlink/types'
import { genWhitelist } from './../whitelist-helper-scripts/genWhitelisted'

//import { NAME as AdapterName } from '../config'

export const NAME = 'genstatehashipfscid' // This should be filled in with a lowercase name corresponding to the API endpoint

//const customError = (data: any) => data.Response === 'Error'

const customParams = {}

export const execute: ExecuteWithConfig<Config> = async (request, config) => {
  const validator = new Validator(request, customParams)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id

  //const response = await Requester.request(options, customError)
  // Tree
  type Tree = {
    [key: string]: {
      hash: string
      lastAuth: number
    }
  }

  genWhitelist()

  const result = 'Ok'

  return Requester.success(jobRunID, {
    data: config.verbose ? { result } : { result },
    result,
    status: 200,
  })
}
