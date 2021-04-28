# Cypress e2e parallel test action

A poor man's action for parallel testing with Cypress.

## Inputs

### `group`

The number for the current group of tests

**default** 1

### `groups`

The total number of testing groups

**default** 1

### `spec`

A glob that matches the test files.

**default** 'cypress/integration/*spec.js'

## Outputs

### `spec`

The tests that should be run in the current group

## Example usage

```yaml
jobs:
  tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        group: [1, 2, 3, 4, 5]
        groups: [5]

    steps:
      - name: Calculate parallel test groups
        id: parallel
        uses: outsideopen/cypress-e2e-parallel-test-action@main
        with:
          group: ${{ matrix.group }}
          groups: ${{ matrix.groups }}
          spec: '/path/to/tests/*.spec.js'

      - name: Run tests in parallel
        run: yarn cypress run --spec ${{ steps.parallel.outputs.spec }}
```

## Weights file

By default, this action will evenly distribute tests across containers. This works well if your tests take a similar amount of time to execute. If, however, you have some longer running tests, you may want to assign weights to your tests, in order to optimize the container assignment.

**NOTE:** In future releases, we will automate this feature, but for now you have to manually assign weights. A good weighting strategy, is to use the execution times from a previous run.

Create a file named `.cypress-weights.json` in the root of your project. This file consists of an object where the keys are the file names, and the values are the weights.

The file names should be the full path, as on the Github Action Workspace.

**Example:**

```
  {
    "/home/runner/work/actions-test-repo/actions-test-repo/tests/test1.spec.js": 4,
    "/home/runner/work/actions-test-repo/actions-test-repo/tests/test2.spec.js": 2,
    "/home/runner/work/actions-test-repo/actions-test-repo/tests/test3.spec.js": 3
  }
```





## Development

After making changes to the code, you need to build the dependencies, and commit the file `dist/index.js`

```bash
npm run build
```

