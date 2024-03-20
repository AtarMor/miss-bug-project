
import { storageService } from './async-storage.service.js'
import { utilService } from './util.service.js'

const BASE_URL = '/api/bug/'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter,
    getDefaultSort
}

function query(filterBy = getDefaultFilter(), sortBy = getDefaultSort()) {
            console.log('filterBy in Load:', filterBy)

    return axios.get(BASE_URL, { params: {...filterBy, ...sortBy} })
        .then(res => res.data)
        .catch(err => {
            console.log('query, err:', err)
        })
}

function getDefaultFilter() {
    return {
        title: '',
        desc: '',
        minSeverity: 0,
        labels: '',
        pageIdx: 0
    }
}

function getDefaultSort() {
    return {
        sortBy: '',
        sortDir: 1
    }
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
        .catch(err => {
            console.log('getById, err:', err)
        })
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data)
        .catch(err => {
            console.log('remove, err:', err)
        })
}

function save(bug) {
    if (bug._id) {
        return axios.put(BASE_URL, bug)
    } else {
        return axios.post(BASE_URL, bug)
    }

    // const url = BASE_URL + 'save'
    // let queryParams = `?title=${bug.title}&severity=${bug.severity}&description=${bug.description}&createdAt=${bug.createdAt}`
    // if (bug._id) {
    //     queryParams += `&_id=${bug._id}`
    // }
    // return axios.get(url + queryParams).then(res => res.data)
}

function _createBugs() {
    let bugs = utilService.loadFromStorage(BASE_URL)
    if (!bugs || !bugs.length) {
        bugs = [
            {
                title: "Infinite Loop Detected",
                severity: 4,
                _id: "1NF1N1T3"
            },
            {
                title: "Keyboard Not Found",
                severity: 3,
                _id: "K3YB0RD"
            },
            {
                title: "404 Coffee Not Found",
                severity: 2,
                _id: "C0FF33"
            },
            {
                title: "Unexpected Response",
                severity: 1,
                _id: "G0053"
            }
        ]
        utilService.saveToStorage(BASE_URL, bugs)
    }
}
