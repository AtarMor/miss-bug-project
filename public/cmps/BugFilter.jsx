const { useState, useEffect } = React
import { LabelSelector } from './LabelSelect.jsx'

export function BugFilter({ onSetFilter, filterBy }) {
	const [filterByToEdit, setFilterByToEdit] = useState(filterBy)

	const labels = ['critical', 'need-CR', 'dev-branch']
	useEffect(() => {
		onSetFilter(filterByToEdit)
	}, [filterByToEdit])

	function handleChange({ target }) {
		const field = target.name
		const value = target.type === 'number' ? +target.value : target.value
		setFilterByToEdit(prevFilter => ({
			...prevFilter,
			[field]: value,
		}))
	}

	function onLabelChange(selectedLabels) {

		setFilterByToEdit(prevFilter => ({
			...prevFilter,
			labels: selectedLabels,
		}))
	}

	const { minSeverity, txt } = filterByToEdit
	return (
		<form className="bug-filter">
			<h3>Filter Bugs</h3>
			<input className="filter-input" type="text" id="txt" name="txt" value={txt} placeholder="Enter text here..." onChange={handleChange} />
			<input placeholder="Enter severity here.." className="filter-input" type="number" id="severity" name="minSeverity" value={minSeverity} onChange={handleChange} />
			<LabelSelector labels={labels} onLabelChange={onLabelChange} />
		</form>
	)
}
