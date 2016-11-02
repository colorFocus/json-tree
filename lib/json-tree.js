'use babel';

import JsonTreeView from './json-tree-view';
import { CompositeDisposable } from 'atom';
var $ = require('./jquery.min.js');
var Atom = require('atom');
var fs = require('fs-plus');
var path = require('path');
var JSONEditor = require('./jsoneditor.js');
var File = Atom.File;

export default {

  jsonTreeView: null,
  modalPanel: null,
  subscriptions: null,
  options: {},
  container: null,
  jeditor: null,
  indent: 4,
  filename: 'ts.json',

  activate(state) {
    var self = this;
    this.jsonTreeView = new JsonTreeView(state.jsonTreeViewState);
    this.modalPanel = atom.workspace.addRightPanel({
      item: this.jsonTreeView.getElement(),
      visible: false
    });

    this.container = document.getElementById('json-tree-container');
    this.options = {
      mode: 'tree',
      modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
      onError: function (err) {
        alert(err.toString());
      },
      onModeChange: function (newMode, oldMode) {
        console.log('Mode switched from', oldMode, 'to', newMode);
      }
    };

    var $jsonTree = $('.json-tree');
    //保存到本地
    $jsonTree.delegate('.js-save', 'click', function(evt){
      var json = JSON.stringify(self.jeditor.get(), null, self.indent);
      var dir = path.dirname(self.path);
      var _path = path.join(dir, self.filename);
      //var _file = new File(_path);
      fs.writeFileSync(_path, json, 'utf8');//将文件写入本地的_path路径
      atom.open({pathsToOpen: _path, newWindow: false});
    });

    //在本地选择要格式化的json文件
    $jsonTree.delegate('.js-open', 'change', function(evt){
      var $target = $(evt.target);
      var file = $target[0].files[0];
      if(fs.isFileSync(file.path)){
        self.path = file.path;
        var _file = new File(file.path);
        _file.read().then(function(cont){
          try{
            var json = JSON.parse(cont);
          }catch(e){
            alert('请上传json文件');
          }
          self.jeditor.set(json);
          $target.val('');
        });
      }else{
        alert('获取文件失败！');
      }
    });

    //格式化当前窗口的文件内容
    $jsonTree.delegate('.js-righthere', 'click', function(evt){
      var textEditor = atom.workspace.getActiveTextEditor();
      try{
        var json = JSON.parse(textEditor.getText());
      }catch(e){
        alert('该文件内容不是json');
      }
      self.jeditor.set(json);
    });

    //将格式化后的json回写当前窗口
    $jsonTree.delegate('.js-convert', 'click', function(evt){
      var json = JSON.stringify(self.jeditor.get(), null, self.indent);
      var textEditor = atom.workspace.getActiveTextEditor();
      textEditor.setText(json);
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'json-tree:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.jsonTreeView.destroy();
  },

  serialize() {
    return {
      jsonTreeViewState: this.jsonTreeView.serialize()
    };
  },

  toggle() {
    var jeditor;
    if(this.modalPanel.isVisible()){
      this.jeditor && this.jeditor.destroy();
      this.modalPanel.hide();
    }else{
      this.jeditor = new JSONEditor(this.container, this.options);
      this.modalPanel.show();
    }
  }

};
