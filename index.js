const cosine = require('compute-cosine-similarity')
const stdev = require('compute-stdev')
const computeMean = require('compute-mean')

module.exports = function TopicTiler (input, options) {
  var windowSize = options.windowSize || 10
  var topicWordMap = options.topicWordMap || {}
  var rich = options.rich != null ? options.rich : true
  var smoothing = options.smoothing || 0.0
  var sentences = input.replace('\\n', ' ').trim() //todo: put nlp-compromise up in here
  .split(/[?\.!]/)
  .map((ea) => ea.trim())
  .filter(function (ea) { return ea })

  var blocks = sentences.reduce(function (arr, cur, i, all) {
    if (i <= windowSize) {
      return arr
    }
    arr.push(all.filter(function (each, j) {
      return j < i + windowSize && j > i - windowSize
    }).join('. '))

    return arr
  }, [])

  function scoreText (text) {
    function pairedDifferences (prev, current, i, arr) {
      if (!arr[i + 1]) {
        return prev
      }
      return prev.concat([[current, arr[i + 1]]])
    }

    function scoreBlocks (string) {
      var words = string.trim().split(/[ ;,\n]/)
      var arr = []
      while (arr.length < 500) {
        arr.push(0)
      }
      return words.reduce(function (prev, ea) {
        var clean = ea.toLowerCase().replace(/[\.“]/gi, '').trim()
        if (topicWordMap[clean] && topicWordMap[clean] instanceof Array) {
          var max = {value: 0}
          topicWordMap[clean].forEach(function (ea) {
            prev[ea.category] = prev[ea.category] > ea.value ? prev[ea.category] : ea.value

            if (!rich) {
              // Rich=True, use only the highest category value. This matches behavior of the paper.
              if (max.value < ea.value) {
                max = ea
              }
            }
          })

          if (rich) {
            prev[max.category] = 1
          }
        }
        return prev
      }, arr)
    }

    function mapArrToArgs (fn) {
      return function (arr, i, array) {
        var result = fn.apply(this, arr)
        return result
      }
    }

    return blocks.map(scoreBlocks).reduce(pairedDifferences, []).map(mapArrToArgs(cosine))
  }

  function findBoundaries (text) {
    var scored = scoreText(text)

    function smooth (values, smoothing) {
      var value = values[0]
      for (var i = 1; i < values.length; i++) {
        var currentValue = values[i]
        value += (currentValue - value) * smoothing
        values[i] = value
      }
      return values
    }

    function getDepthScore (location) {
      var highLeft = findPeak(location, -1, scored)
      var highRight = findPeak(location, 1, scored)
      var depth = ((highLeft - scored[location]) + (highRight - scored[location])) / 2
      return depth
    }

    function findPeak (location, direction, arr) {
      var maxValue = 0
      var newValue = 0
      var nextIndex

      for (var steps = 1; arr[location + (steps * direction)]; steps++) {
        nextIndex = location + (steps * direction)
        if (arr[nextIndex] != null) {
          newValue = arr[nextIndex]
        } else {
          return maxValue
        }
        if (newValue > maxValue) {
          maxValue = newValue
        } else {
          return maxValue
        }
      }
      return maxValue
    }

    function isBoundary (depth, location) {
      if (depth > findPeak(location, -1, depths) && depth > findPeak(location, 1, depths)) {
        //TODO: Make the following parameterized so that users can emulate the behavior of the algorithm described in the paper.
        if (stdeviation > mean) {
          return depth > (mean + stdeviation) 
        } else {
          return depth > (mean - stdeviation)
        }
      }
    }

    var depths = scored.map(function (ea, i) { return getDepthScore(i) })

    if (smoothing > 0.0) {
      depths = smooth(depths, smoothing)
    }

    var mean = computeMean(depths.filter(function (ea) { return ea > 0 }))
    var stdeviation = stdev(depths.filter(function (ea) { return ea > 0 }))

    var boundaries = depths.reduce(function (arr, cur, i) {
      var last = arr.length - 1
      var previousCur = arr[last] && arr[last].value
      if (isBoundary(cur, i)) {
        if (arr[last] && cur > previousCur && arr[last].location > i - (windowSize / 2) && arr[last].location < i + (windowSize / 2)) {
          arr[arr.length - 1] = {location: i, value: cur}
        } else if (arr[last] && cur < previousCur && arr[last].location > i - (windowSize / 2) && arr[last].location < i + (windowSize / 2)) {
          return arr
        } else {
          arr.push({location: i, value: cur})
        }
      }
      return arr
    }, [])

    return boundaries.map(function (ea, i, arr) {
      var chunk = '\n'
      var boundary = ea.location
      if (i === 0) {
        chunk += sentences.slice(0, boundary).join(' ')
      } else if (i === arr.length - 1) {
        chunk += sentences.slice(boundary, sentences.length).join(' ')
      } else {
        chunk += sentences.slice(boundary, arr[i + 1].location).join(' ')
      }
      return chunk
    })
  }

  return findBoundaries(input)
}
