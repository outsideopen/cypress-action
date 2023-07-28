const cache = require("@actions/cache")
const core = require("@actions/core")
const glob = require("@actions/glob")

const { hashElement } = require("folder-hash")

const fs = require("fs")

const { executionPlan } = require("./utils")

const CACHE_KEY = "cypress-weights"
const WEIGHT_FILE = ".cypress-weights.json"

async function weights(files) {
  let fileWeights = {}
  if (fs.existsSync(WEIGHT_FILE)) {
    core.info(`Weights file found at ${WEIGHT_FILE}`)
    const weightsFile = fs.readFileSync(WEIGHT_FILE, "utf8")
    fileWeights = JSON.parse(weightsFile)

    let fileWeightsKeys = Object.keys(fileWeights)
    let difference = files.filter((x) => !fileWeightsKeys.includes(x))

    difference.forEach((el) => {
      fileWeights[el] = 1
    })
    if (difference.length > 0) {
      core.warning(
        `The following files do not have weights assigned: ${difference}`
      )
    }

    difference = fileWeightsKeys.filter((x) => !files.includes(x))
    difference.forEach((el) => {
      delete fileWeights[el]
    })
    if (difference.length > 0) {
      core.warning(
        `The following files are not matched by the glob, but have weights assigned: ${difference}`
      )
    }

    let totalWeight = Object.values(fileWeights).reduce((a, c) => a + c, 0)
    core.info(`Weight assigned to this runner: ${totalWeight}`)
  } else {
    core.info(
      `Weights file not found at ${WEIGHT_FILE}. Using default weights.`
    )

    for (const file of files) {
      core.info(`file: ${file}`)
      fileWeights[file] = 1
    }
  }

  return fileWeights
}

async function restoreCache(paths, cacheKey) {
  core.info(`Reading cache from ${cacheKey}`)
  await cache.restoreCache(paths, cacheKey)
}

async function main() {
  const group = core.getInput("group")
  const groups = core.getInput("groups")
  const testsPath = core.getInput("tests-path")
  const pattern = core.getInput("glob")
  const hash = (await hashElement(testsPath)).hash

  const globber = await glob.create(`${testsPath}/${pattern}`)
  const files = [...(await globber.glob())]
  core.debug(`files: ${files}`)

  await restoreCache([WEIGHT_FILE], `${CACHE_KEY}-${hash}`)

  const weightedFiles = await weights(files)

  core.debug(`weighted files: ${JSON.stringify(weightedFiles, null)}`)

  const plan = executionPlan(weightedFiles, groups)
  core.debug(`execution plan: ${JSON.stringify(plan, null)}`)

  return plan && plan.length >= group ? plan[group - 1].join(",") : ""
}

main()
  .then((res) => {
    core.setOutput("tests", res)
  })
  .catch((err) => {
    core.setFailed(`Action failed with error ${err}`)
  })
