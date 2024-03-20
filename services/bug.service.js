import fs from 'fs'

import { utilService } from "./utils.service.js";

export const bugService = {
    query,
    save,
    getById,
    remove,
    getUserBugs
}

const PAGE_SIZE = 3

const bugs = utilService.readJsonFile('data/bug.json')

function query(filterBy, sortBy) {
    let bugsToReturn = bugs
    if (filterBy) bugsToReturn = filterBugs(bugsToReturn, filterBy)
    if (sortBy) bugsToReturn = sortBugs(bugsToReturn, sortBy)
    if (filterBy.pageIdx !== undefined) {
        const pageIdx = +filterBy.pageIdx
        const startIdx = pageIdx * PAGE_SIZE
        bugsToReturn = bugsToReturn.slice(startIdx, startIdx + PAGE_SIZE)
    }

    return Promise.resolve(bugsToReturn)
}

function filterBugs(bugsToReturn, filterBy) {
    if (filterBy.title) {
        const regex = new RegExp(filterBy.title, 'i')
        bugsToReturn = bugsToReturn.filter(bug => regex.test(bug.title))
    }
    if (filterBy.minSeverity) {
        bugsToReturn = bugsToReturn.filter(bug => bug.severity >= filterBy.minSeverity)
    }
    if (filterBy.desc) {
        const regex = new RegExp(filterBy.desc, 'i')
        bugsToReturn = bugsToReturn.filter(bug => regex.test(bug.description))
    }
    if (filterBy.labels && filterBy.labels.length) {
        filterBy.labels.forEach(label => {
            bugsToReturn = bugsToReturn.filter(bug => {
                if (bug.labels) return bug.labels.includes(label)
            })
        })
    }
    // if (filterBy.label) {
    //     bugsToReturn = bugsToReturn.filter(bug =>
    //         bug.labels.some(label =>
    //             label.includes(filterBy.label)))
    // }
    return bugsToReturn
}

function sortBugs(bugsToReturn, sortBy) {
    if (sortBy.sortBy === 'title') bugsToReturn.sort((bug1, bug2) =>
        (bug1.title.localeCompare(bug2.title)) * sortBy.sortDir)
    else if (sortBy.sortBy === 'severity') bugsToReturn.sort((bug1, bug2) =>
        (bug1.severity - bug2.severity) * sortBy.sortDir)
    else if (sortBy.sortBy === 'createdAt') bugsToReturn.sort((bug1, bug2) =>
        (bug1.createdAt - bug2.createdAt) * sortBy.sortDir)

    return bugsToReturn
}

function getById(id) {
    const bug = bugs.find(bug => bug._id === id)
    if (!bug) return Promise.reject('Bug does not exist!')
    return Promise.resolve(bug)
}

function getUserBugs(userId) {
    const userBugs = bugs.filter(bug => bug.creator._id === userId)
    if (!userBugs) return Promise.reject('You have no bugs')
    return Promise.resolve(userBugs)
}

function remove(id, loggedInUser) {
    const bugIdx = bugs.findIndex(bug => bug._id === id)

    if (bugIdx === -1) return Promise.reject('cannot find the bug')

    const bug = bugs[bugIdx]
    if (!loggedInUser.isAdmin &&
        bug.creator._id !== loggedInUser._id) {
        return Promise.reject('Not your bug')
    }

    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bug, loggedInUser) {
    if (bug._id) {
        if (!loggedInUser.isAdmin &&
            bug.creator._id !== loggedInUser._id) {
            return Promise.reject('Not your bug')
        }
        const bugIdx = bugs.findIndex(_bug => _bug._id === bug._id)
        bugs[bugIdx] = bug
    } else {
        bug._id = utilService.makeId()
        bug.createdAt = Date.now()
        bug.creator = loggedInUser
        bugs.unshift(bug)
    }
    return _saveBugsToFile().then(() => bug)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                console.log(err)
                return reject(err)
            }
            resolve()
        })
    })
}