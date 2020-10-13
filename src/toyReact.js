const RANGE_TO_DOM = Symbol('range to dom')

export function createElement(type, props, ...children) {
  let el
  if (typeof type === 'string') {
    el = new ElementWrapper(type)
  } else {
    el = new type
  }

  for (let prop in props) {
    el.setProps(prop, props[prop])
  }

  function insertChildren(children) {
    for (let child of children) {
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }

      if (child === null) {
        continue
      }

      if (typeof child === 'object' && child instanceof Array) {
        insertChildren(child)
      } else {
        el.appendChild(child)
      }
    }
  }
  insertChildren(children)

  return el
}

export function render(element, parentDom) {
  let range = document.createRange()
  range.setStart(parentDom, 0)
  range.setEnd(parentDom, parentDom.childNodes.length)
  range.deleteContents()
  element[RANGE_TO_DOM](range)
}

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }

  setProps(name, value) {
    if (name.match(/^on([\s\S]+)$/)) {
      this.root.addEventListener(RegExp.$1.replace(/^[\s\S]/, s => s.toLowerCase()), value)
    } else if (name === 'className') {
      this.root.setAttribute('class', value)
    } else {
      this.root.setAttribute(name, value)
    }
  }

  appendChild(component) {
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    component[RANGE_TO_DOM](range)
  }

  [RANGE_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }

  [RANGE_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }

  setProps(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  [RANGE_TO_DOM](range) {
    this._range = range
    this.render()[RANGE_TO_DOM](range)
  }

  rerender() {
    let oldRange = this._range
    let range = document.createRange()
    range.setStart(oldRange.startContainer, oldRange.startOffset)
    range.setEnd(oldRange.startContainer, oldRange.startOffset)

    this[RANGE_TO_DOM](range)

    oldRange.setStart(range.endContainer, range.endOffset)
    oldRange.deleteContents()
  }

  setState(newState) {
    if (this.state === null || typeof this.state !== 'object') {
      this.state = newState
      this.rerender()
      return
    }

    function merge(oldState, newState) {
      for (let key in newState) {
        if (oldState[key] === null || typeof oldState[key] !== 'object') {
          oldState[key] = newState[key]
        } else {
          merge(oldState[key], newState[key])
        }
      }
    }

    merge(this.state, newState)
    this.rerender()
  }
}

