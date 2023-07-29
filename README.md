# Cypress e2e parallel test action

A poor man's Cypress parallel testing action.

## Introduction

This project consists of two sub-actions:

- `assign-tests`
- `update-weights`

`assign-tests`, assign tests to be run on a specific runner. It uses weights to optimize the assignments.

`update-weights`, parses the test results and updates the weights.

## Simple case

All that is needed to use `assign-tests`, is a file `.cypress-weights.json` in the root of your project. Any tests not defined in the weight file, is assigned a weight of `1`.


### Example

```yaml
# .github/workflows/test.yml

name: test
on:
  workflow_dispatch:
jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        group: [1, 2, 3, 4, 5]
        groups: [5]

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
      - run: npm install

      - name: Calculate parallel test groups
        id: parallel
        uses: outsideopen/cypress-action/assign-tests@main
        with:
          group: ${{ matrix.group }}       # The current group        (default: 1)
          groups: ${{ matrix.groups }}     # Total number of groups   (default: 1)
          tests-path: '/path/to/tests'     # Path to cypress tests    (default: cypress/e2e)
          glob: '*.spec.js'                # Glob to match test files (default: **/*.cy.js)
```

## Advanced case

Manually keeping the weights up to date can be a pain, when tests are constantly being added and modified. `update-weights` solves this problem, by parsing the test results, and adding an optimized `.cypress-weights.json` to the cache, that will be used on the next run.


### Dependencies

In order for `update-weights` to parse the test results, you need [mochawesome](https://github.com/adamgruber/mochawesome) reporter installed, and configured to generate `json` output.

```bash
npm install --save-dev mochawesome
```

```js
// You can configure it in cypress.config.js

module.exports = defineConfig({
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/results',
    overwrite: false,
    html: false,
    json: true,
  },
```

```bash
# or use command line options
cypress run --reporter mochawesome --reporter-options "reportDir=cypress/results,overwrite=false,html=false,json=true"
```


### Example

```yaml
# .github/workflows/test.yml

name: test
on:
  workflow_dispatch:
jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        group: [1, 2, 3, 4, 5]
        groups: [5]

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
      - run: npm install

      - name: Calculate parallel test groups
        id: parallel
        uses: outsideopen/cypress-action/assign-tests@main
        with:
          group: ${{ matrix.group }}       # The current group        (default: 1)
          groups: ${{ matrix.groups }}     # Total number of groups   (default: 1)
          tests-path: '/path/to/tests'     # Path to cypress tests    (default: cypress/e2e)
          glob: '*.spec.js'                # Glob to match test files (default: **/*.cy.js)

      - name: Run tests
        run: yarn cypress run --spec ${{ steps.parallel.outputs.spec }} --reporter mochawesome --reporter-options "reportDir=cypress/results,overwrite=false,html=false,json=true"

      - uses: actions/upload-artifact@v3.1.1
        with:
          name: weights
          path: |
            cypress/results/**

  update-weights:
    needs: tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/download-artifact@v3
        with:
          name: weights
          path: cypress/results

      - uses: outsideopen/cypress-action/update-weights@main
        with:
         tests-path: '/path/to/tests'          # Path to cypress tests. Same as above 
                                               # (default: cypress/e2e)
         results-path: '/path/to/test/results' # Path to mochawsome json results (as specified in reportsDir above)
                                               # (default: cypress/results)
```

## Weights file explained

The weights file is a simple JSON file, with the test file path, as the key, and the weight as the value. The key should be the full path, as it is in the Github Action Workspace.

If you are not interested in dynamically updating test weights, it is pretty straight forward to manually create this file, and commit it to the root of your project.

**Example:**

```
  {
    "/home/runner/work/actions-test-repo/actions-test-repo/cypress/e2e/test_suite/test1.spec.js": 4,
    "/home/runner/work/actions-test-repo/actions-test-repo/cypress/e2e/test_suite/test2.spec.js": 2,
    "/home/runner/work/actions-test-repo/actions-test-repo/cypress/e2e/test_suite/test3.spec.js": 3
  }
```
