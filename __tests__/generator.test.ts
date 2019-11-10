/* eslint-env jest */

import * as boringAmericanNames from "./data/boring_names.json";

process.env.EVERY_NAME_FIX_SHUFFLE = "true";

import BuildNameGenerator, {
  Source,
  NameGenerator
} from "../src/BuildNameGenerator";

describe("BuildNameGenerator", () => {
  const boringSource: Source = boringAmericanNames;

  let generator: NameGenerator;

  // This, instead of randomizing each array, just reverses the array
  // for purposes of picking ingredients This means for testing, you
  // should expect each element to be picked in reverse order, until there is only
  // one element left. It will skip that element, and return to the bottom.

  beforeEach(() => {
    generator = BuildNameGenerator(boringSource);
  });

  it("can be initialized with a given source", () => {
    expect(generator.getSourceName()).toBe("Boring American Names");
  });

  it("can make a list of the recipes for display", () => {
    expect(generator.recipesForDisplay()).toEqual([
      { key: "full_name", display: "Full Names" },
      { key: "double_first_name", display: "Double First Name" },
      { key: "first_name", display: "First Names" },
      { key: "last_name", display: "Last Names" }
    ]);
  });

  it("can make a list of the variants for a given recipe", () => {
    expect(generator.variantsForRecipe("full_name")).toEqual([
      { key: "base", display: "All" }
    ]);
    expect(generator.variantsForRecipe("first_name")).toEqual([
      { key: "base", display: "All" },
      { key: "men", display: "Men" },
      { key: "women", display: "Women" }
    ]);
  });

  it("can generate an ingredient from a simple text-only recipe", () => {
    const ingredients =
      boringSource.recipes.last_name.variants.base.ingredients;
    for (let i = 0; i < 100; i += 1) {
      expect(ingredients).toContain(generator.makeName("last_name"));
    }
  });

  it("can give you default keys for a given set of recipes", () => {
    const { recipeKey, variantKey } = generator.getDefaultKeys();

    expect(recipeKey).toEqual("double_first_name");
    expect(variantKey).toEqual("base");
  });

  it("can use generate more items than there are ingredients", () => {
    const names = generator.makeNames("first_name", 6);

    expect(names).toEqual([
      "Dave",
      "Evelyn",
      "Charles",
      "Alice",
      "Bob",
      "Evelyn"
    ]);
  });

  it("can generate multiple names on the same line", () => {
    const names = generator.makeName("double_first_name");

    expect(names).toEqual("Dave Evelyn");
  });

  it("can use a stub to generate items", () => {
    const name1 = generator.makeName("last_name");
    const name2 = generator.makeName("last_name");

    expect(name1).toEqual("Williams");
    expect(name2).toEqual("Johnson");
  });

  it("can generate a complex item", () => {
    const fullName = generator.makeName("full_name");

    expect(fullName).toEqual("Dave Williams III");
  });
});
