const knapsack = require("knapsack-js")

module.exports = { executionPlan }

function remainingWeight(weightedArray) {
  let weights = weightedArray.map((x) => Object.values(x)[0])
  let weight = weights.reduce((accumulator, el) => accumulator + el)
  return weight
}

function executionPlan(weightedFiles, nrOfGroups) {
  if (!weightedFiles || Object.keys(weightedFiles).length == 0) {
    return []
  }

  let executionPlan = []

  weightedArray = []
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
    executionPlan.push(keys)

    keys.forEach((key) => {
      weightedArray = weightedArray.filter(
        (filter) => Object.keys(filter)[0] != key
      )
    })
  }
  return executionPlan
}
