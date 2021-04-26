const core = require('@actions/core');

const glob = require("glob")

const currentGroup = core.getInput('group');
const groups = core.getInput('groups');
const testPattern = core.getInput('test-pattern');
const singlePattern = core.getInput('single-pattern');


glob(testPattern, function(err, files) {
  if (err) {
    core.setFailed(error.message)
  } else {
    const generalFiles = [...files]

    for (let i = 0; i < singlePattern.length; i++) {
      const index = generalFiles.indexOf(singlePattern[i])
      if (index !== -1) generalFiles.splice(index, 1)
    }

    const filesInGroup = Math.ceil(
      generalFiles.length / (groups - singlePattern.length)
    )
    const filesForTest = []

    if (currentGroup < singlePattern.length) {
      filesForTest.push(singlePattern[currentGroup])
    } else {
      for (let i = 0; i < filesInGroup; i++) {
        if (
          generalFiles[(thisGroup - singlePattern.length) * filesInGroup + i]
        ) {
          filesForTest.push(
            generalFiles[(thisGroup - singlePattern.length) * filesInGroup + i]
          )
        }
      }
    }

    core.setOutput('tests', filesForTest)
  }
})
