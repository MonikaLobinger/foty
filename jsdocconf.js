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
      dictionaries: ["jsdoc"]
    },
    templates: {
      cleverLinks: true,
      monospaceLinks: true,
      default: {
        staticFiles: {
          include: [
              "/home/monika/OneDrive/Notes/_/_scripts/static"
          ]
        },
        outputSourceFiles: true
      }
    }
};
// BigInt JSON serialization.
BigInt.prototype.toJSON = function() {
	return this.toString() + 'n';
}

