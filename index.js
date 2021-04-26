const core = require("@actions/core")
const glob = require("@actions/glob")

const currentGroup = core.getInput("group") - 1
const groups = core.getInput("groups")
const testPattern = core.getInput("test-pattern")
const singlePattern = core.getInput("single-pattern")

async function main() {
  core.info(`testPattern: ${testPattern}`)

  const globber = await glob.create(testPattern)
  const generalFiles = [...(await globber.glob())]

  const singleGlobber = await glob.create(singlePattern)
  const singleFiles = [...(await singleGlobber.glob())]

  core.info(`generalFiles: ${generalFiles}`)
  core.info(`generalFiles: ${generalFiles.length}`)
  core.info(`singleFiles: ${singleFiles}`)
  core.info(`singleFiles: ${singleFiles.length}`)

  for (let i = 0; i < singleFiles.length; i++) {
    const index = generalFiles.indexOf(singleFiles[i])
    if (index !== -1) generalFiles.splice(index, 1)
  }

  const filesInGroup = Math.ceil(
    generalFiles.length / (groups - singleFiles.length)
  )
  const filesForTest = []

  if (currentGroup < singleFiles.length) {
    filesForTest.push(singleFiles[currentGroup])
  } else {
    for (let i = 0; i < filesInGroup; i++) {
      if (
        generalFiles[(currentGroup - singleFiles.length) * filesInGroup + i]
      ) {
        filesForTest.push(
          generalFiles[(currentGroup - singleFiles.length) * filesInGroup + i]
        )
      }
    }
  }

  core.info(`filesForTest: ${filesForTest}`)
  return filesForTest.join(',')
}
main().then((res) => {
  core.info(`main ${res}`)
  core.setOutput("tests", res)
})
