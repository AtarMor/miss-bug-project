import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from ".//services/bug.service.js"
import { loggerService } from ".//services/logger.service.js"

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

app.listen(3030, () => console.log('Server ready at port 3030'))

app.get('/api/bug', (req, res) => {
    const filterBy = {
        title: req.query.title || '',
        desc: req.query.desc || '',
        minSeverity: +req.query.minSeverity || 0,
        label: req.query.label,
    }
    bugService.query(filterBy)
        .then(bugs => {
            res.send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.put('/api/bug', (req, res) => {
    const bugToSave = req.body
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

app.post('/api/bug', (req, res) => {
    const bugToSave = req.body
    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

app.get('/api/bug/:id', (req, res) => {
    const bugId = req.params.id

    const visitedBugs = JSON.parse(req.cookies.visitedBugs || '[]')

    if (visitedBugs.length >= 3 && !visitedBugs.includes(bugId)) {
        console.log(`User visited at the following bugs: ${visitedBugs}`)
        return res.status(401).send('Wait for a bit')
    }

    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), { maxAge: 7 * 1000 })

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error(err)
            res.status(400).send('Cannot get bug')
        })
})

app.delete('/api/bug/:id', (req, res) => {
    const bugId = req.params.id
    bugService.remove(bugId)
        .then(() => res.send(bugId))
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})
