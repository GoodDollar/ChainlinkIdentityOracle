import * as fs from 'fs';
export default async function saveToFile(_filename: string, _content: object) {
    fs.writeFile(_filename, JSON.stringify(_content), function (err) {
      if (err) throw err;
        console.log('Saved!');
      });
}