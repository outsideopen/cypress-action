const { OptimizeWeights } = require("../src/optimizeWeights")

describe("Optimize tests", () => {
  test("should plan equally weighted distribution", () => {
    let weights1 = [
      { path: "file1", weight: 1 },
      { path: "file2", weight: 1 },
      { path: "file3", weight: 2 },
    ]
    let optimized1 = new OptimizeWeights(weights1, 2)

    expect(optimized1.bins[0].plan).toEqual(["file3"])
    expect(optimized1.bins[1].plan).toEqual(["file1", "file2"])
  })

  test("should plan unequally weighted distributions", () => {
    let weights = [
      {
        path: "file1",
        weight: 4,
      },
      {
        path: "file2",
        weight: 1,
      },
      {
        path: "file3",
        weight: 1,
      },
    ]
    let optimized = new OptimizeWeights(weights, 2)

    expect(optimized.bins[0].plan).toEqual(["file1"])
    expect(optimized.bins[1].plan).toEqual(["file2", "file3"])

    weights = [
      {
        path: "file1",
        weight: 1,
      },
      {
        path: "file2",
        weight: 1,
      },
      {
        path: "file3",
        weight: 3,
      },
    ]
    optimized = new OptimizeWeights(weights, 2)

    expect(optimized.bins[0].plan).toEqual(["file3"])
    expect(optimized.bins[1].plan).toEqual(["file1", "file2"])

    weights = [
      {
        path: "file1",
        weight: 1,
      },
      {
        path: "file2",
        weight: 3,
      },
      {
        path: "file3",
        weight: 1,
      },
    ]
    optimized = new OptimizeWeights(weights, 2)

    expect(optimized.bins[0].plan).toEqual(["file2"])
    expect(optimized.bins[1].plan).toEqual(["file1", "file3"])
  })

  test("fail gracefully on invalid input", () => {
  let weights = [{ path: "file1", weight: 1 }]
  let optimized = new OptimizeWeights(weights)
  expect(optimized.bins.length).toEqual(1)
  expect(optimized.bins[0].plan).toEqual(["file1"])

  optimized = new OptimizeWeights()
  expect(optimized.bins.length).toEqual(1)
  expect(optimized.bins[0].plan).toEqual([])
  })
})
