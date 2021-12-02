import { ethers } from 'ethers'
import { Requester, Validator } from '@chainlink/external-adapter'
import { ExecuteWithConfig, Config } from '@chainlink/types'
import * as faunadb from 'faunadb'
import { config } from 'dotenv'
config()

//import { NAME as AdapterName } from '../config'

export const NAME = 'getstatehashipfscid' // This should be filled in with a lowercase name corresponding to the API endpoint

const customParams = {}

export const execute: ExecuteWithConfig<Config> = async (request, config) => {
  const validator = new Validator(request, customParams)
  if (validator.error) throw validator.error

  const jobRunID = validator.validated.id

  const faunadbApiSecret =
    process.env.FAUNADB_API_SECRET != undefined ? process.env.FAUNADB_API_SECRET : ''
  const faunadbClient = new faunadb.Client({ secret: faunadbApiSecret })
  const query = faunadb.query
  type faunadbType = {
    [data: string]: { treeIPFSHash: string; merkleRootHash: string }
  }
  const resultQuery: faunadbType = await faunadbClient.query(
    query.Get(query.Ref(query.Collection('IPFS'), '1')),
  )

  console.log(resultQuery.data.treeIPFSHash)
  console.log(resultQuery.data.merkleRootHash)

  const cid: string = resultQuery.data.treeIPFSHash.toString().replace('"', '').replace('"', '')
  const statehash: string =
    '0x' + resultQuery.data.merkleRootHash.toString().replace('"', '').replace('"', '')

  const result = ethers.utils.defaultAbiCoder.encode(['bytes32', 'string'], [statehash, cid])

  return Requester.success(jobRunID, {
    data: config.verbose ? { result } : { result },
    result,
    status: 200,
  })
}
