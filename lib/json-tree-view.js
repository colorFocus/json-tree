'use babel';

var $ = require('./jquery.min.js');

export default class JsonTreeView {

  constructor(serializedState) {
    this.element = $('<div>').addClass('json-tree');
    var tmpl = ''+
      '<div class="btn-top">'+
      '	<input type="file" class="inline-block-tight btn js-open" /><button class="inline-block-tight btn js-save">save</button>'+
      '	<button class="inline-block-tight btn fr js-convert">convert</button><button class="inline-block-tight btn fr mr-5 js-righthere">right here</button>'+
      '</div>'+
      '<div class="json-tree-container" id="json-tree-container"></div>';
    this.element.html(tmpl);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element[0];
  }

}
