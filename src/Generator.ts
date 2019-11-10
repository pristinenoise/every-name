import _ from "lodash";
import Mustache from "mustache";

export interface RecipeFunctionHash {
  [ingredientKey: string]: () => string;
}

export interface RecipeVariant {
  display: string;
  ingredients: string[];
}

export interface RecipeVariantHash {
  [variantName: string]: RecipeVariant;
}

export interface Recipe {
  display: string;
  description?: string;
  variantOrder?: string[];
  variants: RecipeVariantHash;
}

export interface RecipeHash {
  [recipeName: string]: Recipe;
}

export interface GeneratorDefaultKeys {
  recipeKey: string;
  variantKey: string;
}

export interface RecipeDisplayInfo {
  key: string;
  display: string;
}

export interface VariantDisplayInfo {
  key: string;
  display: string;
}

export interface Source {
  name: string;
  system?: string;
  categories: string[];
  author: string;
  recipeOrder?: string[];
  recipes: RecipeHash;
}

function BuildNameGenerator(source: Source): NameGenerator {
  function getSourceName(): string {
    return source.name;
  }

  function getRecipe(recipeKey: string): Recipe {
    return source.recipes[recipeKey];
  }

  function getDefaultRecipeKey(): string {
    if (source.recipeOrder) {
      return source.recipeOrder[0];
    }

    if (source.recipes.base) {
      return "base";
    }

    return Object.keys(source.recipes)[0];
  }

  function getDefaultVariantKey(recipeKey: string): string {
    const recipe = getRecipe(recipeKey);

    if (recipe.variantOrder) {
      return recipe.variantOrder[0];
    }

    if (recipe.variants.base) {
      return "base";
    }

    return Object.keys(recipe.variants)[0];
  }

  function getDefaultKeys(): GeneratorDefaultKeys {
    const recipeKey = getDefaultRecipeKey();

    return {
      recipeKey: recipeKey,
      variantKey: getDefaultVariantKey(recipeKey)
    };
  }

  function recipesForDisplay(): RecipeDisplayInfo[] {
    return Object.keys(source.recipes).reduce((acc, key) => {
      const recipe = getRecipe(key);
      acc.push({ key, display: recipe.display });

      return acc;
    }, []);
  }

  function variantsForRecipe(recipeKey: string): VariantDisplayInfo[] {
    const variants = getRecipe(recipeKey).variants;
    return Object.keys(variants).reduce((acc, key) => {
      const variant = variants[key];
      acc.push({ key, display: variant.display });

      return acc;
    }, []);
  }

  // keeps a shuffled list of ingredients so we don't get too many duplicates.
  const cachedIngredients: { [ingredientKey: string]: string[] } = {};
  const cachedIngredientsThreshold: { [ingredientKey: string]: number } = {};

  // this function is a bit complicated because we support two different formats
  // one with variants
  function fetchIngredient(ingredientKey: string): string {
    const cache = cachedIngredients[ingredientKey];
    if (cache && cache.length > cachedIngredientsThreshold[ingredientKey]) {
      return cache.shift();
    }

    const m = ingredientKey.match(/(.+)\$(.+)/);

    let recipeKey = ingredientKey;
    let variantKey = "base";

    if (m) {
      recipeKey = m[1];
      variantKey = m[2];
    }

    const recipe = getRecipe(recipeKey);

    const ingredients = recipe.variants[variantKey].ingredients;

    if (!ingredients) {
      throw new Error(`Ingredient specified by key ${recipeKey} not found!`);
    }

    cachedIngredients[recipeKey] = _.shuffle(_.clone(ingredients));
    cachedIngredientsThreshold[ingredientKey] = ingredients.length >= 5 ? 1 : 0;

    return cachedIngredients[ingredientKey].shift();
  }

  let cachedRecipeFunctionHashInitialized = false;
  let cachedRecipeFunctionHash: RecipeFunctionHash = {};

  function recipeFunctionHash(): RecipeFunctionHash {
    if (cachedRecipeFunctionHashInitialized) {
      return cachedRecipeFunctionHash;
    }

    const list: RecipeFunctionHash = {};

    Object.keys(source.recipes).forEach(key => {
      const recipe = source.recipes[key];
      Object.keys(recipe.variants).forEach(variant => {
        const keyName = `${key}$${variant}`;
        const func: () => string = () => makeName(keyName); // eslint-disable-line @typescript-eslint/no-use-before-define
        list[keyName] = func;

        if (variant === "base") {
          list[key] = func;
        }
      });
    });

    cachedRecipeFunctionHash = list;
    cachedRecipeFunctionHashInitialized = true;

    return cachedRecipeFunctionHash;
  }

  function makeName(ingredientKey: string): string {
    return Mustache.render(
      fetchIngredient(ingredientKey),
      recipeFunctionHash()
    );
  }

  function makeNames(ingredientKey: string, count: number): string[] {
    return _.times(count, () => makeName(ingredientKey));
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
  };
}

export interface NameGenerator {
  getRecipe: (recipeKey: string) => Recipe;
  getSourceName: () => string;
  getDefaultRecipeKey: () => string;
  getDefaultVariantKey: (recipeKey: string) => string;
  getDefaultKeys: () => GeneratorDefaultKeys;
  recipesForDisplay: () => RecipeDisplayInfo[];
  variantsForRecipe: (recipeKey: string) => VariantDisplayInfo[];
  makeName: (ingredientKey: string) => string;
  makeNames: (ingredientKey: string, count: number) => string[];
}

export default BuildNameGenerator;
