import express from 'express'

import {bugService} from ".//services/bug.service.js"
import {loggerService} from ".//services/logger.service.js"

const app = express()

app.use(express.static('public'))

// app.get('/', (req, res) => res.send('Hello there'))

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

app.get('/api/bug/save', (req, res) => {
    console.log('req.query:', req.query)
    const bugToSave = {
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: req.query.createdAt,
        _id: req.query._id,
    }
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
 })

app.get('/api/bug/:id', (req, res) => { 
    const bugId = req.params.id
    console.log('req.params:', req.params)
    console.log('bugId:', bugId)
    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send('Cannot get bug')
        })
})

app.get('/api/bug/:id/remove', (req, res) => { 
    const bugId = req.params.id
    bugService.remove(bugId)
        .then(() => res.send(bugId))
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})
