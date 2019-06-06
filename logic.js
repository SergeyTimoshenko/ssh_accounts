var CMD = require('node-cmd');
function onClick() {
  fetchDirs().then(dirs => {
    renderAccount(dirs)
  })
}

const renderAccount = (dirs) => {
  let div = document.createElement('div')
  dirs.map(dirName => {
    let row = document.createElement('div')
    row.innerHTML = dirName
    div.appendChild(row)
  })
  document.getElementById('accounts').innerHTML = ''
  document.getElementById('accounts').appendChild(div)
}

const fetchDirs = () => {
  const cmd = 'cd ~/.ssh && ls -la'
  return new Promise(resp => {
    get(cmd).then(res => {
      let resultRows = res.split('\n').slice(3, res.split('\n').length - 1).map(r => r.split(' '))
      let dirs = resultRows.filter(row => row[0] === 'drwxr-xr-x').map(r => r[r.length - 1])
      return resp(dirs)
    })
  })
}

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
