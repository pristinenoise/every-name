import _ from 'lodash'
import Mustache from 'mustache'

function NameGenerator(source) {
  function getSourceName() {
    return source.name
  }

  function getRecipe(key) {
    return source.recipes[key]
  }

  function recipesForDisplay() {
    return Object.keys(source.recipes).filter(key => (getRecipe(key).display !== false))
  }

  // keeps a shuffled list of ingredients so we don't get too many duplicates.
  const ingredients = {}

  function fetchIngredient(key) {
    if (!ingredients[key] || ingredients[key].length <= 1) {
      ingredients[key] = _.shuffle(_.clone(getRecipe(key).ingredients))
    }

    return ingredients[key].shift()
  }

  function makeName(key) {
    if (getRecipe(key).only_text) {
      return fetchIngredient(key)
    }

    return Mustache.render(fetchIngredient(key), recipeFunctionList())
  }

  function makeNames(key, count) {
    return _.times(count, () => makeName(key))
  }

  function recipeFunctionList() {
    return Object.keys(source.recipes).reduce((acc, key) => {
      Object.assign(acc, { [key]: () => makeName(key) })
      return acc
    }, {})
  }

  return {
    getRecipe,
    getSourceName,
    recipesForDisplay,
    makeName,
    makeNames,
  }
}

export default NameGenerator
