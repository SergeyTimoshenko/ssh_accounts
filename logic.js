var CMD = require('node-cmd');
var fs = require('fs');
var axios = require('axios');
var keygen = require('ssh-keygen');
var currentAccount;
function onInit() {
  fsRead().then(res => {
    currentAccount = res.currentAccount
    onClick()
  }).catch(err => {
    console.log(err)
  })
}


function onClick() {
  fetchDirs().then(dirs => {
    renderAccount(dirs)
  })
}

function onUseButton(dir) {
  useAccount(dir).then(r => {
    currentAccount = dir
    onClick()
  }).catch(err => console.log(err))
}

function onAdd() {
  let inputs = document.getElementsByTagName('input')
  // console.log(inputs)
  let email = inputs[0].value
  let name = inputs[1].value
  addFolder(name, email)
  inputs[0].value = ''
  inputs[1].value = ''
}

function showAdd() {
  document.getElementById('addSection').style.display = 'block'
  document.getElementById('hide-button').style.display = 'block'
}

function hideAdd() {
  document.getElementById('result').innerHTML = ''
  document.getElementById('addSection').style.display = 'none'
  document.getElementById('hide-button').style.display = 'none'
}

const addFolder = (name, email) => {
  get(`cd ~/.ssh && mkdir ${email}`).then(res => {
    onClick()
    generateKey(name, email)
  })
}


const generateKey = (name, email) => {
  keygen({
    location: `./id_rsa`,
    comment: email,
    read: true,
    password: false
  }, (err, out) => {
    console.log(out)
    document.getElementById('result').innerHTML = out.pubKey
    get(`cp ./id_rsa ~/.ssh/${email}/ && cp ./id_rsa.pub ~/.ssh/${email}/`).then(() => {
    })
  })

}

const renderAccount = (dirs) => {
  let div = document.createElement('div')
  dirs.map(dirName => {

    if (dirName === currentAccount) {
      dirName = dirName + '<b> SELECTED </b>'
    }

    let row = document.createElement('div')
    let button = document.createElement('button')
    let name = document.createElement('div')
    name.innerHTML = dirName
    button.innerHTML = "use"
    button.setAttribute('onclick', `onUseButton('${dirName}')`)
    name.setAttribute('style', 'padding-left: 20px')
    row.appendChild(button)
    row.appendChild(name)
    row.setAttribute('style', 'display:flex; margin-top: 20px;')
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
      let pattern =  '';
      if (process.platform === 'darwin') {
        pattern = 'drwxr-xr-x'
      } else {
        pattern = 'drwxrwxr-x'
      }
      let dirs = resultRows.filter(row => row[0] === pattern).map(r => r[r.length - 1])
      return resp(dirs)
    })
  })
}

const useAccount = (name) => new Promise((resp, rej) => {
  get(`cp ~/.ssh/${name}/* ~/.ssh/`).then(res => {
    return get('ssh-add')
  }).then(res => {
    return get(`git config --global user.email "${name}"`)
  }).then(res => {
    return fsWrite({currentAccount: name})
  }).then(() => resp(true)).catch(err => rej(err))
})

const run = command => new Promise(r => {
  CMD.run(command)
  r(true)
})

const get = command => new Promise((resp, rej) => {
  CMD.get(command, (err, data, stderr) => {
    if (err) return rej(err)
    resp(data)
  })
})

const fsWrite = json => new Promise((resp, rej) => {
  fs.writeFile('config.json', JSON.stringify(json), 'utf-8', (e, r) => {
    if(e) return rej(e)
    resp(r)
  })
})

const fsRead = () => new Promise((resp, rej) => {
  fs.readFile('config.json', 'utf-8', (e, r) => {
    if (e) return rej(e)
    resp(JSON.parse(r))
  })
})

onInit()
