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

export function render(element, pageDom) {
  pageDom.appendChild(element.root)
}

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }

  setProps(name, value) {
    this.root.setAttribute(name, value)
  }

  appendChild(component) {
    this.root.appendChild(component.root)
  }
}

class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content)
  }
}

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
  }

  setProps(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  get root() {
    if (!this._root) {
      this._root = this.render().root
    }
    return this._root
  }
}

