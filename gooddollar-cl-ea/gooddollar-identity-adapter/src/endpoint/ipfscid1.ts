import { Requester, Validator } from '@chainlink/external-adapter'
import { ExecuteWithConfig, Config } from '@chainlink/types'
import * as fs from 'fs'

//import { NAME as AdapterName } from '../config'

export const NAME = 'ipfscid1' // This should be filled in with a lowercase name corresponding to the API endpoint

const customParams = {}

export const execute: ExecuteWithConfig<Config> = async (request, config) => {
  const validator = new Validator(request, customParams)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id

  const cid: string = fs.readFileSync('CID.txt').toString().replace('"', '').replace('"', '')

  //'bafkreibpjfb52jogprvsjydbyncqbazpcd376r46x6znlzknhzkqkb5pba';

  let bytesArray: number[] = []

  for (let i = 0; i < 32; ++i) {
    if (i < 18) {
      bytesArray = bytesArray.concat(0)
    } else {
      const code = cid.charCodeAt(i - 18)
      bytesArray = bytesArray.concat([code])
    }
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
