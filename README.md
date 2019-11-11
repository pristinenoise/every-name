# every-name
`every-name` is a name generator: it can take a source, specified in json, and use that to generate complex names.

See the example-data for an example recipe, and test for explanations on how to use.

[![Build Status](https://travis-ci.org/pristinenoise/every-name.svg?branch=master)](https://travis-ci.org/pristinenoise/every-name)
[![Coverage Status](https://coveralls.io/repos/github/pristinenoise/every-name/badge.svg?branch=master)](https://coveralls.io/github/pristinenoise/every-name?branch=master)

## Upcoming Features

* syllable-based generation
* more examples
* random chance / random number templates

## License

Copyright © 2017- by James Stuart. This source code is licensed under the MIT license found in
the [LICENSE.txt](https://github.com/pristinenoise/every-name/blob/master/LICENSE.txt) file.

The documentation to the project is licensed under the [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/)
license.

## Getting started

```
git clone git@github.com:pristinenoise/every-name.git

cd every-name                   # Change current directory to the newly created one
yarn install                    # Install dependencies
```

## Testing

This boilerplate uses [Facebook Jest](https://facebook.github.io/jest/). Add a
directory named `__tests__` at any level and start writing tests.

```
yarn test
```

### Changelog

* 0.9.0 - no longer exporting build name generator as default
* 0.8.1 - trying to fix .d.ts file
* 0.8.0  - updated to typescript
* 0.7.2  - updated to babel 7
