const cache = require("@actions/cache")
const core = require("@actions/core")
const glob = require("@actions/glob")

const { hashElement } = require("folder-hash")
import { table } from "table"

const fs = require("fs")

const { OptimizeWeights } = require("./optimizeWeights")

const CACHE_KEY = "cypress-weights"
const WEIGHT_FILE = ".cypress-weights.json"

async function parseWeights(testFiles) {
  let weights = []
  core.info(`Reading weights from ${WEIGHT_FILE} (**GES**)`)
  if (fs.existsSync(WEIGHT_FILE)) {
    core.info(`Weights file found at ${WEIGHT_FILE}`)
    const weightsFile = fs.readFileSync(WEIGHT_FILE, "utf8")
    weights = JSON.parse(weightsFile)

    core.info("vvvvvvvvvvvvvvv")
    core.info(`Weights: ${JSON.stringify(weights, null, 4)}`)
    core.info("^^^^^^^^^^^^^^^")

    let weightPaths = weights.map((e) => e.path)
    let differences = testFiles.filter((x) => !weightPaths.includes(x))

    if (differences.length > 0) {
      core.warning(
        `The following files do not have weights assigned: ${differences.join(
          ", "
        )}`
      )
    }
  } else {
    core.info(
      `Weights file not found at ${WEIGHT_FILE}. Using default weights.`
    )

    for (const testFile of testFiles) {
      weights.push({ path: testFile, weight: 1 })
    }
  }

  return weights
}

async function main() {
  const group = core.getInput("group")
  const groups = core.getInput("groups")
  const testsPath = core.getInput("tests-path")
  const pattern = core.getInput("glob")
  const hash = (await hashElement(testsPath)).hash

  const globber = await glob.create(`${testsPath}/${pattern}`)
  const testFiles = [...(await globber.glob())]

  core.info(`Reading cache from ${CACHE_KEY}`)
  await cache.restoreCache([WEIGHT_FILE], `${CACHE_KEY}-${hash}`, [
    `${CACHE_KEY}-`,
  ])

  const weights = await parseWeights(testFiles)

  const optimizedWeights = new OptimizeWeights(weights, groups)

  core.info(`Runner ${group} of ${groups}`)
  core.info("-------------")
  core.info(table(optimizedWeights.bins[group - 1].tableData()))

  core.info("")
  core.info("Weight Totals")
  core.info("-------------")
  let totalData = []
  let i = 1
  for (let bin of optimizedWeights.bins) {
    totalData.push([`Group ${i++}`, bin.weight])
  }
  core.info(table(totalData))

  return optimizedWeights.bins[group - 1].plan.join(",")
}

main()
  .then((res) => {
    core.setOutput("tests", res)
  })
  .catch((err) => {
    core.setFailed(`Action failed with error ${err}`)
  })
