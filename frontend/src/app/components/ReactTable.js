/*
Custom React Table that has dynamic page size resizing
ie. Page Size options is disabled and the number of row displayed
is based on the items provided
*/
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactTable from 'react-table'

class CustomReactTable extends Component {
  static defaultFilterMethod (filter, row) {
    const id = filter.pivotId || filter.id

    return row[id] !== undefined
      ? String(row[id]).toLowerCase().includes(filter.value.toLowerCase())
      : true
  }

  constructor (props) {
    super(props)

    this.defaultPageSize = props.data.length
    this.pageSize = props.data.length

    this.table = React.createRef()
  }

  componentDidMount () {
    const { filtered } = this.props

    if (filtered && filtered.length > 0) {
      filtered.forEach((arr) => {
        this.table.current.filterColumn(arr, arr.value)
      })
    }
  }

  shouldComponentUpdate (nextProps) {
    if (this.table.current && nextProps.filtered) {
      if (
        JSON.stringify(this.table.current.state.filtered) !==
        JSON.stringify(nextProps.filtered)
      ) {
        nextProps.filtered.forEach((arr) => {
          this.table.current.filterColumn(arr, arr.value)
        })
      }

      if (nextProps.filtered.length === 0) {
        this.pageSize = this.defaultPageSize
      }
    }

    return true
  }

  render () {
    const {
      className,
      columns,
      data,
      defaultSorted,
      filterable,
      sortable,
      filtered,
      getTrProps,
      onFilteredChange,
      setFiltered,
      showPagination
    } = this.props

    let paginationProps = {
      pageSize: this.pageSize > 0 ? this.pageSize : 3,
      pageSizeOptions: [this.pageSize],
      showPagination: false,
      defaultPageSize: this.defaultPageSize
    }
    
    if (showPagination) {
      paginationProps = {
        showPagination: true,
        defaultPageSize: 10
      }
    }    
    return ( 
      <ReactTable
        ref={this.table}
        className={`searchable ${className}`}
        columns={columns}
        filtered={filtered}
        sortable={sortable}
        data={data}
        defaultFilterMethod={CustomReactTable.defaultFilterMethod}
        defaultSorted={defaultSorted}
        filterable={filterable}
        getTdProps={() => ({
          tabIndex: 0
        })}
        getTrProps={(state, row) => {
          if (!getTrProps) {
            return {}
          }

          return {
            onKeyDown: (event) => {
              const { onClick } = getTrProps(state, row)
              if (onClick && event.key === 'Enter') {
                onClick()
              }
            },
            ...getTrProps(state, row)
          }
        }}
        onFilteredChange={(input) => {
          onFilteredChange(input)
          if (setFiltered) {
            setFiltered(input)
          }

          this.pageSize =
            this.table.current.getResolvedState().sortedData.length
        }}
        {...paginationProps}
      />
    )
  }
}

CustomReactTable.defaultProps = {
  className: '',
  defaultSorted: undefined,
  filterable: true,
  filtered: undefined,
  getTrProps: undefined,
  onFilteredChange: () => {},
  setFiltered: undefined
}

CustomReactTable.propTypes = {
  className: PropTypes.string,
  columns: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  data: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  defaultSorted: PropTypes.arrayOf(PropTypes.shape({})),
  filterable: PropTypes.bool,
  filtered: PropTypes.arrayOf(PropTypes.shape({})),
  getTrProps: PropTypes.func,
  onFilteredChange: PropTypes.func,
  setFiltered: PropTypes.func,
  showPagination: PropTypes.bool
}

export default CustomReactTable
