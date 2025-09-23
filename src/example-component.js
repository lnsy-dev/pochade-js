import DataroomElement from 'dataroom-js';

class ExampleComponent extends DataroomElement {
  async initialize(){
    this.create("h1", {content: "Example Code"});
    this.create("p", {content: "This element uses the dataroom.js. It provides a few features that make using custom HTML Elements easier!"})
  }
}

customElements.define('example-component', ExampleComponent)
