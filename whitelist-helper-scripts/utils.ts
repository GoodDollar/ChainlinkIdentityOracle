import * as fs from 'fs'

export default async function saveToFile({
  _filename,
  _content,
}: {
  _filename: string
  _content: object
}) {
  fs.writeFileSync(_filename, JSON.stringify(_content))
}
