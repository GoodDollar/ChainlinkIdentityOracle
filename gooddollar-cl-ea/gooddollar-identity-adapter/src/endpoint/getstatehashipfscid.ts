import { ethers } from 'ethers'
import { Requester, Validator } from '@chainlink/external-adapter'
import { ExecuteWithConfig, Config } from '@chainlink/types'
import * as fs from 'fs'

//import { NAME as AdapterName } from '../config'

export const NAME = 'getstatehashipfscid' // This should be filled in with a lowercase name corresponding to the API endpoint

const customParams = {}

export const execute: ExecuteWithConfig<Config> = async (request, config) => {
  const validator = new Validator(request, customParams)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id

  //const result = `0x637162617a70636433373672343678367a6e6c7a6b6e687a6b716b6235706261`
  const cid: string = fs.readFileSync('CID.txt').toString().replace('"', '').replace('"', '')
  const statehash: string =
    '0x' + fs.readFileSync('merkleRoot.txt').toString().replace('"', '').replace('"', '')

  const result = ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [statehash, cid])

  return Requester.success(jobRunID, {
    data: config.verbose ? { result } : { result },
    result,
    status: 200,
  })
}
