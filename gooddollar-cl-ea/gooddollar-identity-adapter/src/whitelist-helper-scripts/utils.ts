import * as fs from 'fs'
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async function saveToFile({
  _filename,
  _content,
}: {
  _filename: string
  _content: object
}) {
  fs.writeFileSync(_filename, JSON.stringify(_content))
}
