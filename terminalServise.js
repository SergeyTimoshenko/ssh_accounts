var CMD = require('node-cmd');

const run = command => new Promise(r => {
  CMD.run(command)
  r(true)
})

const get = command => new Promise((resp, rej) => {
  CMD.get(command, (err, data, stderr) => {
    if (err) return resj(err)
    resp(data)
  })
})

module.export = r => {console.log('module')}
