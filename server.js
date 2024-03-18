import express from 'express'

import {bugService} from ".//services/bug.service.js"
const app = express()

app.get('/', (req, res) => res.send('Hello there'))

app.listen(3030, () => console.log('Server ready at port 3030'))

app.get('/api/bug', (req, res) => {
    bugService.query()
        .then(bugs => {
            res.send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.get('/api/bug/save', (req, res) => { })

app.get('/api/bug/:bugId', (req, res) => { })

app.get('/api/bug/:bugId/remove', (req, res) => { })
