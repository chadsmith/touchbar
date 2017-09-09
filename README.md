# touchbar package

Add touchbar elements to atom

## Installation
`apm install git@github.com:chadsmith/touchbar.git`

## How to use
Touchbar will be loaded on startup.
Press `ctrl-alt-o` to toggle touchbar

## Current features:
- (Un)comment code
- Beautify code (you will need [atom-beautify](https://atom.io/packages/atom-beautify))
- Color picker
- Emoji Picker
- Toggle Command Palette
- Quickly load frequently used projects
- Hide buttons when not editing

![touchbar screenshot](touch_screenshot.png)

Experimental emoji bar
![touchbar screenshot](touch_screenshot_2.png)

## How to change elements
- Change items in `lib/config.json`

## TODO:
- [ ] move all settings to separate window [touchbar-edit-view.js](lib/touchbar-edit-view.js)
  - Add elements
  - Change commands (label, command, color)
  - Different Profiles
- [ ] show different objects on TouchBar depending on programming language (.md -> bold, italic...)
