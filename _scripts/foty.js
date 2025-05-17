module.exports = foty // templater call: "await tp.user.foty(tp, app)"
//@todo return default value of allowed type if type of given value not allowed
// Skript für Obsidian um Notizen verschiedener Art zu erstellen, siehe foty.md.
// Script for Obsidian to create different note types, see foty.md for details.
//
// Different parts of codes are in different regions.
// A region starts with //#region REGION_NAME or //# REGION_NAME
// and it ends with //#endregion REGION_NAME or //#endregion REGION_NAME
// Regions can be nested.
// Using Visual Studio Code (and perhaps other source code editors) regions
// marked this way can be folded for convenience.
// 
// Some settings for the script can be adapted to user needs. Those are in
// region USER CONFIGURATION.

//#region CONFIGURATION
// This region simulates a configuration dialog
// It contains a section with code to be used in configuration, which user would 
// never see in a configuration dialog, so it is named DO_NOT_TOUCH. 
// Unfortunately the callback functions defined there have to be written in
// JavaScript file before they can be used.
//
// And it contains the value section, which user can edit, so it is
// named USER CONFIGURATION.
//
// Additionally in a section named EXAMPLE_CONFIGURATIONS it contains example 
// configurations
// 
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Only make changes in region USER CONFIGURATION
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  #region DO_NOT_TOUCH
/** Returns sibling with next/prev date, depending on {@link next}
 *
 * @param {*} next 
 * @param {*} tp
 * @param {*} app 
 * @param {*} noteSetting 
 * @returns {*} 
 */
function findSibling(next, tp, app, noteSetting) {
  function hasDate(fname, dateformat) {
    let matchstring = dateformat
    matchstring = matchstring.replaceAll("Y","[0-9]")
    matchstring = matchstring.replaceAll("M","[0-9]")
    matchstring = matchstring.replaceAll("D","[0-9]")
    let answer = fname.match(matchstring)
    return answer == null ? false : true
  }   
  let dateformat = noteSetting.getValue("title_date_format")
  let currentFile /* TFile */ = app.workspace.getActiveFile();
  let currentFileName = currentFile.name;
  let currentFolder /* TFolder */ = currentFile.parent;
  let currentFolderPath /* string */ = currentFolder.path;
  text = "";
  let prevFile /*TFile*/= null;
  let nextFile /*TFile*/= null;
  const siblings = app.vault.getAbstractFileByPath(currentFolderPath).children;
  siblings.forEach((file) => {
    if(hasDate(file.name, dateformat) && file.name != currentFileName) {
      if(file.name > currentFileName) {
        if(nextFile == null) {
          nextFile = file;
        } else {
          if(file.name < nextFile.name) {
            nextFile = file;
          }
        }
      } else if(file.name < currentFileName) { 
        if(prevFile == null) {
          prevFile = file;
        } else {
          if(file.name > prevFile.name) {
            prevFile = file;
          }
          
        }
      }
    }
  });  
  let answerFile = next === true ? nextFile : prevFile
  let answer = ""
  if(answerFile != null) {
    answer = app.fileManager.generateMarkdownLink(answerFile,currentFolderPath+"/")
  } else if (next == true) {
    answer = app.fileManager.generateMarkdownLink(currentFile,currentFolderPath+"/")
    let tomorrow = tp.date.tomorrow(dateformat)
    let today = tp.date.now(dateformat)
    answer = answer.replaceAll(today,tomorrow)
  }
  return answer
}
/** callback to create frontmatter value
 * @callback FrontmatterCallback
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {Setting} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {(String|Array.<String>)}
 */
/** {@link FrontmatterCallback}, => title using "title_before_date" and "title_date_format"
 * @type {FrontmatterCallback}
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {String} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {String}
 */
function cbkCalcDateTitle(tp, noteName, noteType, noteSetting, app) {
  let title_before_date = noteSetting.getValue("title_before_date")
  if(title_before_date == undefined) title_before_date = ""
  let title_date_format = noteSetting.getValue("title_date_format")
  if(title_date_format == undefined) title_date_format = "YYYY-MM-DD"
  let name = title_before_date + tp.date.now(title_date_format)
  return name
}
/** {@link FrontmatterCallback}, returns alias values
 * @type {FrontmatterCallback}
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {String} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {(String|Array.<String>)}
 */
function cbkFmtAlias(tp, noteName, noteType, noteSetting, app) {
  let alias = noteName
  if (noteType != "ort" && noteType != "person") {
    if(noteName.startsWith("_"))
      alias = noteName.slice(1)
    else
      alias = noteName.replace(/,/g, ` `).replace(/  /g, ` `)
  } else {
    // ort, person
    alias = noteName.replace(/, /g, `,`)
    let strArr = alias.split(",")
    alias = strArr[0]
    strArr.shift()
    if (noteType === "ort") {
      alias += "(" + strArr.join(" ") + ")"
    } else if (noteType === "person") {
      alias = strArr.join(" ") + " " + alias
    }
  }
  let aliases=[]
  aliases.push(alias)
  return aliases
}
/** {@link FrontmatterCallback}, returns tags values
 * @type {FrontmatterCallback}
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {String} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {(String|Array.<String>)}
 */
function cbkFmtTags(tp, noteName, noteType, noteSetting, app) {
  let tags=[]
  tags.push("0/" + noteType.charAt(0).toUpperCase() + noteType.slice(1))
  if(noteName.startsWith("_"))
    tags.push("0/" + "moc")
  return tags
}
/** {@link FrontmatterCallback}, returns date value
 * @type {FrontmatterCallback}
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {String} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {String}
 */
function cbkFmtCreated(tp, noteName, noteType, noteSetting, app) {
  return tp.date.now()
}
/** {@link FrontmatterCallback}, returns cssClasses
 * @type {FrontmatterCallback}
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {String} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {String}
 */
function cbkFmtCssClass(tp, noteName, noteType, noteSetting, app) {
  return noteType
}
/** {@link FrontmatterCallback}, returns semantic noteName (not title)
 * @type {FrontmatterCallback}
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {String} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {String}
 */
function cbkNoteName(tp, noteName, noteType, noteSetting, app) {
  let name_end = ""
  let marker = ""
  if(typeof noteSetting == "object") {
    name_end = noteSetting.getValue("name_end")
    marker = noteSetting.getValue("marker")
  }
  if(name_end == undefined) {
    name_end = ""
  }
  if(marker == undefined) {
    marker = ""
  }
  return noteName
}
/** {@link FrontmatterCallback}, returns link to prev diary file 
 * @type {FrontmatterCallback}
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {String} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {String}
 */
function cbkPrevDateLink(tp, noteName, noteType, noteSetting, app) {
  let prevLink=findSibling(false, tp, app, noteSetting)
  let answer = prevLink
  return answer
}
/** {@link FrontmatterCallback}, returns link to next diary file
 * @type {FrontmatterCallback}
 * @param {Object} tp - templater object
 * @param {String} noteName
 * @param {String} noteType
 * @param {String} noteSetting
 * @param {Object} app - Obsidian App object
 * @returns {String}
 */
function cbkNextDateLink(tp, noteName, noteType, noteSetting, app) {
  let nextLink=findSibling(true, tp, app, noteSetting)
  let answer = nextLink
  return answer
}
//  #endregion DO_NOT_TOUCH
//  #region USER CONFIGURATION
//prettier-ignore
let user_configuration = {
  // General section has to be the first section
  __GENERAL_SETTINGS: //localType: (Number|String|Boolean)
  { 
    LANGUAGE: "de", // hardcoded:FALLBACK_LANGUAGE "en"    
    RELATIVE_PATH: true, 
  },
  __TRANSLATE: //localType: (String|Array.<String>|Array.<Array.<String>>)
  { 
    NAME_PROMPT:         [ ["en", "Pure Name of Note"], ["de", "Name der Notiz (ohne Kenner/Marker)"] ],
    TYPE_PROMPT:         [ ["en", "Choose type"], ["de", "Typ wählen"] ],
    TITLE_NEW_FILE:      [ ["en", "Untitled"], ["de", "Unbenannt"] ],
  },
  __DIALOG_SETTINGS: //localType: (Number|Boolean|Array.<Number>|Array.<Boolean>)
  { 
    TYPE_MAX_ENTRIES: 10,
  },
  __NOTE_TYPES: 
  {
    __SPEC: {DEFAULT: "note"},// If DEFAULT is not or wrong set, first is default
    defaults: {
      __SPEC: {REPEAT: true},
      marker:            {__SPEC:false, DEFAULT:"",TYPE:"String", }, 
      name_end:          {__SPEC:false, DEFAULT:"",TYPE:"String", }, 
      title_function:    {__SPEC:false, DEFAULT: "", TYPE: "(String|Function)",},
      title_before_date: {__SPEC:false, DEFAULT:"",TYPE:"String", },
      title_date_format: {__SPEC:false, DEFAULT:"YY-MM-DD",TYPE:"Date", },
      name_prompt:       {__SPEC:false, DEFAULT:"",TYPE:"String", },
      folders:           {__SPEC:false, IGNORE:true,DEFAULT:[""],TYPE:"(Array.<String>)"},
      create_same_named_file: {__SPEC:false, DEFAULT: false, TYPE: "Boolean", },
      frontmatter: {__SPEC: {RENDER: false,},
        aliases:         {__SPEC:false, DEFAULT: cbkFmtAlias, TYPE: "(Array.<String>|Function)"},
        cssclass:        {__SPEC:false, DEFAULT: cbkFmtCssClass, TYPE: "(Array.<String>|Function)"},
        date_created:    {__SPEC:false, DEFAULT: cbkFmtCreated, TYPE: "(Date|Function)", },
        position:        {__SPEC:false, IGNORE: true, TYPE: "Boolean", }, 
        private:         {__SPEC:false, DEFAULT: false, TYPE: "Boolean", },
        publish:         {__SPEC:false, DEFAULT: false, TYPE: "Boolean", },
        tags:            {__SPEC:false, DEFAULT: cbkFmtTags, TYPE: "(Array.<String>|Function)",},
      },    
      page: { __SPEC: {RENDER: true,},
        pict:            {__SPEC:false, DEFAULT: "", TYPE: "String",},
        prevlink:        {__SPEC:false, DEFAULT: cbkPrevDateLink, TYPE: "(String|Function)",},
        nextlink:        {__SPEC:false, DEFAULT: cbkNextDateLink, TYPE: "(String|Function)",},
        firstline:       {__SPEC:false, DEFAULT: cbkNoteName, TYPE: "(String|Function)",},
        lastline:        {__SPEC:false, DEFAULT: "", TYPE: "(String|Function)",},
      },  
    },
    obsidian: {
      folders: ["Obsidian"],
    },
    audio: {
      marker: "{a}", 
      folders: ["zwischenreich"],
      name_prompt: "?Podcast/Reihe - Autornachname - Audiotitel",
      page: { pict: "pexels-foteros-352505_200.jpg",  },
    },
    buch:           {
      marker: "{b}", 
      folders: ["zwischenreich"],
      name_prompt: "Autornachname - Buchtitel", 
      page: { pict: "pexels-gül-işık-2203051_200.jpg", },
    },
    ort:            {
      folders: ["zwischenreich"],
      page: { pict: "pexels-dzenina-lukac-1563005_200.jpg",}, 
      name_prompt: "Ortsname, Land", 
    },
    person:         {
      folders: ["zwischenreich"],
      page: { pict: "pexels-lucas-andrade-14097235_200.jpg",}, 
      name_prompt: "Personnachname, Personvorname ?Geburtsdatum", 
    },
    video:          {
      marker: "{v}", 
      folders: ["zwischenreich"],
      page: { pict: "pexels-vlad-vasnetsov-2363675_200.jpg",}, 
      name_prompt: "?Reihe - ?Autornachname - Videotitel", 
    },
    web:            {
      marker: "{w}", 
      folders: ["zwischenreich"],
      page: { pict: "pexels-sururi-ballıdağ-_200.jpeg",}, 
      name_prompt: "?Autor - Webseitentitel - ?Datum", 
    },
    zitat:          {
      marker: "°",   
      folders: ["zwischenreich"],
      name_prompt: "Titel Autornachname", 
    },
    zitate:         {
      marker: "°°",  
      folders: ["zwischenreich"],
      name_prompt: "Titel Autornachname", 
    },
    exzerpt:        {
      marker: "$",   
      folders: ["exzerpte"],
      name_prompt: "Autornachname - Buchtitel", 
    },
    garten:         {
      folders: ["garten", "temp"],
      name_prompt: "Gartenthema", 
    },
    gartentagebuch: {
      folders: ["gartentagebuch"],
      title_before_date: "Garten ", 
    },
    lesetagebuch:   {
      folders: ["lesetagebuch"],
      firstline: "## ArticleTitle\n[ntvzdf]link\n\n", 
      title_before_date: "Lesetagebucheintrag ", 
    },
    pflanze:        {
      folders: ["pflanzen"],
      name_prompt: "Pflanzenname", 
    },
    unbedacht:      {
      title_function:  cbkCalcDateTitle,
      folders: ["Unbedacht"],
      title_before_date: "Unbedacht ", 
      frontmatter: { private: true, },
    },
    verwaltung:     {
      folders: ["verwaltung"],
      name_prompt: "Verwaltungsthema", 
      frontmatter: { private: true, },
    },
    diary:          {
      title_function:  cbkCalcDateTitle,
      folders: ["diary", "temp"],
      title_date_format: "YYYY-MM-DD", 
      frontmatter: { private: true, },
    },
    note:           {
    },
  
  },
}
//  #endregion USER CONFIGURATION
//  #region EXAMPLE CONFIGURATIONS

//prettier-ignore

//  #endregion EXAMPLE CONFIGURATIONS
//#endregion CONFIGURATION
//#region globals and externals
var GLOBAL_SYMBOL_COUNTER = 0
/**
 * The built in Error object.
 * @external Error
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error|Error&#x2348;}
 */

/** Dialog return codes for functions which call dialogs.
 * <p>
 * The templater dialogs do not return a status, they return the value given by
 * user or, on Cancel, no value
 * <p>
 * Functions may return a {@link Dialog} code as status and the value on other ways
 * @enum {String}
 */
const Dialog = {
  Ok: "Ok",
  Cancel: "Cancel",
}

// TypesWorker
const TYPES_WORKER_KEY = "__NOTE_TYPES"
const TYPES_TYPE =
  "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>|Function)"
// DialogWorker
const DIALOG_WORKER_KEY = "__DIALOG_SETTINGS"
const DIALOG_TYPE = "(Number|Boolean|Array.<Number>|Array.<Boolean>)"
// LocalizationWorker
const LOCALIZATION_WORKER_KEY = "__TRANSLATE"
const LOCALIZATION_TYPE = "(String|Array.<String>|Array.<Array.<String>>)"
const FALLBACK_LANGUAGE = "en"
// GeneralWorker
const GENERAL_WORKER_KEY = "__GENERAL_SETTINGS"
const GENERAL_TYPE = "(Number|String|Boolean)"
// Setting
const GLOBAL_ROOT_KEY = "/"
const GLOBAL_SETTING_TYPE =
  "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>)"
// BreadCrumbs
const GLOBAL_BREADCRUMBS_SEPARATOR = " \u00BB "
// AEssence
const GLOBAL__SPEC = "__SPEC"
// Essence
const GLOBAL_namePartHiddenPropertiesStartWith = "__"
const GLOBAL_RENDER_DEFAULT = undefined
const GLOBAL_TYPE_DEFAULT = "String"
const GLOBAL_DEFAULT_DEFAULT = ""
const GLOBAL_VALUE_DEFAULT = ""
const GLOBAL_IGNORE_DEFAULT = false
const GLOBAL_PARSE_DEFAULT = true
const GLOBAL_INTERNAL_DEFAULT = false
const GLOBAL_FLAT_DEFAULT = false
const GLOBAL_LOCAL_DEFAULT = false
const GLOBAL_ONCE_DEFAULT = false
const GLOBAL_REPEAT_DEFAULT = false

//  #region Colors
/** Color, to be used without quotation marks during development. */
const black = "black"
/** Color, to be used without quotation marks during development. */
const cyan = "cyan"
/** Color, to be used without quotation marks during development. */
const red = "orange"
/** Color, to be used without quotation marks during development. */
const rose = "salmon"
/** Color, to be used without quotation marks during development. */
const pink = "pink"
/** Color, to be used without quotation marks during development. */
const blue = "deepskyblue"
/** Color, to be used without quotation marks during development. */
const yellow = "lightgoldenrodyellow"
/** Color, to be used without quotation marks during development. */
const lime = "lime"
/** Color, to be used without quotation marks during development. */
const green = "lightgreen"
/** Color, to be used without quotation marks during development. */
const gray = "silver"
//  #endregion Colors
//#endregion globals and externals
//#region debug, error and test

/** For debugging purpose.
 * <p>
 * Function {@link dbg} only prints out, if {@link DEBUG} is on.<br>
 * dbgYAML output of {@link foty|main function} is only shown, if  {@link DEBUG} is on.
 * @type {Boolean}
 */
var DEBUG = false
/** For testing purpose. If on, {@link test}s will run when script is executed.
 * <p>
 * If set, {@link DEBUG} is off
 * @type {Boolean}
 */
var TESTING = false
if (TESTING) DEBUG = false
/** For checking error output.
 * <p>
 * If set, all exceptions registered in {@link registeredExceptions}  are triggered and
 * their error output is written to current node.
 * <p>
 * If set, {@link DEBUG} and {@link TESTING} are off
 * @type {Boolean}
 */
var CHECK_ERROR_OUTPUT = false
if (CHECK_ERROR_OUTPUT) {
  DEBUG = false
  TESTING = false
}
var LOG_ESSENCE_CONSTRUCTOR_2_CONSOLE = false

/** If {@link CHECK_ERROR_OUTPUT|reviewing error output} strings in this array {@link letAllThrow|will be evaluated}
 * @type {Array.<String>}
 */
const registeredExceptions = []
/** Calls each function in {@link registeredExceptions} once and puts all
 * Error messages to {@link YAML} properties.
 * @param {Object} YAML
 */
function letAllThrow(YAML) {
  let cnt = 0
  registeredExceptions.forEach((exp) => {
    try {
      eval(exp)
    } catch (e) {
      if (e instanceof FotyError) e.errOut(YAML, ++cnt)
      else FotyError.errOut(e, YAML, ++cnt)
    }
  })
}

/** If {@link TESTING|running tests} functions in this array {@link test|will be executed}
 * @type {Array.<Function>}
 */
var registeredTests = []
/** Runs all {@link registeredTests|registered tests}, if {@link TESTING} set;
 * test results are written to {@link outputObj} as properties.
 * @param {Object} outputObj
 */
function test(outputObj) {
  if (TESTING)
    registeredTests.forEach((testFunction) => testFunction(outputObj))
}

/** Returns string with key-value pairs of {@link inp}s properties.
 * <p>
 * Does not recurse in properties of a value.
 * @param {Object} inp
 * @returns {String}
 */
function flatten(inp) {
  let res = inp
  if (typeof inp === "object") {
    let entries = Object.entries(inp)
    if (entries.length == 0) {
      res = "{}"
    } else {
      res = ""
      entries.forEach(([key, value], idx) => {
        if (typeof value == "symbol")
          value = "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
        let indent = idx === 0 ? "OBJ  " : "\n                 "
        if (typeof value == "object" && value !== null) {
          Object.values(value).forEach((v) => {
            if (typeof v == "symbol") value = "Object with Symbol"
          })
        }
        res += `${indent}${key}: ${value}`
      })
    }
  }
  return res
}

/** Returns whether {@link arg1} and {@link arg1} are deep equal
 * @param {*} arg1
 * @param {*} arg2
 * @param {Number} lv - recursion depth
 * @returns {Boolean|Undefined}
 */
function areEqual(arg1, arg2, lv = 0) {
  function isObject(obj) {
    return obj != null && typeof obj === "object"
  }
  if (!isObject(arg1) || !isObject(arg2)) return arg1 === arg2

  const keys1 = Object.keys(arg1)
  const keys2 = Object.keys(arg2)
  if (keys1.length !== keys2.length) {
    return false
  }
  for (const key of keys1) {
    const val1 = arg1[key]
    const val2 = arg2[key]
    const areObjects = isObject(val1) && isObject(val2)
    if (
      (areObjects && !areEqual(val1, val2, ++lv)) ||
      (!areObjects && val1 !== val2)
    ) {
      return false
    }
  }
  return true
}

/** Logs all parameters colored to console, if {@link DEBUG} is set to true.
 * <p>
 * The background of output will be set to 'LightSkyBlue'.
 * @param  {...*} strs
 */
function dbg(...strs) {
  function dbgLevel(callStack) {
    let answer = 0
    let stack = callStack.split("\n")
    stack.every((str) => {
      answer++
      if (str.includes("at Object.main [")) return false
      return true
    })
    return answer
  }
  if (DEBUG) {
    let output = ""
    let lvl = dbgLevel(new Error().stack)
    while (--lvl) output += " "
    for (const str of strs) {
      output += str + " "
    }
    output = "%c" + output
    console.log(output, "background: LightSkyBlue")
  }
}

/** Logs {@link str}  colored to console.
 * @param {String} str
 * @param {String} b - background color
 * @param {String} c - foreground color
 */
function aut(str, b = "yellow", c = "red") {
  let css = `background:${b};color:${c};font-weight:normal`
  if (typeof str === "object") {
    let entries = Object.entries(str)
    if (entries.length === 0) {
      console.log(`%c${str}`, css)
    } else {
      entries.forEach(([key, value], idx, arr) => {
        let indent = idx === 0 ? "OBJ{" : "    "
        if (idx + 1 < arr.length)
          console.log(`%c${indent}${key}: '${value}'`, css)
        else console.log(`%c${indent}${key}: '${value}'}`, css)
      })
    }
  } else {
    console.log(`%c${str}`, css)
  }
}
/** Logs all parameters red on yellow to console.
 * <p>
 * colors are not configurable as they are in {@link aut}
 * @param {String} str
 * @param  {...String} strs
 */
function auts(str, ...strs) {
  let b = "yellow"
  let c = "red"
  let css = `background:${b};color:${c};font-weight:normal`
  while (strs.length > 0) {
    str += ` ${strs.shift()}`
  }
  console.log(`%c${str}`, css)
}
/** logs {@link vn} and {@link v} colored to console.
 * @param {String} vn - variable name
 * @param {String} v - variable value
 * @param {String} b - background color
 * @param {String} c - foreground color
 */
function vaut(vn, v, b = "yellow", c = "red") {
  let str = `${vn}: ${v}`
  if (typeof v === "object") {
    let entries = Object.entries(v)
    if (entries.length != 0) {
      str = `${vn}: `
      entries.forEach(([key, value], idx) => {
        let indent = idx === 0 ? "" : "    "
        str += `${indent}${key}: ${value}`
      })
    }
  }
  let css = `background:${b};color:${c};font-weight:normal`
  console.log(`%c${str}`, css)
}

class FotyError extends Error {
  static #nl = "\n     "
  /**
   * Newline for multi line error messages
   * <p>
   * As shorthand {@link NL} can be used.<br>
   * @type {String}
   */
  static get nl() {
    return FotyError.#nl
  }
  /**
   * @description
   * Set on construction. Will be part of {@link FotyError#errOut|output message}.
   * @type {String}
   */
  #caller = ""

  /**
   * @classdesc superclass for all foty errors (but not unit test errors).
   * <p>
   * Additionally to the parameters for {@link external:Error}
   * <code>FotyError</code> receives callers name on construction.
   * @extends external:Error
   * @constructor
   * @description Constructs a FotyError instance, with
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name|Error.name&#x2348;}</code>
   * set to "Foty Error".
   * @param {String} caller - Will be part of {FotyError#errOut|output message}.
   * @param  {...*} params - Params are given to {@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error|superclass&#x2348;}
   * They consist of
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message|Error.message&#x2348;}</code>
   * and <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause|Error.cause&#x2348;}</code>.
   */
  constructor(caller, ...params) {
    super(...params)
    this.name = "Foty Error"
    this.#caller = typeof caller === "string" ? caller : ""
  }
  /**
   * Puts error information formatted to {@link YAML} properties.
   * <p>
   * If {@link cnt} is a number, {@link YAML} keys will be created using this
   * number, otherwise fully hardcoded keys will be used.
   * <p>
   * The key which's value contains the
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message|message&#x2348;}</code>
   * is returned.
   *<p>
   * <b>Usage of cnt</b>
   * Frontmatter output to current note works with 'key: value'.<br>
   * In production mode no cnt argument should be given. A short key for e.name
   * and another for e.message will created. They are added to YAML.
   * In every call always the same keys are used. This means, that only the last
   * message is contained in YAML. (In production mode this is supposed to be the
   * first and only one)
   *<p>
   * In some testing cases an every time different cnt argument can be given.
   * Short keys are created in dependance of cnt and appended to YAML. This means,
   * that YAML can contain more than one error message. In this case a separator
   * line is added to YAML under separator key.
   * @param {Object} YAML
   * @param {(Undefined|Number)} cnt
   * @returns {String}
   */
  errOut(YAML, cnt) {
    let prevPad = FotyError.#changePad()
    let nameKey = this.getNameKey(cnt)
    let msgKey = FotyError.getMsgKey(cnt)
    let sepKey = FotyError.getSepKey(cnt)
    if (sepKey != undefined)
      YAML[sepKey] = "---------------------------------------------------"
    YAML[nameKey] = this.name + " in " + this.#caller
    YAML[msgKey] = this.message.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")

    FotyError.#changePad(prevPad)
    return [msgKey]
  }
  /**
   * Puts error information formatted to {@link YAML} properties.
   * <p>
   * This static variant of {@link FotyError#errOut|FotyError.errOut} can be used
   * for output of non FotyErrors. They will be formatted same way as FotyError instance
   * errors.
   * <p>
   * The key which's value contains the <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message|message&#x2348;}</code>
   * of {@link e} is returned.
   * @param {Error} e
   * @param {Object} YAML
   * @param {(undefined|Number)} cnt
   * @returns {String}
   */
  static errOut(e, YAML, cnt) {
    let prevPad = FotyError.#changePad()
    let nameKey = FotyError.getNameKey(cnt)
    let msgKey = FotyError.getMsgKey(cnt)
    let sepKey = FotyError.getSepKey(cnt)
    FotyError.#changePad(prevPad)

    if (sepKey != undefined)
      YAML[sepKey] = "---------------------------------------------------"
    YAML[nameKey] = e.name
    YAML[msgKey] = e.message.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")
    return msgKey
  }
  /**
   * Creates and returns key for this instances name in dependence of value of {@link cnt}.
   * <p>
   * Can be overridden by subclasses.
   * @param {(undefined|Number)} cnt
   * @returns {String}
   */
  getNameKey(cnt) {
    return cnt === undefined || typeof cnt != "number"
      ? "????"
      : cnt.pad() + "?"
  }
  /**
   * Creates and returns key for error name in dependence of value of {@link cnt}.
   * @param {(undefined|Number)} cnt
   * @returns {String}
   */
  static getNameKey(cnt) {
    return cnt === undefined || typeof cnt != "number"
      ? "????"
      : cnt.pad() + "?"
  }
  /**
   * Creates and returns key for error msg in dependence of value of {@link cnt}.
   * @param {(undefined|Number)} cnt
   * @returns {String}
   */
  static getMsgKey(cnt) {
    return cnt === undefined || typeof cnt != "number"
      ? "\u00A8\u00A8\u00A8\u00A8"
      : cnt.pad() + "\u00A8"
  }
  /**
   * Creates and returns key for separator in dependence of value of {@link cnt}.
   * @param {(undefined|Number)} cnt
   * @returns {String}
   */
  static getSepKey(cnt) {
    return cnt === undefined || typeof cnt != "number" ? undefined : cnt.pad()
  }

  static #changePad(padIn) {
    let prevPad = Number.prototype.pad
    function pad(size = 3) {
      var s = String(this)
      while (s.length < size) s = "0" + s
      return s
    }
    Number.prototype.pad = padIn === undefined ? pad : padIn
    return prevPad
  }
}
/** shorthand for {@link FotyError#nl|FotyError.nl} */
const NL = FotyError.nl

class SettingError extends FotyError {
  usrMsg = ""
  /**
   * @classdesc User error thrown from setting tree.
   * <p>
   * Some of the errors from setting tree for sure can only occur if entries in
   * setting input are wrong. Those are user errors. Using the 2nd parameter
   * a user specific message can be given.
   * @extends FotyError
   * @constructor
   * @description
   * Constructs a SettingError instance,
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name|Error.name&#x2348;}</code>
   * set to "Setting Error"
   * @param {String} caller
   * @param {String} usrMsg
   * @param  {...*} params
   */
  constructor(caller, usrMsg, ...params) {
    super(caller, ...params)
    this.name = "Setting Error"
    this.usrMsg = usrMsg === undefined ? "" : usrMsg
  }
  /**
   * Appends user message if given to output object.
   * @param {Object} YAML
   * @param {Undefined|Number} cnt
   */
  errOut(YAML, cnt) {
    cnt = cnt === undefined ? 0 : cnt
    let msgKey = super.errOut(YAML, cnt)
    if (this.usrMsg.length > 0)
      YAML[msgKey] += NL + this.usrMsg.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")
  }
  /**
   * Returns subclass specific name.
   * @param {Undefined|Number} cnt
   * @returns {String}
   */
  getNameKey(cnt) {
    return cnt === undefined ? "_ERR" : cnt.pad(4)
  }
}

class CodingError extends FotyError {
  /** @classdesc Programming error.
   * <p>
   * Some errors only can occur if code is wrong. If this is for sure,
   * CodingError should be thrown.
   * @extends FotyError
   * @constructor
   * @description
   * Constructs a CodingError instance,
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name|Error.name&#x2348;}</code>
   * set to "Coding Error"
   *
   * @param {String} caller
   * @param  {...*} params
   */
  constructor(caller, ...params) {
    super(caller, ...params)
    this.name = "Coding Error"
  }
  /** Returns subclass specific name.
   * @param {Undefined|Number} cnt
   * @returns {String}
   */
  getNameKey(cnt) {
    return cnt === undefined ? "!!!!" : cnt.pad(4) + "!"
  }
}

class TestSuite {
  //#region member variables
  static ok = "\u2713"
  static nok = "\u2718"
  static #totalSuites = 0
  static #totalTests = 0
  static #totalCases = 0
  #name
  #outputObj = undefined
  #succeeded = 0
  #failed = 0
  #fname = ""
  #asserts = 0
  #cases = 0
  o = this.#outputObj
  f = "failing"
  s = "success"
  d = "details"
  e = "none"
  z = "summary"
  get name() {
    return this.#name
  }
  //#endregion member variables

  /** Sets up the suite
   * @param {String} name - name of the suite
   * @param {Object} outputObj - javascript object for output in Obsidian
   */
  constructor(name, outputObj) {
    TestSuite.#totalSuites++
    this.#name = name ? name : "Unknown"
    this.o = outputObj
    if (this.o[this.z] === undefined) this.o[this.z] = this.e
    if (this.o[this.f] === undefined) this.o[this.f] = this.e
    if (this.o[this.s] === undefined) this.o[this.s] = this.e
    if (this.o[this.d] === undefined) this.o[this.d] = this.e
  }
  toString() {
    return " °°" + this.constructor.name + " " + this.name
  }

  /** Shows results resets
   */
  destruct() {
    let suc_Str = this.#succeeded === 1 ? "test" : "tests"
    let failStr = this.#failed === 1 ? "test" : "tests"
    if (this.#failed === 0) {
      this.#praut(
        this.s,
        `Suite "${this.#name}": ${this.#succeeded} ${suc_Str} succeeded`
      )
    } else {
      this.#praut(
        this.f,
        `Suite "${this.#name}": ${this.#failed} ${failStr} failed, ${
          this.#succeeded
        } succeeded`
      )
    }
    this.#name = null
    this.o = null
    this.#succeeded = 0
    this.#failed = 0
    this.#fname = ""
    this.#asserts = 0
    this.#cases = 0
  }

  /** runs test
   * @param {Function} fn
   */
  run(fn) {
    TestSuite.#totalTests++
    this.#fname = fn.name
    this.#asserts = 0
    try {
      fn()
      let cases = this.#cases === 1 ? "case" : "cases"
      if (0 === this.#asserts) {
        this.#succeeded++
        this.#praut(
          this.d,
          `${this.#name}:${this.#fname}(${this.#cases} ${cases}) ${
            TestSuite.ok
          }`
        )
      } else {
        this.#failed++
        this.#praut(
          this.d,
          `${TestSuite.nok}${this.#name}:${this.#fname}(${
            this.#cases
          } ${cases}) ${TestSuite.nok}`
        )
      }
    } catch (e) {
      console.error(
        "ERROR in TestSuite:run\n" +
          "You probably caused an error in one of your tests which is not test specific\n" +
          e
      )
    }
    this.#fname = ""
    this.#cases = 0
  }

  /** runs test containing promised functions
   * @param {Function} fn
   * @example
   * let _ = null
   * function testIt() {
   *   _ = new TestSuite("testIt", null)
   *   _.prun(first_Test)
   *   .then ( (asw) => {return _.prun(second_Test)} )
   *   .then ( (asw) => {return _.prun(third_Test)} )
   *   .then ( (asw) => {_.destruct() _ = null } )
   *   .catch(( asw) => log("CATCH " + asw) )
   * }
   * function first_Test() {//second_Test, third_Test
   *   let p = new Promise((resolve, reject) => {
   *     let fuName = "first_Test" //"second_Test", "third_Test"
   *     let result = asynchronousFunction(fuName).then( () => {
   *       _.assert( 1, _check, result)
   *       _.assert( 2, _check, result)
   *       // destruct result (In use case it might be instance)
   *       resolve("IN" + fuName + ": Result " + result + " destructed")
   *     })
   *   })
   *   return p
   * }
   * function _check(result) {
   *   if(typeof result !== "string")
   *     throw new TestError(`${result} should be a string`)
   * }
   */
  prun(fn) {
    TestSuite.#totalTests++
    return new Promise((resolve, reject) => {
      this.#fname = fn.name
      this.#asserts = 0
      try {
        fn().then((fnAnswer) => {
          let cases = this.#cases === 1 ? "case" : "cases"
          if (0 === this.#asserts) {
            this.#succeeded++
            this.#praut(
              this.d,
              `${this.#name}:${this.#fname}(${this.#cases} ${cases}) ${
                TestSuite.ok
              }`
            )
          } else {
            this.#failed++
            this.#praut(
              this.d,
              `${TestSuite.nok}${this.#name}:${this.#fname}(${
                this.#cases
              } ${cases}) ${TestSuite.nok}`
            )
          }
          this.#fname = ""
          this.#cases = 0
          resolve(fn.name + " resolved")
        })
      } catch (e) {
        console.error(e)
        this.#fname = ""
        this.#cases = 0
        resolve(fn.name + " catch")
      }
    })
  }

  /** asserts boolean one case in a test, shows message on failure
   * @param {Number} errCase
   * @param {Boolean} isTrue
   * @param {String} message
   */
  bassert(errCase, isTrue, message) {
    TestSuite.#totalCases++
    this.#cases++
    if (!isTrue) {
      this.#asserts++
      console.log(
        `%c   ${this.#name}/${this.#fname}:case ${errCase} - ${message}`,
        "background: rgba(255, 99, 71, 0.5)"
      )
    }
  }

  /** asserts catching exceptions one case in a test, shows message on failure
   * @param {Number} errCase
   * @param {Function} fn
   * @param {...*} params
   */
  assert(errCase, fn, ...params) {
    TestSuite.#totalCases++
    this.#cases++
    try {
      fn(...params)
    } catch (err) {
      this.#asserts++
      console.log(
        `%c   ${this.#name}/${this.#fname}:case ${errCase} - ${err.message}`,
        "background: rgba(255, 99, 71, 0.5)"
      )
    }
  }

  /** silents exception of one test case, asserts & shows message if no exception
   * @param {Number} errCase
   * @param {Function} fn
   * @param {...*} ...params
   */
  shouldAssert(errCase, fn, ...params) {
    TestSuite.#totalCases++
    this.#cases++
    let hasAsserted = false
    let message = params.pop()
    try {
      fn(...params)
    } catch (err) {
      hasAsserted = true
    }
    if (!hasAsserted) {
      this.#asserts++
      console.log(
        `%c   ${this.#name}/${
          this.#fname
        }:case ${errCase} should assert - ${message}`,
        "background: rgba(255, 99, 71, 0.5)"
      )
    }
  }

  /** output to current note (indirect) and for failures on console
   * @param {String} str
   */
  #praut(key, str) {
    /* o = this.#outputObj
     * f = "failing"
     * s = "success"
     * d = "details"
     * e = "none"
     * z = "summary" */
    let nl_indent = "\n        "
    if (key != this.s && key != this.f && key != this.d) {
      let errStr = "%c" + key
      console.log(errStr, "background: rgba(255, 99, 71, 0.5)")
    } else if (this.o[key] === this.e) {
      this.o[key] = str
    } else if (str[0] === TestSuite.nok) {
      if (key === this.d) {
        //"details"
        let outParts = this.o[key].split(TestSuite.nok)
        let len = outParts.length
        let okPart = outParts[len - 1]
        if (len === 1) {
          let newLastPart = str.substring(1) + nl_indent + okPart
          outParts[outParts.length - 1] = newLastPart
          this.o[key] = outParts.join()
        } else {
          let newLastPart = nl_indent + str.substring(1) + okPart
          outParts[outParts.length - 1] = newLastPart
          this.o[key] = outParts.join(TestSuite.nok)
        }
      } else {
        //"failing"
        this.o[key] = str.substring(1) + nl_indent + this.o[key]
      }
    } else {
      // "details" or "success"
      this.o[key] = this.o[key] + nl_indent + str
    }
    // prettier-ignore
    this.o[this.z] = `Suites: ${TestSuite.#totalSuites} | Tests: ${TestSuite.#totalTests} | Cases: ${TestSuite.#totalCases}`
  }
}
/**
 * @classdesc Error used for unit tests.
 * @extends external:Error
 */
class TestError extends Error {
  constructor(message, ...params) {
    super(message, ...params)
    this.name = "TestError"
  }
  toString() {
    return " °°" + this.constructor.name + " " + this.name
  }
}

//prettier-ignore
function testGlobals(outputObj) {
  let _ = null
  if(_ = new TestSuite("Globals", outputObj)) {
    _.run(flattenTest)
    _.run(areEqualTest)
    _.destruct()
    _ = null
  }
  function flattenTest() {
    let obj0 = {}
    let flat0 = flatten(obj0)
    let exp0 = "{}"
    _.bassert(1,flat0 == exp0, "empty object should be same as toString output")
  }
  function areEqualTest() {
    let un
    let obj1 = {}
    let obj1_0 = {}
    let obj1_1 = {un}
    let obj1_2 = {a:true}
    _.assert(1,_tryAreEqual,22,obj1,"any arguments allowed")
    _.assert(2,_tryAreEqual,obj1, "a","any arguments allowed")
    _.bassert(3,areEqual(obj1, obj1_0),"objs are equal - see code")
    _.bassert(4,!areEqual(obj1, obj1_1),"objs are not equal - see code")
    _.bassert(5,!areEqual(obj1, obj1_2),"objs are not equal - see code")
    let obj2 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined,i:cbkTypeOf}}}
    let obj2_0 = {"a":{"b":{"c":true,"d":"alpha","e":22,"f":22n,"g":null,"h":undefined,"i":cbkTypeOf}}}
    let obj2_1 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined,i:cbkTypeOf,j:22}}}
    let obj2_2 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined}}}
    let obj2_3 = {a:{b:{c:false,d:"alpha",e:22,f:22n,g:null,h:undefined,i:cbkTypeOf}}}
    let obj2_4 = {a:{b:{c:true,d:"Alpha",e:22,f:22n,g:null,h:undefined,i:cbkTypeOf}}}
    let obj2_5 = {a:{b:{c:true,d:"alpha",e:23,f:22n,g:null,h:undefined,i:cbkTypeOf}}}
    let obj2_6 = {a:{b:{c:true,d:"alpha",e:22,f:22,g:null,h:undefined,i:cbkTypeOf}}}
    let obj2_7 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:undefined,h:undefined,i:cbkTypeOf}}}
    let obj2_8 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:null,i:cbkTypeOf}}}
    let obj2_9 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined,i:_tryAreEqual}}}
    let obj2_10 = {A:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined,i:cbkTypeOf}}}
    _.bassert(10,areEqual(obj2, obj2_0),"objs are equal - see code")
    _.bassert(11,!areEqual(obj2, obj2_1),"objs are not equal - see code")
    _.bassert(12,!areEqual(obj2, obj2_2),"objs are not equal - see code")
    _.bassert(13,!areEqual(obj2, obj2_3),"objs are not equal - see code")
    _.bassert(14,!areEqual(obj2, obj2_4),"objs are not equal - see code")
    _.bassert(15,!areEqual(obj2, obj2_5),"objs are not equal - see code")
    _.bassert(16,!areEqual(obj2, obj2_6),"objs are not equal - see code")
    _.bassert(17,!areEqual(obj2, obj2_7),"objs are not equal - see code")
    _.bassert(18,!areEqual(obj2, obj2_8),"objs are not equal - see code")
    _.bassert(19,!areEqual(obj2, obj2_9),"objs are not equal - see code")
    _.bassert(20,!areEqual(obj2, obj2_10),"objs are not equal - see code")
    let obj3 = {a:[1]}
    let obj3_0 = {a:[1]}
    let obj3_1 = {a:1}
    let obj3_2 = {a:{}}
    let obj3_3 = {a:[2]}
    let obj3_4 = {a:[1,2]}
    _.bassert(30,areEqual(obj3, obj3_0),"objs are equal - see code")
    _.bassert(31,!areEqual(obj3, obj3_1),"objs are not equal - see code")
    _.bassert(32,!areEqual(obj3, obj3_2),"objs are not equal - see code")
    _.bassert(33,!areEqual(obj3, obj3_3),"objs are not equal - see code")
    _.bassert(34,!areEqual(obj3, obj3_4),"objs are not equal - see code")

    let arr1 = []
    let arr1_0 = []
    let arr1_1 = [1]
    _.bassert(101,areEqual(arr1, arr1_0),"arrays are equal - see code")
    _.bassert(102,!areEqual(arr1, arr1_1),"arrays are not equal - see code")
    let arr2 = [undefined, null, true, 1, 1n, "string",cbkTypeOf,{}]
    let arr2_0 = [undefined, null, true, 1, 1n, "string",cbkTypeOf,{}]
    let arr2_1 = [null, null, true, 1, 1n, "string",cbkTypeOf,{}]
    let arr2_2 = [undefined, undefined, true, 1, 1n, "string",cbkTypeOf,{}]
    let arr2_3 = [undefined, null, false, 1, 1n, "string",cbkTypeOf,{}]
    let arr2_4 = [undefined, null, true, 2, 1n, "string",cbkTypeOf,{}]
    let arr2_5 = [undefined, null, true, 1, 1, "string",cbkTypeOf,{}]
    let arr2_6 = [undefined, null, true, 1, 1n, "String",cbkTypeOf,{}]
    let arr2_7 = [undefined, null, true, 1, 1n, "string",_tryAreEqual,{}]
    let arr2_8 = [undefined, null, true, 1, 1n, "string",_tryAreEqual,{a:1}]
    _.bassert(111,areEqual(arr2, arr2_0),"arrays are equal - see code")
    _.bassert(112,!areEqual(arr2, arr2_1),"arrays are not equal - see code")
    _.bassert(113,!areEqual(arr2, arr2_2),"arrays are not equal - see code")
    _.bassert(114,!areEqual(arr2, arr2_3),"arrays are not equal - see code")
    _.bassert(115,!areEqual(arr2, arr2_4),"arrays are not equal - see code")
    _.bassert(116,!areEqual(arr2, arr2_5),"arrays are not equal - see code")
    _.bassert(117,!areEqual(arr2, arr2_6),"arrays are not equal - see code")
    _.bassert(118,!areEqual(arr2, arr2_7),"arrays are not equal - see code")
    _.bassert(119,!areEqual(arr2, arr2_8),"arrays are not equal - see code")
    let arr3 = [[[1,2,3]]]
    let arr3_0 = [[[1,2,3]]]
    let arr3_1 = [[[1,2]]]
    let arr3_2 = [[[1,2,3,4]]]
    _.bassert(131,areEqual(arr3, arr3_0),"arrays are equal - see code")
    _.bassert(132,!areEqual(arr3, arr3_1),"arrays are not equal - see code")
    _.bassert(133,!areEqual(arr3, arr3_2),"arrays are not equal - see code")      

    _.bassert(141,areEqual(un, undefined),"undefined is equal undefined")
    _.bassert(142,!areEqual(un, arr3),"undefined not equal array")
    _.bassert(143,!areEqual(arr3,un),"undefined not equal array")
    _.bassert(144,!areEqual(un, obj3),"undefined not equal object")      
    _.bassert(145,!areEqual(obj3,un),"undefined not equal object")      
    _.bassert(146,!areEqual(un, null),"undefined not equal null")      
    _.bassert(147,!areEqual(null, un),"undefined not equal null")  
    
    _.bassert(151,areEqual(1,1),"1 is equal 1")
    _.bassert(152,areEqual(true,true),"true is equal true")
    _.bassert(153,areEqual(false,false),"false is equal false")
    _.bassert(154,areEqual(22n,22n),"22n is equal 22n")
    _.bassert(155,areEqual("str str","str str"),"'str str' is equal 'str str'")
    _.bassert(156,!areEqual(1,2),"1 is not equal 2")
    _.bassert(157,!areEqual(true,false),"true is not equal false")
    _.bassert(158,!areEqual(false,null),"false is not equal null")
    _.bassert(159,!areEqual(22n,22),"22n is not equal 22")
    _.bassert(160,!areEqual("str str","str str2"),"'str str' is not equal 'str str2'")
  }
function _tryAreEqual(arg1, arg2) {
    areEqual(arg1, arg2)
  }
}
registeredTests.push(testGlobals)

//#endregion debug, error and test
//#region helper classes

/** Events that Dispatcher stores and distribute to listeners.
 *
 */
class Event {
  //#region member variables
  name
  callbacks
  //#endregion member variables

  constructor(name) {
    this.name = name
    this.callbacks = []
  }
  toString() {
    return " °°" + this.constructor.name + " " + this.name
  }
  registerCallback(callback, instance) {
    this.callbacks.push([callback, instance])
  }
  //#region Event tests
  static _ = null
  static test(outputObj) {
    // Event
    Event._ = new TestSuite("Event", outputObj)
    Event._.run(Event.constructorTest)
    Event._.run(Event.toStringTest)
    Event._.run(Event.registerCallbackTest)
    Event._.destruct()
    Event._ = null
  }
  static constructorTest() {
    Event._.assert(1, Event._tryConstruct, undefined)
    Event._.assert(2, Event._tryConstruct, "eventname")
    let event = new Event()
    Event._.bassert(
      3,
      event.constructor === Event,
      "the constructor property is not Event"
    )
  }
  static toStringTest() {
    let str = new Event("eventname").toString()
    Event._.bassert(1, str.includes("eventname"), "does not contain Event name")
  }
  static registerCallbackTest() {
    let e = new Error()
    Event._.assert(1, Event._tryRegisterCallback, undefined, undefined)
    Event._.assert(2, Event._tryRegisterCallback, "eventname", undefined)
    Event._.assert(3, Event._tryRegisterCallback, "eventname", e)
  }
  static _tryConstruct(arg1) {
    new Event(arg1)
  }
  static _tryRegisterCallback(arg1, arg2) {
    let e = new Event("eventname")
    e.registerCallback(arg1, arg2)
  }
  //#endregion Event tests
}
registeredTests.push(Event.test)
/** Event worker.
 *
 */
class Dispatcher {
  //#region member variables
  events
  //#endregion member variables
  constructor() {
    this.events = {}
  }
  toString() {
    return " °°" + this.constructor.name
  }
  registerEvent(eventName) {
    var event = new Event(eventName)
    this.events[eventName] = event
  }
  addListener(eventName, callback, instance) {
    this.events[eventName].registerCallback(callback, instance)
  }
  dispatchEvent(eventName, eventArgs) {
    this.events[eventName].callbacks.forEach((arr) => {
      let callback = arr[0]
      let instance = arr[1]
      callback(instance, eventArgs)
    })
  }
  //#region Dispatcher tests
  static _ = null
  static test(outputObj) {
    // Dispatcher
    Dispatcher._ = new TestSuite("Dispatcher", outputObj)
    Dispatcher._.run(Dispatcher.constructorTest)
    Dispatcher._.run(Dispatcher.toStringTest)
    Dispatcher._.run(Dispatcher.registerEventTest)
    Dispatcher._.run(Dispatcher.dispatchEventTest)
    Dispatcher._.run(Dispatcher.addListenerTest)
    Dispatcher._.destruct()
    Dispatcher._ = null
  }
  static constructorTest() {
    Dispatcher._.assert(1, Dispatcher._tryConstruct)
    let dispatcher = new Dispatcher()
    Dispatcher._.bassert(
      2,
      dispatcher.constructor === Dispatcher,
      "the constructor property is not Dispatcher"
    )
  }
  static toStringTest() {
    let str = new Dispatcher().toString()
    Dispatcher._.bassert(
      1,
      str.includes("°°"),
      "does not contain module mark °°"
    )
  }
  static registerEventTest() {
    Dispatcher._.assert(1, Dispatcher._tryRegisterEvent, undefined)
    Dispatcher._.assert(1, Dispatcher._tryRegisterEvent, "big bang")
  }
  static addListenerTest() {
    Dispatcher._.assert(
      1,
      Dispatcher._tryAddListener,
      "big bang",
      undefined,
      undefined
    )
  }
  static dispatchEventTest() {
    Dispatcher._.assert(1, Dispatcher._tryDispatchEvent, "big bang", undefined)
  }
  static _tryConstruct() {
    new Dispatcher()
  }
  static _tryRegisterEvent(name) {
    let d = new Dispatcher()
    d.registerEvent(name)
  }
  static _tryAddListener(name, cbk, inst) {
    let d = new Dispatcher()
    d.registerEvent(name)
    d.addListener(name, cbk, inst)
  }
  static _tryDispatchEvent(name, args) {
    let d = new Dispatcher()
    d.registerEvent(name)
    d.dispatchEvent(name, args)
  }
  //#endregion Dispatcher tests
}
registeredTests.push(Dispatcher.test)

//#endregion helper classes
//#region Gene, Pool and Essence
//  #region Callbacks
/** callback to check {@link variable} against {@link gene}.
 * @callback GeneCallback
 * @param {*} variable
 * @param {Gene} gene
 * @returns {Boolean}
 */
/** {@link GeneCallback}, returns whether {@link v} is an Object, but not an Array
 * @type {GeneCallback}
 * @param {*} v
 * @param {Gene} gene
 * @returns {Boolean}
 */
function cbkIsObjectNotNullNotArray(v, gene) {
  return typeof v === "object" && v != undefined && !Array.isArray(v)
}
/** {@link GeneCallback}, returns whether {@link v} is Null
 * @type {GeneCallback}
 * @param {*} v
 * @param {Gene} gene
 * @returns {Boolean}
 */
function cbkIsNull(v, gene) {
  return typeof v === "object" && v == undefined && v !== undefined
}
/** {@link GeneCallback}, returns whether {@link v} is an Array
 * @type {GeneCallback}
 * @param {*} v
 * @param {Gene} gene
 * @returns {Boolean}
 */
function cbkIsArray(v, gene) {
  return typeof v === "object" && Array.isArray(v)
}
/** {@link GeneCallback}, returns '{@link v} instanceof {@link gene.ident}'.
 * @type {GeneCallback}
 * @param {*} v
 * @param {Gene} gene
 * @returns {Boolean}
 */
function cbkInstanceOf(v, gene) {
  return v instanceof gene.ident
}
/** {@link GeneCallback}, returns  '{@link v}' typeof '{@link gene.ident}'.
 * @type {GeneCallback}
 * @param {*} v
 * @param {Gene} gene
 * @returns {Boolean}
 */
function cbkTypeOf(v, gene) {
  return typeof v === gene.ident
}
/** {@link GeneCallback}, returns '{@link v}' typeof '{@link gene.ident}.toLowerCase()'
 * @type {GeneCallback}
 * @param {*} v
 * @param {Gene} gene
 * @returns {Boolean}
 */
function cbkTypeOfLc(v, gene) {
  return typeof v === gene.ident.toLowerCase()
}
/** {@link GeneCallback}, returns '{@link v}' typeof '<code>string</code>'
 * @type {GeneCallback}
 * @param {*} v
 * @param {Gene} gene
 * @returns {Boolean}
 */
function cbkIsDate(v, gene) {
  return typeof v === "string"
}
//  #endregion Callbacks

class Gene {
  #cbk
  #ident

  /** Ident of the {@link Gene}.
   * @type {*}
   */
  get ident() {
    return this.#ident
  }

  /**
   * @classdesc Gene is type used in this application.
   * <p>
   * Every gene has a {@link GeneCallback} function associated with it. The default callback
   * function is '
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof|typeof&#x2348;}</code>
   * variable === {@link Gene#ident|Gene.ident}' . {@link Gene#is} calls this callback, comparing
   * variable to check against ident of {@link Gene}.
   * <p>
   * <b>Why this name? </b>
   * Many types of types we have to deal with. Therefore another name for 'allowed
   * types' was searched for. It should be short, have a meaning near to
   * 'very basic' and it should reasonable not be used further in the code, so
   * that name is replaceable throughout whole file, if another one would be
   * chosen.
   * <p>
   * The name has a flaw though: A real gene is something, a gene here is a
   * something definition. In other words: A real gene can be compared to another
   * real gene, e.g whether they are equal or which of them is longer. If you want
   * to decide (still in real world) whether those somethings to be compared are
   * genes at all, you need a gene definition. Here in this code {@link Gene}
   * instance fulfills the job of a gene definition in real world.
   * In {@link Gene#is|Gene.is} you give it a something and it decides,
   * whether it is as defined in this instance.
   * @constructor
   * @description
   * Constructs a Gene instance. Throws on wrong parameter types.
   * @param {*} ident
   * @param {GeneCallback} cbk - default is function {@link cbkTypeOf},
   *                             which compares typeof its first parameter against
   *                             {@link ident}
   * @throws TypeError
   */
  constructor(ident, cbk) {
    if (cbk != undefined && typeof cbk != "function")
      throw new TypeError(
        `function 'Gene.constructor'${NL}2nd parameter '${cbk}' is not of type 'Function'`
      )
    this.#ident = ident
    this.#cbk = cbk === undefined ? cbkTypeOf : cbk
  }

  /** Returns result of Genes registered {@link GeneCallback}( {@link v}, {@link this} ).
   * @param {*} v
   * @returns {Boolean}
   */
  is(v) {
    return this.#cbk(v, this)
  }

  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("Gene", outputObj)) {
      _.run(getterIdentTest)
      _.run(constructorTest)
      _.run(isTest)
      _.destruct()
      _ = null
    }
    function getterIdentTest() {
      let idNull = null
      let idUndE = undefined
      let idBool = false
      let idNumb = 22
      let idBigI = 22n
      let idStrI = "stringIdent"
      let idSymB = Symbol("desc")
      function idFunc() {return false}
      let idObjE = new Error("df")

      let gNull = new Gene(idNull)
      let gUndE = new Gene(idUndE)
      let gBool = new Gene(idBool)
      let gNumb = new Gene(idNumb)
      let gBigI = new Gene(idBigI)
      let gStrI = new Gene(idStrI)
      let gSymB = new Gene(idSymB)
      let gFunc = new Gene(idFunc)
      let gObjE = new Gene(idObjE)
      _.bassert(1,gNull.ident === idNull,"should return what was given as ident")
      _.bassert(2,gUndE.ident === idUndE,"should return what was given as ident")
      _.bassert(3,gBool.ident === idBool,"should return what was given as ident")
      _.bassert(4,gNumb.ident === idNumb,"should return what was given as ident")
      _.bassert(5,gBigI.ident === idBigI,"should return what was given as ident")
      _.bassert(6,gStrI.ident === idStrI,"should return what was given as ident")
      _.bassert(7,gSymB.ident === idSymB,"should return what was given as ident")
      _.bassert(8,gFunc.ident === idFunc,"should return what was given as ident")
      _.bassert(8,gObjE.ident === idObjE,"should return what was given as ident")     
    }
    function constructorTest() {
      let un
      _.shouldAssert(1,_tryConstruct,"number",22,"arg2 has to be a Function")
      _.assert(2,_tryConstruct,"number",undefined,"arg2 may be undefined")

      let idNull = null
      let idUndE = undefined
      let idBool = false
      let idNumb = 22
      let idBigI = 22n
      let idStrI = "stringIdent"
      let idSymB = Symbol("desc")
      function idFunc() {return false}
      let idObjE = new Error("df")
      _.assert(11,_tryConstruct,idNull,un,"arg1 can be null")
      _.assert(12,_tryConstruct,idUndE,un,"arg1 can be undefined")
      _.assert(13,_tryConstruct,idBool,un,"arg1 can be boolean")
      _.assert(14,_tryConstruct,idNumb,un,"arg1 can be number")
      _.assert(15,_tryConstruct,idBigI,un,"arg1 can be bigint")
      _.assert(16,_tryConstruct,idStrI,un,"arg1 can be string")
      _.assert(17,_tryConstruct,idSymB,un,"arg1 can be symbol")
      _.assert(18,_tryConstruct,idFunc,un,"arg1 can be function")
      _.assert(19,_tryConstruct,idObjE,un,"arg1 can be object")
    }
    function isTest() {
      function cbk(v,gene) {return typeof v === gene.ident.toLowerCase()}
      function ACbk(v,gene) {return typeof v === "object" && Array.isArray(v)}
      function aCbk(v,gene) {return gene.ident === "Array" && typeof v === "object" && Array.isArray(v)}
      let g = new Gene("number")
      let G = new Gene("Number")
      let gG = new Gene("Number",cbk)
      let A = new Gene("Array",ACbk)
      let a = new Gene("array",aCbk)
      _.bassert(1,g.is(22),"22 is a number")
      _.bassert(2,!G.is(22),"22 is not a Number")
      _.bassert(3,gG.is(22),"22 is a Number to lowercase")
      _.bassert(4,A.is([]),"'[]' is an Array")
      _.bassert(5,!A.is({}),"'{}' is not an Array")
      _.bassert(6,!a.is([]),"'[]' nothing can be an array")
      _.bassert(7,!a.is({}),"'{}' nothing can be an array")
    }
    function _tryConstruct(arg1, arg2) {
      new Gene(arg1,arg2)
    }
  }
}
registeredTests.push(Gene.test)
registeredExceptions.push("new Gene('name',3)")

class GenePool {
  #genes = {}
  #defaultCallback = cbkInstanceOf

  /**
   * @classdesc Collection of  Genes.
   *
   * <p>
   * Stores  {@link Gene}s. The default {@link GeneCallback|callback} function for newly created
   * {@link Gene}s is '{@link cbkInstanceOf}'. (Whereas the default {@link GeneCallback}|callback)
   * function for plain {@link Gene}s is '{@link cbkTypeOf}').
   * '.
   * @constructor
   * @description Creates new instance of {@link GenePool}.
   * <p>
   * If not set to an other value, the default {@link GeneCallback|callback} function is {@link cbkInstanceOf}.
   * <p>
   * If first parameter is a function, it becomes the default {@link GeneCallback|callback} function.
   * All other parameters (including the first, if not a function) are registered as {@link Gene}s
   * with the default {@link GeneCallback|callback} function set as {@link GeneCallback|callback} function .
   * <p>
   * should never throw
   * @param  {...*} params
   */
  constructor(...params) {
    if (params.length > 0 && typeof params[0] === "function")
      this.#defaultCallback = params.shift()
    while (params.length > 0)
      this.addGene(params.shift(), this.#defaultCallback)
  }

  /**
   * Adds {@link ident} as new Gene with {@link cbk} as {@link GeneCallback|callback} function.
   * <p>
   * If {@link cbk} is undefined, the newly created {@link Gene} gets default {@link GeneCallback|callback} function
   * as {@link GeneCallback|callback} function
   * <p>
   * The newly created {@link Gene} is returned. <br>
   * If {@link ident} is already set, it is not changed, but returned at it is.
   * @param {*} ident
   * @param {Function|undefined} cbk
   * @throws TypeError - does not catch from {@link @Gene|Gene.constructor}, which
   * throws if given {@link cbk} is no function
   * @returns {Gene}
   */
  addGene(ident, cbk) {
    if (this.#genes[ident] === undefined)
      this.#genes[ident] = new Gene(
        ident,
        cbk === undefined ? this.#defaultCallback : cbk
      )
    return this.#genes[ident]
  }

  /**
   * Returns whether {@link ident} contained in this pool.
   * @param {*} ident
   * @returns {Boolean}
   */
  hasGene(ident) {
    return this.#genes[ident] != undefined
  }

  /**
   * Returns number of {@link Gene}s in this pool
   * @returns {Number}
   */
  length() {
    return Object.keys(this.#genes).length
  }
  /**
   * Returns whether {@link v} fulfills {@link ident}s requirements as {@link Gene}.
   * <p>
   * Returns false, if {@link ident} is no {@link Gene} of this pool.
   * <p>
   * {@link ident}s, which are strings, compounds {@link ident}s are possible:<br>
   * - ({@link ident1}|{@link ident2}|{@link ident3})<br>
   * - Array.&lt;{@link ident1}&gt;<br>
   * - combination of both
   * <p>
   * <b>Remark:</b><br>
   * It is not static, because {@link v} is only compared against {@link Gene}s
   * in this {@link GenePool|pool}
   * @param {*} v
   * @param {*} ident
   * @returns {Boolean}
   */
  isA(v, ident) {
    if (GenePool.isCompoundOr(ident)) {
      let ids = ident.slice(1, -1).split("|")
      return ids.some((id) => this.isA(v, id), this)
    } else if (GenePool.isCompoundArr(ident)) {
      if (!Array.isArray(v)) return false
      let innerIdent = ident.slice("Array.<".length, -1)
      return v.every((innerV) => this.isA(innerV, innerIdent), this)
    } else {
      if (!this.hasGene(ident)) return false
      return this.#genes[ident].is(v)
    }
  }
  toString() {
    return "°°°" + this.constructor.name
  }

  static isCompoundOr(id) {
    let answ = false
    if (typeof id === "string") {
      if (id.startsWith("(") && id.endsWith(")")) answ = true
    }
    return answ
  }
  static isCompoundArr(id) {
    let answ = false
    if (typeof id === "string") {
      if (id.startsWith("Array.<") && id.endsWith(">")) answ = true
    }
    return answ
  }

  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("GenePool", outputObj)) {
      _.run(constructorTest)
      _.run(addTest)
      _.run(hasTest)
      _.run(lengthTest)
      _.run(isATest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let idNull = null
      let idUndE = undefined
      let idBool = false
      let idNumb = 22
      let idBigI = 22n
      let idStrI = "stringIdent"
      let idSymB = Symbol("desc")
      function idFunc() {return false}
      let idObjE = new Error("df")
      _.assert(1,_tryConstruct1,idNull,"should construct, any id allowed")
      _.assert(2,_tryConstruct1,idUndE,"should construct, any id allowed")
      _.assert(3,_tryConstruct1,idBool,"should construct, any id allowed")
      _.assert(4,_tryConstruct1,idNumb,"should construct, any id allowed")
      _.assert(5,_tryConstruct1,idBigI,"should construct, any id allowed")
      _.assert(6,_tryConstruct1,idStrI,"should construct, any id allowed")
      _.assert(7,_tryConstruct1,idSymB,"should construct, any id allowed")
      _.assert(8,_tryConstruct2,"abc",idFunc,"should construct, any id allowed")
      _.assert(9,_tryConstruct1,idObjE,"should construct, any id allowed")

      _.assert(21,_tryConstruct0,"should construct")
      _.assert(22,_tryConstruct2,"String","Number","should construct")
      _.assert(23,_tryConstruct3,"String","Number","Boolean","should construct")
      _.assert(24,_tryConstruct4,"String","Number","Boolean","Function","should construct")
      _.assert(25,_tryConstruct1,{},"should construct")
      _.assert(26,_tryConstruct2,"String",{},"should construct")
      _.assert(27,_tryConstruct3,"String","Number",{},"should construct")
      _.assert(28,_tryConstruct4,{},"Number","Boolean","Function","should construct")
    }
    function addTest() {
      let gns = new GenePool(cbkTypeOfLc,"Number")
      let gn = gns.addGene("Number")
      let gn2
      _.bassert(1, gn = gns.addGene("Number"),"Trying to add existing Gene should return it")
      _.bassert(2, gn.ident === "Number", "The existing Gene should be returned")
      _.shouldAssert(3,_tryAdd,gns,"abc",22,"Adding Gene with no function as callback should throw")

      let idNull = null
      let idUndE = undefined
      let idBool = false
      let idNumb = 22
      let idBigI = 22n
      let idStrI = "stringIdent"
      let idSymB = Symbol("desc")
      function idFunc() {return false}
      let idObjE = new Error("df")
      let gnNull
      let gnUndE
      let gnBool
      let gnNumb
      let gnBigI
      let gnStrI
      let gnSymB
      let gnFunc
      let gnObjE
      _.bassert(11, gnNull = gns.addGene(idNull),"null should be added")
      _.bassert(12, gnUndE = gns.addGene(idUndE),"null should be added")
      _.bassert(13, gnBool = gns.addGene(idBool),"null should be added")
      _.bassert(14, gnNumb = gns.addGene(idNumb),"null should be added")
      _.bassert(15, gnBigI = gns.addGene(idBigI),"null should be added")
      _.bassert(16, gnStrI = gns.addGene(idStrI),"null should be added")
      _.bassert(17, gnSymB = gns.addGene(idSymB),"null should be added")
      _.bassert(18, gnFunc = gns.addGene(idFunc),"null should be added")
      _.bassert(19, gnObjE = gns.addGene(idObjE),"null should be added")


      _.bassert(21, gnNull.ident === idNull,"The added Gene should be added")
      _.bassert(22, gnUndE.ident === idUndE,"The added Gene should be added")
      _.bassert(23, gnBool.ident === idBool,"The added Gene should be added")
      _.bassert(24, gnNumb.ident === idNumb,"The added Gene should be added")
      _.bassert(25, gnBigI.ident == idBigI,"The added Gene should be added")
      _.bassert(26, gnStrI.ident === idStrI,"The added Gene should be added")
      _.bassert(27, gnSymB.ident === idSymB,"The added Gene should be added")
      _.bassert(28, gnFunc.ident === idFunc,"The added Gene should be added")
      _.bassert(29, gnObjE.ident === idObjE,"The added Gene should be added")
    }
    function hasTest() {
      let gns = new GenePool(cbkTypeOfLc,"Number")
      _.bassert(1,gns.hasGene("Number"),"'Number' was given to constructor")
      _.bassert(2,!gns.hasGene("number"),"'number' was not given to constructor")
      _.bassert(3,!gns.hasGene("string"),"'string' was not given to constructor")
      _.bassert(4,!gns.hasGene(),"undefined is not given to constructor")
      _.bassert(5,!gns.hasGene({}),"'{}' is not given to constructor")

      let idNull = null
      let idUndE = undefined
      let idBool = false
      let idNumb = 22
      let idBigI = 22n
      let idStrI = "stringIdent"
      let idSymB = Symbol("desc")
      function idFunc() {return false}
      let idObjE = new Error("df")
      let gns2 = new GenePool()
      gns2.addGene(idNull)
      gns2.addGene(idUndE)
      gns2.addGene(idBool)
      gns2.addGene(idNumb)
      gns2.addGene(idBigI)
      gns2.addGene(idStrI)
      gns2.addGene(idSymB)
      gns2.addGene(idFunc)
      gns2.addGene(idObjE)
      _.bassert(11,gns2.hasGene(idNull), "id had been added")
      _.bassert(12,gns2.hasGene(idUndE), "id had been added")
      _.bassert(13,gns2.hasGene(idBool), "id had been added")
      _.bassert(14,gns2.hasGene(idNumb), "id had been added")
      _.bassert(15,gns2.hasGene(idBigI), "id had been added")
      _.bassert(16,gns2.hasGene(idStrI), "id had been added")
      _.bassert(17,gns2.hasGene(idSymB), "id had been added")
      _.bassert(18,gns2.hasGene(idFunc), "id had been added")
      _.bassert(19,gns2.hasGene(idObjE), "id had been added")
    }
    function lengthTest() {
      let pool0 = new GenePool()
      let pool1 = new GenePool(1)
      let pool2 = new GenePool(1,2)
      let pool3 = new GenePool(1,2,3)
      let pool4 = new GenePool(1,2,3)
      pool4.addGene("Number",cbkTypeOfLc)
      _.bassert(0,pool0.length() == 0, "no genes added")
      _.bassert(1,pool1.length() == 1, "1 gene added")
      _.bassert(2,pool2.length() == 2, "2 genes added")
      _.bassert(3,pool3.length() == 3, "3 genes added")
      _.bassert(4,pool4.length() == 4, "4 genes added")
    }
    function isATest() {
      let gns = new GenePool(cbkTypeOfLc,"Number")
      _.bassert(1,gns.isA(22,"Number"),"22 is Number")
      _.bassert(2,!gns.isA({},"Number"),"'{}' is no Number")
      _.bassert(3,!gns.isA(),"no arguments given should return false")
      _.bassert(4,!gns.isA({}),"2nd argument not given should return false")
      _.bassert(5,!gns.isA({},{}),"2nd argument not a string should return false")
      _.bassert(6,!gns.isA({},"String"),"2nd argument not allowed type should return false")

      let gns2 = new GenePool(cbkTypeOfLc,"Number","Boolean","String")
      _.bassert(11,gns2.isA(["a","b","c"],"Array.<String>"),"array of strings should be recognized")
      _.bassert(12,!gns2.isA(["a","b",3],"Array.<String>"),"array of strings with number should be rejected")
      _.bassert(13,gns2.isA(3,"(String|Number)"),"Number should be recognized for String or Number")
      _.bassert(14,gns2.isA("a","(String|Number)"),"String should be recognized for String or Number")
      _.bassert(15,!gns2.isA(false,"(String|Number)"),"Boolean should not be recognized for String or Number")
      _.bassert(16,gns2.isA(["a","b","c"],"(String|Array.<String>)"),"array of strings should be recognized for String or Array of Strings")
      _.bassert(17,gns2.isA("a","(String|Array.<String>)"),"String should be recognized for String or Array of Strings")
      _.bassert(18,gns2.isA(2,"(Number|Array.<String>)"),"Number should be recognized for Number or Array of Strings")      

      let idNull = null
      let idUndE = undefined
      let idBool = false
      let idNumb = 22
      let idBigI = 22n
      let idStrI = "stringIdent"
      let idSymB = Symbol("desc")
      function idFunc() {return false}
      let idObjE = new Error("df")
      let gns3 = new GenePool()
      function cbkNull(v, gene) {return typeof(v === "object" && v === undefined)}
      function cbkUndE(v, gene) {return typeof(v === "undefined")}
      function cbkBool(v, gene) {return typeof(v === "boolean")}
      function cbkNumb(v, gene) {return typeof(v === "number")}
      function cbkBigI(v, gene) {return typeof(v === "bigint")}
      function cbkStrI(v, gene) {return typeof(v === "string")}
      function cbkSymB(v, gene) {return typeof(v === "symbol")}
      function cbkFunc(v, gene) {return typeof(v === "function")}
      function cbkObjE(v, gene) {return typeof(v === "object")}
      gns3.addGene(idNull,cbkNull)
      gns3.addGene(idUndE,cbkUndE)
      gns3.addGene(idBool,cbkBool)
      gns3.addGene(idNumb,cbkNumb)
      gns3.addGene(idBigI,cbkBigI)
      gns3.addGene(idStrI,cbkStrI)
      gns3.addGene(idSymB,cbkSymB)
      gns3.addGene(idFunc,cbkFunc)
      gns3.addGene(idObjE,cbkObjE)
      
      _.bassert(21,gns3.isA(idNull,idNull), "should be a, see cbk")
      _.bassert(22,gns3.isA(idUndE,idUndE), "should be a, see cbk")
      _.bassert(23,gns3.isA(idBool,idBool), "should be a, see cbk")
      _.bassert(24,gns3.isA(idNumb,idNumb), "should be a, see cbk")
      _.bassert(25,gns3.isA(idBigI,idBigI), "should be a, see cbk")
      _.bassert(26,gns3.isA(idStrI,idStrI), "should be a, see cbk")
      _.bassert(27,gns3.isA(idSymB,idSymB), "should be a, see cbk")
      _.bassert(28,gns3.isA(idFunc,idFunc), "should be a, see cbk")
      _.bassert(29,gns3.isA(idObjE,idObjE), "should be a, see cbk")      
    }
    function _tryConstruct0() { new GenePool() }
    function _tryConstruct1(a) { new GenePool(a) }
    function _tryConstruct2(a,b) { new GenePool(a,b) }
    function _tryConstruct3(a,b,c) { new GenePool(a,b,c) }
    function _tryConstruct4(a,b,c,d) { new GenePool(a,b,c,d) }
    function _tryAdd(genes, arg1, arg2) {genes.add(arg1, arg2)}
  }
}
registeredTests.push(GenePool.test)
registeredExceptions.push("new GenePool().add('noGene','noFunction')")

class Essence extends GenePool {
  //#region member variables
  /**
   * Default hardcoded key for SPEC sections
   * @type {String}
   */
  static #DEFAULT_HARDCODED_SPEC_KEY = "_S_P_E_C_"
  #specificationPool = new GenePool()
  #SPEC_KEY = Essence.#DEFAULT_HARDCODED_SPEC_KEY
  #skipped = [] //[{.name,.value,.expectedType}]
  /**
   * @type {GenePool}
   */
  get specificationPool() {
    return this.#specificationPool
  }
  /**
   * @type {String}
   */
  get SPEC_KEY() {
    return this.#SPEC_KEY
  }
  /** skipped essences
   * @type {Array.<Object>}
   */
  get skipped() {
    return this.#skipped
  }
  /** ROOT essence, set automatically
   * @type {Boolean}
   */
  get ROOT() {
    return this[Essence.#pre + "ROOT"]
  }
  /** RENDER essence, inherited
   * @type {Boolean|undefined}
   */
  get RENDER() {
    return this[Essence.#pre + "RENDER"]
  }
  /** TYPE essence, inherited
   * @type {String}
   */
  get TYPE() {
    return this[Essence.#pre + "TYPE"]
  }
  /** DEFAULT essence, individual<br>
   *  is of type given in {@link Essence#TYPE|Essence.TYPE}
   * @type {*}
   */
  get DEFAULT() {
    return this[Essence.#pre + "DEFAULT"]
  }
  /** VALUE essence, individual<br>
   *  is of type given in {@link Essence#TYPE|Essence.TYPE}
   * @type {*}
   */
  get VALUE() {
    return this[Essence.#pre + "VALUE"]
  }
  /** IGNORE essence, inherited
   * @type {Boolean}
   */
  get IGNORE() {
    return this[Essence.#pre + "IGNORE"]
  }
  /** PARSE essence, inherited
   * <p>
   * Only for internal use. 
   * If set to false, no Essences will be added. This is the only
   * case, in which no Essences are possible. If used internally, instance has
   * to be parsed later before returning. Never ever an instance without
   * Essences should be given out from the using code.
   * @type {Boolean}
   */
  get PARSE() {
    return this[Essence.#pre + "PARSE"]
  }
  /** INTERNAL essence, inherited
   * @type {Boolean}
   */
  get INTERNAL() {
    return this[Essence.#pre + "INTERNAL"]
  }
  /** FLAT essence, individual
   * @type {Boolean}
   */
  get FLAT() {
    return this[Essence.#pre + "FLAT"]
  }
  /** LOCAL essence, inherited
   * @type {Boolean}
   */
  get LOCAL() {
    return this[Essence.#pre + "LOCAL"]
  }
  /** ONCE essence, individual
   * @type {Boolean}
   */
  get ONCE() {
    return this[Essence.#pre + "ONCE"]
  }
  /** REPEAT essence, individual
   * @type {Boolean}
   */
  get REPEAT() {
    return this[Essence.#pre + "REPEAT"]
  }

  static #pre = GLOBAL_namePartHiddenPropertiesStartWith // "__"
  static #RENDER_DEFT = GLOBAL_RENDER_DEFAULT // false
  static #TYPE_DEFT = GLOBAL_TYPE_DEFAULT // "String"
  static #DEFAULT_DEFT = GLOBAL_DEFAULT_DEFAULT // ""
  static #VALUE_DEFT = GLOBAL_VALUE_DEFAULT // ""
  static #IGNORE_DEFT = GLOBAL_IGNORE_DEFAULT // false
  static #PARSE_DEFT = GLOBAL_PARSE_DEFAULT  // true
  static #INTERNAL_DEFT = GLOBAL_INTERNAL_DEFAULT  // false
  static #FLAT_DEFT = GLOBAL_FLAT_DEFAULT  // false
  static #LOCAL_DEFT = GLOBAL_LOCAL_DEFAULT  // false
  static #ONCE_DEFT = GLOBAL_ONCE_DEFAULT  // false
  static #REPEAT_DEFT = GLOBAL_REPEAT_DEFAULT  // false
  //#endregion member variables
  /**
   * @classdesc Essence is unrecognizable except through me.
   * Reads and removes specification properties from literal and stores
   * them as tokens. Specification
   * properties are found in specification sections, which are  objects with a certain
   * specification key. The hardcoded default of this key is
   * {@link Essence#DEFAULT_HARDCODED_SPEC_KEY|Essence.#DEFAULT_HARDCODED_SPEC_KEY}.
   * On construction a different key can be set.
   * <p>
   * <p> There exists a set of predefined tokens.  Tokens can be individual or
   * inherited.  After initialization of an
   * Essence instance, each token is always there.
   * Either as found in specification section or as
   * given from parent if one and if inherited or at least as hardcoded default.
   * They have to be of certain {@link Gene}, e.g. the value for the
   * {@link Essence.getRENDER|RENDER} token has to be a Boolean or undefined. 
   * If some specification  entry
   * has wrong  {@link Gene} it will be {@link Essence#skipped|skipped} and
   * parent token value if inherited or if no parent or individual
   * hardcoded value will be used.
   * <p>
   * Essence has to do with two {@link GenePool}s. The one that it is and that it's
   * subclasses will be. The other is the
   * {@link Essence#specificationPool|Essence.specificationPool}.
   * This one it uses to check the specification properties in the literal given
   * to it.
   * <p>
   * All known specification properties in the literals specification object
   * are changed to invisible and unremovable properties, the tokens, of this instance,
   * which represents the literal for subclass instances.
   * They also are added to the literal containing the specification object as invisible
   * and unremovable properties. Those can be questioned using static get functions
   * ({@link Essence.getDEFAULT} - {@link Essence.getVALUE})
   * of {@link Essence}
   * <p>
   * This class is pure essence. Without filling some {@link Gene}s in
   * {@link Essence#specificationPool|Essence.specificationPool} it only produces
   * default token values.
   * @mermaid
   *  classDiagram
   *      GenePool <|-- Essence
   * @extends GenePool
   * @constructor
   * @description
   * Creates {@link Essence} instance.
   * <p>
   * Adds {@link Object}, {@link Gene}, {@link GenePool} and {@link Essence}
   * to its pool as Genes with {@link GeneCallback|callback} {@link cbkInstanceOf}.
   * @param {String} spec_key - no type check, but only implemented for
   * {@type String} and tested against {@type String}.
   */
  constructor(spec_key = Essence.#DEFAULT_HARDCODED_SPEC_KEY) {
    super()
    this.#SPEC_KEY = spec_key
    this.addGene(Object)
    this.addGene(Gene)
    this.addGene(GenePool)
    this.addGene(Essence)
  }
  /**
   * Creates the tokens.
   * <p>
   * Removes {@link Essence#SPEC_KEY|this.SPEC_KEY} property from {@link literal} and
   * removes all <code class="bordered"><a href="#zweitens">
   * specification properties</a> </code> from literal if value of
   * {@link Essence#SPEC_KEY|this.SPEC_KEY} property is not of type <code>Boolean</code>.
   * <p>
   * Adds recognized <code class="bordered"><a href="#zweitens">
   * specification properties</a> </code>
   * from {@link literal} as hidden properties (tokens)
   * to this instance and {@link literal}.<br>
   * Adds hidden properties which are not given in {@link literal}
   * with parent value (if inherited) or hardcoded default value
   * to this instance and {@link literal}.
   * <p>
   * Values in literal with wrong type (e.g. if value of {@link Essence#IGNORE|IGNORE}
   * is <code>yes</code>) will be skipped and added to {@link skipped}.
   * <p id="zweitens">
   * Recognized <code  class="bordered">{@link this#SPEC_KEY|__SPEC} properties</code> are:
   * {@link Essence#RENDER|RENDER} (inherited),
   * {@link Essence#TYPE|TYPE} (inherited),
   * {@link Essence#DEFAULT|DEFAULT},
   * {@link Essence#VALUE|VALUE},
   * {@link Essence#IGNORE|IGNORE} (inherited),
   * {@link Essence#FLAT|FLAT},
   * {@link Essence#LOCAL|LOCAL} (inherited),
   * {@link Essence#ONCE|ONCE},
   * {@link Essence#REPEAT|REPEAT} (individual) and
   * Also {@link Essence#ROOT|ROOT} is added, with value dependent
   * whether {@link parent}
   * is defined. There are some more <code>specification properties</code> for
   * internal use. Other entries in {@link literal} are ignored.<br>
   * Tokens are never undefined, even not
   * it they make no sense. Essence is not about sense.
   * @param {(Undefined|Object)} literal
   * @param {(Undefined|GenePool)} parent
   * @param {(Undefined|String)} name - for checking tests
   * @throws TypeError
   */
  parse(literal, parent, name) {
    if (LOG_ESSENCE_CONSTRUCTOR_2_CONSOLE) {
      let name_x =
        name === undefined
          ? "undefined"
          : typeof name == "symbol"
          ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
          : name
      let literal_x =
        literal === undefined
          ? "undefined"
          : literal === null
          ? "Null"
          : false
          ? JSON.stringify(literal, null, 4)
          : flatten(literal)
      let specLit_x =
        literal != undefined ? flatten(literal[this.SPEC_KEY]) : "undefined"
      let line_x = ""
      if (parent == undefined)
        line_x = "----------------------------------------------------"
      aut(
        `START Essence parse----  ${name_x}  ${line_x}---------\n   SPEC: ${specLit_x}\n   Literal :${literal_x}`,
        lime
      )
    }
    if (parent != undefined && !this.isA(parent, GenePool))
      throw new TypeError(
        `function 'Essence.parse'${NL}2nd parameter '${parent}' is not of type 'GenePool'`
      )
    if (literal != undefined && typeof literal != "object")
      throw new TypeError(
        `function 'Essence.parse'${NL}1st parameter '${literal}' is not of type 'Object'`
      )
    let un
    let p = parent
    let specLit = {}
    if (literal != un) specLit = literal[this.#SPEC_KEY]
    if (typeof specLit == "boolean") {
      specLit = literal
      specLit["FLAT"] = true
    }
    if (specLit === un) specLit = {}
    if (specLit["PARSE"] === false) return

    function changeToHiddenProp(me, lit, specL, key, type, p, def, val, name) {
      let v
      if (val != undefined) v = val
      else {
        let given = specL[key]
        delete specL[key]
        if (!me.#validateOrInform(given, type, key)) given = undefined
        v = given != undefined ? given : p != undefined ? p[key] : def
      }
      // Add hidden property to me
      Object.defineProperty(me, Essence.#pre + key, {
        value: v,
        writable: false,
        configurable: false,
        enumerable: false,
      })
      try {
        Object.defineProperty(lit, Essence.#pre + key, {
          value: v,
          writable: false,
          configurable: false,
          enumerable: false,
        })
      } catch (e) {
        let col = undefined
        if (lit != undefined && Essence.getINTERNAL(lit)) col = red
        if (!TESTING && !col && !CHECK_ERROR_OUTPUT) {
          vaut(name, e, col)
          throw e
        }
      }
    }
    let hide = changeToHiddenProp
    let l = literal
    let s = specLit
    let n = name
    // 6th arg p: Property is inherited
    // 6th arg un: Property is individual
    hide(this, l, s, "ROOT", "Boolean",     p, un, parent == un, n)
    hide(this, l, s, "RENDER", "Boolean",   p, Essence.#RENDER_DEFT, un, n)
    hide(this, l, s, "TYPE", "String",      p, Essence.#TYPE_DEFT, un, n)
    hide(this, l, s, "IGNORE", "Boolean",   p, Essence.#IGNORE_DEFT, un, n)
    hide(this, l, s, "PARSE", "Boolean",    p, Essence.#PARSE_DEFT, un, n)
    hide(this, l, s, "INTERNAL", "Boolean", p, Essence.#INTERNAL_DEFT, un, n)
    hide(this, l, s, "FLAT", "Boolean",     un, Essence.#FLAT_DEFT, un, n)
    hide(this, l, s, "LOCAL", "Boolean",    p, Essence.#LOCAL_DEFT, un, n)
    hide(this, l, s, "ONCE", "Boolean",     un, Essence.#ONCE_DEFT, un, n)
    hide(this, l, s, "REPEAT", "Boolean",   un, Essence.#REPEAT_DEFT, un, n)
    hide(this, l, s, "DEFAULT", this.TYPE,  un, Essence.#DEFAULT_DEFT, un, n)
    hide(this, l, s, "VALUE", this.TYPE,    un, Essence.#VALUE_DEFT, un, n)
    
    if (literal != un) delete literal[this.#SPEC_KEY]
    if (LOG_ESSENCE_CONSTRUCTOR_2_CONSOLE) {
      let name_x =
        name === undefined
          ? "undefined"
          : typeof name == "symbol"
          ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
          : name
      let literal_x =
        literal === undefined
          ? "undefined"
          : literal === null
          ? "Null"
          : false
          ? JSON.stringify(literal, null, 4)
          : flatten(literal)
      let specLit_x = specLit != undefined ? flatten(specLit) : "undefined"
      let flat_x = this.FLAT ? "FLAT" : "flat"
      let ignore_x = this.IGNORE ? "IGNORE" : "ignore"
      let root_x = this.ROOT ? "ROOT" : "root"
      let repeat_x = this.REPEAT ? "REPEAT" : "repeat"
      let render_x = this.RENDER ? "RENDER" : "render"
      let value_x = this.VALUE.length ? "VALUE" : "value"
      let default_x = this.DEFAULT.length ? "DEFAULT" : "default"
      let type_x = "type"
      if (literal != undefined)
        aut(
          `\
${flat_x}:${Essence.getFLAT(literal)} \
${ignore_x}:${Essence.getIGNORE(literal)} \
${root_x}:${Essence.getROOT(literal)} \
${repeat_x}:${Essence.getREPEAT(literal)} \
${render_x}:${Essence.getRENDER(literal)}
${value_x}:'${Essence.getVALUE(literal)}' \
${default_x}:'${Essence.getDEFAULT(literal)}' \
${type_x}:${Essence.getTYPE(literal)} \
`,
          blue
        )
      aut(
        `   SPEC: ${specLit_x}\n   Literal :${literal_x}
${flat_x}:${this.FLAT} \
${ignore_x}:${this.IGNORE} \
${root_x}:${this.ROOT} \
${repeat_x}:${this.REPEAT} \
${render_x}:${this.RENDER}
${value_x}:'${this.VALUE}' \
${default_x}:'${this.DEFAULT}' \
${type_x}:${this.TYPE} \
`,
        lime
      )
      aut(
        `ENDE Essence parse----  ${name_x}  \
--------------------------------------------------------------`,
        lime
      )
    }
  }
  #validateOrInform(value, type, name) {
    let ok = value === undefined || this.#specificationPool.isA(value, type)
    if (!ok) {
      let errObj = {}
      errObj.name = name
      errObj.value = value
      errObj.expectedType = type
      this.#skipped.push(errObj)
    }
    return ok
  }

  /**
   * Returns false if literal's __SPEC has PARSE set to false, true else
   * @param {Object} literal
   * @returns {Boolean}
   */
  static doParse(literal) {
    let answ = true
    if (typeof literal == "object" && literal != null) {
      let spec = literal["__SPEC"]
      if (typeof spec == "object" && spec != null) {
        if (spec["PARSE"] !== undefined) answ = spec["PARSE"] !== false
      }
    }
    return answ
  }
  //#region static getESSENCE from literal
  /** ROOT essence, set automatically
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getROOT(lit) {
    return lit[Essence.#pre + "ROOT"]
  }
  /** RENDER essence, inherited
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getRENDER(lit) {
    return lit[Essence.#pre + "RENDER"]
  }
  /** TYPE essence, individual
   * @param {Object} lit
   * @returns {String}
   */
  static getTYPE(lit) {
    return lit[Essence.#pre + "TYPE"]
  }
  /** DEFAULT essence, individual<br>
   *  is of type given in {@link Essence#TYPE|Essence.TYPE}
   * @param {Object} lit
   * @returns {*}
   */
  static getDEFAULT(lit) {
    return lit[Essence.#pre + "DEFAULT"]
  }
  /** VALUE essence, individual<br>
   *  is of type given in {@link Essence#TYPE|Essence.TYPE}
   * @param {Object} lit
   * @returns {*}
   */
  static getVALUE(lit) {
    return lit[Essence.#pre + "VALUE"]
  }
  /** IGNORE essence, inherited
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getIGNORE(lit) {
    return lit[Essence.#pre + "IGNORE"]
  }
  /** PARSE essence, individual
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getPARSE(lit) {
    return lit[Essence.#pre + "PARSE"]
  }
  /** INTERNAL essence, inherited
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getINTERNAL(lit) {
    return lit[Essence.#pre + "INTERNAL"]
  }
  /** FLAT essence, inherited
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getFLAT(lit) {
    return lit[Essence.#pre + "FLAT"]
  }
  /** LOCAL essence, individual
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getLOCAL(lit) {
    return lit[Essence.#pre + "LOCAL"]
  }
  /** ONCE essence, individual
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getONCE(lit) {
    return lit[Essence.#pre + "ONCE"]
  }
  /** REPEAT essence, individual
   * @param {Object} lit
   * @returns {Boolean}
   */
  static getREPEAT(lit) {
    return lit[Essence.#pre + "REPEAT"]
  }
  //#endregion static getESSENCE from literal

  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("Essence", outputObj)) {
      _.run(getterSPEC_KEYTest)
      _.run(getterSpecificationPoolTest)
      _.run(getterEssencesTest)
      _.run(constructorTest)
      _.run(isATest)
      _.run(parseTest)
      _.run(doParseTest)
      _.run(getEssencesTest)
      _.destruct()
      _ = null
    }
    function getterSPEC_KEYTest() {
      let ess1 = new Essence()
      let ess2 = new Essence("x")
      _.bassert(1,ess1.SPEC_KEY == "_S_P_E_C_", "Default hardcoded SPEC key")
      _.bassert(2,ess2.SPEC_KEY == "x", "x given as SPEC key")
    }
    function getterSpecificationPoolTest(){
      let ess1 = new Essence("x")
      let specPool = ess1.specificationPool
      _.bassert(1,specPool.length() == 0, "no genes in specification pool")

    }
    function getterEssencesTest() {
      let un
      let ess0 = new Essence(un)
      _.bassert(1,ess0.ROOT===undefined,"Should not be defined after construction")
      _.bassert(2,ess0.RENDER===undefined,"Should not be defined after construction")
      _.bassert(3,ess0.IGNORE===undefined,"Should not be defined after construction")
      _.bassert(4,ess0.ONCE===undefined,"Should not be defined after construction")
      _.bassert(5,ess0.FLAT===undefined,"Should not be defined after construction")
      _.bassert(6,ess0.LOCAL===undefined,"Should not be defined after construction")
      _.bassert(7,ess0.REPEAT===undefined,"Should not be defined after construction")
      _.bassert(8,ess0.TYPE===undefined,"Should not be defined after construction")
      _.bassert(9,ess0.DEFAULT===undefined,"Should not be defined after construction")
      _.bassert(10,ess0.VALUE===undefined,"Should not be defined after construction")
      _.bassert(11,areEqual(ess0.DEFAULTSundefined),"Should not be defined after construction")
      _.bassert(12,ess0.PARSE===undefined,"Should not be defined after construction")
      _.bassert(13,ess0.INTERNAL===undefined,"Should not be defined after construction")
      ess0.parse(un,un,"Essence.getterEssencesTest21")
      _.bassert(21,ess0.ROOT===true,"Should always be defined")
      _.bassert(22,ess0.RENDER===undefined,"RENDER is used as trivalent")
      _.bassert(23,ess0.IGNORE===false,"Should always be defined")
      _.bassert(24,ess0.ONCE===false,"Should always be defined")
      _.bassert(25,ess0.FLAT===false,"Should always be defined")
      _.bassert(26,ess0.LOCAL===false,"Should always be defined")
      _.bassert(27,ess0.REPEAT===false,"Should always be defined")
      _.bassert(28,ess0.TYPE==="String","Should always be defined")
      _.bassert(29,ess0.DEFAULT==="","Should always be defined")
      _.bassert(30,ess0.VALUE==="","Should always be defined")
      _.bassert(32,ess0.PARSE===true,"Should always be defined")
      _.bassert(33,ess0.INTERNAL===false,"Should always be defined")
      let lit1 = {__SPEC: {RENDER:true,
                           IGNORE:true,
                           ONCE:true,
                           FLAT:true,
                           LOCAL:true,
                           REPEAT:true,
                           TYPE:"Boolean",
                           DEFAULT:false,
                           INTERNAL:true,
                           VALUE:false}}
      let ess1 = new Essence("__SPEC")
      ess1.parse(lit1,un,"Essence:getterEssencesTest1")
      _.bassert(31,ess1.ROOT===true,"Should be set automatically")
      _.bassert(32,ess1.RENDER===undefined,"Should stay at default value")
      _.bassert(33,ess1.IGNORE===false,"Should stay at default value")
      _.bassert(34,ess1.ONCE===false,"Should stay at default value")
      _.bassert(35,ess1.FLAT===false,"Should stay at default value")
      _.bassert(36,ess1.LOCAL===false,"Should stay at default value")
      _.bassert(37,ess1.REPEAT===false,"Should stay at default value")
      _.bassert(38,ess1.TYPE==="String","Should stay at default value")
      _.bassert(39,ess1.DEFAULT==="","Should stay at default value")
      _.bassert(40,ess1.VALUE==="","Should stay at default value")
      _.bassert(41,ess1.INTERNAL===false,"Should stay at default value")
      _.bassert(42,ess1.PARSE===true,"Should stay at default value")
      let lit2 = {_S_P_E_C_: {RENDER:true,
                           IGNORE:true,
                           ONCE:true,
                           FLAT:true,
                           LOCAL:true,
                           REPEAT:true,
                           TYPE:"Boolean",
                           DEFAULT:false,
                           INTERNAL:true,
                           VALUE:false}}
      let ess2 = new Essence()
      ess2.parse(lit2,un,"Essence:getterEssencesTest51")
      _.bassert(50,ess2.SPEC_KEY == "_S_P_E_C_", "Reason that nothing works is not the SPEC key")
      _.bassert(51,ess2.ROOT===true,"Should be set automatically")
      _.bassert(52,ess2.RENDER===undefined,"Should stay at default value")
      _.bassert(53,ess2.IGNORE===false,"Should stay at default value")
      _.bassert(54,ess2.ONCE===false,"Should stay at default value")
      _.bassert(55,ess2.FLAT===false,"Should stay at default value")
      _.bassert(56,ess2.LOCAL===false,"Should stay at default value")
      _.bassert(57,ess2.REPEAT===false,"Should stay at default value")
      _.bassert(58,ess2.TYPE==="String","Should stay at default value")
      _.bassert(59,ess2.DEFAULT==="","Should stay at default value")
      _.bassert(60,ess2.VALUE==="","Should stay at default value")
      _.bassert(61,ess2.INTERNAL===false,"Should stay at default value")
      _.bassert(62,ess2.PARSE===true,"Should stay at default value")
    }
    function constructorTest() {
      let un
      _.assert(1,_tryConstruct,un,"should construct with no parameter given")
      _.assert(2,_tryConstruct,1,"should construct with number parameter")
      _.assert(3,_tryConstruct,"name","should construct with string parameter")
    }
    function parseTest() {
      let un
      let ess0 = new Essence()
      ess0.parse(un,un,"Essence parseTest1")
      _.bassert(1,ess0.ROOT===true,"Should always be defined")
      _.bassert(2,ess0.RENDER===undefined,"RENDER is used as trivalent")
      _.bassert(3,ess0.IGNORE===false,"Should always be defined")
      _.bassert(4,ess0.ONCE===false,"Should always be defined")
      _.bassert(5,ess0.FLAT===false,"Should always be defined")
      _.bassert(6,ess0.LOCAL===false,"Should always be defined")
      _.bassert(7,ess0.REPEAT===false,"Should always be defined")
      _.bassert(8,ess0.TYPE==="String","Should always be defined")
      _.bassert(9,ess0.DEFAULT==="","Should always be defined")
      _.bassert(10,ess0.VALUE==="","Should always be defined")
      _.bassert(12,ess0.PARSE===true,"Should always be defined")
      _.bassert(13,ess0.INTERNAL===false,"Should always be defined")
      let lit1 = {_S_P_E_C_: {RENDER:true,
                           IGNORE:true,
                           ONCE:true,
                           FLAT:true,
                           LOCAL:true,
                           REPEAT:true,
                           TYPE:"Boolean",
                           DEFAULT:false,
                           INTERNAL:true,
                           VALUE:false}}
      let ess1 = new Essence()     
      _.bassert(20,ess1.SPEC_KEY=="_S_P_E_C_","Just to assure, we have correct SPEC KEY")
      ess1.specificationPool.addGene("String", cbkTypeOfLc)
      ess1.specificationPool.addGene("Boolean", cbkTypeOfLc)
        
      ess1.parse(lit1,un,"Essence:getterEssencesTest1")
      _.bassert(21,ess1.ROOT===true,"Should always be defined")
      _.bassert(22,ess1.RENDER===true,"Should be set to literal value")
      _.bassert(23,ess1.IGNORE===true,"Should be set to literal value")
      _.bassert(24,ess1.ONCE===true,"Should be set to literal value")
      _.bassert(25,ess1.FLAT===true,"Should be set to literal value")
      _.bassert(26,ess1.LOCAL===true,"Should be set to literal value")
      _.bassert(27,ess1.REPEAT===true,"Should be set to literal value")
      _.bassert(28,ess1.TYPE==="Boolean","Should be set to literal value")
      _.bassert(29,ess1.DEFAULT===false,"Should be set to literal value")
      _.bassert(30,ess1.VALUE===false,"Should be set to literal value")
      _.bassert(31,ess1.INTERNAL===true,"Should be set to literal value")
      _.bassert(32,ess1.PARSE===true,"Should stay at default value")
           
      _.shouldAssert(40,_tryParse,ess1,{}, new Error(),un,"Error no allowed parent")
      _.shouldAssert(41,_tryParse,ess1,"string", un,un,"String no allowed literal")
    }    
    function isATest() {
      let un
      let ess1 = new Essence(un)
      let gn1 = new Gene("abc")
      // Object, Gene, GenePool, Essence added for each Essence instance
      _.bassert(1,ess1.isA(ess1,Essence),"Essence should be Essence")
      _.bassert(3,ess1.isA(ess1,GenePool),"Essence should be GenePool")
      _.bassert(4,ess1.isA(ess1,Object),"Essence should be Object")
      _.bassert(5,ess1.isA(gn1,Object),"Gene should be Object")
      _.bassert(6,ess1.isA(gn1,Gene),"Gene should be Gene")
      _.bassert(7,!ess1.isA(ess1,Gene),"Essence should not be Gene")
      _.bassert(8,!ess1.isA(gn1,GenePool),"Gene should not be GenePool")
  
      _.bassert(11,!ess1.isA(new Error(),Error),"should return false for Error, as not in pool")
      _.bassert(12,!ess1.isA("String",String),"should return false for string, as not in pool")
      _.bassert(13,!ess1.isA("String","String"),"should return false for string, as not in pool")
      _.bassert(14,!ess1.isA("String","string"),"should return false for string, as not in pool")
      _.bassert(15,!ess1.isA("String",Object),"should return false as string is not an Object")
    }
    function doParseTest() {
      let lit1 = {a:"b"}
      let lit2 = {a:"b",__SPEC:{}}
      let lit3 = {a:"b",__SPEC:{anything:"something"}}
      let lit4 = {a:"b",__SPEC:{anything:"something",PARSE:true}}
      let lit5 = {a:"b",__SPEC:{anything:"something",PARSE:false}}
      let answ1 = Essence.doParse(lit1)
      let answ2 = Essence.doParse(lit2)
      let answ3 = Essence.doParse(lit3)
      let answ4 = Essence.doParse(lit4)
      let answ5 = Essence.doParse(lit5)
      _.bassert(1,answ1 === true, "PARSE is not set")
      _.bassert(2,answ2 === true, "PARSE is not set")
      _.bassert(3,answ3 === true, "PARSE is not set")
      _.bassert(4,answ4 === true, "PARSE is set to true")
      _.bassert(5,answ5 === false, "PARSE is set to false")
    }
    function getEssencesTest(){
      let un
      let lit1 = {__SPEC: {RENDER:true,
                           IGNORE:true,
                           ONCE:true,
                           FLAT:true,
                           LOCAL:true,
                           REPEAT:true,
                           TYPE:"Number",
                           DEFAULT:126,
                           VALUE:127 }}
      _.bassert(0,lit1.__SPEC !== undefined, "__SPEC properties not removed")
      _.bassert(1,Essence.getROOT(lit1) === undefined, "Hidden properties not added")
      _.bassert(2,Essence.getRENDER(lit1) === undefined, "Hidden properties not added")
      _.bassert(3,Essence.getIGNORE(lit1) === undefined, "Hidden properties not added")
      _.bassert(4,Essence.getONCE(lit1) === undefined, "Hidden properties not added")
      _.bassert(5,Essence.getFLAT(lit1) === undefined, "Hidden properties not added")
      _.bassert(6,Essence.getLOCAL(lit1) === undefined, "Hidden properties not added")
      _.bassert(7,Essence.getREPEAT(lit1) === undefined, "Hidden properties not added")
      _.bassert(8,Essence.getTYPE(lit1) === undefined, "Hidden properties not added")
      _.bassert(9,Essence.getDEFAULT(lit1) === undefined, "Hidden properties not added")
      _.bassert(10,Essence.getVALUE(lit1) === undefined, "Hidden properties not added")
      _.bassert(11,Essence.getINTERNAL(lit1) === undefined, "Hidden properties not added")
      _.bassert(12,Essence.getPARSE(lit1) === undefined, "Hidden properties not added")
      let ess1 = new Essence("__SPEC")
      ess1.specificationPool.addGene("String", cbkTypeOfLc)
      ess1.specificationPool.addGene("Boolean", cbkTypeOfLc)
      ess1.specificationPool.addGene("Number", cbkTypeOfLc)
      ess1.parse(lit1,un,"Essence:getEssencesTest20")
      _.bassert(20,lit1.__SPEC === undefined, "__SPEC properties removed")
      _.bassert(21,Essence.getROOT(lit1) === true, "Hidden properties added")
      _.bassert(22,Essence.getRENDER(lit1) === true, "Hidden properties added")
      _.bassert(23,Essence.getIGNORE(lit1) === true, "Hidden properties added")
      _.bassert(24,Essence.getONCE(lit1) === true, "Hidden properties added")
      _.bassert(25,Essence.getFLAT(lit1) === true, "Hidden properties added")
      _.bassert(26,Essence.getLOCAL(lit1) === true, "Hidden properties added")
      _.bassert(27,Essence.getREPEAT(lit1) === true, "Hidden properties added")
      _.bassert(28,Essence.getTYPE(lit1) === "Number", "Hidden properties added")
      _.bassert(29,Essence.getDEFAULT(lit1) === 126, "Hidden properties added")
      _.bassert(30,Essence.getVALUE(lit1) === 127, "Hidden properties added")
      _.bassert(31,Essence.getINTERNAL(lit1) === false, "Hidden properties added")
      _.bassert(32,Essence.getPARSE(lit1) === true, "Hidden properties added")
      _.bassert(32,Object.keys(lit1).length === 0,"Hidden properties are not enumerable")
      let lit2 = {__SPEC: {RENDER:true,
        IGNORE:true,
        ONCE:true,
        FLAT:true,
        LOCAL:true,
        REPEAT:true,
        TYPE:"Boolean",
        DEFAULT:"No Boolean",
        INTERNAL:true,
        PARSE:false,
        VALUE:"No Boolean"}}
        let ess2 = new Essence("__SPEC")
        ess2.specificationPool.addGene("String", cbkTypeOfLc)
        ess2.specificationPool.addGene("Boolean", cbkTypeOfLc)
        ess2.specificationPool.addGene("Number", cbkTypeOfLc)
        ess2.parse(lit2,un,"Essence:getEssencesTest40")
      _.bassert(40,typeof lit2.__SPEC === "object", "__SPEC not changed")
      _.bassert(41,Essence.getROOT(lit2) === undefined, "Hidden properties not added")
      _.bassert(42,Essence.getRENDER(lit2) === undefined, "Hidden properties not added")
      _.bassert(43,Essence.getIGNORE(lit2) === undefined, "Hidden properties not added")
      _.bassert(44,Essence.getONCE(lit2) === undefined, "Hidden properties not added")
      _.bassert(45,Essence.getFLAT(lit2) === undefined, "Hidden properties not added")
      _.bassert(46,Essence.getLOCAL(lit2) === undefined, "Hidden properties not added")
      _.bassert(47,Essence.getREPEAT(lit2) === undefined, "Hidden properties not added")
      _.bassert(48,Essence.getTYPE(lit2) === undefined, "Hidden properties not added")
      _.bassert(49,Essence.getDEFAULT(lit2) === undefined, "Hidden properties not added")
      _.bassert(50,Essence.getVALUE(lit2) === undefined, "Hidden properties not added")
      _.bassert(51,Essence.getINTERNAL(lit2) === undefined, "Hidden properties not added")
      _.bassert(52,Essence.getPARSE(lit2) === undefined, "Hidden properties not added")
      _.bassert(54,Object.keys(lit2["__SPEC"]).length === 11,"SPEC not changed") 
      _.bassert(55,lit2["__SPEC"]["RENDER"] === true,"SPEC not changed") 
      _.bassert(56,lit2["__SPEC"]["IGNORE"] === true,"SPEC not changed") 
      _.bassert(57,lit2["__SPEC"]["ONCE"] === true,"SPEC not changed") 
      _.bassert(58,lit2["__SPEC"]["FLAT"] === true,"SPEC not changed") 
      _.bassert(59,lit2["__SPEC"]["LOCAL"] === true,"SPEC not changed") 
      _.bassert(60,lit2["__SPEC"]["REPEAT"] === true,"SPEC not changed") 
      _.bassert(61,lit2["__SPEC"]["TYPE"] === "Boolean","SPEC not changed") 
      _.bassert(62,lit2["__SPEC"]["DEFAULT"] === "No Boolean","SPEC not changed") 
      _.bassert(63,lit2["__SPEC"]["INTERNAL"] === true,"SPEC not changed") 
      _.bassert(64,lit2["__SPEC"]["PARSE"] === false,"SPEC not changed") 
      _.bassert(65,lit2["__SPEC"]["VALUE"] === "No Boolean","SPEC not changed")       
    }
    function _tryConstruct(arg1) {
      new Essence(arg1)
    }
    function _tryParse(me,arg1,arg2,arg3) {
      me.parse(arg1,arg2,arg3)
    }
  }
}
registeredTests.push(Essence.test)
registeredExceptions.push(
  "new Essence().parse({}, new Error())",
  "new Essence().parse('thisIsNotAnObject')"
)

//#endregion Gene, Pool and Essence
//#region central code classes
class AEssence extends Essence {
  static #SPEC_KEY = GLOBAL__SPEC // "__SPEC"
  /** SPEC key
   * @type {String}
   */
  static get SPEC_KEY() {
    return AEssence.#SPEC_KEY
  }

  /**
   * @classdesc
   * First superclass in tree, which is foty specific.
   * @mermaid
   *  classDiagram
   *      GenePool <|-- Essence
   *      Essence <|-- AEssence
   * @extends Essence
   * @constructor
   * @description
   * Creates foty tokens.
   * <p>
   * Adds self to its pool with {@link GeneCallback|default callback}}.
   * Adds {@link String}, {@link Number}, {@link Boolean},
   * {@link Function} and {@link Object} with
   * {@link GeneCallback|callback} {@link cbkTypeOfLc}
   * and {@link Date} with {@link GeneCallback|callback} {@link cbkIsDate}.
   * <p>
   * Sets {@link Essence#SPEC_KEY|supers SPEC_KEY} to {@link AEssence.SPEC_KEY}
   * and calls {@link Essence#parse|supers parse}, which creates the tokens.
   * @param {(Undefined|Object)} literal
   * @param {(Undefined|GenePool)} parent
   * @param {(Undefined|String)} name - for checking tests
   * @throws TypeError
   */
  constructor(literal, parent, name) {
    super(AEssence.#SPEC_KEY)
    if (parent != undefined && !this.isA(parent, GenePool))
      throw new TypeError(
        `function 'AEssence.constructor'${NL}2nd parameter '${parent}' is not of type 'GenePool'`
      )
    if (literal != undefined && typeof literal != "object")
      throw new TypeError(
        `function 'AEssence.constructor'${NL}1st parameter '${literal}' is not of type 'Object'`
      )

    this.addGene(AEssence)
    this.specificationPool.addGene("String", cbkTypeOfLc)
    this.specificationPool.addGene("Number", cbkTypeOfLc)
    this.specificationPool.addGene("Boolean", cbkTypeOfLc)
    this.specificationPool.addGene("Function", cbkTypeOfLc)
    this.specificationPool.addGene("Object", cbkTypeOfLc)
    this.specificationPool.addGene("Date", cbkIsDate)
    this.parse(
      literal,
      parent,
      typeof name == "symbol" ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++ : name
    )
    }

  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("AEssence", outputObj)) {
      _.run(getterEssencesTest)
      _.run(constructorTest)
      _.run(isATest)
      _.run(getEssencesTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let un
      _.assert(1,_tryConstruct1,{__SPEC: {RENDER:true}},"Should construct")
      _.assert(2,_tryConstruct1,{__SPEC: {IGNORE:true}},"Should construct")
      _.assert(3,_tryConstruct1,{__SPEC: {ONCE:true}},"Should construct")
      _.assert(4,_tryConstruct1,{__SPEC: {FLAT:true}},"Should construct")
      _.assert(5,_tryConstruct1,{__SPEC: {LOCAL:true}},"Should construct")
      _.assert(6,_tryConstruct1,{__SPEC: {REPEAT:true}},"Should construct")
      _.assert(7,_tryConstruct1,{__SPEC: {TYPE:"Boolean"}},"Should construct")
      _.assert(8,_tryConstruct1,{__SPEC: {DEFAULT:""}},"Should construct")
      _.assert(9,_tryConstruct1,{__SPEC: {VALUE:""}},"Should construct")
      _.assert(10,_tryConstruct1,{__SPEC: {NO_SPEC_KEY:""}},"Should construct")
      _.assert(11,_tryConstruct1,{__SPEC: {RENDER:"abc"}},"Should construct")
      _.assert(12,_tryConstruct1,{__SPEC: {IGNORE:"abc"}},"Should construct")
      _.assert(13,_tryConstruct1,{__SPEC: {ONCE:"abc"}},"Should construct")
      _.assert(14,_tryConstruct1,{__SPEC: {FLAT:"abc"}},"Should construct")
      _.assert(15,_tryConstruct1,{__SPEC: {LOCAL:"abc"}},"Should construct")
      _.assert(16,_tryConstruct1,{__SPEC: {REPEAT:"abc"}},"Should construct")
      _.assert(17,_tryConstruct1,{__SPEC: {TYPE:false}},"Should construct")
      _.assert(18,_tryConstruct1,{__SPEC: {DEFAULT:false}},"Should construct")
      _.assert(19,_tryConstruct1,{__SPEC: {VALUE:false}},"Should construct")
      let wrong1 = new AEssence({__SPEC: {RENDER:"abc"}},un,"AEssence:constructorTestWrong1")
      let wrong2 = new AEssence({__SPEC: {IGNORE:"abc"}},un,"AEssence:constructorTestWrong2")
      let wrong3 = new AEssence({__SPEC: {ONCE:"abc"}},un,"AEssence:constructorTestWrong3")
      let wrong4 = new AEssence({__SPEC: {FLAT:"abc"}},un,"AEssence:constructorTestWrong4")
      let wrong5 = new AEssence({__SPEC: {LOCAL:"abc"}},un,"AEssence:constructorTestWrong5")
      let wrong6 = new AEssence({__SPEC: {REPEAT:"abc"}},un,"AEssence:constructorTestWrong6")
      let wrong7 = new AEssence({__SPEC: {TYPE:false}},un,"AEssence:constructorTestWrong7")
      let wrong8 = new AEssence({__SPEC: {DEFAULT:false}},un,"AEssence:constructorTestWrong8")
      let wrong9 = new AEssence({__SPEC: {VALUE:false}},un,"AEssence:constructorTestWrong9")
      let wrong10 = new AEssence({__SPEC: {NO_SPEC_KEY:false}},un,"AEssence:constructorTestWrong10")
      _.bassert(21,wrong1.skipped[0]["name"]==="RENDER","RENDER should be skipped")
      _.bassert(22,wrong2.skipped[0]["name"]==="IGNORE","IGNORE should be skipped")
      _.bassert(23,wrong3.skipped[0]["name"]==="ONCE","ONCE should be skipped")
      _.bassert(24,wrong4.skipped[0]["name"]==="FLAT","FLAT should be skipped")
      _.bassert(25,wrong5.skipped[0]["name"]==="LOCAL","LOCAL should be skipped")
      _.bassert(26,wrong6.skipped[0]["name"]==="REPEAT","REPEAT should be skipped")
      _.bassert(27,wrong7.skipped[0]["name"]==="TYPE","TYPE should be skipped")
      _.bassert(28,wrong8.skipped[0]["name"]==="DEFAULT","DEFAULT should be skipped")
      _.bassert(29,wrong9.skipped[0]["name"]==="VALUE","VALUE should be skipped")
      _.bassert(30,wrong10.skipped.length ===0,"unknown SPEC entries should be skipped silently")
      let lit = {__SPEC: {RENDER:true},myValue:"22"}
      _.bassert(31,lit.__SPEC != undefined,"just to show it is defined")
      _.bassert(32,lit.myValue != undefined,"just to show it is defined")
      let ess1 = new AEssence(lit,un,"AEssence:ConstructorTestEss1")
      _.bassert(33,lit.__SPEC === undefined,"SPEC should no longer be defined")
      _.bassert(34,lit.myValue != undefined,"just to show it is still defined")
  
      _.shouldAssert(41,_tryConstruct3,{__SPEC: {RENDER:true}},new Error(),"Should not be constructed")
      _.assert(42,_tryConstruct3,{__SPEC: {RENDER:true}},ess1,"Should be constructed")    
    }
    function getterEssencesTest() {
      let un
      let ess0 = new AEssence(un,un,"AEssence:getterEssencesTest0")
      _.bassert(1,ess0.ROOT===true,"Should always be defined")
      _.bassert(2,ess0.RENDER===undefined,"RENDER is used as trivalent")
      _.bassert(3,ess0.IGNORE===false,"Should always be defined")
      _.bassert(4,ess0.ONCE===false,"Should always be defined")
      _.bassert(5,ess0.FLAT===false,"Should always be defined")
      _.bassert(6,ess0.LOCAL===false,"Should always be defined")
      _.bassert(7,ess0.REPEAT===false,"Should always be defined")
      _.bassert(8,ess0.TYPE==="String","Should always be defined")
      _.bassert(9,ess0.DEFAULT==="","Should always be defined")
      _.bassert(10,ess0.VALUE==="","Should always be defined")
      _.bassert(12,ess0.PARSE===true,"Should always be defined")
      _.bassert(13,ess0.INTERNAL===false,"Should always be defined")
      let lit1 = {__SPEC: {RENDER:true,
                           IGNORE:true,
                           ONCE:true,
                           FLAT:true,
                           LOCAL:true,
                           REPEAT:true,
                           TYPE:"Boolean",
                           DEFAULT:false,
                           INTERNAL:true,
                           VALUE:false}}
      let ess1 = new AEssence(lit1,un,"AEssence:getterEssencesTest1")
      _.bassert(21,ess1.ROOT===true,"Should always be defined")
      _.bassert(22,ess1.RENDER===true,"Should be set to literal value")
      _.bassert(23,ess1.IGNORE===true,"Should be set to literal value")
      _.bassert(24,ess1.ONCE===true,"Should be set to literal value")
      _.bassert(25,ess1.FLAT===true,"Should be set to literal value")
      _.bassert(26,ess1.LOCAL===true,"Should be set to literal value")
      _.bassert(27,ess1.REPEAT===true,"Should be set to literal value")
      _.bassert(28,ess1.TYPE==="Boolean","Should be set to literal value")
      _.bassert(29,ess1.DEFAULT===false,"Should be set to literal value")
      _.bassert(30,ess1.VALUE===false,"Should be set to literal value")
      _.bassert(31,ess1.INTERNAL===true,"Should be set to literal value")
      _.bassert(32,ess1.PARSE===true,"Should stay at default value")
      let ess2 = new AEssence(undefined,ess1,"AEssence:getterEssencesTest2")
      _.bassert(41,ess2.ROOT===false,"Should always be defined")
      _.bassert(42,ess2.RENDER===true,"Should be set to parent value")
      _.bassert(43,ess2.IGNORE===true,"Should be set to parent value")
      _.bassert(44,ess2.ONCE===false,"Should be set to default value")
      _.bassert(45,ess2.FLAT===false,"Should be set to default value")
      _.bassert(46,ess2.LOCAL===true,"Should be set to parent value")
      _.bassert(47,ess2.REPEAT===false,"Should be set to default value")
      _.bassert(48,ess2.TYPE==="Boolean","Should be set to parent value")
      _.bassert(49,ess2.DEFAULT==="","Should be set to default value")
      _.bassert(50,ess2.VALUE==="","Should be set to default value")
      _.bassert(51,ess2.INTERNAL===true,"Should be set to inherited value")
      _.bassert(52,ess1.PARSE===true,"Should stay at default value")
      let lit3 = {__SPEC: {RENDER:true,
        IGNORE:true,
        ONCE:true,
        FLAT:true,
        LOCAL:true,
        REPEAT:true,
        TYPE:"Boolean",
        DEFAULT:false,
        INTERNAL:true,
        PARSE:false,
        VALUE:false}}
      let ess3 = new AEssence(lit3,un,"AEssence:getterEssencesTest3")
      _.bassert(61,ess3.ROOT===undefined,"No Essences should be added")
      _.bassert(62,ess3.RENDER===undefined,"No Essences should be added")
      _.bassert(63,ess3.IGNORE===undefined,"No Essences should be added")
      _.bassert(64,ess3.ONCE===undefined,"No Essences should be added")
      _.bassert(65,ess3.FLAT===undefined,"No Essences should be added")
      _.bassert(66,ess3.LOCAL===undefined,"No Essences should be added")
      _.bassert(67,ess3.REPEAT===undefined,"No Essences should be added")
      _.bassert(68,ess3.TYPE===undefined,"No Essences should be added")
      _.bassert(69,ess3.DEFAULT===undefined,"No Essences should be added")
      _.bassert(70,ess3.VALUE===undefined,"No Essences should be added")
      _.bassert(71,ess3.INTERNAL===undefined,"No Essences should be added")
      _.bassert(72,ess3.PARSE===undefined,"No Essences should be added")
    }
    function isATest() {
      let un
      let ess1 = new AEssence(un,un,"AEssence:isATest1")
      let gn1 = new Gene("abc")
      // Object, Gene, GenePool, AEssence added for each AEssence instance
      _.bassert(1,ess1.isA(ess1,AEssence),"AEssence should be AEssence")
      _.bassert(2,ess1.isA(ess1,Essence),"AEssence should be Essence")
      _.bassert(3,ess1.isA(ess1,GenePool),"AEssence should be GenePool")
      _.bassert(4,ess1.isA(ess1,Object),"AEssence should be Object")
      _.bassert(5,ess1.isA(gn1,Object),"Gene should be Object")
      _.bassert(6,ess1.isA(gn1,Gene),"Gene should be Gene")
      _.bassert(7,!ess1.isA(ess1,Gene),"AEssence should not be Gene")
      _.bassert(8,!ess1.isA(gn1,GenePool),"Gene should not be GenePool")
      _.bassert(9,!ess1.isA(gn1,AEssence),"Gene should not be AEssence")
  
      _.bassert(11,!ess1.isA(new Error(),Error),"should return false for Error, as not in pool")
      _.bassert(12,!ess1.isA("String",String),"should return false for string, as not in pool")
      _.bassert(13,!ess1.isA("String","String"),"should return false for string, as not in pool")
      _.bassert(14,!ess1.isA("String","string"),"should return false for string, as not in pool")
      _.bassert(15,!ess1.isA("String",Object),"should return false as string is not an Object")
    }
    function getEssencesTest() {
      let un
      let lit1 = {__SPEC: {RENDER:true,
                           IGNORE:true,
                           ONCE:true,
                           FLAT:true,
                           LOCAL:true,
                           REPEAT:true,
                           TYPE:"Number",
                           DEFAULT:126,
                           VALUE:127 }}
      _.bassert(0,lit1.__SPEC !== undefined, "__SPEC properties not removed")
      _.bassert(1,AEssence.getROOT(lit1) === undefined, "Hidden properties not added")
      _.bassert(2,AEssence.getRENDER(lit1) === undefined, "Hidden properties not added")
      _.bassert(3,AEssence.getIGNORE(lit1) === undefined, "Hidden properties not added")
      _.bassert(4,AEssence.getONCE(lit1) === undefined, "Hidden properties not added")
      _.bassert(5,AEssence.getFLAT(lit1) === undefined, "Hidden properties not added")
      _.bassert(6,AEssence.getLOCAL(lit1) === undefined, "Hidden properties not added")
      _.bassert(7,AEssence.getREPEAT(lit1) === undefined, "Hidden properties not added")
      _.bassert(8,AEssence.getTYPE(lit1) === undefined, "Hidden properties not added")
      _.bassert(9,AEssence.getDEFAULT(lit1) === undefined, "Hidden properties not added")
      _.bassert(10,AEssence.getVALUE(lit1) === undefined, "Hidden properties not added")
      _.bassert(11,AEssence.getINTERNAL(lit1) === undefined, "Hidden properties not added")
      _.bassert(12,AEssence.getPARSE(lit1) === undefined, "Hidden properties not added")
      new AEssence(lit1,un,"AEssence:getEssencesTest")
      _.bassert(20,lit1.__SPEC === undefined, "__SPEC properties removed")
      _.bassert(21,AEssence.getROOT(lit1) === true, "Hidden properties added")
      _.bassert(22,AEssence.getRENDER(lit1) === true, "Hidden properties added")
      _.bassert(23,AEssence.getIGNORE(lit1) === true, "Hidden properties added")
      _.bassert(24,AEssence.getONCE(lit1) === true, "Hidden properties added")
      _.bassert(25,AEssence.getFLAT(lit1) === true, "Hidden properties added")
      _.bassert(26,AEssence.getLOCAL(lit1) === true, "Hidden properties added")
      _.bassert(27,AEssence.getREPEAT(lit1) === true, "Hidden properties added")
      _.bassert(28,AEssence.getTYPE(lit1) === "Number", "Hidden properties added")
      _.bassert(29,AEssence.getDEFAULT(lit1) === 126, "Hidden properties added")
      _.bassert(30,AEssence.getVALUE(lit1) === 127, "Hidden properties added")
      _.bassert(31,AEssence.getINTERNAL(lit1) === false, "Hidden properties added")
      _.bassert(32,AEssence.getPARSE(lit1) === true, "Hidden properties added")
      _.bassert(32,Object.keys(lit1).length === 0,"Hidden properties are not enumerable")
      let lit2 = {__SPEC: {RENDER:true,
        IGNORE:true,
        ONCE:true,
        FLAT:true,
        LOCAL:true,
        REPEAT:true,
        TYPE:"Boolean",
        DEFAULT:"No Boolean",
        INTERNAL:true,
        PARSE:false,
        VALUE:"No Boolean"}}
      new AEssence(lit2,un,"AEssence:getEssencesTest")
      _.bassert(40,typeof lit2.__SPEC === "object", "__SPEC not changed")
      _.bassert(41,AEssence.getROOT(lit2) === undefined, "Hidden properties not added")
      _.bassert(42,AEssence.getRENDER(lit2) === undefined, "Hidden properties not added")
      _.bassert(43,AEssence.getIGNORE(lit2) === undefined, "Hidden properties not added")
      _.bassert(44,AEssence.getONCE(lit2) === undefined, "Hidden properties not added")
      _.bassert(45,AEssence.getFLAT(lit2) === undefined, "Hidden properties not added")
      _.bassert(46,AEssence.getLOCAL(lit2) === undefined, "Hidden properties not added")
      _.bassert(47,AEssence.getREPEAT(lit2) === undefined, "Hidden properties not added")
      _.bassert(48,AEssence.getTYPE(lit2) === undefined, "Hidden properties not added")
      _.bassert(49,AEssence.getDEFAULT(lit2) === undefined, "Hidden properties not added")
      _.bassert(50,AEssence.getVALUE(lit2) === undefined, "Hidden properties not added")
      _.bassert(51,AEssence.getINTERNAL(lit2) === undefined, "Hidden properties not added")
      _.bassert(52,AEssence.getPARSE(lit2) === undefined, "Hidden properties not added")
      _.bassert(54,Object.keys(lit2["__SPEC"]).length === 11,"SPEC not changed") 
      _.bassert(55,lit2["__SPEC"]["RENDER"] === true,"SPEC not changed") 
      _.bassert(56,lit2["__SPEC"]["IGNORE"] === true,"SPEC not changed") 
      _.bassert(57,lit2["__SPEC"]["ONCE"] === true,"SPEC not changed") 
      _.bassert(58,lit2["__SPEC"]["FLAT"] === true,"SPEC not changed") 
      _.bassert(59,lit2["__SPEC"]["LOCAL"] === true,"SPEC not changed") 
      _.bassert(60,lit2["__SPEC"]["REPEAT"] === true,"SPEC not changed") 
      _.bassert(61,lit2["__SPEC"]["TYPE"] === "Boolean","SPEC not changed") 
      _.bassert(62,lit2["__SPEC"]["DEFAULT"] === "No Boolean","SPEC not changed") 
      _.bassert(63,lit2["__SPEC"]["INTERNAL"] === true,"SPEC not changed") 
      _.bassert(64,lit2["__SPEC"]["PARSE"] === false,"SPEC not changed") 
      _.bassert(65,lit2["__SPEC"]["VALUE"] === "No Boolean","SPEC not changed") 
    }
    function _tryConstruct1(arg1) { 
      new AEssence(arg1) 
    }
    function _tryConstruct3(arg1, arg2, arg3) { 
      if(arg3 == undefined) arg3 = "EssenceTest"
      new AEssence(arg1, arg2, arg3) 
    }
  }
}
registeredTests.push(AEssence.test)
registeredExceptions.push(
  "new AEssence({}, new Error())",
  "new AEssence('thisIsNotAnObject')"
)

class BreadCrumbs extends AEssence {
  static sep = GLOBAL_BREADCRUMBS_SEPARATOR // " \u00BB "
  #name
  #parent
  #literal
  /**
   *
   * Returns literal given in BreadCrumbs constructor, __SPEC property removed.
   * @returns {Object}
   */
  get literal() {
    return this.#literal
  }
  /**
   * Returns parent given in BreadCrumbs constructor
   * @type (Undefined|BreadCrumbs)
   */
  get parent() {
    return this.#parent
  }
  /**
   * Returns key given in BreadCrumbs constructor
   * @type {String}
   */
  get name() {
    return this.#name
  }
  /**
   * Returns root of the BreadCrumbs tree
   * @type {BreadCrumbs}
   */
  get root() {
    return this.ROOT ? this : this.parent.root
  }

  /**
   * @classdesc 
   * Parsing tree superclass.
   * @mermaid
   *  classDiagram
   *      GenePool <|-- Essence
   *      Essence <|-- AEssence
   *      AEssence <|-- Breadcrumbs
   * @extends AEssence
   * @constructor
   * @description
   * Creates new BreadCrumbs instance.
   * <p>
   * Adds {@link BreadCrumbs}
   * to its pool as Gene with {@link GeneCallback|callback} {@link cbkInstanceOf}.<br>
   * Adds <code>undefined</code>, <code>boolean</code>, <code>number</code>,
   * <code>bigint</code>, <code>string</code>, <code>symbol</code>
   * and <code>function</code> to this pool with
   * {@link GeneCallback|callback} {@link cbkTypeOf}.<br>
   * Adds <code>date</code> to this pool with
   * {@link GeneCallback|callback} {@link cbkIsDate}.<br>
   * Adds <code>object</code> with {@link GeneCallback|callback} {@link cbkIsObjectNotNullNotArray},
   * <code>null</code> with {@link GeneCallback|callback} {@link cbkIsNull}
   * and <code>array</code> with {@link GeneCallback|callback} {@link cbkIsArray}
   * to this pool.
   * @param {(Undefined|Object)} literal
   * @param {(String|Symbol)} name
   * @param {(Undefined|BreadCrumbs)} parent
   */
  constructor(literal, name, parent) {
    super(
      literal,
      parent,
      typeof name == "symbol" ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++ : name
    )
    this.addGene(BreadCrumbs)
    this.addGene("undefined", cbkTypeOf)
    this.addGene("null", cbkIsNull)
    this.addGene("boolean", cbkTypeOf)
    this.addGene("number", cbkTypeOf)
    this.addGene("bigint", cbkTypeOf)
    this.addGene("string", cbkTypeOf)
    this.addGene("symbol", cbkTypeOf)
    this.addGene("function", cbkTypeOf)
    this.addGene("date", cbkIsDate)
    this.addGene("object", cbkIsObjectNotNullNotArray)
    this.addGene("array", cbkIsArray)
    if (!this.isA(parent, "undefined"))
      this.throwIfNotOfType(parent, "parent", BreadCrumbs)
    this.#parent = parent
    this.throwIfUndefined(name, "name")
    this.throwIfNotOfType(name, "name", "(string|symbol)")
    if (typeof name === "symbol")
      this.#name = "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
    this.#name = name
    if (!this.isA(literal, "undefined"))
      this.throwIfNotOfType(literal, "literal", "object")
    this.#literal = literal
    if (this.skipped.length) {
      //prettier-ignore
      let str = `Breadcrumbs: ${this.toBreadcrumbs()}
Not all specification values had been correct. Wrong values 
are skipped and parents setting or hardcoded default is used.
Skipped values are: `
      this.skipped.forEach((skip) => {
        str += "\nName: " + skip.name
        str += ", value: " + skip.value
        str += ", expected type: " + skip.expectedType
      })
      console.log(str)
    }
  }

  /**
   * Returns string representing class instance for BreadCrumbs and derived instances .
   * @returns {String} string containing class name of deepest subclass and key
   *          as given in BreadCrumbs constructor.
   */
  toString() {
    if (typeof this.#name === "string")
      return "°°°" + this.constructor.name + " " + this.#name
    else if (typeof this.#name === "symbol")
      return (
        "°°°" +
        this.constructor.name +
        " " +
        "_Symbol_" +
        GLOBAL_SYMBOL_COUNTER++
      )
  }

  /**
   * Returns line of ancestors with keys given in BreadCrumbs constructor.
   *
   * For this instance and its ancestors keys are returned, separated by
   * {@link BreadCrumbs.sep}.
   * @returns {String}
   */
  toBreadcrumbs() {
    let breadcrumbs = ""
    let sep = ""
    if (!this.isA(this.#parent, "undefined")) {
      if (this.isA(this.#parent, BreadCrumbs))
        breadcrumbs += this.#parent.toBreadcrumbs()
      else breadcrumbs += "(" + this.#parent + ")"
      sep = BreadCrumbs.sep
    }
    breadcrumbs += sep + this.#name
    return breadcrumbs
  }

  /**
   * Throws if {@link val} is strictly undefined (null is defined).
   *<p>
   * Does not throw on parameter type errors.
   * @param {*} val
   * @param {String} vName - becomes part of Error message
   * @param {String} fuName - becomes part of Error message
   * @param {String} msg - becomes part of Error message
   * @param {String} usrMsg - becomes part of Error message
   * @throws {SettingError}
   */
  throwIfUndefined(
    val,
    vName,
    fuName = "constructor",
    msg = "is undefined",
    usrMsg = ""
  ) {
    if (typeof vName != "string") vName = ""
    if (typeof fuName != "string") fuName = ""
    if (typeof msg != "string") msg = "is undefined"
    if (typeof usrMsg != "string") usrMsg = ""
    if (this.isA(val, "undefined"))
      throw new SettingError(
        `${this.constructor.name}.${fuName}`,
        usrMsg,
        `Path: ${this.toBreadcrumbs()}${NL}'${vName}' ${msg}`
      )
  }

  /**
   * Throws if val is not of type or compound type, if type is defined with string.
   * <p>
   * Does not throw on parameters type errors.
   * @param {*} val
   * @param {String} vName
   * @param {String} type - compound type string possible for types defined
   *                        using strings
   * @param {String} [fuName="constructor"] - becomes part of Error message
   * @param {String} [msg="is not of type"] - becomes part of Error message
   * @param {String} [usrMsg=""] - becomes part of Error message
   * @throws {SettingError}
   */
  throwIfNotOfType(
    val,
    vName,
    type,
    fuName = "constructor",
    msg = "is not of type",
    usrMsg = ""
  ) {
    let typeStr = this.isA(type, Object) ? type.toString().split(" ")[1] : type
    if (typeof vName != "string") vName = ""
    if (typeof fuName != "string") fuName = ""
    if (typeof msg != "string") msg = " is not of type"
    if (typeof usrMsg != "string") usrMsg = ""
    if (!this.isA(val, type))
      throw new SettingError(
        `${this.constructor.name}.${fuName}`,
        usrMsg,
        `Path: ${this.toBreadcrumbs()}${NL}'${vName}' '${val}' ${msg} '${typeStr}'`
      )
  }

  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("BreadCrumbs", outputObj)) {
      _.run(getterLiteralTest)
      _.run(getterParentTest)
      _.run(getterNameTest)
      _.run(getterRootTest)
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.run(toBreadCrumbsTest)
      _.run(throwIfUndefinedTest)
      _.run(throwIfNotOfTypeTest)
      _.destruct()
      _ = null
    }
    function getterLiteralTest() {
      let breadcrumbs0 = new BreadCrumbs({}, "my name1")
      let breadcrumbs1 = new BreadCrumbs({"key1": 87673}, "my name2")
      _.bassert(1,breadcrumbs1.literal.key1 === 87673, "does not return literal given on construction ")
      _.bassert(2,breadcrumbs0.literal != undefined, "empty literal given should be defined")
    }
    function getterParentTest() {
      let un
      let bc0 = new BreadCrumbs(un, "GodMother")
      let bc1 = new BreadCrumbs(un, "Granny",bc0)
      let bc2 = new BreadCrumbs(un, "Mummy",bc1)
      let bc3 = new BreadCrumbs(un, "Youngster",bc2)
      _.bassert(0,undefined == bc0.parent,"is root")
      _.bassert(1,bc1.parent == bc0,"has bc0 as parent")
      _.bassert(2,bc2.parent == bc1,"has bc1 as parent")
      _.bassert(3,bc3.parent == bc2,"has bc2 as parent")
    }
    function getterNameTest() {
      let un
      let bc0 = new BreadCrumbs(un, "GodMother")
      let bc1 = new BreadCrumbs(un, "Granny",bc0)
      let bc2 = new BreadCrumbs(un, "Mummy",bc1)
      let bc3 = new BreadCrumbs(un, "Youngster",bc2)
      _.bassert(0,bc0.name == "GodMother","name is 'GodMother'")
      _.bassert(1,bc1.name == "Granny","name is 'Granny'")
      _.bassert(2,bc2.name == "Mummy","name is 'Mummy'")
      _.bassert(3,bc3.name == "Youngster","name is 'Youngster'")
      _.bassert(4,bc3.parent.name == "Mummy", "parents name is 'Mummy'")
      _.bassert(4,bc3.parent.parent.name == "Granny", "grandparents name is 'Granny'")
      _.bassert(4,bc3.parent.parent.parent.name == "GodMother", "first ancestors name is 'GodMother'")
    }
    function getterRootTest() {
      let un
      let bc0 = new BreadCrumbs(un, "GodMother")
      let bc1 = new BreadCrumbs(un, "Granny",bc0)
      let bc2 = new BreadCrumbs(un, "Mummy",bc1)
      let bc3 = new BreadCrumbs(un, "Youngster",bc2)
      _.bassert(1,bc0.root == bc0,"root is bc0")
      _.bassert(2,bc1.root == bc0,"root is bc0")
      _.bassert(3,bc2.root == bc0,"root is bc0")
      _.bassert(4,bc3.root == bc0,"root is bc0")
      _.bassert(5,bc3.root.parent == undefined, "root has no parent")
      _.bassert(6,bc3.root.name == "GodMother", "roots name is 'GodMother'")
    }
    function constructorTest() {
      let un
      _.assert(1,_tryConstruct,un,"BreadCrumbs:myName1",un, "undefined for literal, string for name, undefined for parent should construct")
      _.assert(2,_tryConstruct,{},"BreadCrumbs:myName2",un, "empty object for literal should construct")
      _.shouldAssert(3,_tryConstruct,2,"BreadCrumbs:myName3",un, "number for literal should not construct")
      _.shouldAssert(4,_tryConstruct,null,"BreadCrumbs:myName4",un, "null for literal should not construct")
      _.assert(5,_tryConstruct,new Error(),"BreadCrumbs:myName5",un, "any class for literal should construct")
      _.shouldAssert(6,_tryConstruct,["a","b"],"BreadCrumbs:myName6",un, "array for literal should not construct")
      _.shouldAssert(7,_tryConstruct,Symbol(),"BreadCrumbs:myName7",un, "symbol for literal should not construct")
  
      _.assert(8,_tryConstruct,un,Symbol(),un, "symbol for key should construct")
      _.shouldAssert(9,_tryConstruct,{},un,un,"key has to be defined")
      _.shouldAssert(10,_tryConstruct,{},2,un,"key can not be a number")
      _.shouldAssert(11,_tryConstruct,{},null,un,"key may not be 'null'")
      _.shouldAssert(12,_tryConstruct,{},{},un,"key may not be an object")
      _.shouldAssert(13,_tryConstruct,{},new Error(),un,"key may not be 'Error' instance")
      _.shouldAssert(14,_tryConstruct,{},["a","b"],un,"key may not be an array")
  
      let breadcrumbs = new BreadCrumbs(un,"myName8")
      let parent = new BreadCrumbs({},"myName9")
      _.assert(15,_tryConstruct,un,"BreadCrumbs:myName10",breadcrumbs,"BreadCrumbs with no literal for parent should construct")
      _.assert(16,_tryConstruct,un,"BreadCrumbs:myName11",parent, "BreadCrumbs with literal for parent should construct")
      _.shouldAssert(17,_tryConstruct,un,"BreadCrumbs:myName12",null,"parent may not be 'null'")
      _.shouldAssert(18,_tryConstruct,un,"BreadCrumbs:myName13",new Error(),"parent may not be 'Error' instance")
      _.shouldAssert(19,_tryConstruct,un,"BreadCrumbs:myName14",{},"parent may not be a plain js object")
      _.shouldAssert(20,_tryConstruct,un,"BreadCrumbs:myName15",2,"parent may not be a number")
      _.shouldAssert(21,_tryConstruct,un,"BreadCrumbs:myName16",["a","b"],"parent may not be an array")
      _.shouldAssert(22,_tryConstruct,un,"BreadCrumbs:myName17",Symbol(),"parent may not be a symbol")
  
      _.bassert(101,breadcrumbs instanceof Object,"'BreadCrumbs' has to be an instance of 'Object'")
      _.bassert(102,breadcrumbs instanceof BreadCrumbs,"'BreadCrumbs' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,breadcrumbs.constructor === BreadCrumbs,"the constructor property is not 'BreadCrumbs'")
    }
    function isATest() {
      // Object, Gene, GenePool, AEssence added for each AEssence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      let un
      let bc = new BreadCrumbs(un, "BreadCrumbs:NameIsATest")
      _.bassert(1,bc.isA(new BreadCrumbs(un, "BreadCrumbs:NameIsATest"),BreadCrumbs),"BreadCrumbs instance should be a BreadCrumbs")
      _.bassert(2,!bc.isA(new Error(),BreadCrumbs),"Error instance should not be a BreadCrumbs")
      _.bassert(3,!bc.isA("BreadCrumbs",BreadCrumbs),"String should not be a BreadCrumbs")
      _.bassert(4,!bc.isA(22,BreadCrumbs),"number should not be a BreadCrumbs")

      _.bassert(11,bc.isA(un,"undefined"),"should be registered and succeed")
      _.bassert(12,bc.isA(null,"null"),"should be registered and succeed")
      _.bassert(13,bc.isA(false,"boolean"),"should be registered and succeed")
      _.bassert(14,bc.isA(12,"number"),"should be registered and succeed")
      _.bassert(15,bc.isA(12n,"bigint"),"should be registered and succeed")
      _.bassert(16,bc.isA("good","string"),"should be registered and succeed")
      _.bassert(17,bc.isA(Symbol(),"symbol"),"should be registered and succeed")
      _.bassert(18,bc.isA(cbkTypeOf,"function"),"should be registered and succeed")
      _.bassert(19,bc.isA({},"object"),"should be registered and succeed")
      _.bassert(20,bc.isA([],"array"),"should be registered and succeed")
      _.bassert(21,bc.isA("abc","date"),"should be registered and succeed")

      _.bassert(31,!bc.isA(null,"undefined"),"should be registered and fail")
      _.bassert(32,!bc.isA(undefined,"null"),"should be registered and fail")
      _.bassert(33,!bc.isA(null,"boolean"),"should be registered and fail")
      _.bassert(34,!bc.isA(12n,"number"),"should be registered and fail")
      _.bassert(35,!bc.isA(12,"bigint"),"should be registered and fail")
      _.bassert(36,!bc.isA(String,"string"),"should be registered and fail")
      _.bassert(37,!bc.isA({},"symbol"),"should be registered and fail")
      _.bassert(38,!bc.isA({},"function"),"should be registered and fail")
      _.bassert(39,!bc.isA([],"object"),"should be registered and fail")
      _.bassert(40,!bc.isA({},"array"),"should be registered and fail")
      _.bassert(41,!bc.isA({},"date"),"should be registered and fail")
      _.bassert(42,!bc.isA(null,"object"),"should be registered and fail")

      _.bassert(51,bc.isA(new BreadCrumbs(un, "BreadCrumbs:NameIsATest"),BreadCrumbs),"BreadCrumbs instance should be a BreadCrumbs")
      _.bassert(52,bc.isA(new BreadCrumbs(un, "BreadCrumbs:NameIsATest"),AEssence),"BreadCrumbs instance should be a AEssence")
      _.bassert(53,bc.isA(new BreadCrumbs(un, "BreadCrumbs:NameIsATest"),Essence),"BreadCrumbs instance should be a Essence")
      _.bassert(54,bc.isA(new BreadCrumbs(un, "BreadCrumbs:NameIsATest"),GenePool),"BreadCrumbs instance should be a GenePool")
      _.bassert(55,bc.isA(new BreadCrumbs(un, "BreadCrumbs:NameIsATest"),Object),"BreadCrumbs instance should be a Object")

    }
    function toStringTest() {
      let str = new BreadCrumbs(undefined, "BrRrEadCrumbs:my name11").toString()
      _.bassert(1,str.includes("BrRrEadCrumbs:my name11"),"result does not contain name given on construction")
      _.bassert(2,str.includes("BreadCrumbs"),"result does not contain class name")
      str = new BreadCrumbs({},"BreaDCrumbs:myName20").toString()
      _.bassert(3,str.includes("BreaDCrumbs:myName20"),"result does not contain name given on construction")
      _.bassert(4,str.includes("BreadCrumbs"),"result does not contain class name")
    }
    function toBreadCrumbsTest() {
      let sep = BreadCrumbs.sep
      let parent = new BreadCrumbs(undefined, "BreadCrumbs:parent1")
      let child = new BreadCrumbs(undefined, "BreadCrumbs:child1", parent)
      let grandChild = new BreadCrumbs(undefined, "BreadCrumbs:grandChild1", child)
      let parentStr = parent.toBreadcrumbs()
      let childStr = child.toBreadcrumbs()
      let grandChildStr = grandChild.toBreadcrumbs()
      _.bassert(1,parentStr === "BreadCrumbs:parent1","breadCrumbs '" + parentStr + "' are wrong")
      _.bassert(2,childStr === "BreadCrumbs:parent1"+ sep +"BreadCrumbs:child1","BreadCrumbs:breadCrumbs '" + childStr + "' are wrong")
      _.bassert(3,grandChildStr === "BreadCrumbs:parent1"+sep+"BreadCrumbs:child1"+sep+"BreadCrumbs:grandChild1","breadCrumbs '" + grandChildStr + "' are wrong")
    }
    function throwIfUndefinedTest() {
      let un
      let vName
      _.assert(1,_tryThrowIfUndefined,22,un,un,un,"should accept all types for all parameter")
      _.shouldAssert(2, _tryThrowIfUndefined,vName, "vName", "test",un,"Should throw as 'vName' is undefined")
      _.assert(3,_tryThrowIfUndefined,null,un,un,un,"should not throw for null")
    }
    function throwIfNotOfTypeTest() {
      let un
      let str = "String"
      let bc = new BreadCrumbs({},"BreadCrumbs:testThrowNotOfType")
      _.assert      (1,_tryThrowIfNotOfType,bc,22 ,"vName","number",un,un,un,"should accept all types for all parameter, besides 2nd")
      _.shouldAssert(2,_tryThrowIfNotOfType,bc,22 ,"vName",un,un, un,un,"should throw for 22 and no type given")
      _.shouldAssert(3,_tryThrowIfNotOfType,bc,str,"vName", "String", "test",un,un,"should throw as 'String' is no valid type to check against")
      _.assert      (4,_tryThrowIfNotOfType,bc,str,"vName", "(String|string)", "test",un,un,"should not throw as 'string' is correct type and is contained in 2nd parameter")
    }
    function _tryConstruct(arg1, arg2,arg3) {
      new BreadCrumbs(arg1,arg2,arg3)
    }
    function _tryThrowIfUndefined(arg1, arg2, arg3, arg4) {
      let breadCrumbs = new BreadCrumbs({},"BreadCrumbs:key")
      breadCrumbs.throwIfUndefined(arg1, arg2, arg3, arg4)
    }
    function _tryThrowIfNotOfType(bc,arg1, arg2, arg3, arg4,arg5,arg6) {
      bc.throwIfNotOfType(arg1, arg2, arg3, arg4,arg5,arg6)
    }
  }
}
registeredTests.push(BreadCrumbs.test)
registeredExceptions.push(
  "new BreadCrumbs({},'goodName', new GenePool())",
  "new BreadCrumbs({}, undefined, undefined)",
  "new BreadCrumbs({}, 22, undefined)",
  "new BreadCrumbs(22,'goodName', undefined)"
)

class Setting extends BreadCrumbs {
  static #ROOT_KEY = GLOBAL_ROOT_KEY //  "/"
  static #globalType = GLOBAL_SETTING_TYPE //  "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>)"
  #workersTypeForChildren
  static #workers = {} // and managers
  #works = {}
  #children = {}
  #tp
  /**
   * Workers registers by setting themselves <code>Setting.worker = WorkerClass</code>
   * @type {Object.<string, Setting>}
   * @param {Setting} workerClass
   */
  static set worker(workerClass) {
    Setting.#workers[workerClass.workerKey] = workerClass
  }
  /**
   * Returns workersTypeForChildren 
   * @type (Undefined|Setting)
   */
  get workersTypeForChildren() {
    return this.#workersTypeForChildren
  }
  /**
   * Type to be used for workers children construction
   * @param {String} type
   * @type {String}
   */
  set workersTypeForChildren(type) {
    this.#workersTypeForChildren = type
  }
  /**
   * Returns children 
   * @type Object
   */
  get children() {
    return this.#children
  }
  /**
   * Templater Object
   * @type Object
   */
  get tp() {
    return this.ROOT ? this.#tp : this.parent.tp
  }

  /**
   * @classdesc setting parser; traverses deep literal to flat output
   * <p>
   * Setting is the only subclass which should be constructed from outside, with
   * only literal given as argument.
   * <p>
   * It calls the workers and traverses given literal to flat output; thereby
   * respecting worker configuration rules and removing worker literals from
   * output.
   * <p>
   * <b>Workflow and requisites</b><br>
   * BreadCrumbs:<br>
   * - Adds undefined, boolean, number, bigint, string, symbol and function
   * to this pool with callback cbkTypeOf.<br>
   * - Adds date to this pool with callback cbkIsDate.<br>
   * - Adds object with callback cbkIsObjectNotNullNotArray,
   * null with callback cbkIsNull and
   * array with callback cbkIsNull to this pool.
   *<p>
   * AEssence:<br>
   * - Adds "String", "Number", "Boolean", "Function" and "Object" to user pool
   *   as Genes with callback cbkTypeOfLc.<br>
   * - Adds "Date" to user pool as Genes with callback cbkIsDate.
   *<p>
   * Setting:<br>
   *  #globalType =
   * "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>)"
   *<p>
   * <i>In German, id do not understand it in English. I suppose, other people
   * would not understand it in my English, so not translated. </i>
   * <p>
   * AEssence:<br>
   * Für Nodes: (bedeutet: der Wert von __SPEC ist nicht Boolean)<br>
   *     Vergleicht den Typ des Wertes des SPEC_Eintrags im __SPEC Node mit
   *     einem hardcoded Typ ("String", "Boolean" oder "Object" werden zur
   *     Zeit verwendet) oder, für DEFAULT und VALUE, dem Typ der in TYPE
   *     gegeben wird. Für den Vergleich benutzt er den user pool.<br>
   *     Wenn der Typ nicht stimmt, verwirft er den Wert und verwendet den
   *     Wert der Parent AEssence, falls der SPEC_Eintrag inherited ist und
   *     eine Parent AEssence existiert, sonst den hardcoded Default Wert.<br>
   *     - Löscht alle SPEC_Einträge aus __SPEC Node.<br>
   *     - Löscht den Eintrag __SPEC aus dem ParentNode<br>
   *     - erzeugt für jeden SPEC_Eintrag (auch nicht angegebene) einen Wert
   *       in der eigenen Instanz<br>
   *     - für jeden SPEC_Eintrag (auch nicht angegebene) eine hidden
   *       Property ans Node Literal<br>
   * Für Atoms: (bedeutet: der Wert von __SPEC ist Boolean)<br>
   *     Verwendet den ParentNode (den Node, der __SPEC enthält) als __SPEC
   *     Node.<br>
   *     Sets FLAT to true
   *<p>
   * Setting:<br>
   * Für Nodes: (bedeutet: der Wert von __SPEC ist nicht Boolean)<br>
   *    Wie AEssence für Nodes.<br>
   * Für Atoms:<br>
   *    Für spezifizierte Atoms: (bedeutet: Der Wert ist ein Object und es
   *                              enthält einen __SPEC Eintrag und
   *                              dessen Wert ist vom Typ Boolean)<br>
   *       Falls __SPEC true ist: <br>TYPE wird auf #globalType gesetzt
   *                              (außer er ist parallel zu __SPEC gesetzt)<br>
   *       Falls __SPEC false ist: <br>TYPE wird nicht gesetzt<br>
   *                               hat damit den DEFAULT Wert<br>
   *                              (außer er ist parallel zu __SPEC gesetzt)<br>
   *    Für reine Atoms: (bedeutet: der Wert ist kein Object)<br>
   *       erzeugt ein spezifiziertes Atom mit VALUE: Wert und __SPEC true
   *       (damit wird TYPE zu #globalType)
   *<p>
   *    Dann wie AEssence für Atoms.<br>
   *    Danach wird VALUE aus der erzeugten AEssence zum Wert des Atoms.<br>
   * @mermaid
   *  classDiagram
   *      GenePool <|-- Essence
   *      Essence <|-- BreadCrumbs
   *      AEssence <|-- BreadCrumbs
   *      BreadCrumbs <|-- Setting
   * @extends BreadCrumbs
   * @constructor
   * @description
   * Constructs a new Setting instance.
   * Adds {@link Setting}
   * to its pool as Gene with {@link GeneCallback|callback} {@link cbkInstanceOf}.
   * <p>
   * Recurses into {@link Object} entries and creates {@link Setting} instances
   * for them with <code>this</code> instance as parent and entry key as {@link key}.
   * <p>
   * Creates {@link AEssence} instances for all other entries.
   * <p>
   * If {@link tp} is not correctly set for root frontmatter callbacks using
   * templater will throw. If no such callbacks are used, there is no problem.
   * <p>
   * Throws on wrong parameter types, but not on wrong {@link tp}
   * @param {Object} literal
   * @param {(Undefined|String|Symbol)} key - if undefined, becomes root key
   * @param {(Undefined|Setting)} parent
   * @param {(Undefined|Object)} tp - templater object
   * @param {Boolean} add2parent - internal
   * @throws {SettingError}
   */
  constructor(
    literal,
    key = undefined,
    parent = undefined,
    templater = undefined,
    add2parent = false
  ) {
    if (LOG_ESSENCE_CONSTRUCTOR_2_CONSOLE) {
      let name_x =
        key === undefined
          ? "undefined"
          : typeof key == "symbol"
          ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
          : key
      let literal_x =
        literal === undefined
          ? "undefined"
          : literal === null
          ? "Null"
          : false
          ? JSON.stringify(literal, null, 4)
          : flatten(literal)
      let specLit_x =
        literal != undefined ? flatten(literal["__SPEC"]) : "undefined"
      if (parent == undefined)
        aut(
          `========================================================================================`,
          lime
        )
      aut(
        `========================================================================================`,
        lime
      )
      aut(
        `START Setting =========  ${name_x}  =========\n   SPEC: ${specLit_x}\n   Literal :${literal_x}`,
        lime
      )
    }
    super(literal, key === undefined ? Setting.#ROOT_KEY : key, parent)
    this.addGene(Setting)
    this.throwIfUndefined(literal, "literal")
    // literal {(Undefined|Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|BreadCrumbs)} checked by superclass
    if (!this.isA(parent, "undefined"))
      this.throwIfNotOfType(parent, "parent", Setting)
    this.#tp = this.ROOT ? templater : undefined
    if (!this.ROOT)
      this.#workersTypeForChildren = this.parent.workersTypeForChildren
    if (add2parent && !this.ROOT) this.parent.children[key] = this

    this.#parse()
    if (LOG_ESSENCE_CONSTRUCTOR_2_CONSOLE) {
      let name_x =
        this.name === undefined
          ? "undefined"
          : typeof this.name == "symbol"
          ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
          : this.name
      let literal_x =
        this.literal === undefined
          ? "undefined"
          : this.literal === null
          ? "Null"
          : false
          ? JSON.stringify(this.literal, null, 4)
          : flatten(this.literal)
      let specLit_x =
        this.literal != undefined
          ? flatten(this.literal["__SPEC"])
          : "undefined"
      aut(
        `   SPEC: ${specLit_x}\n   Literal :${literal_x}\nENDE Setting =====\
====  ${name_x}  =============================================================`,
        lime
      )
    }
  }
  #parse() {
    let un
    let type =
      !this.ROOT && this.parent.workersTypeForChildren !== undefined
        ? this.parent.workersTypeForChildren
        : Setting.#globalType
    for (const [childkey, childval] of Object.entries(this.literal)) {
      if (!AEssence.doParse(childval)) continue
      if (Setting.#isWorkerKey(childkey)) {
        // constructs a workers instance
        this.#works[childkey] = 
                        new Setting.#workers[childkey](childval, childkey, this)
      } else if (this.isA(childval, "object")) {
        let aEss = this.#essenceOfAtom(this.literal, childkey, type)
        if (aEss != un) this.#children[childkey] = aEss
        else this.#children[childkey] = new Setting(childval, childkey, this)
      } else {
        let litAtom = {VALUE: this.literal[childkey], __SPEC: true}
        this.literal[childkey] = litAtom
        this.#children[childkey] = 
                               this.#essenceOfAtom(this.literal, childkey, type)
      }
    }
  }

  /**
   * Returns {@link AEssence} for <code>atomic literal</code>,
   * <code>undefined</code> for <code>node literal</code>
   * <p>
   * If value of {@link this.#SPEC_KEY|__SPEC} property
   * of {@link literal}[{@link key}] is
   * <code>undefined</code> or an {@link Object}
   * {@link literal} is <code>node literal</code>,
   * in any other case it is <code>atomic literal</code>
   * <p>
   * For atomic literals:<br>
   * If value of {@link this.#SPEC_KEY|__SPEC} is true,
   * {@link AEssence#TYPE|TYPE} property with value  {@link type}
   * is added to {@link literal}[{@link key}]. This only if {@link type}
   * is a <code>String</code>. Nothing is added in any other case.<br>
   * A new {@link AEssence} from (possibly changed, see above){@link literal}[{@link key}]
   * is created with <code>this</code> instance as parent.<br>
   * Value of {@link literal}[{@link key}] becomes {@link AEssence#VALUE|VALUE} of
   * this newly created instance.
   * <p>
   * Returns <code>undefined</code> on wrong parameter types
   * <p><b>Simply said:</b> Changes value of {@link literal}[{@link key}]
   * to given {@link AEssence#VALUE|VALUE}.
   * @param {Object} literal
   * @param {*} key
   * @param {String} type
   * @returns {(AEssence|Undefined)}
   */
  #essenceOfAtom(literal, key, type) {
    if (typeof literal != "object") return undefined
    let aEss = undefined
    let specLit = literal[key][AEssence.SPEC_KEY]
    if (typeof specLit == "boolean") {
      if (
        specLit == true &&
        typeof type == "string" &&
        literal[key]["TYPE"] == undefined
      )
        literal[key]["TYPE"] = type
      aEss = new AEssence(literal[key], this, key)
      literal[key] = aEss.VALUE
    }
    return aEss
  }

  /**
   * Iterator
   * @returns {AEssence}
   */
  iterator() {
    /* don't know how to js document  [Symbol.iterator] otherwise*/
  }

  [Symbol.iterator]() {
    let index = 0
    return {
      next: () => {
        let keys = Object.keys(this.#children)
        if (index < keys.length)
          return {
            value: [keys[index], this.#children[keys[index++]]],
            done: false,
          }
        else return {done: true}
      },
    }
  }

  /** Returns whether entry for {@link key} exists
   * @param {String} key 
   * @returns {Boolean} 
   */
  has(key) {
    if (typeof key == "string") {
      let subKeys = key.split(".")
      if (subKeys.length > 1) {
        if (this.#works[subKeys[0]] !== undefined)
          return this.#works[subKeys.shift()].has(subKeys.join("."))
        else if (this.#children[subKeys[0]] !== undefined &&
          this.isA(this.#children[subKeys[0]],Setting))
          return this.#children[subKeys.shift()].has(subKeys.join("."))
        else return false
      }
    } 
    if (this.#works[key]) return true
    else if (this.#children[key]) return true
    else return false
  }

  /** Returns entry for key
   * 
   * @param {(String|Symbol)} key
   * @returns {(AEssence|Setting)}
   */
  at(key) {
    if (typeof key == "string") {
      let subKeys = key.split(".")
      if (subKeys.length > 1) {
        if (this.#works[subKeys[0]] !== undefined)
          return this.#works[subKeys.shift()].at(subKeys.join("."))
        if (this.#children[subKeys[0]] !== undefined)
          return this.#children[subKeys.shift()].at(subKeys.join("."))
      }
    }
    if (this.#works[key]) return this.#works[key]
    else return this.#children[key]
  }

  /** Returns value from worker, if {@link key} is registered worker, else from 
   * this
   * 
   * @param {String} key - key can specify child keys by using points, 
   *                       e.g. "grandParentKey.parentKey.childKey"
   * @param  {...any} params - for worker's getValue
   * @returns {*}
   */
  getValue(key, ...params) {
    let works_and_subkeys = this.#getWorks(key)
    if (works_and_subkeys !== undefined) {
      if (params === undefined)
        return works_and_subkeys[0].getValue(works_and_subkeys[1])
      else
        return works_and_subkeys[0].getValue(works_and_subkeys[1], ...params)
    } else {
      if (this.at(key) !== undefined) 
        return this.at(key).VALUE
    }
  }

  #getWorks(key) {
    let answ
    if (typeof key == "string") {
      let subKeys = key.split(".")
      let workerKey = subKeys.length > 1 ? subKeys[0] : key
      if (this.#works[workerKey] !== undefined) {
        answ = []
        answ.push(this.#works[workerKey])
        subKeys.shift()
        answ.push(subKeys.join("."))
      }
    }
    return answ
  }

  /** Returns all frontmatter entries of this instance and descendants
   * besides IGNORED ones.
   * Workers are not treated as descendants. Otherwise entries
   * for all notetypes would be gathered if called from root.
   * @returns  {Object.<String.any>}
   */
  getFrontmatterYAML() {
    let frontmatterYAML = {}
    for (const [key, value] of this) {
      if (value.FLAT) {
        if (value.RENDER != undefined && !value.RENDER && !value.IGNORE) 
          frontmatterYAML[key] = value.VALUE
      } else {
        Object.assign(frontmatterYAML, value.getFrontmatterYAML())
      }
    }
    return frontmatterYAML
  }

  /** Returns all render entries of this instance and descendants
   * besides IGNORED ones.
   * Workers are not treated as descendants. Otherwise entries
   * for all notetypes would be gathered if called from root.
   * @returns  {Object.<String.any>}
   */
  getRenderYAML() {
    let renderYAML = {}
    for (const [key, value] of Object.entries(this.#children)) {
      if (value.FLAT) {
        if (value.RENDER && !value.IGNORE) renderYAML[key] = value.VALUE
      } else Object.assign(renderYAML, value.getRenderYAML())
    }
    return renderYAML
  }

  /** LOGS all key.VALUE pairs recursive to console
   * @param {Number} depth 
   */
  showVALUES(depth) {
    let indent = ""
    for(let d=depth;d>0;d--) indent += "    "
    for (const [key, value] of this) {
      vaut(indent+key, value.VALUE)
      if(value.isA(value, Setting))
        value.showVALUES(depth+1)
    }
  }

  /** LOGS all keys with their VALUE and DEFAULT token recursive to console.
   * Functions are shortenend to String "FUNCTION"
   * @param {Number} depth 
   */
  showVALUE_DEFAULT(depth) {
    let indent = ""
    for(let d=depth;d>0;d--) indent += "    "
    for (const [key, value] of Object.entries(this.#children)) {
      if(typeof value.VALUE == "function")
        vaut(indent+key+".VALUE", "FUNCTION")
      else if(typeof value.VALUE != "string" || value.VALUE.length > 0)
        vaut(indent+key+".VALUE", value.VALUE)
      if(typeof value.DEFAULT != "string" || value.DEFAULT.length > 0)
        vaut(indent+key+".DEFAULT", value.DEFAULT)
      if(typeof value.VALUE == "string" && value.VALUE.length == 0 &&
        typeof value.DEFAULT == "string" && value.DEFAULT.length == 0)
        vaut(indent+key+".DEFAULT|VALUE", "-----")
      if(value.isA(value, Setting)) {
        value.showVALUE_DEFAULT(depth+1)
      }
    }
  }

  /** LOGS all keys recursive to console with some of their tags.
   * Functions are shortenend to String "FUNCTION"
   * @param {Number} depth 
   */
  showWhatGoesOut(depth) {
    let indent = ""
    if(depth == 0)
      vaut("RENDER|IGNORE|REPEAT|FLAT", "KEY:VALUE:DEFAULT")
    for(let d=depth;d>0;d--) indent += "    "
    for (const [key, value] of this) {
      let render = value.RENDER + "|"
      let ignore = value.IGNORE + "|"
      let repeat = value.REPEAT + "|"
      let flat = value.FLAT
      let val = value.VALUE
      let def = value.DEFAULT
      if(typeof value.VALUE == "function") val="FUNCTION"
      if(typeof value.DEFAULT == "function") def="FUNCTION"
      vaut(indent+render+ignore+repeat+flat, key+":"+val+":"+def)
      if(value.isA(value, Setting))
        value.showWhatGoesOut(depth+1)
    }
  }


  /** Returns whether key is main key of known workers
   * @param {*} key
   * @returns {Boolean}
   */
  static #isWorkerKey(key) {
    return Setting.#workers[key] !== undefined
  }

  // prettier-ignore
  static test(outputObj) { // Setting
    let _ = null
    if(_ = new TestSuite("Setting", outputObj)) {
      _.run(getterLiteralTest)
      _.run(setterWorkersTest)
      _.run(setterWorkersTypeForChildrenTest)
      _.run(getterTpTest)
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.run(iteratorTest)
      _.run(hasTest)
      _.run(atTest)
      _.run(getValueTest)
      _.run(getFrontmatterYAMLTest)
      _.run(getRenderYAMLTest)
      _.run(atomsTest)
      _.run(deepLiteralTest)
      _.destruct()
    _ = null
    }
    function getterLiteralTest() {
      let un
      let sym = Symbol("a")
      let setting1 = new Setting({},"Setting:getterLiteralTest02",un)
      let setting2 = new Setting({sym: {}},"Setting:getterLiteralTest03",un)
      let setting3 = new Setting({"__NOTE_TYPES": {}},"Setting:getterLiteralTest04",un)
      let setting4 = new Setting({"a": {"MARKER":"2"}},"Setting:getterLiteralTest05",un)
      let setting5 = new Setting({"a": {"MARKER":"2","DATE":true,}},"Setting:getterLiteralTest06",un)
      let setting6 = new Setting({"a": {MARKER:"2",DATE:false,},"d": {TITLE_BEFORE_DATE:"abc"}},"Setting:getterLiteralTest07",un)
      let lit1 = setting1.literal
      let lit2 = setting2.literal
      let lit3 = setting3.literal
      let lit4 = setting4.literal
      let lit5 = setting5.literal
      let lit6 = setting6.literal
      _.bassert(1,Object.keys(lit1).length === 0,"literal should be empty as given")
      _.bassert(2,Object.keys(lit2).length === 1,"only 1 value should be contained, as only one given")
      _.bassert(3,Object.keys(lit2.sym).length === 0,"object assigned to symbol key should be empty as given")
      _.bassert(4,Object.keys(lit3).length === 1,"only 1 value should be contained, as only one given")
      _.bassert(5,Object.keys(lit3.__NOTE_TYPES).length === 0,"object assigned to '__NOTE_TYPES' key should be empty as given")
      _.bassert(6,Object.keys(lit4).length === 1,"only 1 value should be contained, as only one given")
      _.bassert(7,Object.keys(lit4.a).length === 1,"object assigned to 'a' should only contain one entry as only one given")
      _.bassert(8,lit4.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(9,Object.keys(lit5).length === 1,"only 1 value should be contained, as only one given")
      _.bassert(10,Object.keys(lit5.a).length === 2,"object assigned to 'a' should contain 2 entries as two given")
      _.bassert(11,lit5.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(12,lit5.a.DATE === true,"value of a.DATE should be 'true' as given")
      _.bassert(13,Object.keys(lit6).length === 2,"2 values should be contained, as two given")
      _.bassert(14,Object.keys(lit6.a).length === 2,"object assigned to 'a' should contain 2 entries as two given")
      _.bassert(15,Object.keys(lit6.d).length === 1,"object assigned to 'd' should only contain one entry as only one given")
      _.bassert(16,lit6.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(17,lit6.a.DATE === false,"value of a.DATE should be 'false' as given")
      _.bassert(18,lit6.d.TITLE_BEFORE_DATE === "abc","value of d.TITLE_BEFORE_DATE should be 'abc' as given")
    }
    function setterWorkersTest() {
      class testWorker extends Setting {
        static get workerKey() {
          return "__TEST"
        }
        constructor(literal, key, parent) {
          super(literal,key,parent)
          this.addGene(testWorker)
          delete literal["remove"]
        }          
      }
      let lit = {__TEST:{remove:"Not removed", stay:"Always there"}}
      Setting.worker = testWorker
      let set = new Setting(lit)
      _.bassert(1,lit["__TEST"]["remove"]==undefined,"Test worker removes it")
      _.bassert(2,lit["__TEST"]["stay"]=="Always there","Test worker leaves it")
    }
    function setterWorkersTypeForChildrenTest() {
      class testWorker extends Setting {
        static get workerKey() {
          return "__TEST"
        }
        constructor(literal, key, parent) {
          parent.workersTypeForChildren = "Boolean"
          super(literal,key,parent)
          this.addGene(testWorker)
        }          
      }
      let lit = {__TEST:{bool:true, str:"not allowed"}}
      Setting.worker = testWorker
      let set = new Setting(lit)
      _.bassert(1,set.at("__TEST").getValue("bool")==true,"Boolean is ok")
      _.bassert(2,set.at("__TEST").getValue("str")=="","String not allowed")
    }
    function getterTpTest() {
      let tp = "SHOULD BE TEMPLATER OBJECT"
      let set0 = new Setting({},undefined,undefined,tp)
      let set1 = new Setting({}, "Granny",set0,"another tp")
      let set2 = new Setting({}, "Mummy",set1, "and another one")
      let set3 = new Setting({}, "Youngster",set2, "this will be ignored too")
      _.bassert(1,set0.tp == tp, "tp is always of root")
      _.bassert(2,set1.tp == tp, "tp is always of root")
      _.bassert(3,set2.tp == tp, "tp is always of root")
      _.bassert(4,set2.tp == tp, "tp is always of root")

    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "Setting:constructorTest", un)
      let st = new Setting({}, "Setting:constructorTest1", un)
      _.assert(1,_tryConstruct,{},"Setting:cTest1",un,"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"Setting:cTest2",un,"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"Setting:cTest3",un,"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","Setting:cTest4",un,"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"Setting:cTest5",un,"should not be created, literal is null")
      _.assert(6,_tryConstruct,{},un,un,"should be created, undefined key is ok")
      _.shouldAssert(7,_tryConstruct,{},22,un,"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},un,"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,un,"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),un,"should be created, key is Symbol")
      _.assert(11,_tryConstruct,{},"Setting:cTest11",un,"should  be created, undefined parent is ok")
      _.shouldAssert(12,_tryConstruct,{},"Setting:cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"Setting:cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"Setting:cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"Setting:cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"Setting:cTest16",null,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"Setting:cTest16",b,"should not be be created, parent is BreadCrumbs")
      let setting = new Setting({},"Setting:constructorTest101")
      _.bassert(101,setting instanceof Object,"'Setting' has to be an instance of 'Object'")
      _.bassert(102,setting instanceof BreadCrumbs,"'Setting' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,setting instanceof Setting,"'Setting' has to be an instance of 'Setting'")
      _.bassert(104,setting.constructor === Setting,"the constructor property is not 'Setting'")
    }
    function isATest() {
      // Object, Gene, GenePool, AEssence added for each AEssence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      // Setting added for each Setting instance
      let un
      let setting1 = new Setting({},"Setting:NameIsATest",un)
      _.bassert(1,setting1.isA(setting1,"object"), "'" + setting1 + "' should be a " + "object")
      _.bassert(2,setting1.isA(setting1,Object), "'" + setting1 + "' should be a " + "Object")
      _.bassert(3,setting1.isA(setting1,GenePool), "'" + setting1 + "' should be a " + "GenePool")
      _.bassert(4,setting1.isA(setting1,Essence), "'" + setting1 + "' should be a " + "Essence")
      _.bassert(5,setting1.isA(setting1,AEssence), "'" + setting1 + "' should be a " + "AEssence")
      _.bassert(6,setting1.isA(setting1,BreadCrumbs), "'" + setting1 + "' should be a " + "BreadCrumbs")
      _.bassert(7,setting1.isA(setting1,Setting), "'" + setting1 + "' should be a " + "Setting")
      _.bassert(8,!setting1.isA(setting1,Error), "'" + setting1 + "' should not be a " + "Error")
      _.bassert(9,!setting1.isA(setting1,Gene), "'" + setting1 + "' should not be a " + "Gene")
    }
    function toStringTest() {
      let un
      let setting1 = new Setting({},"SetTing:toStringTest1",un)
      _.bassert(1,setting1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,setting1.toString().includes("Setting"),"result does not contain class string"    )
    }
    function iteratorTest() {
      /**********************************************************************/{
      let lit = {a:"A",b:2,c:true,d:{da:"A", db:2, dc:true} }
      let set = new Setting(lit)
      let keyStr = ""
      let valStr = ""
      let expKeyStr = "abcd"
      let expValStr = "A2true"
      for (const [key, value] of set) {
        keyStr+=key
        valStr+=value.VALUE
      }
      _.bassert(1,keyStr == expKeyStr,"all keys should be contained")
      _.bassert(2,valStr == expValStr,"all value.VALUEs should be contained")
      keyStr = ""
      valStr = ""
      let expKeyStr2 = "ab"
      let expValStr2 = "A2"
      for (const [key, value] of set) {
        keyStr+=key
        valStr+=value.VALUE
        if(key == "b") break
      }
      _.bassert(11,keyStr == expKeyStr2,"first 2 keys should be contained")
      _.bassert(12,valStr == expValStr2,"first 2 value.VALUEs should be contained")
      keyStr = ""
      valStr = ""
      for (const [key, value] of set) {
        keyStr+=key
        valStr+=value.VALUE
      }
      _.bassert(21,keyStr == expKeyStr,"all keys should be contained")
      _.bassert(22,valStr == expValStr,"all value.VALUEs should be contained")
      }/**********************************************************************/{        
      let lit = {a:"A",b:2,c:true,d:{da:"A", db:2, dc:true},e:"ja" }
      let set = new Setting(lit)
      let keyStr = ""
      let valStr = ""
      let expKeyStr = "a b c d da db dc e "
      let expValStr = "A 2 true A 2 true ja "
      for (const [key, value] of set) {
        keyStr+=key + " "
        if(value.FLAT)
          valStr+=value.VALUE + " "
        else 
        for (const [k, v] of value) {
          keyStr+=k + " "
          valStr+=v.VALUE + " "
        }
      }
      _.bassert(31,keyStr == expKeyStr,"Should contain all keys")
      _.bassert(32,valStr == expValStr, "Should contain all values")

      keyStr = ""
      valStr = ""
      let expKeyStr2 = "a b c d da db e "
      let expValStr2 = "A 2 true A 2 ja "
      for (const [key, value] of set) {
        keyStr+=key + " "
        if(value.FLAT)
          valStr+=value.VALUE + " "
        else 
        for (const [k, v] of value) {
          keyStr+=k + " "
          valStr+=v.VALUE + " "
          if(k == "db") break
        }
      }
      _.bassert(41,keyStr == expKeyStr2,"Should contain all keys except the last of 'd'")
      _.bassert(42,valStr == expValStr2, "Should contain all values except the last of 'd'")

      keyStr = ""
      valStr = ""
      for (const [key, value] of set) {
        keyStr+=key + " "
        if(value.FLAT)
          valStr+=value.VALUE + " "
        else 
        for (const [k, v] of value) {
          keyStr+=k + " "
          valStr+=v.VALUE + " "
        }
      }
      _.bassert(51,keyStr == expKeyStr,"Should contain all keys")
      _.bassert(52,valStr == expValStr, "Should contain all values")
      }/**********************************************************************/{        
      let lit = {a:"A",b:2,c:true,d:{da:"A", db:2, dc:true},e:"ja" }
      let set = new Setting(lit)
      let keyStr = ""
      let valStr = ""
      let expKeyStr = "a b c d da db dc e "
      let expValStr = "A 2 true A 2 true ja "
      for (const [key, value] of set) {
        keyStr+=key + " "
        if(value.FLAT)
          valStr+=value.VALUE + " "
        else 
        for (const [k, v] of value) {
          keyStr+=k + " "
          valStr+=v.VALUE + " "
        }
      }
      _.bassert(61,keyStr == expKeyStr,"Should contain all keys")
      _.bassert(62,valStr == expValStr, "Should contain all values")

      keyStr = ""
      valStr = ""
      let expKeyStr2 = "a b c d da dc e "
      let expValStr2 = "A 2 true A true ja "
      for (const [key, value] of set) {
        keyStr+=key + " "
        if(value.FLAT)
          valStr+=value.VALUE + " "
        else 
        for (const [k, v] of value) {
          if(k == "db") continue
          keyStr+=k + " "
          valStr+=v.VALUE + " "
        }
      }
      _.bassert(71,keyStr == expKeyStr2,"Should contain all keys except the last of 'd'")
      _.bassert(72,valStr == expValStr2, "Should contain all values except the last of 'd'")

      keyStr = ""
      valStr = ""
      for (const [key, value] of set) {
        keyStr+=key + " "
        if(value.FLAT)
          valStr+=value.VALUE + " "
        else 
        for (const [k, v] of value) {
          keyStr+=k + " "
          valStr+=v.VALUE + " "
        }
      }
      _.bassert(81,keyStr == expKeyStr,"Should contain all keys")
      _.bassert(82,valStr == expValStr, "Should contain all values")
      }/**********************************************************************/{        
      class testWorker extends Setting {
        static get workerKey() {
          return "__TEST"
        }
        constructor(literal, key, parent) {
          parent.workersTypeForChildren = "(Number|Array.<Number>)"
          super(literal,key,parent)
          this.addGene(testWorker)
        }          
      }
      let lit = {__TEST:{a:1,b:2,c:3,d:{da:4, db:5, dc:6},e:7 }}
      Setting.worker = testWorker
      let set = new Setting(lit)
      let keyStr = ""
      let valStr = ""
      let expKeyStr = "a b c d da db dc e "
      let expValStr = "1 2 3 4 5 6 7 "
      for (const [key, value] of set.at("__TEST")) {
        keyStr+=key + " "
        if(value.FLAT)
          valStr+=value.VALUE + " "
        else 
        for (const [k, v] of value) {
          keyStr+=k + " "
          valStr+=v.VALUE + " "
        }
      }
      _.bassert(91,keyStr == expKeyStr,"Should contain all keys")
      _.bassert(92,valStr == expValStr, "Should contain all values")

      }/**********************************************************************/              

    }
    function hasTest() {
      /**********************************************************************/{
      let lit = {pos:[22,12], deep: {deeper: {pos:[14,13,18]}}}
      let set = new Setting(lit)
      let answ1 = set.has("deep")
      let answ2 = set.has("deep.deeper")
      let answ3 = set.has("deep.deeper.pos")
      let answ4 = set.has("neep.deeper.pos")
      let answ5 = set.has("deep.deeper.xos")
      let answ6 = set.has("deep.deeper.pos.ne")
      _.bassert(1,answ1==true,"'deep' exists")
      _.bassert(2,answ2==true,"'deep.deeper' exists")
      _.bassert(3,answ3==true,"'deep.deeper.pos' exists")
      _.bassert(4,answ4==false,"'neep' does not exist")
      _.bassert(5,answ5==false,"'deep.deeper.xos' does not exist")
      _.bassert(6,answ6==false,"'deep.deeper.pos.ne' does not exist")
      }/**********************************************************************/{        
      class testWorker extends Setting {
        static get workerKey() {
          return "__TEST"
        }
        constructor(literal, key, parent) {
          parent.workersTypeForChildren = "(Number|Array.<Number>)"
          super(literal,key,parent)
          this.addGene(testWorker)
        }          
      }
      let lit = {__TEST:{pos:[22,12], deep: {deeper: {pos:[14,13,18]}}}}
      Setting.worker = testWorker
      let set = new Setting(lit)
      let answer1 = set.has("__TEST")
      let answer2 = set.has("__TEST.deep")
      let answer3 = set.has("__TEST.deep.deeper")
      let answer4 = set.has("__TEST.deep.deeper.pos")
      let answer5 = set.has("__NEST.deep.deeper.pos")
      let answer6 = set.has("__TEST.neep")
      let answer7 = set.has("__TEST.deep.deeper.nos")
      let answer8 = set.has("__TEST.deep.deeper.pos.ne")
      _.bassert(1,answer1==true,"Workers root exists")
      _.bassert(2,answer2==true,"Workers 'deep' exists")
      _.bassert(3,answer3==true,"Workers 'deep.deeper' exists")
      _.bassert(4,answer4==true,"Workers 'deep.deeper.pos' exists")
      _.bassert(5,answer5==false,"Worker '__NEST' does not exist")
      _.bassert(6,answer6==false,"Workers 'neep' does not exist")
      _.bassert(7,answer7==false,"Workers 'deep.deeper.nos' does not exist")
      _.bassert(8,answer8==false,"Workers 'deep.deeper.pos.ne' does not exist")
      }/**********************************************************************/              
    }
    function atTest() {
      /**********************************************************************/{
      let lit = {pos:[22,12], deep: {deeper: {pos:[14,13,18]}}}
      let set = new Setting(lit)
      let answ1 = set.at("deep")
      let answ2 = set.at("deep.deeper")
      let answ3 = set.at("deep.deeper.pos")
      _.bassert(1,set.getValue("deep.deeper.pos")[2]==18,"should return value root")
      _.bassert(2,answ1.getValue("deeper.pos")[2]==18,"should return its 'deep'")
      _.bassert(3,answ2.getValue("pos")[2]==18,"should return its 'deep.deeper'")
      _.bassert(4,answ3.VALUE[2]==18,"should return its 'deep.deeper.pos'")
      }/**********************************************************************/{        
      class testWorker extends Setting {
        static get workerKey() {
          return "__TEST"
        }
        constructor(literal, key, parent) {
          parent.workersTypeForChildren = "(Number|Array.<Number>)"
          super(literal,key,parent)
          this.addGene(testWorker)
        }          
      }
      let lit = {__TEST:{pos:[22,12], deep: {deeper: {pos:[14,13,18]}}}}
      Setting.worker = testWorker
      let set = new Setting(lit)
      let test = set.at("__TEST")
      let test1 = set.at("__TEST.deep")
      let test2 = set.at("__TEST.deep.deeper")
      let test3 = set.at("__TEST.deep.deeper.pos")
      _.bassert(1,test.getValue("deep.deeper.pos")[2]==18,"should return Workers root")
      _.bassert(2,test1.getValue("deeper.pos")[2]==18,"should return Workers 'deep'")
      _.bassert(3,test2.getValue("pos")[2]==18,"should return Workers 'deep.deeper'")
      _.bassert(3,test3.VALUE[2]==18,"should return Workers 'deep.deeper.pos'")
      }/**********************************************************************/              
    }
    function getValueTest() {
      /**********************************************************************/{        
      let lit = {a:2, b:{bb:"bbValue"}}
      let set = new Setting(lit,"Setting:getValueTest1")
      _.bassert(1,set.getValue("a") ==2,"should return value of a")
      _.bassert(2,set.getValue("b") =="","value for node is empty string")
      _.bassert(3,set.getValue("b.bb") =="bbValue","should return value of bb")
      _.bassert(4,set.getValue("b.bbb") ==undefined,"key not there,should return undefined")
      }/**********************************************************************/{        
      class testWorker extends Setting {
        static get workerKey() {
          return "__TEST"
        }
        constructor(literal, key, parent) {
          parent.workersTypeForChildren = "(Number|Array.<Number>)"
          super(literal,key,parent)
          this.addGene(testWorker)
        }          
      }
      let lit = {__TEST:{pos:[22,12], str:"not allowed"}}
      Setting.worker = testWorker
      let set = new Setting(lit)
      _.bassert(1,set.getValue("__TEST.pos")[0] ==22,"should return value of Worker")
      _.bassert(2,set.getValue("__TEST.notThere") ==undefined,"is not there, has no VALUE")
      _.bassert(3,set.getValue("__TEST") ==undefined,"is not FLAT, has no VALUE")
      }/**********************************************************************/              
    }
    function getFrontmatterYAMLTest() {
      const lit1 = {__SPEC: {RENDER: false}, a: 23}
      const lit2 = {__SPEC: {RENDER: false}, a: 23, b: "ja"}
      const lit3 = {__SPEC: {RENDER: false}, a: 23, c: {b: "ja"}, d: "ja"}
      const lit4 = {__SPEC: {RENDER: false}, a: 23, c: {b: "ja", c: {c: 25}}, d: "ja"}
      const lit5 = {__SPEC: {RENDER: false} , a: 23, c: {__SPEC: {RENDER: true}, pict: "ja", d: {__SPEC: {RENDER: false}, x: "y"}}}
      let setting1 = new Setting(lit1,"Setting:getFrontmatterYAMLTest1")
      let setting2 = new Setting(lit2,"Setting:getFrontmatterYAMLTest2")
      let setting3 = new Setting(lit3,"Setting:getFrontmatterYAMLTest3")
      let setting4 = new Setting(lit4,"Setting:getFrontmatterYAMLTest4")
      let setting5 = new Setting(lit5,"Setting:getFrontmatterYAMLTest5")
      let answ1f = setting1.getFrontmatterYAML()
      let answ2f = setting2.getFrontmatterYAML()
      let answ3f = setting3.getFrontmatterYAML()
      let answ4f = setting4.getFrontmatterYAML()
      let answ5f = setting5.getFrontmatterYAML()
      let expAnsw1f = '{"a":23}'
      let expAnsw2f = '{"a":23,"b":"ja"}'
      let expAnsw3f = '{"a":23,"b":"ja","d":"ja"}'
      let expAnsw4f = '{"a":23,"b":"ja","c":25,"d":"ja"}'
      let expAnsw5f = '{"a":23,"x":"y"}'
      _.bassert(1,JSON.stringify(answ1f) === expAnsw1f,`output of JSON.stringify(result) is:'${JSON.stringify(answ1f)}',but should be:'${expAnsw1f}'`)
      _.bassert(2,JSON.stringify(answ2f) === expAnsw2f,`output of JSON.stringify(result) is:'${JSON.stringify(answ2f)}',but should be:'${expAnsw2f}'`)
      _.bassert(3,JSON.stringify(answ3f) === expAnsw3f,`output of JSON.stringify(result) is:'${JSON.stringify(answ3f)}',but should be:'${expAnsw3f}'`)
      _.bassert(4,JSON.stringify(answ4f) === expAnsw4f,`output of JSON.stringify(result) is:'${JSON.stringify(answ4f)}',but should be:'${expAnsw4f}'`)
      _.bassert(5,JSON.stringify(answ5f) === expAnsw5f,`output of JSON.stringify(result) is:'${JSON.stringify(answ5f)}',but should be:'${expAnsw5f}'`)
    }
    function getRenderYAMLTest() {
      const lit1 = {a: 23, c: {b: "ja", c: {c: 25}}, d: "ja"}
      const lit2 = {a: 23, c: {__SPEC: {RENDER: true}, pict: "ja"}}
      const lit3 = {a: 23, c: {b: "ja"}, d: "ja"}
      const lit4 = {
        c: {
          __SPEC: {RENDER: true},
          pict: "ja",
          d: {__SPEC: {RENDER: false}, 
             private: true,
             x: {
              __SPEC: {RENDER: true}, 
              y:"z"
             }
          },
        },
      }
      let setting1 = new Setting(lit1,"Setting:getRenderYAMLTest1")
      let setting2 = new Setting(lit2,"Setting:getRenderYAMLTest2")
      let setting3 = new Setting(lit3,"Setting:getRenderYAMLTest3")
      let setting4 = new Setting(lit4,"Setting:getRenderYAMLTest4")
      let answ1 = setting1.getRenderYAML()
      let answ2 = setting2.getRenderYAML()
      let answ3 = setting3.getRenderYAML()
      let answ4 = setting4.getRenderYAML()
      let expAnsw1 = "{}"
      let expAnsw2 = '{"pict":"ja"}'
      let expAnsw3 = "{}"
      let expAnsw4 = '{"pict":"ja","y":"z"}'
      _.bassert(1,JSON.stringify(answ1) === expAnsw1,`output of JSON.stringify(result) is:'${JSON.stringify(answ1)}',but should be:'${expAnsw1}'`)
      _.bassert(2,JSON.stringify(answ2) === expAnsw2,`output of JSON.stringify(result) is:'${JSON.stringify(answ2)}',but should be:'${expAnsw2}'`)
      _.bassert(3,JSON.stringify(answ3) === expAnsw3,`output of JSON.stringify(result) is:'${JSON.stringify(answ3)}',but should be:'${expAnsw3}'`)
      _.bassert(4,JSON.stringify(answ4) === expAnsw4,`output of JSON.stringify(result) is:'${JSON.stringify(answ4)}',but should be:'${expAnsw4}'`)
    }
    function atomsTest() {
      /**********************************************************************/{        
        let lit = {  
        a: "stg",
        b: 22,
        c: true,
        d: cbkFmtCreated,
        e: {ee: "internal"},
        f: "2023-01-31",
        g: null,
        h: undefined,
       }
      if(false){
      let ess0 = new AEssence({},un,"atomsTest")
      console.log(`ess0: '${ess0}'`) 
      console.log(`ess0.DEFAULT: '${ess0.DEFAULT}'`) 
      console.log(`ess0.FLAT: '${ess0.FLAT}'`) 
      console.log(`ess0.IGNORE: '${ess0.IGNORE}'`) 
      console.log(`ess0.LOCAL: '${ess0.LOCAL}'`) 
      console.log(`ess0.ONCE: '${ess0.ONCE}'`) 
      console.log(`ess0.RENDER: '${ess0.RENDER}'`) 
      console.log(`ess0.REPEAT: '${ess0.REPEAT}'`) 
      console.log(`ess0.ROOT: '${ess0.ROOT}'`) 
      console.log(`ess0.TYPE: '${ess0.TYPE}'`) 
      console.log(`ess0.VALUE: '${ess0.VALUE}'`) 
      }
      
      }/**********************************************************************/{        
      }/**********************************************************************/        
    }
    function deepLiteralTest() {
      /************************************************************/if(true){    
        let lit0 = { __SPEC: {TYPE: "Number",RENDER: false},
        pict: {VALUE: "Russian-Matroshka2.jpg", 
              __SPEC: true, RENDER: true, },
        integer: {VALUE: 127, __SPEC: false, },
        soso: [128,127],
        noValue: {__SPEC: true, },
        noValueButType: {__SPEC: false, },
      }
      let set0 = new Setting(lit0,"Setting:deepLiteralTest0")
      let frontMY0 = set0.getFrontmatterYAML()
      let renderY0 = set0.getRenderYAML()
      _.bassert(1,frontMY0["integer"] == 127,"Type of 'Number' should be inherited")
      _.bassert(2,areEqual(frontMY0["soso"],[128,127]),"Type of 'Array.<Number>' should be general")
      _.bassert(3,frontMY0["noValue"] == "","No value should become default empty string")
      _.bassert(4,frontMY0["noValueButType"] === "","No value should become default empty string, even if type is set to 'Number'")
      _.bassert(5,Object.keys(frontMY0).length == 4,"only added entries should appear in frontmatter YAML")
      _.bassert(6,renderY0["pict"] == "Russian-Matroshka2.jpg","'pict' should be in render YAML as given")
      _.bassert(7,renderY0["integer"] == undefined,"'integer' should not appear in render YAML")
      _.bassert(8,renderY0["soso"] == undefined,"'soso' should not appear in render YAML")
      _.bassert(9,Object.keys(renderY0).length == 1,"only added entries should appear in render YAML")
      
      }/************************************************************/if(true){
      let lit1 = {  __SPEC: {RENDER: false},
                    a:2,
                    b:"stg",
                    c:true,
                    d:false,
                    e:undefined,
                    f:null,
                    g:Symbol("abc"),
                    h:cbkTypeOf,
                    i:22n,
                   }
      let set1 = new Setting(lit1,"Setting:deepLiteralTest1")
      let frontMY1 = set1.getFrontmatterYAML()
      let renderY1 = set1.getRenderYAML()
      _.bassert(20,Object.keys(renderY1).length == 0,"no render entries given")
      _.bassert(21,frontMY1["a"] === 2,"should be as given")
      _.bassert(22,frontMY1["b"] === "stg","should be as given")
      _.bassert(23,frontMY1["c"] === true,"should be as given")
      _.bassert(24,frontMY1["d"] === false,"should be as given")
      _.bassert(25,frontMY1["e"] === "","Value should be removed, 'undefined' no globalType")
      _.bassert(26,frontMY1["f"] === "","Value should be removed, 'null' no globalType")
      _.bassert(27,frontMY1["g"] === "","Value should be removed, 'symbol' no globalType")
      _.bassert(28,frontMY1["h"] === "","Value should be removed, 'function' no globalType")
      _.bassert(29,frontMY1["i"] === "","Value should be removed, 'bigint' no globalType")

      }/************************************************************/if(true){
        let lit2 = { __SPEC: {RENDER: false},  
                    a:[],
                    b:[1,2,3],
                    c:[false,false,true],
                    d:["a"],
                    e:[undefined],
                    f:[null],
                    g:[Symbol("abc")],
                    h:[cbkTypeOf],
                    i:[22n],
                   }
      let set2 = new Setting(lit2,"Setting:deepLiteralTest2")
      let frontMY2 = set2.getFrontmatterYAML()
      let renderY2 = set2.getRenderYAML()
      _.bassert(30,Object.keys(renderY2).length === 0,"no render entries given")
      _.bassert(31,Array.isArray(frontMY2.a),"empty array should be returned as array")
      _.bassert(32,Array.isArray(frontMY2.b),"array of numbers should be returned as array")
      _.bassert(33,Array.isArray(frontMY2.c),"array of booleans should be returned as array")
      _.bassert(34,Array.isArray(frontMY2.d),"array of strings should be returned as array")
      _.bassert(35,areEqual(frontMY2.a,[]),"empty array should be returned as empty array")
      _.bassert(36,areEqual(frontMY2.b,[1,2,3]),"array of numbers should be returned as same array")
      _.bassert(37,areEqual(frontMY2.c,[false,false,true]),"array of booleans should be returned as same array")
      _.bassert(38,areEqual(frontMY2.d,["a"]),"array of strings should be returned as same array")
      _.bassert(39,frontMY2["e"] === "","Value should be removed, array of 'undefined' no globalType")
      _.bassert(40,frontMY2["f"] === "","Value should be removed, array of 'null' no globalType")
      _.bassert(41,frontMY2["g"] === "","Value should be removed, array of 'symbol' no globalType")
      _.bassert(42,frontMY2["h"] === "","Value should be removed, array of 'function' no globalType")
      _.bassert(43,frontMY2["i"] === "","Value should be removed, array of 'bigint' no globalType")

      }/************************************************************/if(true){
        let lit3 = { __SPEC: {RENDER: false,TYPE: "Number"},
                  a:2,
                  b:"stg",
                  c:true,
                  d:false,
                  e:undefined,
                  f:null,
                  g:Symbol("abc"),
                  h:cbkTypeOf,
                  i:22n,
                }      
      let set3 = new Setting(lit3,"Setting:deepLiteralTest3")
      let frontMY3 = set3.getFrontmatterYAML()
      let renderY3 = set3.getRenderYAML()
      _.bassert(50,Object.keys(renderY3).length == 0,"no render entries given")
      _.bassert(51,frontMY3["a"] === 2,"should be as given")
      _.bassert(52,frontMY3["b"] === "stg","should be as given, globalType is used")
      _.bassert(53,frontMY3["c"] === true,"should be as given, globalType is used")
      _.bassert(54,frontMY3["d"] === false,"should be as given, globalType is used")
      _.bassert(55,frontMY3["e"] === "","Value should be removed, 'undefined' no globalType")
      _.bassert(56,frontMY3["f"] === "","Value should be removed, 'null' no globalType")
      _.bassert(57,frontMY3["g"] === "","Value should be removed, 'symbol' no globalType")
      _.bassert(58,frontMY3["h"] === "","Value should be removed, 'function' no globalType")
      _.bassert(59,frontMY3["i"] === "","Value should be removed, 'bigint' no globalType")

      }/************************************************************/if(true){
        let lit4 = {  __SPEC: {RENDER: false,TYPE: "Number"},
                    a:[],
                    b:[1,2,3],
                    c:[false,false,true],
                    d:["a"],
                    e:[undefined],
                    f:[null],
                    g:[Symbol("abc")],
                    h:[cbkTypeOf],
                    i:[22n],
                   }
      let set4 = new Setting(lit4,"Setting:deepLiteralTest4")
      let frontMY4 = set4.getFrontmatterYAML()
      let renderY4 = set4.getRenderYAML()
      _.bassert(60,Object.keys(renderY4).length === 0,"no render entries given")
      _.bassert(61,Array.isArray(frontMY4.a),"should be as given, globalType is used")
      _.bassert(62,Array.isArray(frontMY4.b),"should be as given, globalType is used")
      _.bassert(63,Array.isArray(frontMY4.c),"should be as given, globalType is used")
      _.bassert(64,Array.isArray(frontMY4.d),"should be as given, globalType is used")
      _.bassert(65,areEqual(frontMY4.a,[]),"empty array should be returned as empty array")
      _.bassert(66,areEqual(frontMY4.b,[1,2,3]),"array of numbers should be returned as same array")
      _.bassert(67,areEqual(frontMY4.c,[false,false,true]),"array of booleans should be returned as same array")
      _.bassert(68,areEqual(frontMY4.d,["a"]),"array of strings should be returned as same array")
      _.bassert(69,frontMY4["e"] === "","Value should be removed, array of 'undefined' no globalType")
      _.bassert(70,frontMY4["f"] === "","Value should be removed, array of 'null' no globalType")
      _.bassert(71,frontMY4["g"] === "","Value should be removed, array of 'symbol' no globalType")
      _.bassert(72,frontMY4["h"] === "","Value should be removed, array of 'function' no globalType")
      _.bassert(73,frontMY4["i"] === "","Value should be removed, array of 'bigint' no globalType")

      }/************************************************************/if(true){
        let lit5 = { __SPEC: {RENDER: false,TYPE: "Number"},
                  a:{__SPEC: true, VALUE:2},
                  b:{__SPEC: true, VALUE:"stg"},
                  c:{__SPEC: true, VALUE:true},
                  d:{__SPEC: true, VALUE:false},
                  e:{__SPEC: true, VALUE:undefined},
                  f:{__SPEC: true, VALUE:null},
                  g:{__SPEC: true, VALUE:Symbol("abc")},
                  h:{__SPEC: true, VALUE:cbkTypeOf},
                  i:{__SPEC: true, VALUE:22n},
                 }
      let set5 = new Setting(lit5,"Setting:deepLiteralTest5")
      let frontMY5 = set5.getFrontmatterYAML()
      let renderY5 = set5.getRenderYAML()
      _.bassert(80,Object.keys(renderY5).length == 0,"no render entries given")
      _.bassert(81,frontMY5["a"] === 2,"should be as given")
      _.bassert(82,frontMY5["b"] === "stg","should be as given, globalType is used")
      _.bassert(83,frontMY5["c"] === true,"should be as given, globalType is used")
      _.bassert(84,frontMY5["d"] === false,"should be as given, globalType is used")
      _.bassert(85,frontMY5["e"] === "","Value should be removed, 'undefined' no globalType")
      _.bassert(86,frontMY5["f"] === "","Value should be removed, 'null' no globalType")
      _.bassert(87,frontMY5["g"] === "","Value should be removed, 'symbol' no globalType")
      _.bassert(88,frontMY5["h"] === "","Value should be removed, 'function' no globalType")
      _.bassert(89,frontMY5["i"] === "","Value should be removed, 'bigint' no globalType")

      }/************************************************************/if(true){
        let lit6 = {  __SPEC: {RENDER: false,TYPE: "Number"},
                    a:{__SPEC: true, VALUE:[]},
                    b:{__SPEC: true, VALUE:[1,2,3]},
                    c:{__SPEC: true, VALUE:[false,false,true]},
                    d:{__SPEC: true, VALUE:["a"]},
                    e:{__SPEC: true, VALUE:[undefined]},
                    f:{__SPEC: true, VALUE:[null]},
                    g:{__SPEC: true, VALUE:[Symbol("abc")]},
                    h:{__SPEC: true, VALUE:[cbkTypeOf]},
                    i:{__SPEC: true, VALUE:[22n]},
                   }
      let set6 = new Setting(lit6,"Setting:deepLiteralTest6")
      let frontMY6 = set6.getFrontmatterYAML()
      let renderY6 = set6.getRenderYAML()
      _.bassert(90,Object.keys(renderY6).length === 0,"no render entries given")
      _.bassert(91,Array.isArray(frontMY6.a),"should be as given, globalType is used")
      _.bassert(92,Array.isArray(frontMY6.b),"should be as given, globalType is used")
      _.bassert(93,Array.isArray(frontMY6.c),"should be as given, globalType is used")
      _.bassert(94,Array.isArray(frontMY6.d),"should be as given, globalType is used")
      _.bassert(95,areEqual(frontMY6.a,[]),"empty array should be returned as empty array")
      _.bassert(96,areEqual(frontMY6.b,[1,2,3]),"array of numbers should be returned as same array")
      _.bassert(97,areEqual(frontMY6.c,[false,false,true]),"array of booleans should be returned as same array")
      _.bassert(98,areEqual(frontMY6.d,["a"]),"array of strings should be returned as same array")
      _.bassert(99,frontMY6["e"] === "","Value should be removed, array of 'undefined' no globalType")
      _.bassert(100,frontMY6["f"] === "","Value should be removed, array of 'null' no globalType")
      _.bassert(101,frontMY6["g"] === "","Value should be removed, array of 'symbol' no globalType")
      _.bassert(102,frontMY6["h"] === "","Value should be removed, array of 'function' no globalType")
      _.bassert(103,frontMY6["i"] === "","Value should be removed, array of 'bigint' no globalType")

      }/************************************************************/if(true){
        let lit7 = { __SPEC: {RENDER: false,TYPE: "Number"},
                  a:{__SPEC: false, VALUE:2},
                  b:{__SPEC: false, VALUE:"stg"},
                  c:{__SPEC: false, VALUE:true},
                  d:{__SPEC: false, VALUE:false},
                  e:{__SPEC: false, VALUE:undefined},
                  f:{__SPEC: false, VALUE:null},
                  g:{__SPEC: false, VALUE:Symbol("abc")},
                  h:{__SPEC: false, VALUE:cbkTypeOf},
                  i:{__SPEC: false, VALUE:22n},
                 }
      let set7 = new Setting(lit7,"Setting:deepLiteralTest7")
      let frontMY7 = set7.getFrontmatterYAML()
      let renderY7 = set7.getRenderYAML()
      _.bassert(110,Object.keys(renderY7).length == 0,"no render entries given")
      _.bassert(111,frontMY7["a"] === 2,"should be as given")
      _.bassert(112,frontMY7["b"] === "","Value should be removed, globalType is not used")
      _.bassert(113,frontMY7["c"] === "","Value should be removed, globalType is not used")
      _.bassert(114,frontMY7["d"] === "","Value should be removed, globalType is not used")
      _.bassert(115,frontMY7["e"] === "","Value should be removed, 'undefined' no globalType")
      _.bassert(116,frontMY7["f"] === "","Value should be removed, 'null' no globalType")
      _.bassert(117,frontMY7["g"] === "","Value should be removed, 'symbol' no globalType")
      _.bassert(118,frontMY7["h"] === "","Value should be removed, 'function' no globalType")
      _.bassert(119,frontMY7["i"] === "","Value should be removed, 'bigint' no globalType")

      }/************************************************************/if(true){
        let lit8 = {  __SPEC: {RENDER: false,TYPE: "Number"},
                    a:{__SPEC: false, VALUE:[]},
                    b:{__SPEC: false, VALUE:[1,2,3]},
                    c:{__SPEC: false, VALUE:[false,false,true]},
                    d:{__SPEC: false, VALUE:["a"]},
                    e:{__SPEC: false, VALUE:[undefined]},
                    f:{__SPEC: false, VALUE:[null]},
                    g:{__SPEC: false, VALUE:[Symbol("abc")]},
                    h:{__SPEC: false, VALUE:[cbkTypeOf]},
                    i:{__SPEC: false, VALUE:[22n]},
                   }
      let set8 = new Setting(lit8,"Setting:deepLiteralTest8")
      let frontMY8 = set8.getFrontmatterYAML()
      let renderY8 = set8.getRenderYAML()
      _.bassert(120,Object.keys(renderY8).length === 0,"no render entries given")
      _.bassert(111,frontMY8["a"] === "","Value should be removed, globalType is not used")
      _.bassert(112,frontMY8["b"] === "","Value should be removed, globalType is not used")
      _.bassert(113,frontMY8["c"] === "","Value should be removed, globalType is not used")
      _.bassert(114,frontMY8["d"] === "","Value should be removed, globalType is not used")
      _.bassert(115,frontMY8["e"] === "","Value should be removed, 'undefined' no globalType")
      _.bassert(116,frontMY8["f"] === "","Value should be removed, 'null' no globalType")
      _.bassert(117,frontMY8["g"] === "","Value should be removed, 'symbol' no globalType")
      _.bassert(118,frontMY8["h"] === "","Value should be removed, 'function' no globalType")
      _.bassert(119,frontMY8["i"] === "","Value should be removed, 'bigint' no globalType")

      }/**********************************************************************/
    }
    function _tryConstruct(arg1, arg2, arg3) {
      new Setting(arg1, arg2, arg3)
    }
  }
}
registeredTests.push(Setting.test)
registeredExceptions.push(
  "new Setting({},'goodN', new BreadCrumbs({},'root'))",
  "new Setting()"
)

//  #region workers
class GeneralWorker extends Setting {
  static #KEY =  GENERAL_WORKER_KEY // "__GENERAL_SETTINGS"
  static #localType =  GENERAL_TYPE // "(Number|String|Boolean)"
  
  /**
   * Key which this worker will handle
   * @type {String}
   */
  static get workerKey() {
    return GeneralWorker.#KEY
  }

  /**
   * @classdesc For note types
   * @extends Setting
   * @constructor
   * @description
   *
   * Creates a GeneralWorker instance
   * @extends Setting
   * @param {Object} literal
   * @param {String} key
   * @param {Setting} parent
   */
  constructor(literal, key, parent) {
    parent.workersTypeForChildren = GeneralWorker.#localType
    super(literal, key, parent)
    this.addGene(GeneralWorker)
    // literal {(Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|Setting)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    this.throwIfUndefined(key, "key")
  }

  /**
   * Returns value of {@link key} or {@link fallback} as caller fallback
   * or undefined if none of them is found
   * <p>
   * @param {String} key
   * @param  {...any} fallback
   * @returns {...any}
   */
  getValue(key, fallback) {
    let atom = this.at(key)
    let value
    if( atom !== undefined) {
      value = atom.VALUE
    } else {
      value = fallback
    }        
    return value
  }
  
  //prettier-ignore
  static test(outputObj) { // GeneralWorker
    let _ = null
    if(_ = new TestSuite("GeneralWorker", outputObj)) {
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.run(getValueTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "GeneralWorker:constructorTest", un)
      let dlgMan0 = new GeneralWorker({}, "GeneralWorker:constructorTest1", new Setting({},"parent"))
      _.assert(1,_tryConstruct,{},"GeneralWorker:cTest1",new Setting({},"parent"),"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"GeneralWorker:cTest2",new Setting({},"parent"),"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"GeneralWorker:cTest3",new Setting({},"parent"),"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","GeneralWorker:cTest4",new Setting({},"parent"),"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"GeneralWorker:cTest5",new Setting({},"parent"),"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,new Setting({},"parent"),"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,new Setting({},"parent"),"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},new Setting({},"parent"),"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,new Setting({},"parent"),"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),new Setting({},"parent"),"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"GeneralWorker:cTest11",un,"should  not be created, undefined parent is not ok")
      _.shouldAssert(12,_tryConstruct,{},"GeneralWorker:cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"GeneralWorker:cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"GeneralWorker:cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"GeneralWorker:cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"GeneralWorker:cTest16",null,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"GeneralWorker:cTest16",b,"should not be be created, parent is BreadCrumbs")
      let dlgMan = new GeneralWorker({},"GeneralWorker:constructorTest101", new Setting({},"parent"))
      _.bassert(101,dlgMan instanceof Object,"'GeneralWorker' has to be an instance of 'Object'")
      _.bassert(102,dlgMan instanceof BreadCrumbs,"'GeneralWorker' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,dlgMan instanceof GeneralWorker,"'GeneralWorker' has to be an instance of 'GeneralWorker'")
      _.bassert(104,dlgMan.constructor === GeneralWorker,"the constructor property is not 'GeneralWorker'")
    }
    function isATest() {
      // Object, Gene, GenePool, AEssence added for each AEssence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      // GeneralWorker added for each GeneralWorker instance
      let dlgMan1 = new GeneralWorker({},"GeneralWorker:NameIsATest",new Setting({},"parent"))
      _.bassert(1,dlgMan1.isA(dlgMan1,"object"), "'" + dlgMan1 + "' should be a " + "object")
      _.bassert(2,dlgMan1.isA(dlgMan1,Object), "'" + dlgMan1 + "' should be a " + "Object")
      _.bassert(3,dlgMan1.isA(dlgMan1,BreadCrumbs), "'" + dlgMan1 + "' should be a " + "BreadCrumbs")
      _.bassert(4,dlgMan1.isA(dlgMan1,Setting), "'" + dlgMan1 + "' should be a " + "Setting")
      _.bassert(5,dlgMan1.isA(dlgMan1,GeneralWorker), "'" + dlgMan1 + "' should be a " + "GeneralWorker")
      _.bassert(6,!dlgMan1.isA(dlgMan1,Error), "'" + dlgMan1 + "' should not be a " + "Error")
      _.bassert(7,!dlgMan1.isA(dlgMan1,Gene), "'" + dlgMan1 + "' should not be a " + "Gene")
    }
    function toStringTest() {
      let dlgMan1 = new GeneralWorker({},"DlgWrk:toStringTest1",new Setting({},"parent"))
      _.bassert(1,dlgMan1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,dlgMan1.toString().includes("GeneralWorker"),"result does not contain class string"    )
    }
    function getValueTest() {
      let un
      let par = new Setting({},"GeneralWorker:getValueTest:parent")
      /**********************************************************************/{        
      let lit = {LANGUAGE:"abcd"}
      let gen = new GeneralWorker(lit,"GeneralWorker:getValueTest1",par)
      let val = gen.getValue("LANGUAGE")
      _.bassert(1,areEqual(val,"abcd"),"get the LANGUAGE value via GeneralWorker")
      let litS = { __GENERAL_SETTINGS:{LANGUAGE:"abcd"}}
      let set = new Setting(litS)
      let valS = set.getValue("__GENERAL_SETTINGS.LANGUAGE")
      _.bassert(2,areEqual(valS,"abcd"),"get the LANGUAGE value via Setting")
      }/**********************************************************************/{        
      let lit = {NOLANGUAGE:"abcd"}
      let gen = new GeneralWorker(lit,"GeneralWorker:getValueTest11",par)
      let val = gen.getValue("LANGUAGE",FALLBACK_LANGUAGE)
      _.bassert(11,areEqual(val,FALLBACK_LANGUAGE),"get the hardcoded LANGUAGE value via GeneralWorker")
      let litS = { __GENERAL_SETTINGS:{NOLANGUAGE:"abcd"}}
      let set = new Setting(litS)
      let valS = set.getValue("__GENERAL_SETTINGS.LANGUAGE", FALLBACK_LANGUAGE)
      _.bassert(12,areEqual(valS,FALLBACK_LANGUAGE),"get the hardcoded LANGAUGE value via Setting") 
      }/**********************************************************************/{        
      let lit = {NOLANGUAGE:"abcd"}
      let gen = new GeneralWorker(lit,"GeneralWorker:getValueTest21",par)
      let val = gen.getValue("LANGUAGE","ced")
      _.bassert(21,areEqual(val,"ced"),"get the fallback LANGUAGE value via GeneralWorker")
      let litS = { __GENERAL_SETTINGS:{NOLANGUAGE:"abcd"}}
      let set = new Setting(litS)
      let valS = set.getValue("__GENERAL_SETTINGS.LANGUAGE","ced")
      _.bassert(22,areEqual(valS,"ced"),"get the fallback LANGAUGE value via Setting") 
      }/**********************************************************************/{        
      let lit = {LANGUAGE:"abcd"}
      let gen = new GeneralWorker(lit,"GeneralWorker:getValueTest31",par)
      let val = gen.getValue("notthere")
      _.bassert(31,areEqual(val,un),"get value for non existing key via GeneralWorker")
      let litS = { __GENERAL_SETTINGS:{LANGUAGE:"abcd"}}
      let set = new Setting(litS)
      let valS = set.getValue("__GENERAL_SETTINGS.notthere",)
      _.bassert(32,areEqual(valS,un),"get value for non existing key via Setting") 
      }/**********************************************************************/{        
      }/**********************************************************************/         
    }

    function _tryConstruct(arg1, arg2,arg3) {
      new GeneralWorker(arg1,arg2,arg3)
    }
  }
}
Setting.worker = GeneralWorker
registeredTests.push(GeneralWorker.test)
registeredExceptions.push(
  "new GeneralWorker({},'goodName', undefined)",
  "new GeneralWorker({},undefined, new Setting({},'parent'))"
)

class LocalizationWorker extends Setting {
  static #KEY =  LOCALIZATION_WORKER_KEY //  "__TRANSLATE"
  static #localType =  LOCALIZATION_TYPE // "(String|Array.<String>|Array.<Array.<String>>)"
  #defaultLang = FALLBACK_LANGUAGE
  /** Key which this worker will handle
   * @type {String}
   */
  static get workerKey() {
    return LocalizationWorker.#KEY
  }
  /**
   * @type {String}
   * @param {String} lang
   */
  set defaultLang(lang) {
    if (typeof lang == "string") this.#defaultLang = lang
  }

  /**
   * @classdesc For translation
   * @extends Setting
   * @constructor
   * @description
   * Creates a LocalizationWorker instance
   * @param {Object} literal
   * @param {String} key
   * @param {Setting} parent
   */
  constructor(literal, key, parent) {
    parent.workersTypeForChildren = LocalizationWorker.#localType
    super(literal, key, parent)
    this.addGene(LocalizationWorker)
    // literal {(Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|Setting)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    this.throwIfUndefined(key, "key")
    if(this.root.at(GENERAL_WORKER_KEY) != undefined)
      this.#defaultLang = this.root.at(GENERAL_WORKER_KEY).getValue("LANGUAGE", FALLBACK_LANGUAGE)
  }

  /**
   * Returns translated value or value or undefined if {@link key}
   * not found
   * <p>
   * The value can be:<br>
   * - a string<br>
   * - an array of two strings<br>
   * - an array of arrays of two strings
   * <p>
   * If the value is a string, this is returned
   * <p>
   * From a plain array of string the 2nd string is returned.
   * <p>
   * The 1st string in a two string array is considered as the language
   * key. If it is equal with language string in {@link params} the 2nd
   * string of this pair is returned. <br>
   * If no match is found, the value for the default language is returned.<br>
   * If this is not found, the 2nd value of the first pair is returned.
   * @example
   * // returns "word"
   * let lit =  { __TRANSLATE: {
   *             word: [ ["de", "Wort"], ["en", "word"] ]
   * }          }
   * let set = new Setting(lit)
   * set.getValue("__TRANSLATE.word", "en")
   * @example
   * // returns "word", if "en" is default language
   * let lit =  { __TRANSLATE: {
   *            word: [ ["de", "Wort"], ["en", "word"] ]
   * }          }
   * let set = new Setting(lit)
   * set.getValue("__TRANSLATE.word", "nl")
   * @example
   * // returns "Auto"
   * let lit ={  __TRANSLATE: {
   *            car: ["de", "Auto"],
   * }         }
   * let set = new Setting(lit)
   * set.getValue("__TRANSLATE.car", "nl")
   * @param {String} key
   * @param {String} fallback 
   * @param {String} language - if other langauge string than #defaultLang
   * @returns {String}
   */
  getValue(key, fallbackIn, language) {
    let atom = this.at(key)
    if (atom != undefined  && Array.isArray(atom.VALUE)) {
      let lang = language == undefined ? this.#defaultLang : language
      let fallback = fallbackIn
      for (const langPair of atom.VALUE) {
        if (Array.isArray(langPair) && langPair.length > 1) {
          if (langPair[0] == lang) {
            return langPair[1]
          }
          if (fallback == undefined) fallback = langPair[1]
          if (langPair[0] == this.#defaultLang)
            fallback = langPair[1]
        } else break
      }
      if (fallback != undefined) return fallback
      if (atom.VALUE.length > 1) return atom.VALUE[1]
    }
    if (atom != undefined) return atom.VALUE
  }
  //prettier-ignore
  static test(outputObj) { // LocalizationWorker
    let _ = null
    if(_ = new TestSuite("LocalizationWorker", outputObj)) {
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.run(getValueTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "LocalizationWorker:constructorTest", un)
      let lm = new LocalizationWorker({}, "LocalizationWorker:constructorTest1", new Setting({},"LocalizationWorker:cTest0:parent"))
      _.assert(1,_tryConstruct,{},"LocalizationWorker:cTest1",new Setting({},"LocalizationWorker:cTest1:parent"),"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"LocalizationWorker:cTest2",new Setting({},"LocalizationWorker:cTest2:parent"),"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"LocalizationWorker:cTest3",new Setting({},"LocalizationWorker:cTest3:parent"),"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","LocalizationWorker:cTest4",new Setting({},"LocalizationWorker:cTest4:parent"),"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"LocalizationWorker:cTest5",new Setting({},"LocalizationWorker:cTest5:parent"),"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,new Setting({},"LocalizationWorker:wrong1:parent"),"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,new Setting({},"LocalizationWorker:wrong2:parent"),"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},new Setting({},"LocalizationWorker:wrong3:parent"),"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,new Setting({},"LocalizationWorker:wrong4:parent"),"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),new Setting({},"LocalizationWorker:sym1:parent"),"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"LocalizationWorker:cTest11",un,"should  not be created, undefined parent is not ok")
      _.shouldAssert(12,_tryConstruct,{},"LocalizationWorker:cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"LocalizationWorker:cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"LocalizationWorker:cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"LocalizationWorker:cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"LocalizationWorker:cTest16",null,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"LocalizationWorker:cTest16",b,"should not be be created, parent is BreadCrumbs")
      let locMan = new LocalizationWorker({},"LocalizationWorker:constructorTest101", new Setting({},"LocalizationWorker:101:parent"))
      _.bassert(101,locMan instanceof Object,"'LocalizationWorker' has to be an instance of 'Object'")
      _.bassert(102,locMan instanceof BreadCrumbs,"'LocalizationWorker' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,locMan instanceof LocalizationWorker,"'LocalizationWorker' has to be an instance of 'LocalizationWorker'")
      _.bassert(104,locMan.constructor === LocalizationWorker,"the constructor property is not 'LocalizationWorker'")
    }
    function isATest() {
      // Object, Gene, GenePool, AEssence added for each AEssence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      // LocalizationWorker added for each LocalizationWorker instance
      let locMan1 = new LocalizationWorker({},"LocalizationWorker:NameIsATest",new Setting({},"parent"))
      _.bassert(1,locMan1.isA(locMan1,"object"), "'" + locMan1 + "' should be a " + "object")
      _.bassert(2,locMan1.isA(locMan1,Object), "'" + locMan1 + "' should be a " + "Object")
      _.bassert(3,locMan1.isA(locMan1,BreadCrumbs), "'" + locMan1 + "' should be a " + "BreadCrumbs")
      _.bassert(4,locMan1.isA(locMan1,Setting), "'" + locMan1 + "' should be a " + "Setting")
      _.bassert(5,locMan1.isA(locMan1,LocalizationWorker), "'" + locMan1 + "' should be a " + "LocalizationWorker")
      _.bassert(6,!locMan1.isA(locMan1,Error), "'" + locMan1 + "' should not be a " + "Error")
      _.bassert(7,!locMan1.isA(locMan1,Gene), "'" + locMan1 + "' should not be a " + "Gene")
    }
    function toStringTest() {
      let locMan1 = new LocalizationWorker({},"LocWork:toStringTest1",new Setting({},"parent"))
      _.bassert(1,locMan1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,locMan1.toString().includes("LocalizationWorker"),"result does not contain class string"    )
    }
    function getValueTest() {
      let par = new Setting({},"LocalizationWorker:getValueTest:parent")
      /**********************************************************************/{        
      let lit = {word: "Wort"}
      let loc = new LocalizationWorker(lit,"LocalizationWorker:getValueTest1",par)
      let val = loc.getValue("word")
      _.bassert(1,val == "Wort","get the value via DialogWorker")
      let litS = { __TRANSLATE:{word: "Wort"}}
      let set = new Setting(litS,"LocalizationWorker:getValueTest12",par)
      let valS = set.getValue("__TRANSLATE.word")
      _.bassert(2,valS == "Wort","get the value via Setting")
      }/**********************************************************************/{        
      let lit = { chapter: {word: "Wort"}}
      let loc = new LocalizationWorker(lit,"LocalizationWorker:getValueTest11",par)
      let val = loc.getValue("chapter.word")
      _.bassert(11,val == "Wort","get the value via Setting")
      let litS = { __TRANSLATE:{chapter: {word: "Wort"}}}
      let set = new Setting(litS,"DialogWorker:getValueTest12",par)
      let valS = set.getValue("__TRANSLATE.chapter.word")
      _.bassert(12,valS == "Wort","get the value via Setting")
      }/**********************************************************************/{        
      let lit = {word: ["de","Wort"]}
      let loc = new LocalizationWorker(lit,"LocalizationWorker:getValueTest1",par)
      let val = loc.getValue("word")
      _.bassert(21,areEqual(val,"Wort"),"get the value via DialogWorker")
      let litS = { __TRANSLATE:{word: ["de","Wort"]}}
      let set = new Setting(litS,"LocalizationWorker:getValueTest12",par)
      let valS = set.getValue("__TRANSLATE.word")
      _.bassert(22,areEqual(valS,"Wort"),"get the value via Setting")
      }/**********************************************************************/{        
      let lit = { chapter: {word: ["de","Wort"]}}
      let loc = new LocalizationWorker(lit,"LocalizationWorker:getValueTest11",par)
      let val = loc.getValue("chapter.word")
      _.bassert(31,areEqual(val,"Wort"),"get the value via Setting")
      let litS = { __TRANSLATE:{chapter: {word: ["de","Wort"]}}}
      let set = new Setting(litS,"DialogWorker:getValueTest12",par)
      let valS = set.getValue("__TRANSLATE.chapter.word")
      _.bassert(32,areEqual(valS,"Wort"),"get the value via Setting")
      }/**********************************************************************/        
      let lit = { word: "Wort", 
                  coffee: ["de","Kaffee"],
                  tree: [["en","tree"],["fr","arbre"],["es","botavara"],["de","Baum"]],
                  notThere: ["some","use","less","words"],
                  noLang: [["some","1"],["use","2"],["less","3"],["words","4"]],
                }
      let loc = new LocalizationWorker(lit,"LocalizationWorker:getValueTest40",par)
      loc.defaultLang = "de" 
      let val1 = loc.getValue("word")
      let val2 = loc.getValue("coffee")
      let val3 = loc.getValue("tree")
      let val4 = loc.getValue("notThere")
      let val5 = loc.getValue("noLang")
      let expAnsw1 = "Wort"
      let expAnsw2 = "Kaffee"
      let expAnsw3 = "Baum"
      let expAnsw4 = "use"
      let expAnsw5 = "1"
      _.bassert(41,val1==expAnsw1,"no language given")
      _.bassert(42,val2==expAnsw2,"no language given")
      _.bassert(43,val3==expAnsw3,"no language given")
      _.bassert(44,val4==expAnsw4,"no language given")
      _.bassert(45,val5==expAnsw5,"no language given")
      val1 = loc.getValue("word","de")
      val2 = loc.getValue("coffee","de")
      val3 = loc.getValue("tree","de")
      val4 = loc.getValue("notThere","de")
      val5 = loc.getValue("noLang","de")
      expAnsw1 = "Wort"
      expAnsw2 = "de"
      expAnsw3 = "Baum"
      expAnsw4 = "de"
      expAnsw5 = "de"
      _.bassert(51,val1==expAnsw1,"de")
      _.bassert(52,val2==expAnsw2,"de")
      _.bassert(53,val3==expAnsw3,"de")
      _.bassert(54,val4==expAnsw4,"de")
      _.bassert(55,val5==expAnsw5,"de")

      val1 = loc.getValue("word","nl")
      val2 = loc.getValue("coffee","nl")
      val3 = loc.getValue("tree","nl")
      val4 = loc.getValue("notThere","nl")
      val5 = loc.getValue("noLang","nl")
      expAnsw1 = "Wort"
      expAnsw2 = "nl"
      expAnsw3 = "Baum"
      expAnsw4 = "nl"
      expAnsw5 = "nl"
      _.bassert(61,val1==expAnsw1,"language 'nl' not found")
      _.bassert(62,val2==expAnsw2,"language 'nl' not found")
      _.bassert(63,val3==expAnsw3,"language 'nl' not found")
      _.bassert(64,val4==expAnsw4,"language 'nl' not found")
      _.bassert(65,val5==expAnsw5,"language 'nl' not found")

      let litS = { __TRANSLATE:lit}
      let set = new Setting(litS,"DialogWorker:getValueTest12",par)
      val1 = set.getValue("__TRANSLATE.word","de")
      val2 = set.getValue("__TRANSLATE.coffee","de")
      val3 = set.getValue("__TRANSLATE.tree","de")
      val4 = set.getValue("__TRANSLATE.notThere","de")
      val5 = set.getValue("__TRANSLATE.noLang","de")
      expAnsw1 = "Wort"
      expAnsw2 = "de"
      expAnsw3 = "tree"
      expAnsw4 = "de"
      expAnsw5 = "de"
      _.bassert(71,val1==expAnsw1,"de")
      _.bassert(72,val2==expAnsw2,"de")
      _.bassert(73,val3==expAnsw3,"de")
      _.bassert(74,val4==expAnsw4,"de")
      _.bassert(75,val5==expAnsw5,"de")

      }/**********************************************************************/{        
      }

    function _tryConstruct(arg1, arg2,arg3) {
      new LocalizationWorker(arg1,arg2,arg3)
    }
  }
}
Setting.worker = LocalizationWorker
registeredTests.push(LocalizationWorker.test)
registeredExceptions.push(
  "new LocalizationWorker({},'goodName', undefined)",
  "new LocalizationWorker({},undefined, new Setting({},'parent'))"
)

class DialogWorker extends Setting {
  static #KEY = DIALOG_WORKER_KEY // "__DIALOG_SETTINGS"
  static #localType =  DIALOG_TYPE // "(Number|Boolean|Array.<Number>|Array.<Boolean>)"
  /**
   * Key which this worker will handle
   * @type {String}
   */
  static get workerKey() {
    return DialogWorker.#KEY
  }
  /**
   * @classdesc For note types
   * @extends Setting
   * @constructor
   * @description
   *
   * Creates a DialogWorker instance
   * @extends Setting
   * @param {Object} literal
   * @param {String} key
   * @param {Setting} parent
   */
  constructor(literal, key, parent) {
    parent.workersTypeForChildren = DialogWorker.#localType
    super(literal, key, parent)
    this.addGene(DialogWorker)
    // literal {(Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|Setting)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    this.throwIfUndefined(key, "key")
  }

  //prettier-ignore
  static test(outputObj) { // DialogWorker
    let _ = null
    if(_ = new TestSuite("DialogWorker", outputObj)) {
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.run(getValueTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "DialogWorker:constructorTest", un)
      let dlgMan0 = new DialogWorker({}, "DialogWorker:constructorTest1", new Setting({},"parent"))
      _.assert(1,_tryConstruct,{},"DialogWorker:cTest1",new Setting({},"parent"),"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"DialogWorker:cTest2",new Setting({},"parent"),"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"DialogWorker:cTest3",new Setting({},"parent"),"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","DialogWorker:cTest4",new Setting({},"parent"),"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"DialogWorker:cTest5",new Setting({},"parent"),"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,new Setting({},"parent"),"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,new Setting({},"parent"),"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},new Setting({},"parent"),"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,new Setting({},"parent"),"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),new Setting({},"parent"),"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"DialogWorker:cTest11",un,"should  not be created, undefined parent is not ok")
      _.shouldAssert(12,_tryConstruct,{},"DialogWorker:cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"DialogWorker:cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"DialogWorker:cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"DialogWorker:cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"DialogWorker:cTest16",null,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"DialogWorker:cTest16",b,"should not be be created, parent is BreadCrumbs")
      let dlgMan = new DialogWorker({},"DialogWorker:constructorTest101", new Setting({},"parent"))
      _.bassert(101,dlgMan instanceof Object,"'DialogWorker' has to be an instance of 'Object'")
      _.bassert(102,dlgMan instanceof BreadCrumbs,"'DialogWorker' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,dlgMan instanceof DialogWorker,"'DialogWorker' has to be an instance of 'DialogWorker'")
      _.bassert(104,dlgMan.constructor === DialogWorker,"the constructor property is not 'DialogWorker'")
    }
    function isATest() {
      // Object, Gene, GenePool, AEssence added for each AEssence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      // DialogWorker added for each DialogWorker instance
      let dlgMan1 = new DialogWorker({},"DialogWorker:NameIsATest",new Setting({},"parent"))
      _.bassert(1,dlgMan1.isA(dlgMan1,"object"), "'" + dlgMan1 + "' should be a " + "object")
      _.bassert(2,dlgMan1.isA(dlgMan1,Object), "'" + dlgMan1 + "' should be a " + "Object")
      _.bassert(3,dlgMan1.isA(dlgMan1,BreadCrumbs), "'" + dlgMan1 + "' should be a " + "BreadCrumbs")
      _.bassert(4,dlgMan1.isA(dlgMan1,Setting), "'" + dlgMan1 + "' should be a " + "Setting")
      _.bassert(5,dlgMan1.isA(dlgMan1,DialogWorker), "'" + dlgMan1 + "' should be a " + "DialogWorker")
      _.bassert(6,!dlgMan1.isA(dlgMan1,Error), "'" + dlgMan1 + "' should not be a " + "Error")
      _.bassert(7,!dlgMan1.isA(dlgMan1,Gene), "'" + dlgMan1 + "' should not be a " + "Gene")
    }
    function toStringTest() {
      let dlgMan1 = new DialogWorker({},"DlgWrk:toStringTest1",new Setting({},"parent"))
      _.bassert(1,dlgMan1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,dlgMan1.toString().includes("DialogWorker"),"result does not contain class string"    )
    }
    function getValueTest() {
      let par = new Setting({},"DialogWorker:getValueTest:parent")
      /**********************************************************************/{        
      let lit = {pos:22}
      let dlg = new DialogWorker(lit,"DialogWorker:getValueTest1",par)
      let val = dlg.getValue("pos")
      _.bassert(1,val == 22,"get the value via DialogWorker")
      let litS = { __DIALOG_SETTINGS:{pos:22}}
      let set = new Setting(litS,"DialogWorker:getValueTest12",par)
      let valS = set.getValue("__DIALOG_SETTINGS.pos")
      _.bassert(2,valS == 22,"get the value via Setting")
      }/**********************************************************************/{        
      let lit = { line: {pos:22}}
      let dlg = new DialogWorker(lit,"DialogWorker:getValueTest11",par)
      let val = dlg.getValue("line.pos")
      _.bassert(11,val == 22,"get the value via Setting")
      let litS = { __DIALOG_SETTINGS:{line: {pos:22}}}
      let set = new Setting(litS,"DialogWorker:getValueTest12",par)
      let valS = set.getValue("__DIALOG_SETTINGS.line.pos")
      _.bassert(12,valS == 22,"get the value via Setting")
      }/**********************************************************************/{        
      let lit = {pos:[22,14]}
      let dlg = new DialogWorker(lit,"DialogWorker:getValueTest1",par)
      let val = dlg.getValue("pos")
      _.bassert(21,areEqual(val,[22,14]),"get the value via DialogWorker")
      let litS = { __DIALOG_SETTINGS:{pos:[22,14]}}
      let set = new Setting(litS,"DialogWorker:getValueTest12",par)
      let valS = set.getValue("__DIALOG_SETTINGS.pos")
      _.bassert(22,areEqual(valS,[22,14]),"get the value via Setting")
      }/**********************************************************************/{        
      let lit = { line: {pos:[22,14]}}
      let dlg = new DialogWorker(lit,"DialogWorker:getValueTest11",par)
      let val = dlg.getValue("line.pos")
      _.bassert(31,areEqual(val,[22,14]),"get the value via Setting")
      let litS = { __DIALOG_SETTINGS:{line: {pos:[22,14]}}}
      let set = new Setting(litS,"DialogWorker:getValueTest12",par)
      let valS = set.getValue("__DIALOG_SETTINGS.line.pos")
      _.bassert(32,areEqual(valS,[22,14]),"get the value via Setting")
      }/**********************************************************************/{        
      }/**********************************************************************/         
    }

    function _tryConstruct(arg1, arg2,arg3) {
      new DialogWorker(arg1,arg2,arg3)
    }
  }
}
Setting.worker = DialogWorker
registeredTests.push(DialogWorker.test)
registeredExceptions.push(
  "new DialogWorker({},'goodName', undefined)",
  "new DialogWorker({},undefined, new Setting({},'parent'))"
)

class TypesWorker extends Setting {
  static #KEY = TYPES_WORKER_KEY // "__NOTE_TYPES"
  static #localType = TYPES_TYPE  // "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>|Function)"
  /** Key which this worker will handle
   * @type {String}
   */
  static get workerKey() {
    return TypesWorker.#KEY
  }

  /**
   * @classdesc For note types
   * @extends Setting
   * @constructor
   * @description
   * Creates a TypesWorker instance
   * @param {Object} literal
   * @param {String} key
   * @param {Setting} parent
   */
  constructor(literal, key, parent) {
    if (LOG_ESSENCE_CONSTRUCTOR_2_CONSOLE) {
      let name_x =
        key === undefined
          ? "undefined"
          : typeof key == "symbol"
          ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
          : key
      let literal_x =
        literal === undefined
          ? "undefined"
          : literal === null
          ? "Null"
          : false
          ? JSON.stringify(literal, null, 4)
          : flatten(literal)
      let specLit_x =
        literal != undefined ? flatten(literal[AEssence.SPEC_KEY]) : "undefined"
      if (parent == undefined)
        aut(
          `========================================================================================`,
          pink
        )
      aut(
        `========================================================================================`,
        pink
      )
      aut(
        `START TypesWorker ======  ${name_x}  =======\n   SPEC: ${specLit_x}\n   Literal :${literal_x}`,
        pink
      )
    }
    parent.workersTypeForChildren = TypesWorker.#localType
    TypesWorker.#cpRepeatedDefaults(literal)
    super(literal, key, parent)
    this.addGene(TypesWorker)
    // literal {(Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|Setting)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    this.throwIfUndefined(key, "key")
    if (LOG_ESSENCE_CONSTRUCTOR_2_CONSOLE) {
      let name_x =
        this.name === undefined
          ? "undefined"
          : typeof this.name == "symbol"
          ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
          : this.name
      let literal_x =
        this.literal === undefined
          ? "undefined"
          : this.literal === null
          ? "Null"
          : false
          ? JSON.stringify(this.literal, null, 4)
          : flatten(this.literal)
      let specLit_x =
        this.literal != undefined
          ? flatten(this.literal[AEssence.SPEC_KEY])
          : "undefined"
      aut(
        `   SPEC: ${specLit_x}\n   Literal :${literal_x}\nENDE TypesWorker ===\
===  ${name_x}  =========================================================`,
        pink
      )
    }
  }
  static #cpRepeatedDefaults(literal) {
    if (typeof literal != "object" || literal == null) return
    let spec = literal[AEssence.SPEC_KEY]
    if (typeof spec != "object" || spec == null) return
    let defaults
    let defaultskey
    for (const [key, value] of Object.entries(literal)) {
      if(value[AEssence.SPEC_KEY] != undefined &&
        value[AEssence.SPEC_KEY].REPEAT == true &&
        value[AEssence.SPEC_KEY].IGNORE != true ) {
        defaults = value
        defaultskey = key
        value[AEssence.SPEC_KEY].REPEAT = undefined
        break;
      }
    }
    if (defaults != undefined) {
      for (const [key, value] of Object.entries(literal)) {
        if (key == AEssence.SPEC_KEY || key == defaultskey) continue
        for (const [defkey, defvalue] of Object.entries(defaults)) {
          TypesWorker.#deepCopy(defvalue, value, defkey, key,0)
        }
      }
      delete literal[defaultskey]
    }
  }
  static #deepCopy(what, to, name, toname, depth) {
    if(depth > 5) return
    if(typeof what != "object") {
      if(to[name] === undefined) {
        to[name] = what
      }
    } else if(typeof what[AEssence.SPEC_KEY] == "boolean") {
      if(to[name] === undefined) {
        to[name] = {}
        let defaultval
        for (const [newkey, newvalue] of Object.entries(what)) {
          to[name][newkey]=newvalue
          if(newkey === "DEFAULT") {
            defaultval = newvalue
          }
        }
        if(to[name]["VALUE"] === undefined) {
          to[name]["VALUE"]=defaultval
        }
        to[name][AEssence.SPEC_KEY]=true
      }
    } else {
      if(to[name] === undefined) {
        to[name] = {}
      }
      for (const [whatkey, whatvalue] of Object.entries(what)) {
        TypesWorker.#deepCopy(whatvalue, to[name], whatkey, name,depth+1)
      }
  }
  }
  /**
   * Returns value of {@link key} or {@link fallback} as caller fallback
   * or undefined if none of them is found
   * <p>
   * @param {String} key
   * @param  {...any} fallback
   * @returns {...any}
   */
  getValue(key, fallback) {
    let atom = this.at(key)
    let value
    if( atom !== undefined) {
      value = atom.VALUE
    } else {
      value = fallback
    }        
    return value
  }
    
  //prettier-ignore
  static test(outputObj) { // TypesWorker
    let _ = null
    if(_ = new TestSuite("TypesWorker", outputObj)) {
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.run(getValueTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "TypesWorker:constructorTest", un)
      let typesMan0 = new TypesWorker({}, "TypesWorker:constructorTest1", new Setting({},"parent"))
      _.assert(1,_tryConstruct,{},"TypesWorker:cTest1",new Setting({},"parent"),"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"TypesWorker:cTest2",new Setting({},"parent"),"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"TypesWorker:cTest3",new Setting({},"parent"),"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","TypesWorker:cTest4",new Setting({},"parent"),"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"TypesWorker:cTest5",new Setting({},"parent"),"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,new Setting({},"parent"),"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,new Setting({},"parent"),"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},new Setting({},"parent"),"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,new Setting({},"parent"),"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),new Setting({},"parent"),"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"TypesWorker:cTest11",un,"should  not be created, undefined parent is not ok")
      _.shouldAssert(12,_tryConstruct,{},"TypesWorker:cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"TypesWorker:cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"TypesWorker:cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"TypesWorker:cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"TypesWorker:cTest16",null,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"TypesWorker:cTest16",b,"should not be be created, parent is BreadCrumbs")
      let typesMan = new TypesWorker({},"TypesWorker:constructorTest101", new Setting({},"parent"))
      _.bassert(101,typesMan instanceof Object,"'TypesWorker' has to be an instance of 'Object'")
      _.bassert(102,typesMan instanceof BreadCrumbs,"'TypesWorker' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,typesMan instanceof TypesWorker,"'TypesWorker' has to be an instance of 'TypesWorker'")
      _.bassert(104,typesMan.constructor === TypesWorker,"the constructor property is not 'TypesWorker'")
    }
    function isATest() {
      // Object, Gene, GenePool, AEssence added for each AEssence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      // TypesWorker added for each TypesWorker instance
      let typesMan1 = new TypesWorker({},"TypesWorker:NameIsATest",new Setting({},"parent"))
      _.bassert(1,typesMan1.isA(typesMan1,"object"), "'" + typesMan1 + "' should be a " + "object")
      _.bassert(2,typesMan1.isA(typesMan1,Object), "'" + typesMan1 + "' should be a " + "Object")
      _.bassert(3,typesMan1.isA(typesMan1,BreadCrumbs), "'" + typesMan1 + "' should be a " + "BreadCrumbs")
      _.bassert(4,typesMan1.isA(typesMan1,Setting), "'" + typesMan1 + "' should be a " + "Setting")
      _.bassert(5,typesMan1.isA(typesMan1,TypesWorker), "'" + typesMan1 + "' should be a " + "TypesWorker")
      _.bassert(6,!typesMan1.isA(typesMan1,Error), "'" + typesMan1 + "' should not be a " + "Error")
      _.bassert(7,!typesMan1.isA(typesMan1,Gene), "'" + typesMan1 + "' should not be a " + "Gene")
    }
    function toStringTest() {
      let typesMan1 = new TypesWorker({},"TypMan:toStringTest1",new Setting({},"parent"))
      _.bassert(1,typesMan1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,typesMan1.toString().includes("TypesWorker"),"result does not contain class string"    )
    }
    function getValueTest() {
      let par = new Setting({},"TypesWorker:getValueTest:parent")
      /**********************************************************************/{        
      let lit = { __SPEC: {REPEAT: true, },  section: {pos:22}}
      let typ = new TypesWorker(lit,"TypesWorker:getValueTest1",par)
      let val = typ.getValue("section.pos")
      _.bassert(1,val == 22,"get the value via TypesWorker")
      let litS = { __NOTE_TYPES:{__SPEC: {REPEAT: true, },  section: {pos:22}}}
      let set = new Setting(litS,"TypesWorker:getValueTest12",par)
      let valS = set.getValue("__NOTE_TYPES.section.pos")
      _.bassert(2,valS == 22,"get the value via Setting")
      }/**********************************************************************/{        
      let lit = { __SPEC: {REPEAT: true, },  section: {line: {pos:22}}}
      let typ = new TypesWorker(lit,"TypesWorker:getValueTest11",par)
      let val = typ.getValue("section.line.pos")
      _.bassert(11,val == 22,"get the value via Setting")
      let litS = { __NOTE_TYPES:{__SPEC: {REPEAT: true, },  section: {line: {pos:22}}}}
      let set = new Setting(litS,"TypesWorker:getValueTest12",par)
      let valS = set.getValue("__NOTE_TYPES.section.line.pos")
      _.bassert(12,valS == 22,"get the value via Setting")
      }/**********************************************************************/{        
      let lit = { __SPEC: {REPEAT: true, },  section: {pos:[22,14]}}
      let typ = new TypesWorker(lit,"TypesWorker:getValueTest1",par)
      let val = typ.getValue("section.pos")
      _.bassert(21,areEqual(val,[22,14]),"get the value via TypesWorker")
      let litS = { __NOTE_TYPES:{__SPEC: {REPEAT: true, },  section: {pos:[22,14]}}}
      let set = new Setting(litS,"TypesWorker:getValueTest12",par)
      let valS = set.getValue("__NOTE_TYPES.section.pos")
      _.bassert(22,areEqual(valS,[22,14]),"get the value via Setting")
      }/**********************************************************************/{        
      let lit = { __SPEC: {REPEAT: true, },  section: {line: {pos:[22,14]}}}
      let typ = new TypesWorker(lit,"TypesWorker:getValueTest11",par)
      let val = typ.getValue("section.line.pos")
      _.bassert(31,areEqual(val,[22,14]),"get the value via Setting")
      let litS = { __NOTE_TYPES:{__SPEC: {REPEAT: true, },  section: {line: {pos:[22,14]}}}}
      let set = new Setting(litS,"TypesWorker:getValueTest12",par)
      let valS = set.getValue("__NOTE_TYPES.section.line.pos")
      _.bassert(32,areEqual(valS,[22,14]),"get the value via Setting")
      }/**********************************************************************/         
    }

    function _tryConstruct(arg1, arg2,arg3) {
      new TypesWorker(arg1,arg2,arg3)
    }
  }
}
Setting.worker = TypesWorker
registeredTests.push(TypesWorker.test)
registeredExceptions.push(
  "new TypesWorker({},'goodName', undefined)",
  "new TypesWorker({},undefined, new Setting({},'parent'))"
)
//  #endregion workers
//#endregion central code classes
//#region Templater
/**
 * @classdesc Error used for User cancelling
 * @extends external:Error
 */
class DialogError extends Error {
  constructor(message, ...params) {
    super(message, ...params)
    this.name = "DialogError"
  }
  toString() {
    return " °°" + this.constructor.name + " " + this.name
  }
}

class Templater {
  #tp
  #app
  #gen //general cfg     // LANGUAGE RELATIVE_PATH
  #loc //translation cfg // TITLE_NEW_FILE TYPE_PROMPT NAME_PROMPT
  #dlg //dlg cfg         // TYPE_MAX_ENTRIES
  #typ //notetyps cfg    // DEFAULT


  #cfgname // current notes type name  - only set after done some work
  #cfg //current notes type cfg - only set after done some work
    // IGNORE (für alle Typen abgefragt)
    // "folders" (für alle Typen abgefragt)
    // "marker" (für alle Typen abgefragt)
    // "name_end"
    // "title_function"
    // "name_prompt"
    // create_same_named_file

  #isNew=false
  #filetitle // Name of file (with marker and name_end)
  #notename  // Name of note (without marker and name_end)
  
  get notetype() {return this.#cfgname}

  constructor(setting, tp, app) {
    this.#tp = tp
    this.#app = app
    this.#gen = setting.at(GENERAL_WORKER_KEY)
    this.#loc = setting.at(LOCALIZATION_WORKER_KEY)
    this.#dlg = setting.at(DIALOG_WORKER_KEY)
    this.#typ = setting.at(TYPES_WORKER_KEY)

    this.#filetitle = this.#tp.file.title
  }

  async doTheWork() {
    try {
      this.#checkIsNewNote()
      await this.#findType()
      await this.#findName()
      await this.#rename()
    } catch(e) {
      throw e
    }
  }
  setValues(vals) {
    for (let [key, value] of Object.entries(vals)) {
      if(typeof value == "function") {
        vals[key]=value(this.#tp, this.#notename, this.#cfgname, this.#cfg, this.#app)
      }
    }
  
  }
  #checkIsNewNote() {
    let answer = false
    let lang_array = [FALLBACK_LANGUAGE]
    let new_titles_array = []
    let lang = this.#gen.getValue("LANGUAGE", FALLBACK_LANGUAGE)
    if(0 != lang.localeCompare(FALLBACK_LANGUAGE)) {
      lang_array.push(lang)
    }
    lang_array.forEach((lang) => {     
      let title = this.#loc.getValue("TITLE_NEW_FILE","", lang)
      if(title.length > 0) {
        new_titles_array.push(title)
      }
    })
    new_titles_array.some(prefix => { 
      this.#isNew = this.#filetitle.startsWith(prefix) ? true : false
      return this.#isNew
    });
  } 
  async #findType() {
    let types_f = []
    let types_m = []
    let types_wrong_folder = []
    function typesFromFolder(me) {
      let relative = me.#gen.getValue("RELATIVE_PATH", true)
      let path_relative = me.#tp.file.path(true)
      let path_absolute = me.#tp.file.path(false)
      let noteWithPath = relative ? path_relative : path_absolute
      let folderParts = noteWithPath.split("\\")
      if(folderParts.length < 2) {
        folderParts = noteWithPath.split("/")
      }
      folderParts.pop()
 
      for (const [key, value] of me.#typ) {
        let folders = me.#typ.getValue(key+".folders")
        if(folders == undefined) continue
        if(typeof folders == "string") {
          let f = folders[0]
          folders = [f]
        }
        let answer = folderParts.some(part => {
          return folders.some(folder => {
            if(0 == part.localeCompare(folder)) {
              return true
            }
          })
        })
        if(answer == true) {
          types_f.push(key)
        } else {
          types_wrong_folder.push(key)
        }     
      }
    }
    function typesFromMarker(me) {
      let type = undefined;
      let noMarker  = [];
      let markerlen = 0;
      let typelen = 0;
    
      for (const [key, value] of me.#typ) {
        if(value.IGNORE) continue
        if(types_f.length > 0 && !types_f.includes(key)) 
          continue;
        if(types_wrong_folder.length > 0 && types_wrong_folder.includes(key)) 
          continue;
        let marker = me.#typ.getValue(key+".marker")
        markerlen = marker === undefined ? 0 : marker.length
        if(marker.length==0) {
          noMarker.push(key);
        } else {
          markerlen = marker.length
          if(me.#filetitle.startsWith(marker)) {
            if(markerlen > typelen) {
              typelen = markerlen;
              type = key;
            }
          }
        }
      }
      if(type != undefined) { 
        types_m.push(type)
      } else {
        types_m = [...noMarker];
      }
    }
    function defaultTypeName(me) {
      let defaulttypename = me.#typ.DEFAULT
      if(defaulttypename == undefined) {
        for (const [key, value] of me.#typ) {
          if(value.IGNORE) continue
          defaulttypename = key
          break
        }
      }
      if(defaulttypename == undefined) {
        defaulttypename = "note"
      }
      return defaulttypename
    }
    let defaulttypename = defaultTypeName(this)
    typesFromFolder(this)
    if(!this.#isNew) {
      typesFromMarker(this)
    }  
    let TYPE_PROMPT = this.#loc.getValue("TYPE_PROMPT", "Choose Type")
    let type_max_entries = this.#dlg.getValue("TYPE_MAX_ENTRIES", 10)
    try {
      if(types_m.length > 1) {
        this.#cfgname = await this.#tp.system.suggester(types_m, 
          types_m, true, TYPE_PROMPT, type_max_entries);
      } else if(types_f.length > 1) {
        this.#cfgname = await this.#tp.system.suggester(types_f, 
          types_f, true, TYPE_PROMPT, type_max_entries);
      } else { 
        this.#cfgname = types_m.length > 0 ? types_m[0] : 
          types_f.length > 0 ? types_f[0] : defaulttypename
      }
    } catch(e) {
      throw new DialogError("Choose Value Dialog cancelled")
    }
    this.#cfg = this.#typ.at(this.#cfgname)    
  }
  async #findName(){
    this.#notename = ""
    if(!this.#isNew) {
      let marker = this.#cfg.getValue("marker", "")
      this.#notename = this.#filetitle.substring(marker.length)
    } else {
      let fu = this.#cfg.getValue("title_function", undefined)
      if(typeof fu == "function") {
        this.#notename = fu(this.#tp, this.#notename, this.#cfgname, this.#cfg, this.#app)
      }
    }
    if(this.#notename == "") {
      let defprompt = this.#loc.getValue("NAME_PROMPT", "Pure Name of Note")
      let prompt = this.#cfg.getValue("name_prompt")
      if(prompt == undefined || prompt.length==0) {
        prompt = defprompt
      }
      try {
        this.#notename= await this.#tp.system.prompt(prompt,"",true)
      } catch(e) {
        throw new DialogError("Choose Notename Dialog cancelled");
      }
    }     
  }
  async #rename(){
    function purepath (value) {  
      let delimiter = "/"
      let substrings = value.split(delimiter)
      if(substrings.length < 2) {
        delimiter ="\\"
        substrings = value.split(delimiter)
      }
      return substrings.length === 1
        ? ""
        : substrings.slice(0,-1).join(delimiter)+delimiter
    }

    try {
      if(this.#notename.length > 0) {
        let marker = this.#cfg.getValue("marker", "")
        let name_end = this.#cfg.getValue("name_end", "")
        let newname = marker + this.#notename + name_end
        let path = purepath(this.#tp.file.path(true))
        let purenewname = String(newname)
        let num=0
        if(await this.#tp.file.exists(path+newname+".md")) {
          let create_dupl = this.#cfg.getValue("create_same_named_file", false)
          if(create_dupl == true) {
            while(await this.#tp.file.exists(path+newname+".md")) {
              newname = purenewname + " " + ++num
            }
          }
        }
        await(this.#tp.file.rename(newname))
      }
    } catch(e) {
      this.#tp.system.prompt("Renaming not possible or supported",
        "ABORT\n\
        Renaming not possible or supported in this folder\n\
        Press ESCAPE or any key",false,true)
      throw new DialogError("Renaming not possible or supported");
    }
  }
}
//#endregion Templater 
/** exported function.
 * <p>
 * Name does not matter for templater, but if named 'main' interferes with jsdoc.
 * @param {Object} tp - templater object
 * @param {Object} app - obsidian api object
 * @returns {Object}
 */
async function foty(tp, app) {
  let checkErrorOutputYAML = {}
  let testYAML = {}
  let frontmatterYAML = {}
  let renderYAML = {____: ""}
  let dbgYAML = {}
  if (CHECK_ERROR_OUTPUT) {
    letAllThrow(checkErrorOutputYAML)
    return checkErrorOutputYAML
  }
  test(testYAML)
  try {
    let lit = user_configuration
    let setting = new Setting(lit, undefined, undefined, tp)
    let templ = new Templater(setting, tp, app)
    await templ.doTheWork()
    let notetype = templ.notetype
    let noteCfg = setting.at("__NOTE_TYPES."+notetype)
    //setting.showWhatGoesOut(0)
    //noteCfg.showWhatGoesOut(0)
    //noteCfg.showVALUES(0)

    frontmatterYAML = setting.getFrontmatterYAML()
    Object.assign(frontmatterYAML, noteCfg.getFrontmatterYAML())
    Object.assign(renderYAML, setting.getRenderYAML(), noteCfg.getRenderYAML())
    templ.setValues(frontmatterYAML)
    templ.setValues(renderYAML)
  } catch (e) {
    if (e instanceof FotyError) {
      let errYAML = {}
      e.errOut(errYAML)
      return errYAML
    } else if( e instanceof DialogError) {
      return {CANCELLED: true}
    } else {
      aut("RETHROWING")
      throw e
    }
  }

  dbgYAML = {
    __notePath: tp.file.path(true /*relative*/),
    __noteTitle: tp.file.title,
    __activeFile: tp.config.active_file.path,
    /* 1-create with alt-e
     * 2-create from link or create with ctrl-n
     */
    __runMode: tp.config.run_mode,
    __targetFile: tp.config.target_file.path,
    __templateFile: tp.config.template_file.path,
    __frontmatter: flatten(tp.frontmatter),
  }

  if (!DEBUG) dbgYAML = undefined
  return Object.assign({}, frontmatterYAML, dbgYAML, testYAML, renderYAML)
}
const lit1 = {__SPEC: {RENDER: true}, a: 23}

