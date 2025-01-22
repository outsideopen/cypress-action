const cache = require("@actions/cache")
const core = require("@actions/core")
const glob = require("@actions/glob")
const fs = require("fs/promises")
const path = require("path")
const { hashElement } = require("folder-hash")

const CACHE_KEY = "cypress-weights"
const WEIGHT_FILE = ".cypress-weights.json"

async function getFiles(path) {
  const globber = await glob.create(`${path}/**/*.json`)
  return [...(await globber.glob())]
}

async function getWeights(file) {
  core.info("Reading weights from file")
  const results = await fs.readFile(file, "utf8")
  const json = JSON.parse(results)

  let resultObject = {}
  for (const result of json?.results) {
    let duration = 1

    for (const suite of result?.suites) {
      duration += suite?.duration
    }

    resultObject = { path: path.resolve(result?.file), weight: duration }
  }

  return resultObject
}

async function saveCache(paths, cacheKey) {
  core.info(`Saving cache to ${cacheKey}`)
  await cache.saveCache(paths, cacheKey)
}

async function main() {
  const testsPath = core.getInput("tests-path")
  const hash = (await hashElement(testsPath)).hash

  const resultsPath = core.getInput("results-path")
  const files = await getFiles(resultsPath)

  let weights = []
  for (const file of files) {
    let fileWeight = await getWeights(file)

    weights.push(fileWeight)
  }

  core.info(`Weights ALL: ${JSON.stringify(weights, null, 4)}`)

  await fs.writeFile(WEIGHT_FILE, JSON.stringify(weights, null))

  await saveCache([WEIGHT_FILE], `${CACHE_KEY}-${hash}`)

  return `${JSON.stringify(weights, null)}`
}

main()
  .then((res) => {
    core.setOutput("weights", res)
  })
  .catch((err) => {
    core.setFailed(`Action failed with error ${err}`)
  })
