const fs = require('fs')
const path = require('path')
/*
  Converts Mallet's sparse word weights into a structure easier to work with for the topic tiler.
  Expects data in the form:
  <id> <word> <topic>:<count>
  0 site 247:811 90:605 175:444 62:246 87:231 11:209 227:162 288:156 153:129 96:120 145:96 294:83 18:72 275:63 179:58 165:54 242:53 193:51 69:48 59:42 250:40 295:39 269:38 4:36 51:28 217:27 129:27 0:27 206:26 255:25 124:25 19:24 122:23 222:20 229:18 192:17 23:16 115:15 259:12 180:11 245:10 223:10 265:7 176:4 65:4 8:3 118:1 20:1 238:1 48:1

*/
module.exports = function readSparseWordWeights (filePath) {
  //TODO: Swap this out for a stream, there isn't any need to pull it all into memory.
  return fs.readFileSync(path.resolve(filePath), 'utf8').split('\n').reduce(function (obj, str, i, arr) {
    var data = str.split(' ')
    var topics = data.map(function (ea, i) {
      if (i > 2) {
        var values = ea.split(':')
        return { value: values[1],
          category: values[0] }
      }
    }).filter(function (ea) { return ea })
    var word = data[1]
    obj[word] = topics
    return obj
  }, {})
}
