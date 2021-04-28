const { executionPlan } = require("../src/utils")

test("should plan equally weighted distribution", () => {
  const plan = executionPlan({ file1: 1, file2: 1, file3: 1 }, 2)
  expect(plan[0]).toEqual(["file1", "file2"])
  expect(plan[1]).toEqual(["file3"])
})

test("should plan unequally weighted distributions", () => {
  let plan = executionPlan({ file1: 3, file2: 1, file3: 1 }, 2)
  expect(plan[0]).toEqual(["file1"])
  expect(plan[1]).toEqual(["file2", "file3"])

  plan = executionPlan({ file1: 1, file2: 1, file3: 3 }, 2)
  expect(plan[0]).toEqual(["file1", "file2"])
  expect(plan[1]).toEqual(["file3"])

  plan = executionPlan({ file1: 1, file2: 3, file3: 1 }, 2)
  expect(plan[0]).toEqual(["file1", "file3"])
  expect(plan[1]).toEqual(["file2"])
})

test("fail gracefully on invalid input", () => {
  let plan = executionPlan({ file1: 1 })
  expect(plan.length).toEqual(0)

  plan = executionPlan({})
  expect(plan.length).toEqual(0)

  plan = executionPlan()
  expect(plan.length).toEqual(0)

  plan = executionPlan(undefined, 2)
  expect(plan.length).toEqual(0)
})
