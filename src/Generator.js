import _ from 'lodash'
import Mustache from 'mustache'

function NameGenerator (source) {
  function getSourceName () {
    return source.name
  }

  function getRecipe (key) {
    return source.recipes[key]
  }

  function getRecipeDisplay (key) {
    return source.recipes[key].display
  }

  function getVariant (key) {
    return source.recipes[key]
  }

  function getDefaultRecipeKey () {
    if (source.recipeOrder) {
      return source.recipeOrder[0]
    }

    if (source.recipes.base) {
      return 'base'
    }

    return Object.keys(source.recipes)[0]
  }

  function getDefaultVariantKey (recipeKey) {
    const recipe = getRecipe(recipeKey)

    if (recipe.variantOrder) {
      return recipe.variantOrder[0]
    }

    if (recipe.variants.base) {
      return 'base'
    }

    return Object.keys(recipe.variants)[0]
  }

  function getDefaultKeys () {
    const recipeKey = getDefaultRecipeKey()

    return {
      recipeKey: recipeKey,
      variantKey: getDefaultVariantKey(recipeKey)
    }
  }

  function recipesForDisplay () {
    return Object.keys(source.recipes).reduce((acc, key) => {
      const recipe = getRecipe(key)
      if (recipe.display !== false) {
        acc.push({ key, display: recipe.display })
      }

      return acc
    }, [])
  }

  function variantsForRecipe (recipe) {
    const variants = getRecipe(recipe).variants
    return Object.keys(variants).reduce((acc, key) => {
      const variant = variants[key]
      if (variant.display !== false) {
        acc.push({ key, display: variant.display })
      }

      return acc
    }, [])
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
    getDefaultKeys,
    getDefaultRecipeKey,
    getDefaultVariantKey,
    recipesForDisplay,
    variantsForRecipe,
    makeName,
    makeNames
  }
}

export default NameGenerator
