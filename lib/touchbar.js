'use babel';

import TouchbarEditView from './touchbar-edit-view';
import {CompositeDisposable} from 'atom';

const {app, BrowserWindow, TouchBar} = require('remote')

const {
  TouchBarButton,
  TouchBarColorPicker,
  TouchBarGroup,
  TouchBarLabel,
  TouchBarPopover,
  TouchBarScrubber,
  TouchBarSegmentedControl,
  TouchBarSlider,
  TouchBarSpacer
} = TouchBar

const EditViewURI = 'atom://touchbar-edit-view'

const touchBarConfig = require("./config.json")
const emojis = require('./emoji.json')

let touchBarEnabled = false;

let globalTouchBar = undefined;

export default {

  touchbarView : null,
  modalPanel : null,
  subscriptions : null,

  config : {},

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.setTouchBar();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'touchbar:toggle': () => this.toggle()
    }));

    this.subscriptions.add(atom.workspace.observeActivePaneItem((item) => this.setTouchBar()));

    this.subscriptions.add(atom.project.onDidChangePaths((paths) => this.setTouchBar()));

    // Register command that opens the edit window
    // this.subscriptions.add(atom.commands.add('atom-workspace', {
    //   'touchbar:edit': () => this.openEditWindow()
    // }));
  },

  deactivate() {
    BrowserWindow.getFocusedWindow().setTouchBar(null)
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.touchbarView.destroy();
  },

  setTouchBar() {
    const touchBar = this.arrayToTouchBarElements(touchBarConfig.elements)

    globalTouchBar = touchBar

    atom.getCurrentWindow().setTouchBar(touchBar)
  },

  serialize() {
    // return {touchbarViewState: this.touchbarView.serialize()};
  },

  toggle() {
    BrowserWindow.getFocusedWindow().setTouchBar(touchBarEnabled
      ? null
      : globalTouchBar)
    touchBarEnabled = !touchBarEnabled
  },

  openEditWindow() {
    let tbev = new TouchbarEditView(EditViewURI)
    atom.workspace.open(tbev)
  },

  arrayToTouchBarElements(input) {
    let myTouchBarElements = []
    let editor = !!atom.workspace.getActiveTextEditor();
    let projects = atom.project.getPaths();
    // map all touch bar elements from config and create equivalent objects
    input.map((e, i) => {
      switch (e.type) {
        case "button":
          // creating new button
          myTouchBarElements.push(new TouchBarButton({
            label: e.label,
            click: () => {
              let view = atom.workspace.getActiveTextEditor();
              atom.commands.dispatch(atom.views.getView(view || atom.workspace), e.command);
            },
            // apply selected color only when there is one specified in config, otherwise use default color
            backgroundColor: (e.color
              ? e.color
              : null)
          }))
          break;

        case "editor-button":
          // creating button that only appears when editing a file
          if(editor)
            myTouchBarElements.push(new TouchBarButton({
              label: e.label,
              click: () => {
                let view = atom.workspace.getActiveTextEditor();
                atom.commands.dispatch(atom.views.getView(view || atom.workspace), e.command);
              },
              // apply selected color only when there is one specified in config, otherwise use default color
              backgroundColor: (e.color
                ? e.color
                : null)
            }))
          break;

        case "project-folder":
          // creating project folder button
          if(projects.indexOf(e.path) < 0) {
            myTouchBarElements.push(new TouchBarButton({
              label: e.label,
              click: () => atom.addToProject([e.path]),
              // apply selected color only when there is one specified in config, otherwise use default color
              backgroundColor: (e.color
                ? e.color
                : null)
            }));
            break;
          }
          break;

        case "label":
          // creating new label
          myTouchBarElements.push(new TouchBarLabel({label: e.label, textColor: e.color}))
          break;

        case "color-picker":
          // creating new color picker
          myTouchBarElements.push(new TouchBarColorPicker({
            change: (color) => {
              // inserts the current selected color
              // BUG: inserts a lot of colors when sliding over colors / color gradient
              atom.workspace.getActiveTextEditor().insertText(color)
            }
          }))
          break;

        case "spacer":
          // creating new color picker
          myTouchBarElements.push(new TouchBarSpacer({size: e.size}))
          break;

        case "group":
          myTouchBarElements.push(new TouchBarGroup({
            items: this.arrayToTouchBarElements(e.elements)
          }))
          break;

        case "popover":
          myTouchBarElements.push(new TouchBarPopover({
            label: e.label,
            items: this.arrayToTouchBarElements(e.elements)
          }))
          break;

        case "project-bar":
          // creating project bar popover
          var inactiveProjects = e.elements.filter(element => element.type === 'project-folder' && projects.indexOf(element.path) < 0);
          if(inactiveProjects.length)
            myTouchBarElements.push(new TouchBarPopover({
              label: e.label,
              items: this.arrayToTouchBarElements(e.elements)
            }));
          else
            myTouchBarElements.push(new TouchBarButton({
              label: e.label,
              click: () => {
                let view = atom.workspace.getActiveTextEditor();
                atom.commands.dispatch(atom.views.getView(view || atom.workspace), 'application:add-project-folder');
              },
              backgroundColor: (e.color
                ? e.color
                : null)
            }))
          break;

        case "scrubber":
          myTouchBarElements.push(new TouchBarScrubber({
            items: emojis,
            highlight: (i) => {
              atom.workspace.getActiveTextEditor().insertText(emojis[i].label)
            },
            selectedStyle: "outline",
            overlayStyle: "outline",
            continuous: false
          }))
          break;

      }
    })

    return new TouchBar(myTouchBarElements)
  }
};
