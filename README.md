# Cypress e2e parallel test action

A poor man's action for parallel testing with Cypress.

## Inputs

### `group`

The number for the current group of tests

**default** 1

### `groups`

The total number of testing groups

**default** 1

### `test-pattern`

A path to match test files.

**default** '/github/workspace/tests/e2e/specs/*.spec.js'

### `single-pattern`
An array of paths to tests that each should be run as their own group. Useful for tests that have a long run time.'

**default** []

## Outputs

### `tests`

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
          test-pattern: '/path/to/tests/*.spec.js'
          single-pattern: '/path/to/tests/runOnItsOwn.spec.js'

      - name: Run tests in parallel
        run: yarn cypress run --spec ${{ steps.parallel.outputs.tests }}
```

## Development

After making changes to the code, you need to build the dependencies, and commit the file `dist/index.js`

```bash
npm run build
```

