# topic-tile [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5] [![test coverage][6]][7]
[![downloads][8]][9] [![js-standard-style][10]][11]

Implementation of a string segmentation algorithm based on topic model word-weights.

This is a variation on [Martin Riedl and Chris Biemann's Topic Tiling](https://ai2-s2-pdfs.s3.amazonaws.com/8ab0/c46b9b6cab8754ac7a130b822bad8e961b6f.pdf) algorithm. With smoothing, adjustable window size, and, unlike the original, all categories are used to determine similarity between windows, not merely the top most category. 

## Usage
```js
const fs = require('fs')
const path = require('path')
const Tiler = require('./tiler.js')

var topicWords = require('./readMallet.js')('sparse-word-weights.txt')

fs.readdir(path.resolve('stories/'), function (err, files) {
  if (err) return console.log(err)
  var numbers = {}

  /*
    Read all stories, run tiler on each
  */
  files.forEach(function (file, idx) {
    var storyName = file.match(/^\-[a-zA-Z0-9]+\-/i)
    numbers[storyName] = numbers[storyName] || 0
    if (storyName !== null) {
      var string = fs.readFileSync('stories/' + file, 'utf8')
      Tiler(string, {topicWordMap: topicWords}).forEach(function (ea, i) {
        numbers[storyName]++
        /*
          Slice each story into scenes and write each scene in a new file.
        */
        fs.writeFileSync(`scenes/${storyName}-${numbers[storyName]}.txt`, ea)
      })
    }
  })
})

```

## API
### topicTile

## Installation
```sh
$ npm install topic-tile
```

## TODO
* Tests!!!
* Document parameters

## Acknowledgments

This wouldn't have been implemented if not for the paper on [Topic Tiling](https://ai2-s2-pdfs.s3.amazonaws.com/8ab0/c46b9b6cab8754ac7a130b822bad8e961b6f.pdf)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/topic-tile.svg?style=flat-square
[3]: https://npmjs.org/package/topic-tile
[4]: https://img.shields.io/travis/JDvorak/topic-tile/master.svg?style=flat-square
[5]: https://travis-ci.org/JDvorak/topic-tile
[6]: https://img.shields.io/codecov/c/github/JDvorak/topic-tile/master.svg?style=flat-square
[7]: https://codecov.io/github/JDvorak/topic-tile
[8]: http://img.shields.io/npm/dm/topic-tile.svg?style=flat-square
[9]: https://npmjs.org/package/topic-tile
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
