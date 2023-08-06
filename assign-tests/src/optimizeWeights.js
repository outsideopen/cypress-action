class OptimizeWeights {
  constructor(weights = [], nrOfBins = 1) {
    this.bins = []

    for (let i = 0; i < nrOfBins; i++) {
      this.bins.push(new Bin())
    }
    this.optimize(weights)
  }

  get totalWeight() {
    return this.bins.reduce((a, c) => a + c, 0)
  }

  optimize(weights) {
    weights.sort((a, b) => b.weight - a.weight)

    for (let weight of weights) {
      let nextBin = this.nextBin()
      nextBin.add(weight)
    }
  }

  get plan() { }

  nextBin() {
    let minWeight = null
    let nextBin = null

    for (let bin of this.bins) {
      if (minWeight == null || bin.weight < minWeight) {
        nextBin = bin
        minWeight = bin.weight
      }
    }
    return nextBin
  }

  formatWeights(weights) {
    let formattedWeights = []

    for (let i in weights) {
      formattedWeights.push({ filePath: i, weight: weights[i] })
    }

    return formattedWeights
  }
}

class Bin {
  constructor() {
    this.content = []
  }

  add(weight) {
    this.content.push(weight)
  }

  get weight() {
    return this.content.map((el) => el.weight).reduce((a, c) => a + c, 0)
  }

  get plan() {
    return this.content.map((el) => el.path)
  }

  tableData() {
    const tableData = this.content.map((el) => [el.path, el.weight])

    tableData.push(["Plan total", this.weight])

    return tableData
  }
}

module.exports = { OptimizeWeights }
