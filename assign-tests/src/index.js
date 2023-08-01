const cache = require("@actions/cache")
const core = require("@actions/core")
const glob = require("@actions/glob")

const { hashElement } = require("folder-hash")
import { table } from "table"

const fs = require("fs")

const { executionPlan, optimizeWeights } = require("./utils")

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
  } else {
    core.info(
      `Weights file not found at ${WEIGHT_FILE}. Using default weights.`
    )

    for (const file of files) {
      fileWeights[file] = 1
    }
  }

  return fileWeights
}

async function restoreCache(paths, cacheKey, restoreKeys) {
  core.info(`Reading cache from ${cacheKey}`)
  await cache.restoreCache(paths, cacheKey, restoreKeys)
}

function printOptimizedGroup(optimizedWeights, group, groups) {
  let planWeight = 0
  const tableData = optimizedWeights[group - 1].map((el) => {
    const key = Object.keys(el)[0]
    planWeight += el[key]
    return [key, el[key]]
  })
  tableData.push(["Plan total", planWeight])

  core.info(`Runner ${group} of ${groups}`)
  core.info("-------------")
  core.info(table(tableData))
}

function printTotals(optimizedWeights, groups){
  let totalData = []
  let grandTotal = 0
  for (let i = 0; i < groups; i++) {
    const total = optimizedWeights[i]
      .map((el) => {
        const key = Object.keys(el)[0]
        return el[key]
      })
      .reduce((a, c) => a + c, 0)
    grandTotal += total
    totalData.push([`Group ${i + 1}`, total])
  }
  totalData.push(["Total", grandTotal])

  core.info("")
  core.info("Weight Totals")
  core.info("-------------")
  core.info(table(totalData))
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

  await restoreCache([WEIGHT_FILE], `${CACHE_KEY}-${hash}`, [`${CACHE_KEY}-`])

  const weightedFiles = await weights(files)

  const optimizedWeights = optimizeWeights(weightedFiles, groups)
  
  printOptimizedGroup(optimizedWeights, group, groups)

  printTotals(optimizedWeights, groups)

  const plan = executionPlan(optimizedWeights)
  return plan && plan.length >= group ? plan[group - 1].join(",") : ""
}

main()
  .then((res) => {
    core.setOutput("tests", res)
  })
  .catch((err) => {
    core.setFailed(`Action failed with error ${err}`)
  })
