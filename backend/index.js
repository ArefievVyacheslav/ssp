const server = require('express')()
const cors = require('cors')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const fs = require('fs')
const path = require('path')

server.use(bodyParser.json(), cors())

server.post('/login', (req, res) => {
  const token = jwt.sign({ user: 'user name', admin: true }, 'ssp', { expiresIn: '30d' })
  try {
    if (!(req.body.name === 'ss' && req.body.pass === 'ss')) res.status(400).send('Пошёл нахуй')
    res.status(200).send({ accessToken: token })
  } catch (e) {
    res.status(400).send(e)
  }
})

server.get('/proxy', (req, res) => {
  const proxies = fs.readFileSync(path.join(__dirname, '../parsing/proxies.txt'), 'utf-8')
  res.send(proxies.split('\n').filter(proxy => !!proxy))
})

server.put('/proxy', (req, res) => {
  const proxies = req.body.reduce((acc, proxy) => acc += proxy + '\n', '')
  fs.writeFileSync(path.join(__dirname, '../parsing/proxies.txt'), proxies)
  res.status(200).send('Прокси успешно записаны!')
})

server.listen(3002, () => console.log('SERVER ON 3002'))
