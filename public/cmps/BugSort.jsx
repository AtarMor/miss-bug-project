const { useState, useEffect } = React

export function BugSort({ onSetSort, sortBy }) {
    const [sortByToEdit, setSortByToEdit] = useState({ ...sortBy })

    useEffect(() => {
        onSetSort(sortByToEdit)
    }, [sortByToEdit])

    function handleChange({ target }) {
        const field = target.name
        const value = target.value

        if (field === 'sortDir')
            setSortByToEdit(prevSort => ({
                ...prevSort, sortDir: -prevSort.sortDir,
            }))
        else
            setSortByToEdit(prevSort => ({
                ...prevSort, [field]: value,
            }))
    }

    return (
        <form className="bug-sort">
            <select className="sort-by" name="sortBy" value={sortByToEdit.sortBy} onChange={handleChange}>
                <option value={''}>----</option>
                <option value="title">Title</option>
                <option value="severity">Severity</option>
                <option value="createdAt">Date</option>
            </select>
            <label>
                <input type="checkbox" name="sortDir" value={!sortByToEdit.sortDir === -1} onChange={handleChange} />
                Descending
            </label>
        </form>
    )
}
