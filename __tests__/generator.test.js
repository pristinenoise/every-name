import _ from 'lodash'

import Generator from '../src/Generator'

import boringNames from './data/boring_names.json'

describe('Generator', () => {
  let generator
  const mockShuffle = jest.fn(a => _.reverse(a))

  // This, instead of randomizing each array, just reverses the array
  // for purposes of picking ingredients This means for testing, you
  // should expect each element to be picked in reverse order, until there is only
  // one element left. It will skip that element, and return to the bottom.

  beforeEach(() => {
    _.shuffle = mockShuffle
    generator = Generator(boringNames)
  })

  it('can be initialized with a given source', () => {
    expect(generator.getSourceName()).toBe('Boring American Names')
  })

  it('can make a list of the recipes for display', () => {
    expect(generator.recipesForDisplay()).toEqual(['full_name', 'double_first_name', 'first_name', 'last_name'])
  })

  it('can generate an ingredient from a simple text-only recipe', () => {
    const ingredients = boringNames.recipes.first_name.ingredients
    for (let i = 0; i < 100; i += 1) {
      expect(ingredients).toContain(generator.makeName('first_name'))
    }
  })

  it('can use generate more items than there are ingredients', () => {
    const names = generator.makeNames('first_name', 5)

    expect(names).toEqual(['Dave', 'Charles', 'Bob', 'Dave', 'Charles'])
  })

  it('can generate multiple names on the same line', () => {
    const names = generator.makeName('double_first_name', 1)

    expect(names).toEqual('Dave Charles')
  })

  it('can use a stub to generate items', () => {
    const name1 = generator.makeName('first_name')
    const name2 = generator.makeName('first_name')

    expect(name1).toEqual('Dave')
    expect(name2).toEqual('Charles')
  })

  it('can generate a complex item', () => {
    const fullName = generator.makeName('full_name')

    expect(fullName).toEqual('Dave Williams III')
  })
})
