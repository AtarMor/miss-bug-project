import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from ".//services/bug.service.js"
import { loggerService } from ".//services/logger.service.js"

const app = express()

app.use(express.static('public'))
app.use(cookieParser())

// app.get('/user3', (req,res) => {
// const visitedBugs = req.cookies.visitedBugs || []
// res.cookie('visitedBugs', JSON.stringify)
// res.send(<h1>User visited at the following bugs: ${visitedBugs}</h1>)
// })

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

    const visitedBugs = JSON.parse(req.cookies.visitedBugs || '[]')
    
    if (visitedBugs.length >= 3 && !visitedBugs.includes(bugId)) {
        console.log(`User visited at the following bugs: ${visitedBugs}`)
        return res.status(401).send('Wait for a bit')
    }

    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    res.cookie('visitedBugs', JSON.stringify(visitedBugs), {maxAge: 7 * 1000})

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
