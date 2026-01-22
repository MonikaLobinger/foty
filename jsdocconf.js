'use strict';
// js configuration file needed, not json, because jsdoc has problems with BigInt.
// This can be "fixed" in a js file. (See last lines of this file.)
// This file can not be in _scripts directory, because it is scripts folder
// for templater in obsidian.
// As jsdoc does not work at all for directories starting with an underscore "_",
// I had to copy the configuration file to another place before calling jsdoc.
// This in any case, whether json config file or js config file.
// The configuration file than fixes the problem with the underscore
//
// So this file is moved to _scripts parent directory.
// The old configuration file jsdocconf.json still is in _scripts directory,
// because I am not good with git. I do not know how to move it.
// 
module.exports = {
    plugins: ['plugins/markdown','jsdoc-mermaid',
      "node_modules/vue-x-docs",
      //'node_modules/classy-template/plugin.js',
      //'node_modules/jsdoc-wmf-theme/plugins/default',
    ],
    opts: {
      template: "node_modules/better-docs", // SEHR SEHR GUT, dreispaltig, dezent,
      //template: "node_modules/docdash/",
      //template: "node_modules/@etercast/jsdoc-template", // COOOL, anstrengend
      //template: "./node_modules/jsdoc-wmf-theme", // NETT, Wikipedia eben
      //template: "node_modules/simple-jsdoc", // COOL
      //template: "node_modules/docolatte", // ZIEMLICH COOL, Hell/Dunkel, Seitenleiste zu lang
      //template: "node_modules/vue-x-docs", // HÜBSCH
      //template: "./node_modules/ink-docstrap/template", // OK
      //template: "node_modules/minami", // Nicht so mein Fall
      //template: "node_modules/toast-jsdoc", // Hässlich, Speicherintensiv?
      // NICHT SO GUT template: "node_modules/classy-template/", // Dreispaltig, Keine Suche, Klassen sind verschwunden
      // GEHT NICHT template: "./node_modules/jsdoc-rtd", // Scheitert an async 
      // KANN NICHT MIT MERMAID template: "node_modules/clean-jsdoc-theme/",
      // GEHT NICHT template: "node_modules/jsdoc-chameleon-template", // Problem mit underscore module
      // GEHT NICHT template: "./node_modules/tidy-jsdoc", // Problem mit underscore module
      // GEHT NICHT template: "./node_modules/bcmc-jsdoc-template/template",
      // NICHT INSTALLIERBAR template: "node_modules/connect-jsdoc-theme", // Gibt es in npm nicht mehr
      // RIESENSAUEREI template: "./node_modules/daybrush-jsdoc-template", // Zerstört jsdoc
      sourceType: "module",
      encoding: "utf8",
      recurse: true,
      verbose: true,
      allowedGlobals: ["CHECK_ERROR_OUTPUT", "DEBUG", "TESTING",
        "LOG_ESSENCE_CONSTRUCTOR_2_CONSOLE", "FrontmatterCallback",
        "GeneCallback", "NL", "Setting.", "areEqual", "aut", "dbg", "vaut",
        "auts", "white", "black", "cyan", "red", "rose", "pink", "blue", "yellow",
        "lime", "green", "gray", "findSibling", "cbkCalcDateTitle", "cbkFmtAlias",
        "cbkFmtTags", "cbkFmtCreated", "cbkFmtCssClasses", "cbkNoteType",
        "cbkNoteName", "cbkIsObjectNotNullNotArray", "cbkIsNull", "cbkIsArray",
        "cbkInstanceOf", "cbkTypeOf", "cbkTypeOfLc", "cbkIsDate", "cbkNextDateLink",
        "cbkPrevDateLink", "Error", "registeredExceptions", "letAllThrow",
        "registeredTests", "test", "flatten", "foty"
      ],
    },
    source: {
      includePattern: ".+\\.js(doc|x)?$",
      excludePattern: "(^|\\/|\\\\)%"
    },
    tags: {
      allowUnknownTags: true,
    },
    templates: {
      default: {
        staticFiles: {
          include: ['./_static'],
        },
      },
      "search": true,
      cleverLinks: false,
      monospaceLinks: false,
      outputSourceFiles: true,
    },
    docdash: {
      sort: false,            // [false|true] Sort the methods in the navbar
      static: true,         // [false|true] Display the static members inside the navbar      
      search: true,         // [false|true] Display seach box above navigation which allows to search/filter navigation items
      collapse: true,       //  [false|true|top] Collapse navigation by default except current object's navigation of the current page, top for top level collapse
      typedefs: true,       // [false|true] Include typedefs in menu
      navLevel: 5,          // [integer] depth level to show in navbar, starting at 0 (false or -1 to disable)
      wrap: false,           // [false|true] Wrap long navigation names instead of trimming them
      ShortenTypes: false, // [false|true] If set to true this will resolve the display name of all types as the shortened name only (after the final period).
      removeQuotes: "none",// ["none"|"all"|"trim"] Remove single and double quotes, trim removes only surrounding ones
      private: false,        // [false|true] set to false to not show @private in navbar
      sectionOrder: [               // Order the main section in the navbar (default order shown here)
        "Classes",
        "Events",
        "Namespaces",
        "Mixins",
        "Tutorials",
        "Modules",
        "Interfaces",
        "Global",
        "Externals",
      ],
    },
    xdocdash: {
      commonNav: false,      // [false|true] Group all html code for <nav> in a nav.inc.html fetched on each page (instead of include it in each html page, save {navSize}×{nb html pages} which can be huge on big project)
      scripts: [],                  // Array of external (or relative local copied using templates.default.staticFiles.include) js or css files to inject into HTML,
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
