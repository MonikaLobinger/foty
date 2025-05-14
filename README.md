# foty

Folder Types for [Obsidian](https://obsidian.md/), Plugin [Templater](https://github.com/SilentVoid13/Templater) has to be installed

|| [History of foty.js](https://github.com/MonikaLobinger/foty/commits/main/_scripts/foty.js) || [All main commits](https://github.com/MonikaLobinger/foty/commits/main) ||

This script [foty.js](https://github.com/MonikaLobinger/foty/blob/main/_scripts/foty.js) is called from template [atest_Vorlage.md](https://github.com/MonikaLobinger/foty/blob/main/_vorlagen/atest_Vorlage.md)

## Previous

The precursor of this script [onne.js](https://github.com/MonikaLobinger/foty/blob/main/_scripts/onne.js) is called from template [One_Vorlage.md](https://github.com/MonikaLobinger/foty/blob/main/_vorlagen/One_Vorlage.md)

But this is much to complicated and unstructured for my taste and it is not generic - changing my needs or being used for other users needs will result in code changes (not only data changes)

## Current

So I am working on a generic version.

Every line of code you do not write is good 

## JSDoc

- `cd NotebookDirectory/_`
- `npm install -D jsdoc`
- `npm install -D docdash`
- `npm install -D jsdoc-mermaid`
- Edit: `./node_modules/jsdoc-mermaid/index.js` replace `7.1.0` with `11.6.0`
  - OR: Download https://app.unpkg.com/mermaid@11.6.0/files/dist/mermaid.min.js
  - to `.` (current directory which is `NotebookDirectory/_`)    
  - Edit: `./node_modules/jsdoc-mermaid/index.js` replace `https://unpkg.com/mermaid@7.1.0/dist` with `..`
  - So source would be `src="../mermaid.min.js">`
- `cp jsdoc.css node_modules/docdash/static/styles`
- `./node_modules/.bin/jsdoc -c jsdocconf.js -r _scripts/foty.md _scripts/foty.js`
- open `./out/index.html` in Browser

