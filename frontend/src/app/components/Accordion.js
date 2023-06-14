import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// an accordion component + helping components you can use
// the keys of the opened accordion items should be supplied by the calling component, and so you must also supply a handler that updates these keys
// you can use the accordionItemClickHandler below if you do not need behaviour additional to opening/closing an item

const accordionItemClickHandler = (state, stateSetter, itemKey) => {
  const index = state.findIndex((keyOfItem) => {
    return keyOfItem === itemKey
  })
  if (index > -1) {
    const newState = [...state]
    newState.splice(index, 1)
    stateSetter(newState)
  } else {
    stateSetter([...state, itemKey])
  }
}

const AccordionHeader = ({ itemKey, title, keysOfOpenItems = [], handleItemClick }) => {
  let icon = "chevron-down"
  if (keysOfOpenItems.includes(itemKey)) {
    icon = "chevron-up"
  }
  return (
    <div className="accordion-header">
      <span>
        <b>
          {title}
        </b>
      </span>
      <span>
        <button className="toggler" onClick={(event) => { handleItemClick(itemKey) }}><FontAwesomeIcon icon={icon} size="2x"/></button>
      </span>
    </div>
  )
}

const Accordion = ({ items = [], keysOfOpenItems = [], handleItemClick }) => {
  const accordionItems = []

  items.forEach((item) => {
    const itemKey = item.key
    const title = item.title
    let content = null
    if (keysOfOpenItems.includes(itemKey)) {
      content = item.content
    }
    accordionItems.push(<div key={itemKey}><AccordionHeader itemKey={itemKey} title={title} keysOfOpenItems={keysOfOpenItems} handleItemClick={handleItemClick}/>{content}</div>)
  })

  return (
    <div>{accordionItems}</div>
  )
}

export { accordionItemClickHandler, Accordion }
