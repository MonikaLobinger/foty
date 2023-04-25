'use strict';
// js configuration file needed, not json, because jsdoc has problems with BigInt.
// This can be "fixed" in a js file. (See last lines of this file.)
// This file can not be in _scripts directory, because it is scripts folder
// for templater in obsidian.
// As jsdoch does not work at all for directories starting with an underscore "_",
// I had to copy the configuration file to another place before calling jsdoc.
// This in any case, whether json config file or js config file.
// The configuration file than fixes the problem with the underscore
//
// So this file is moved to _scripts parent directory.
// The old configuration file jsdocconf.json still is in _scripts directory,
// because I am not good with git. I do not know how to move it.
// 
module.exports = {
    plugins: ['plugins/markdown','jsdoc-mermaid'],
    recurseDepth: 10,
    source: {
      includePattern: ".+\\.js(doc|x)?$",
      excludePattern: "(^|\\/|\\\\)__"
    },
    sourceType: "module",
    tags: {
      allowUnknownTags: true,
    },
    templates: {
      cleverLinks: true,
      monospaceLinks: true,
      default: {
        staticFiles: {
          include: [
              "/home/monika/OneDrive/Notes/_/_scripts/static2"
          ]
        },
        outputSourceFiles: true
      }
    },
    docdash: {
      static: false,         // [false|true] Display the static members inside the navbar
      sort: true,            // [false|true] Sort the methods in the navbar
      sectionOrder: [               // Order the main section in the navbar (default order shown here)
           "Classes",
           "Externals",
           "Events",
           "Namespaces",
           "Mixins",
           "Tutorials",
           "Modules",
           "Interfaces"
      ],
      search: true,         // [false|true] Display seach box above navigation which allows to search/filter navigation items
      commonNav: false,      // [false|true] Group all html code for <nav> in a nav.inc.html fetched on each page (instead of include it in each html page, save {navSize}×{nb html pages} which can be huge on big project)
      collapse: true,   //  [false|true|top] Collapse navigation by default except current object's navigation of the current page, top for top level collapse
      wrap: false,           // [false|true] Wrap long navigation names instead of trimming them
      typedefs: false,       // [false|true] Include typedefs in menu
      navLevel: 3,          // [integer] depth level to show in navbar, starting at 0 (false or -1 to disable)
      private: false,        // [false|true] set to false to not show @private in navbar
      removeQuotes: "none",// ["none"|"all"|"trim"] Remove single and double quotes, trim removes only surrounding ones
      scripts: [],                  // Array of external (or relative local copied using templates.default.staticFiles.include) js or css files to inject into HTML,
      ShortenTypes: false, // [false|true] If set to true this will resolve the display name of all types as the shortened name only (after the final period).
      menu: {                       // Adding additional menu items after Home
      },
      scopeInOutputPath: true, // [false|true] Add scope from package file (if present) to the output path, true by default.
      nameInOutputPath: true, // [false|true] Add name from package file to the output path, true by default.
      versionInOutputPath: true // [false|true] Add package version to the output path, true by default. 
  }

}
// BigInt JSON serialization.
BigInt.prototype.toJSON = function() {
	return this.toString() + 'n';
}

