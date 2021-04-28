const knapsack = require("knapsack-js")

module.exports = { executionPlan }

function executionPlan(weightedFiles, nrOfGroups) {
  if (!weightedFiles || Object.keys(weightedFiles).length == 0) {
    return []
  }

  let executionPlan = []

  let weights = Object.values(weightedFiles)

  let totalWeight = weights.reduce((accumulator, el) => accumulator + el)

  const weightPerGroup = Math.ceil(totalWeight / nrOfGroups)

  weightedArray = []
  for (const key in weightedFiles) {
    let weightedObject = {}
    weightedObject[key] = weightedFiles[key]
    weightedArray.push(weightedObject)
  }

  for (let i = 0; i < nrOfGroups; i++) {
    let nextGroup = knapsack.resolve(weightPerGroup, weightedArray)
    const keys = nextGroup.map((el) => Object.keys(el)[0])
    executionPlan.push(keys)
    keys.forEach((key) => {
      weightedArray = weightedArray.filter(
        (filter) => Object.keys(filter)[0] != key
      )
    })
  }
  return executionPlan
}
