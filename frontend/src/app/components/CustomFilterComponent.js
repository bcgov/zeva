import React from 'react'

const CustomFilterComponent = ({ filter, onChange, column }) => {
  const onKeyDown = (event) => {
    if (event.keyCode === 13) {
      column.applyFilters()
    }
  }

  return (
    <input
      type="text"
      style={{
        width: '100%'
      }}
      placeholder={column.Placeholder}
      value={filter ? filter.value : ''}
      onChange={event => onChange(event.target.value)}
      onKeyDown={onKeyDown}
    />
  )
}

export default CustomFilterComponent
