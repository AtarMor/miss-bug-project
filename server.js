import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'

import { bugService } from ".//services/bug.service.js"
import { loggerService } from ".//services/logger.service.js"
import { userService } from './services/user.service.js'

const app = express()

app.use(express.static('public'))
app.use(cookieParser())
app.use(express.json())

const PORT = 3030
app.listen(PORT, () =>
    loggerService.info(`Server listening on port http://127.0.0.1:${PORT}/`)
)

app.get('/api/bug', (req, res) => {
    const filterBy = {
        title: req.query.title || '',
        desc: req.query.desc || '',
        minSeverity: +req.query.minSeverity || 0,
        labels: req.query.labels || '',
        pageIdx: req.query.pageIdx
    }
    const sortBy = {
        sortBy: req.query.sortBy,
        sortDir: req.query.sortDir || 1
    }
    bugService.query(filterBy, sortBy)
        .then(bugs => {
            res.send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.get('/api/user/:id/bug', (req, res) => {
    const userId = req.params.id

    bugService.getUserBugs(userId)
        .then(bugs => {
            res.send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })
})

app.put('/api/bug', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot add bug')

    const bugToSave = req.body
    bugService.save(bugToSave, loggedInUser)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

app.post('/api/bug', (req, res) => {
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot add bug')

    const bugToSave = req.body
    bugService.save(bugToSave, loggedInUser)
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
    const loggedInUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedInUser) return res.status(401).send('Cannot add bug')
    
    const bugId = req.params.id
    bugService.remove(bugId, loggedInUser)
        .then(() => res.send(bugId))
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})


// AUTH API

app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        })
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})

app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})