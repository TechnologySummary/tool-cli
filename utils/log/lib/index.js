const log = require('npmlog')

log.heading = 'tool'
log.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : 'info'
log.addLevel('success', 2000, { fg: 'green', bold: true })

module.exports = log
