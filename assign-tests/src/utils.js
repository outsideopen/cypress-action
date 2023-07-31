const core = require("@actions/core")
const knapsack = require("knapsack-js")

module.exports = { executionPlan, optimizeWeights }

function remainingWeight(weightedArray) {
  let weights = weightedArray.map((x) => Object.values(x)[0])
  let weight = weights.reduce((accumulator, el) => accumulator + el)
  return weight
}

function optimizeWeights(weightedFiles, nrOfGroups) {
  if (!weightedFiles || Object.keys(weightedFiles).length == 0) {
    return []
  }
  
  let returnArray = []
  let weightedArray = []

  for (const key in weightedFiles) {
    let weightedObject = {}
    weightedObject[key] = weightedFiles[key]
    weightedArray.push(weightedObject)
  }

  for (let i = 0; i < nrOfGroups; i++) {
    const weight = remainingWeight(weightedArray)
    const weightPerGroup = Math.ceil(weight / (nrOfGroups - i))

    const nextGroup = knapsack.resolve(weightPerGroup, weightedArray)
    const keys = nextGroup.map((el) => Object.keys(el)[0])

    keys.forEach((key) => {
      weightedArray = weightedArray.filter(
        (filter) => Object.keys(filter)[0] != key
      )
    })
    returnArray.push(nextGroup)
  }
  return returnArray
}

function executionPlan(groups) {
  let executionPlan = []
  for (let group of groups) {
    const keys = group.map((el) => Object.keys(el)[0])
    executionPlan.push(keys)
  }
  return executionPlan
}
