const core = require("@actions/core")
const glob = require("@actions/glob")

const fs = require("fs")

const { executionPlan } = require("./utils")

const filename = ".cypress-weights.json"

async function weights(files) {
  let fileWeights = {}
  if (fs.existsSync(filename)) {
    core.info(`Weights file found at ${filename}`)
    weightsFile = fs.readFileSync(filename, "utf8")
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
        `The following files are not matched by the spec glob, but have weights assigned: ${difference}`
      )
    }
  } else {
    core.info(`Weights file not found at ${filename}. Using default weights.`)

    for (const file of files) {
      core.info(`file: ${file}`)
      fileWeights[file] = 1
    }
  }


  return fileWeights
}

async function main() {
  const group = core.getInput("group")
  const groups = core.getInput("groups")
  const spec = core.getInput("spec")

  const globber = await glob.create(spec)
  const files = [...(await globber.glob())]
  core.info(`files: ${files}`)
  const weightedFiles = await weights(files)
  
  core.info(`weighted files: ${JSON.stringify(fileWeights, null)}`)

  const plan = executionPlan(weightedFiles, groups)
  core.info(`execution plan: ${JSON.stringify(plan, null)}`)

  return plan[group - 1].join(",")
}

main()
  .then((res) => {
    core.setOutput("tests", res)
  })
  .catch((err) => {
    core.setFailed(`Action failed with error ${err}`)
  })
