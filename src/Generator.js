import _ from 'lodash'
import Mustache from 'mustache'

function NameGenerator (source) {
  function getSourceName () {
    return source.name
  }

  function getRecipe (key) {
    return source.recipes[key]
  }

  function recipesForDisplay () {
    return Object.keys(source.recipes).filter(key => (getRecipe(key).display !== false))
  }

  // keeps a shuffled list of ingredients so we don't get too many duplicates.
  const cachedIngredients = {}
  const cachedIngredientsThreshold = []

  // this function is a bit complicated because we support two different formats
  // one with variants
  function fetchIngredient (key) {
    const cache = cachedIngredients[key]
    if (cache && cache.length > cachedIngredientsThreshold[key]) {
      return cache.shift()
    }

    const m = key.match(/(.+)\$(.+)/)

    let keyName = key
    let variant = 'base'

    if (m) {
      keyName = m[1]
      variant = m[2]
    }

    const recipe = getRecipe(keyName)

    const ingredients = recipe.variants[variant].ingredients

    if (!ingredients) {
      throw (new Error(`Ingredient specified by key ${key} not found!`))
    }

    cachedIngredients[key] = _.shuffle(_.clone(ingredients))
    cachedIngredientsThreshold[key] = ingredients.length >= 5 ? 1 : 0

    return cachedIngredients[key].shift()
  }

  function makeName (key) {
    return Mustache.render(fetchIngredient(key), recipeFunctionList())
  }

  function makeNames (key, count) {
    return _.times(count, () => makeName(key))
  }

  let cachedRecipeFunctionList

  function recipeFunctionList () {
    if (cachedRecipeFunctionList) {
      return cachedRecipeFunctionList
    }

    const list = {}

    Object.keys(source.recipes).forEach((key) => {
      const recipe = source.recipes[key]
      Object.keys(recipe.variants).forEach((variant) => {
        const keyName = `${key}$${variant}`
        const func = () => makeName(keyName)
        list[keyName] = func

        if (variant === 'base') {
          list[key] = func
        }
      })
    })

    cachedRecipeFunctionList = list

    return cachedRecipeFunctionList
  }

  return {
    getRecipe,
    getSourceName,
    recipesForDisplay,
    makeName,
    makeNames
  }
}

export default NameGenerator
