/// <reference pah="../typings/jasmine/jasmine.d.ts" />

describe('math.add test', function() {
  it('1 + 1', function() {
      expect(add(1, 1)).toEqual(2);
  })
})