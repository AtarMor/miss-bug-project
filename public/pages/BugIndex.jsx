import { BugList } from '../cmps/BugList.jsx'
import { BugFilter } from '../cmps/BugFilter.jsx'

import { bugService } from '../services/bug.service.js'
import { utilService } from '../services/util.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

const { useState, useEffect, useRef } = React

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())
    // const [sortBy, setSortBy] = useState(bugService.getDefaultSort())
    const debounceOnSetFilter = useRef(utilService.debounce(onSetFilter, 500))


    useEffect(() => {
        loadBugs()
    }, [filterBy])

    function loadBugs() {
        bugService.query(filterBy)
            .then(setBugs)
    }

    function onSetFilter(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    function onChangePage(diff) {
        if (filterBy.pageIdx === undefined) return
        let nextPageIdx = filterBy.pageIdx + diff
        if (nextPageIdx < 0) nextPageIdx = 0
        setFilterBy(prevFilter => ({ ...prevFilter, pageIdx: nextPageIdx }))
    }

    function onTogglePagination() {
        setFilterBy(prevFilter => ({
            ...prevFilter,
            pageIdx: filterBy.pageIdx === undefined ? 0 : undefined
        }))
    }

    function onRemoveBug(bugId) {
        bugService
            .remove(bugId)
            .then(() => {
                console.log('Deleted Successfully!')
                const bugsToUpdate = bugs.filter((bug) => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch((err) => {
                console.log('Error from onRemoveBug ->', err)
                showErrorMsg('Cannot remove bug')
            })
    }

    function onAddBug() {
        const bug = {
            title: prompt('Bug title?'),
            severity: +prompt('Bug severity?'),
            description: prompt('Bug description?')
        }
        console.log('description:', bug)
        bugService
            .save(bug)
            .then((savedBug) => {
                console.log('Added Bug', savedBug)
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch((err) => {
                console.log('Error from onAddBug ->', err)
                showErrorMsg('Cannot add bug')
            })
    }

    function onEditBug(bug) {
        const severity = +prompt('New severity?')
        const bugToSave = { ...bug, severity }
        bugService
            .save(bugToSave)
            .then((savedBug) => {
                console.log('Updated Bug:', savedBug)
                const bugsToUpdate = bugs.map((currBug) =>
                    currBug._id === savedBug._id ? savedBug : currBug
                )
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch((err) => {
                console.log('Error from onEditBug ->', err)
                showErrorMsg('Cannot update bug')
            })
    }

    return (
        <main>
            <h3>Bugs App</h3>
            <main>
                <section className="pagination">
                    <button onClick={() => onChangePage(-1)}>-</button>
                    <span>{filterBy.pageIdx + 1 || 'No pagination'}</span>
                    <button onClick={() => onChangePage(1)}>+</button>
                    <button onClick={onTogglePagination}>Toggle Pagination</button>
                </section>
                <BugFilter
                    onSetFilter={debounceOnSetFilter.current}
                    filterBy={filterBy} />

                <button onClick={onAddBug}>Add Bug ⛐</button>
                <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
            </main>
        </main>
    )
}
