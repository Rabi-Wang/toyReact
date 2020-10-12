import { render, createElement, Component } from './toyReact.js'

class App extends Component{
  render() {
    return (
      <div>
        <h1>Toy React</h1>
        {this.children}
      </div>
    )
  }
}

render(<App>
  <div>--------------</div>
  <span>toy react</span>
</App>, document.body)
