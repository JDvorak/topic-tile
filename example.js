const fs = require('fs')
const path = require('path')
const Tiler = require('./tiler.js')

var topicWords = require('./readMallet.js')('sparse-word-weights.txt')

fs.readdir(path.resolve('data/full/'), function (err, files) {
  if (err) return console.log(err)
  var numbers = {}
  files.forEach(function (file, idx) {
    var writeName = file.match(/^\-[a-zA-Z0-9]+\-/i)
    numbers[writeName] = numbers[writeName] || 0
    if (writeName !== null) {
      var string = fs.readFileSync('data/full/' + file, 'utf8')
      Tiler(string, {topicWordMap: topicWords}).forEach(function (ea, i) {
        numbers[writeName]++
        fs.writeFileSync(`data/slices/${writeName}-${numbers[writeName]}.txt`, ea)
      })
    }
  })
})
