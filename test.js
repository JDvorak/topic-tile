const test = require('tape')
const topicTile = require('./')

test('should assert input types', function (t) {
  t.plan(1)
  t.throws(topicTile)
})
