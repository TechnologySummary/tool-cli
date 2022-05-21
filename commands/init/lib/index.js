function init(projectName, cmd) {
  console.log(projectName, process.env.CLI_INIT_FORCE, process.env.CLI_TARGET_PATH)
}

module.exports = init
