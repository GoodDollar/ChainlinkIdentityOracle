import { Requester, Validator } from '@chainlink/external-adapter'
import { ExecuteWithConfig, Config } from '@chainlink/types'
import * as fs from 'fs'

//import { NAME as AdapterName } from '../config'

export const NAME = 'ipfscid2' // This should be filled in with a lowercase name corresponding to the API endpoint

const customParams = {}

export const execute: ExecuteWithConfig<Config> = async (request, config) => {
  const validator = new Validator(request, customParams)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id

  //const result = `0x637162617a70636433373672343678367a6e6c7a6b6e687a6b716b6235706261`
  const cid: string = fs.readFileSync('CID.txt').toString().replace('"', '').replace('"', '')

  let bytesArray: number[] = []

  for (let i = 14; i < 46; ++i) {
    const code = cid.charCodeAt(i)
    bytesArray = bytesArray.concat([code])
  }

  const result =
    '0x' +
    bytesArray
      .map((v) => {
        return v.toString(16).padStart(2, '0')
      })
      .join('')

  return Requester.success(jobRunID, {
    data: config.verbose ? { result } : { result },
    result,
    status: 200,
  })
}
