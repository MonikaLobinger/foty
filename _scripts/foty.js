module.exports = foty // templater call: "await tp.user.foty(tp, app)"
/**
 * @description
 * Script for obsidian, templater extension needed
 * Creates new notes with frontmatter and text skeleton based on note types
 *<p>
 * Basics<br>
 * ======<br>
 * Obsidian creates a new note as empty note.
 * Notes of given kinds have some text in it in common. This text can be
 * inserted automatically with a template. One has to write the templates
 * for the kinds of notes one uses, choose the correct one on new note
 * creation and the skeleton will be inserted.
 * Code can also be written in javascript in case templater extension is
 * installed. This can be done within the template in specific code sections.
 * With templater parts of javascript code can be written in javascript files
 * which each export a function. This function can be called from within the
 * code section.
 *<p>
 * Problem description<br>
 * ===================<br>
 * For each kind of note another template is needed. If needs change, the
 * template has to be changed. If general needs change, all templates have
 * to be changed. Elaborated Templates are difficult to maintain. Not all
 * users of obsidian can write javascript.
 *<p>
 * Intention of foty<br>
 * =================<br>
 * Let user needs be configurable and write a full note skeleton from given
 * configuration.
 * For changing needs only configuration should have to be changed.
 *<p>
 * Presumptions<br>
 * ============<br>
 * Note skeleton will contain a frontmatter header and a rendered part.
 * Frontmatter header has frontmatter entries. Rendered part has plain text
 * and text based on variable output, e.g. date or links to resources.
 *<p>
 * On new unnamed note creation note name will be created. Some kinds of
 * notes have a marker in its names, which do not belong to the semantic
 * title.
 *<p>
 * This all has to be configurable based on kind of note. Different kinds
 * of notes in foty are called 'types'. The configuration of a type should
 * lead to expected output, after foty has identified the type and the
 * (semantic) title.
 *<p>
 * Note types can be bound to folders.
 *<p>
 * Realization<br>
 * ===========<br>
 * foty consists of two parts: This javascript file and the template file,
 * which calls this script.
 *<p>
 * The script will return a list of key/value entries. One of the keys
 * is '____'. Before this key all entries are frontmatter entries, entries
 * after this keys are variables to be used in render part.
 *<p>
 * The template will write out all frontmatter entries in notes frontmatter
 * header section. Then it will write the render section depending on
 * variables.
 *<p>
 * Connection between script and template is tight, the template has to know
 * the names of the variables.
 *<p>
 * One could have realized it the way, that all the output is created from
 * script file, but than changes in rendering only would require javascript
 * editing.
 *<p>
 * Usage<br>
 * =====<br>
 * Different parts of codes are in different regions.
 * A region starts with //#region REGION_NAME or //# REGION_NAME
 * and it ends with //#endregion REGION_NAME or //#endregion REGION_NAME
 * Regions can be nested.
 * Using Visual Studio Code (and perhaps other source code editors) regions
 * marked this way can be folded for convenience.
 *<p>
 * Some settings for the script can be adapted to user needs. Those are in
 * region USER CONFIGURATION.
 */
//#region CONFIGURATION
// This region simulates a configuration dialog
// It contains a configuration defining section, which user would never
// see in a configuration dialog, so it is named DO_NOT_TOUCH.
// And it contains the value section, which user can edit, so it is
// named USER CONFIGURATION.
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Only make changes in region USER CONFIGURATION
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  #region DO_NOT_TOUCH
/**@ignore */
function aliasCbk(tp, noteName, type) {
  let alias = noteName
  if (type != "ort" && type != "person") {
    alias = noteName.replace(/,/g, ` `).replace(/  /g, ` `)
  } else {
    // ort, person
    alias = noteName.replace(/, /g, `,`)
    let strArr = alias.split(",")
    alias = strArr[0]
    strArr.shift()
    if (type == "ort") {
      alias += "(" + strArr.join(" ") + ")"
    } else if (type == "person") {
      alias = strArr.join(" ") + " " + alias
    }
  }
  return alias
}
function tagsCbk(tp, noteName, type) {
  return "0/" + type
}
function createdCbk(tp, noteName, type) {
  return tp.date.now()
}
function cssClassCbk(tp, noteName, type) {
  return type
}
//  #endregion DO_NOT_TOUCH
//  #region USER CONFIGURATION
//  #endregion USER CONFIGURATION
//  #region test configurations
/**
 * Defaults
 * __DIALOG_SETTINGS: ONCE: true,
 * __NOTE_TYPES: ONCE: true, REPEAT: true
 * __FOLDER2TYPE: ONCE: true, REPEAT: true
 *
 * __SPEC:
 *  ROOT: -- false | (set automatically correct)
 *  RENDER: -- false | (inherited)
 *  TYPE: -- "String" | (individual)
 *  DEFAULT: -- "" | (individual)
 *  IGNORE: -- false | (inherited)(It is possible to IGNORE ancestors, but not descendants)
 *  FLAT : -- false | (values are not parsed, even if they are objects)
 *  ONCE: -- false | (if true, has to be the outermost possible)
 *  REPEAT: -- false | (individual) (same entryType can be added several times under diff. keys)
 *  DEFAULTS: -- object | (individual)(makes only sense for REPEAT: sections)
 * @ignore
 */
//prettier-ignore
const vTest = {ROOT:true, __:"...",
  __DIALOG_SETTINGS: {ONCE:true, __:"...",
    TYPE_PROMPT: {TYPE:"String",DEFAULT:"Typ wählen", __:"...",},
    TYPE_MAX_ENTRIES: {TYPE:"Number",DEFAULT:10, __:"...",},
    TITLE_NEW_FILE: {TYPE:"(String|Array.<String>)",DEFAULT:["Unbenannt", "Untitled"], __:"...",},
  },
  __NOTE_TYPES: {ONCE:true,REPEAT:true, __:"...",
    DEFAULTS: {
      MARKER: {TYPE:"String",DEFAULT:"", __:"...",},
      DATE: {TYPE:"Boolean",DEFAULT:false, __:"...",},
      TITLE_BEFORE_DATE: {TYPE:"String",DEFAULT:"", __:"...",},
      DATEFORMAT: {TYPE:"Date",DEFAULT:"YY-MM-DD", __:"...",},
      FRONTMATTER: {
        aliases: {TYPE: "Array", DEFAULT: aliasCbk},
        date_created: {TYPE: "Date", DEFAULT: createdCbk},
        tags: {TYPE: "Array", DEFAULT: tagsCbk},
        publish: {TYPE: "Boolean", DEFAULT: false},
        cssclass: {TYPE: "Array", DEFAULT: cssClassCbk},
        private: {TYPE: "Boolean", DEFAULT: false},
        position: {IGNORE: true},
      },
      language: {IGNORE:true, __:"...",},
    },
    diary: {
      DATE: true,
      DATEFORMAT: "YYYY-MM-DD",
      FRONTMATTER: {private: true},
      language: "Portuguese", /* will be ignored */
    },
    citation: {
      MARKER: "°",
      FRONTMATTER: {cssclass: "garten, tagebuch"},
    },
  },
__FOLDER2TYPE: {ONCE:true,REPEAT:true, __:"...",
    DEFAULTS: {TYPE:"(String|Array.<String>)", __:"...",
    },
    test: "diary",
    "/": ["citation", "diary"],
  },
  c: {RENDER: true,TYPE:"", __: "...",
    pict: "ja",
    d: {RENDER: false, __: "...",
      d: {RENDER: false/*inherited*/, __: "...", 
        gloria: "halleluja",
      },
    },
  },
}
//prettier-ignore
const wTest = {
  __DIALOG_SETTINGS: {__SPEC: {__ONCE:true},
    TYPE_PROMPT: {TYPE:"String",DEFAULT:"Typ wählen", __:"...",},
    TYPE_MAX_ENTRIES: {TYPE:"Number",DEFAULT:10, __:"...",},
    TITLE_NEW_FILE: {TYPE:"(String|Array.<String>)",DEFAULT:["Unbenannt", "Untitled"], __:"...",},
  },
  __NOTE_TYPES: {ONCE:true,REPEAT:true, __:"...",
    DEFAULTS: {
      MARKER: {TYPE:"String",DEFAULT:"", __:"...",},
      DATE: {TYPE:"Boolean",DEFAULT:false, __:"...",},
      TITLE_BEFORE_DATE: {TYPE:"String",DEFAULT:"", __:"...",},
      DATEFORMAT: {TYPE:"Date",DEFAULT:"YY-MM-DD", __:"...",},
      FRONTMATTER: {
        aliases: {TYPE: "Array", DEFAULT: aliasCbk},
        date_created: {TYPE: "Date", DEFAULT: createdCbk},
        tags: {TYPE: "Array", DEFAULT: tagsCbk},
        publish: {TYPE: "Boolean", DEFAULT: false},
        cssclass: {TYPE: "Array", DEFAULT: cssClassCbk},
        private: {TYPE: "Boolean", DEFAULT: false},
        position: {IGNORE: true},
      },
      language: {IGNORE:true, __:"...",},
    },
    diary: {
      DATE: true,
      DATEFORMAT: "YYYY-MM-DD",
      FRONTMATTER: {private: true},
      language: "Portuguese", /* will be ignored */
    },
    citation: {
      MARKER: "°",
      FRONTMATTER: {cssclass: "garten, tagebuch"},
    },
  },
__FOLDER2TYPE: {ONCE:true,REPEAT:true, __:"...",
    DEFAULTS: {TYPE:"(String|Array.<String>)", __:"...",
    },
    test: "diary",
    "/": ["citation", "diary"],
  },
  c: {RENDER: true,TYPE:"", __: "...",
    pict: "ja",
    d: {RENDER: false, __: "...",
      d: {RENDER: false/*inherited*/, __: "...", 
        gloria: "halleluja",
      },
    },
  },
}
const xTest = {
  __DIALOG_SETTINGS: {
    TYPE_PROMPT: "Typ wählen" /* String */,
    TYPE_MAX_ENTRIES: 10 /* Number */, // Max entries in "type" drop down list
    TITLE_NEW_FILE: ["Unbenannt", "Untitled"] /* String or Array of Strings */,
  },
  __FOLDER2TYPE: {
    /* Values are  String or Array of Strings */ test: "diary",
    "/": ["citation", "diary"],
  },
  __NOTE_TYPES: {
    __DEFAULTS: {
      // Overwrites the hardcoded defaults
      /* String */ MARKER: "",
      /* Boolean */ DATE: false,
      /* String */ TITLE_BEFORE_DATE: "",
      /* Date */ DATEFORMAT: "YY-MM-DD",
      /* @todo */ FRONTMATTER: {
        aliases: {__SPEC: {TYPE: "Array", DEFAULT: aliasCbk}},
        date_created: {__SPEC: {TYPE: "Date", DEFAULT: createdCbk}},
        tags: {__SPEC: {TYPE: "Array", DEFAULT: tagsCbk}},
        publish: {__SPEC: {TYPE: "Boolean", DEFAULT: false}},
        cssclass: {__SPEC: {TYPE: "Array", DEFAULT: cssClassCbk}},
        private: {__SPEC: {TYPE: "Boolean", DEFAULT: false}},
        position: {__SPEC: {IGNORE: true}},
      },
    },
    diary: {
      MARKER: "",
      DATE: true,
      TITLE_BEFORE_DATE: "",
      DATEFORMAT: "YYYY-MM-DD",
      FRONTMATTER: {private: true},
    },
    citation: {
      MARKER: "°",
      FRONTMATTER: {cssclass: "garten, tagebuch"},
    },
  },
  c: {
    __SPEC: {RENDER: /* Boolean */ true},
    pict: "ja",
    d: {
      __SPEC: {RENDER: false},
      d: {
        gloria: "halleluja",
      },
    },
  },
}
const yTest = {
  audio: {marker: "{a}", pict: "a.jpg", frontmatter: {private: true}},
  plant: {frontmatter: {kind: "", seed: ""}},
}
//  #endregion test configurations
//#endregion CONFIGURATION
//#region globals and externals
/**
 * The built in Error object.
 * @external Error
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error|Error}
 */

/** Dialog return codes for functions which call dialogs.
 * <p>
 * The templater dialogs do return the value given by user or
 * not the value, on Cancel
 * <p>
 * Functions may return a Dialog code as status and the value on other ways
 */
const Dialog = {
  Ok: "Ok",
  Cancel: "Cancel",
}

/** Color, to be used without quotation marks during development. */
const black = "black"
/** Color, to be used without quotation marks during development. */
const cyan = "cyan"
/** Color, to be used without quotation marks during development. */
const red = "orange"
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

/** Returns string of {@link inp} attribute key value pairs, one level.
 * @param {Object} inp
 * @returns {String}
 */
function flatten(inp) {
  let res = inp
  if (typeof inp == "object") {
    let entries = Object.entries(inp)
    if (entries.length != 0) {
      res = ""
      entries.forEach(([key, value], idx) => {
        let indent = idx == 0 ? "OBJ  " : "\n                        "
        res += `${indent}${key}: ${value}`
      })
    }
  }
  return res
}

var registeredTests = []
/** Runs all registered tests, if {@link TESTING} set; output to {@link outputObj}.
 * @param {Object} outputObj
 */
function test(outputObj) {
  if (TESTING)
    registeredTests.forEach((testFunction) => testFunction(outputObj))
}
//prettier-ignore
function testGlobals(outputObj) {
  let _
  _ = new TestSuite("Globals", outputObj)
  _.run(flattenTest)
  _.destruct()
  _ = null
  function flattenTest() {
    let obj0 = {}
    let flat0 = flatten(obj0)
    let exp0 = obj0.toString()
    _.bassert(1,flat0 == exp0, "empty object should be basic toString output")
  }
}
registeredTests.push(testGlobals)
//#endregion globals
//#region debug, error and test
/** For debugging purpose.
 * @type {Boolean}
 */
var DEBUG = true
/** For testing purpose.
 * @type {Boolean}
 */
var TESTING = true
if (TESTING) DEBUG = false
/** For checking error output.
 * <p>
 * If set, all Errors messages are written to current node.
 * @type {Boolean}
 */
var CHECK_ERROR_OUTPUT = false
if (CHECK_ERROR_OUTPUT) {
  DEBUG = false
  TESTING = false
}
/** For exception testing, array of strings to be evaluated */
var registeredExceptions = []

/** Triggers each Exception in {@link registeredExceptions} once and puts all
 * Error messages to {@link YAML} attributes,
 * if {@link CHECK_ERROR_OUTPUT} is true.<br>
 * Does nothing if {@link CHECK_ERROR_OUTPUT} is false
 * <p>
 * Register exception test as string to be evaluated. Local callback function
 * {@link cbk} which returns false is defined
 * @param {Object} YAML
 */
function letAllThrow(YAML) {
  if (!CHECK_ERROR_OUTPUT) return
  let cnt = 0
  function cbk() {
    return false
  }
  registeredExceptions.forEach((exp) => {
    try {
      eval(exp)
    } catch (e) {
      if (e instanceof FotyError) e.errOut(YAML, ++cnt)
      else FotyError.errOut(e, YAML, ++cnt)
    }
  })
}

/** Logs all parameters to console, if {@link DEBUG} is set to true.
 * @param  {...any} strs
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
  if (typeof str == "object") {
    let entries = Object.entries(str)
    if (entries.length == 0) {
      console.log(`%c${str}`, css)
    } else {
      entries.forEach(([key, value], idx) => {
        let indent = idx == 0 ? "OBJ " : "    "
        console.log(`%c${indent}${key}: ${value}`, css)
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
  if (typeof v == "object") {
    let entries = Object.entries(v)
    if (entries.length != 0) {
      str = `${vn}: `
      entries.forEach(([key, value], idx) => {
        let indent = idx == 0 ? "" : "    "
        str += `${indent}${key}: ${value}`
      })
    }
  }
  let css = `background:${b};color:${c};font-weight:normal`
  console.log(`%c${str}`, css)
}

/** @classdesc superclass for all foty errors (but not unit test errors).
 * <p>
 * Additionally to the {@link external:Error} properties <code>FotyError</code>
 * receives callers name as string on construction.
 * @extends external:Error
 */
class FotyError extends Error {
  /** Newline for multi line error messages
   * <p>
   * As shorthand {@link NL} can be used.<br>
   * @type {String}
   */
  static nl = "\n     " // for multiLine messages

  caller = ""
  /** Constructs a FotyError instance,
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name|Error.name}</code>
   * set to "Foty Error"
   *
   * @param {String} caller
   * @param  {...any} params - consists of
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message|Error.message}</code>
   * and <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause|Error.cause}</code>
   */
  constructor(caller, ...params) {
    super(...params)
    this.name = "Foty Error"
    this.caller = caller
  }
  errOut(YAML, cnt) {
    let prevPad = FotyError.#changePad()
    let nameKey = this.getNameKey(cnt)
    let msgKey = FotyError.getMsgKey(cnt)
    let sepKey = FotyError.getSepKey(cnt)
    if (sepKey != undefined)
      YAML[sepKey] = "---------------------------------------------------"
    YAML[nameKey] = this.name + " in " + this.caller
    YAML[msgKey] = this.message.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")

    FotyError.#changePad(prevPad)
    return [msgKey]
  }
  /** Adds error message to {@link YAML}.
   *<p>
   * Frontmatter output to current note works with 'key: value'.
   *<p>
   * In production mode a short key for e.name and another for e.message is
   * created. They are added to YAML. In every call always the same keys are used.
   *<p>
   * In testing mode short key pair in dependance of cnt is created and appended
   * to YAML.
   *
   * @param {Error} e
   * @param {Object} YAML
   * @param {(undefined|Number)} cnt
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
  }
  getNameKey(cnt) {
    return cnt == undefined ? "????" : cnt.pad() + "?"
  }
  static getNameKey(cnt) {
    return cnt == undefined ? "????" : cnt.pad() + "?"
  }
  static getMsgKey(cnt) {
    return cnt == undefined ? "\u00A8\u00A8\u00A8\u00A8" : cnt.pad() + "\u00A8"
  }
  static getSepKey(cnt) {
    return cnt == undefined ? undefined : cnt.pad()
  }
  static #changePad(padIn) {
    let prevPad = Number.prototype.pad
    function pad(size = 3) {
      var s = String(this)
      while (s.length < size) s = "0" + s
      return s
    }
    Number.prototype.pad = padIn == undefined ? pad : padIn
    return prevPad
  }
}
/** shorthand for {@link FotyError.nl} */
let NL = FotyError.nl
/** @classdesc User error thrown from setting tree.
 * <p>
 * Some of the errors from setting tree for sure can only occur if entries in
 * setting input are wrong. Those are user errors. Using the 2nd parameter
 * a user specific message can be given.
 * @extends FotyError
 */
class SettingError extends FotyError {
  usrMsg = ""
  /** Constructs a SettingError instance,
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name|Error.name}</code>
   * set to "Setting Error"
   * @param {String} caller
   * @param  {...String} params - consists of
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message|Error.message}</code>
   * only or user specific message and
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message|Error.message}</code>
   */
  constructor(caller, ...params) {
    let usrMsg = ""
    if (params.length > 1) usrMsg = params.shift()
    super(caller, ...params)
    this.name = "Setting Error"
    this.usrMsg = usrMsg
  }
  errOut(YAML, cnt) {
    cnt = cnt == undefined ? 0 : cnt
    let msgKey = super.errOut(YAML, cnt)
    if (this.usrMsg.length > 0)
      YAML[msgKey] += NL + this.usrMsg.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")
  }
  getNameKey(cnt) {
    return cnt == undefined ? "_ERR" : cnt.pad(4)
  }
}
/** @classdesc Programming error.
 * <p>
 * Some errors only can occur if code is wrong. If this is for sure,
 * CodingError should be thrown.
 * @extends FotyError
 */
class CodingError extends FotyError {
  /** Constructs a CodingError instance,
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name|Error.name}</code>
   * set to "Coding Error"
   *
   * @param {String} caller
   * @param  {...any} params - consists of
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message|Error.message}</code>
   * and <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause|Error.cause}</code>
   */
  constructor(caller, ...params) {
    super(caller, ...params)
    this.name = "Coding Error"
  }
  errOut(YAML, cnt) {
    cnt = cnt == undefined ? 0 : cnt
    super.errOut(YAML, cnt)
    YAML[cnt] += this.caller
  }
  getNameKey(cnt) {
    return cnt == undefined ? "!!!!" : cnt.pad(4) + "!"
  }
}

/** Runs unit tests. */
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
    if (this.o[this.z] == undefined) this.o[this.z] = this.e
    if (this.o[this.f] == undefined) this.o[this.f] = this.e
    if (this.o[this.s] == undefined) this.o[this.s] = this.e
    if (this.o[this.d] == undefined) this.o[this.d] = this.e
  }
  toString() {
    return " °°" + this.constructor.name + " " + this.name
  }

  /** Shows results resets
   */
  destruct() {
    let succStr = this.#succeeded == 1 ? "test" : "tests"
    let failStr = this.#failed == 1 ? "test" : "tests"
    if (this.#failed == 0) {
      this.#praut(
        this.s,
        `Suite "${this.#name}": ${this.#succeeded} ${succStr} succeeded`
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
      let cases = this.#cases == 1 ? "case" : "cases"
      if (0 == this.#asserts) {
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
          let cases = this.#cases == 1 ? "case" : "cases"
          if (0 == this.#asserts) {
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
   * @param {Number} errcase
   * @param {Boolean} isTrue
   * @param {String} message
   */
  bassert(errcase, isTrue, message) {
    TestSuite.#totalCases++
    this.#cases++
    if (!isTrue) {
      this.#asserts++
      console.log(
        `%c   ${this.#name}/${this.#fname}:case ${errcase} - ${message}`,
        "background: rgba(255, 99, 71, 0.5)"
      )
    }
  }

  /** asserts catching exceptions one case in a test, shows message on failure
   * @param {Number} errcase
   * @param {Function} fn
   * @param {...any} params
   */
  assert(errcase, fn, ...params) {
    TestSuite.#totalCases++
    this.#cases++
    try {
      fn(...params)
    } catch (err) {
      this.#asserts++
      console.log(
        `%c   ${this.#name}/${this.#fname}:case ${errcase} - ${err.message}`,
        "background: rgba(255, 99, 71, 0.5)"
      )
    }
  }

  /** silents exception of one testcase, asserts & shows message if no exception
   * @param {Number} errcase
   * @param {Function} fn
   * @param {...any} ...params
   */
  shouldAssert(errcase, fn, ...params) {
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
        }:case ${errcase} should assert - ${message}`,
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
      let errstr = "%c" + key
      console.log(errstr, "background: rgba(255, 99, 71, 0.5)")
    } else if (this.o[key] == this.e) {
      this.o[key] = str
    } else if (str[0] == TestSuite.nok) {
      if (key == this.d) {
        //"details"
        let outParts = this.o[key].split(TestSuite.nok)
        let len = outParts.length
        let okPart = outParts[len - 1]
        if (len == 1) {
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
/** Error used for unit tests. */
class TestError extends Error {
  constructor(message, ...params) {
    super(message, ...params)
    this.name = "TestError"
  }
  toString() {
    return " °°" + this.constructor.name + " " + this.name
  }
}
//#endregion debug, error and test
//#region helper classes
/** Events that Dispatcher stores and distribute to listeners
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
      event.constructor == Event,
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
/** Event manager
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
      dispatcher.constructor == Dispatcher,
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
//#region code
/** callback to check {@link variable} against {@link gene}.
 * @callback GeneCallback
 * @param {*} variable
 * @param {Gene} gene
 * @returns {Boolean}
 */
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
  return typeof v == gene.ident
}
/** {@link GeneCallback}, returns whether '{@link v}' typeof '{@link gene.ident}.toLowerCase()'
 * @type {GeneCallback}
 * @param {*} v
 * @param {Gene} gene
 * @returns {Boolean}
 */
function cbkTypeOfLc(v, gene) {
  return typeof v == gene.ident.toLowerCase()
}

/** @classdesc Gene is type used in this application.
 * <p>
 * Every gene has a {@link GeneCallback} function associated with it. The default callback
 * function is '
 * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof|typeof}</code>
 * variable == {@link Gene#ident|Gene.ident}' . {@link Gene#isA} calls this callback, comparing
 * variable to check against ident of {@link Gene}.
 * <p>
 * <b>Why this name? </b>
 * Many types of types we have to deal with. Therefore another name for 'allowed
 * types' was searched for. It should be short, have a meaning near to
 * 'very basic' and it should reasonable not be used further in the code, so
 * that name is replaceable throughout whole file, if another one would be
 * chosen.
 */
class Gene {
  #cbk
  #ident

  /** Ident of the {@link Gene}.
   * @type {*}
   */
  get ident() {
    return this.#ident
  }

  /** Constructs a Gene instance. Throws on wrong parameter types.
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
    this.#cbk = cbk == undefined ? cbkTypeOf : cbk
  }

  /** Returns result of {@link GeneCallback}( {@link v}, {@link this} ).
   * @param {*} v
   * @returns {Boolean}
   */
  isA(v) {
    return this.#cbk(v, this)
  }

  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("Gene", outputObj)) {
      _.run(getterIdentTest)
      _.run(constructorTest)
      _.run(isATest)
      _.destruct()
      _ = null
    }
    function getterIdentTest() {}
    function constructorTest() {
      function cbk() {return false}
      _.assert(1,_tryConstruct,22,cbk,"arg1 can be of any type")
      _.shouldAssert(2,_tryConstruct,"number",22,"arg2 has to be a Function")
      _.assert(3,_tryConstruct,"number",undefined,"arg2 may be undefined")
      _.assert(4,_tryConstruct,"number",cbk,"all args are ok")
    }
    function isATest() {
      function cbk(v,gene) {return typeof v == gene.ident.toLowerCase()}
      function ACbk(v,gene) {return gene.ident == "Array" && typeof v == "object" && Array.isArray(v)}
      function aCbk(v) {return typeof v == "object" && Array.isArray(v)}
      let g = new Gene("number")
      let G = new Gene("Number")
      let gG = new Gene("Number",cbk)
      let A = new Gene("Array",ACbk)
      let a = new Gene("array",aCbk)
      _.bassert(1,g.isA(22),"22 is a number")
      _.bassert(2,!G.isA(22),"22 is not a Number")
      _.bassert(3,gG.isA(22),"22 is a Number to lowercase")
      _.bassert(4,A.isA([]),"'[]' is an Array")
      _.bassert(5,!A.isA({}),"'{}' is not an Array")
      _.bassert(6,a.isA([]),"'[]' is an Array")
      _.bassert(7,!a.isA({}),"'{}' is not an Array")
    }
    function _tryConstruct(arg1, arg2) {
      new Gene(arg1,arg2)
    }
  }
}
registeredTests.push(Gene.test)
registeredExceptions.push("new Gene('name',3)")

/** @classdesc Collection of allowed/used Genes.
 * <p>
 * Stores  {@link Gene}s. The default {@link GeneCallback|callback} function for created
 * by adding {@link Gene}s is '
 * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof|typeof}</code>
 * variable == tolower({@link Gene#ident|Gene.ident})'. (Whereas the default {@link GeneCallback}|callback)
 * function for plain {@link Gene}s is '
 * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof|typeof}</code>
 * variable == {@link Gene#ident|Gene.ident}'.
 */
class GenePool {
  #genes = {}
  #defaultCallback = cbkInstanceOf

  /** Creates new instance of {@link GenePool}.
   * <p>
   * If first parameter is a function, it becomes the default {@link GeneCallback|callback} function.
   * All other parameters (including the first, if not a function) are registered as {@link Gene}s
   * with the default {@link GeneCallback|callback} function set as {@link GeneCallback|callback} function .
   * <p>
   * should never throw
   * @param  {...any} params
   */
  constructor(...params) {
    this.addAsGene(Object, cbkInstanceOf)
    this.addAsGene(Gene, cbkInstanceOf)
    this.addAsGene(GenePool, cbkInstanceOf)
    if (params.length > 0 && typeof params[0] == "function")
      this.#defaultCallback = params.shift()
    while (params.length > 0)
      this.addAsGene(params.shift(), this.#defaultCallback)
  }

  /** Adds {@link ident} as new Gene with {@link cbk} as {@link GeneCallback|callback} function.
   * <p>
   * If {@link cbk} is undefined, the newly created {@link Gene} gets default {@link GeneCallback|callback} function
   * as {@link GeneCallback|callback} function
   * <p>
   * The newly created {@link Gene} is returned. <br>
   * If {@link cbk} is already set, it is not changed, but returned at it is.
   * @param {*} ident
   * @param {Function|undefined} cbk
   * @throws TypeError - does not catch from {@link @Gene|Gene.constructor}, which
   * throws if {@link cbk} is no function
   * @returns {Gene}
   */
  addAsGene(ident, cbk) {
    if (this.#genes[ident] == undefined)
      this.#genes[ident] = new Gene(
        ident,
        cbk == undefined ? this.#defaultCallback : cbk
      )
    return this.#genes[ident]
  }

  /** Returns whether {@link ident} contained in this pool.
   * @param {*} ident
   * @returns {Boolean}
   */
  has(ident) {
    return this.#genes[ident] != undefined
  }

  /** Returns whether {@link v} fulfills {@link ident}s requirements as {@link Gene}.
   * <p>
   * Compound {@link ident} possible:<br>
   * - ({@link ident1}|{@link ident2}|{@link ident3})<br>
   * - Array.&lt;{@link ident1}&gt;<br>
   * - combination of both
   * @param {*} v
   * @param {*} ident
   * @returns {Boolean}
   */
  is(v, ident) {
    if (GenePool.isCompoundOr(ident)) {
      let ids = ident.slice(1, -1).split("|")
      return ids.some((id) => this.is(v, id), this)
    } else if (GenePool.isCompoundArr(ident)) {
      if (!Array.isArray(v)) return false
      let innerIdent = ident.slice("Array.<".length, -1)
      return v.every((innerV) => this.is(innerV, innerIdent), this)
    } else {
      if (!this.has(ident)) return false
      return this.#genes[ident].isA(v)
    }
  }
  static isCompoundOr(id) {
    let answ = false
    if (typeof id == "string") {
      if (id.startsWith("(") && id.endsWith(")")) answ = true
    }
    return answ
  }
  static isCompoundArr(id) {
    let answ = false
    if (typeof id == "string") {
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
      _.run(isTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      _.assert(1,_tryConstruct0,"should construct")
      _.assert(2,_tryConstruct1,"String","should construct")
      _.assert(3,_tryConstruct2,"String","Number","should construct")
      _.assert(4,_tryConstruct3,"String","Number","Boolean","should construct")
      _.assert(5,_tryConstruct4,"String","Number","Boolean","Function","should construct")
      _.assert(12,_tryConstruct1,{},"should construct")
      _.assert(13,_tryConstruct2,"String",{},"should construct")
      _.assert(14,_tryConstruct3,"String","Number",{},"should construct")
      _.assert(15,_tryConstruct4,{},"Number","Boolean","Function","should construct")
    }
    function addTest() {
      let gns = new GenePool(cbkTypeOfLc,"Number")
      let gn = gns.addAsGene("Number")
      let gn2
      function cbk() { return false}
      _.bassert(1, gn = gns.addAsGene("Number"),"Trying to add existing Gene should return it")
      _.bassert(2, gn.ident == "Number", "The added Gene should be returned")
      _.bassert(3, gn2 = gns.addAsGene("String"),"Adding new Gene should return it")
      _.bassert(4, gn2.ident == "String", "The added Gene should be returned")
      _.assert(5,_tryAddAsGene,gns,22,cbk,"Adding Gene with no string as ident should work")
      _.shouldAssert(6,_tryAddAsGene,gns,"abc",22,"Adding Gene with no function as callback should throw")
    }
    function hasTest() {
      let gns = new GenePool(cbkTypeOfLc,"Number")
      _.bassert(1,gns.has("Number"),"'Number' was given to constructor")
      _.bassert(2,!gns.has("number"),"'number' was not given to constructor")
      _.bassert(3,!gns.has("string"),"'string' was not given to constructor")
      _.bassert(4,!gns.has(),"undefined argument is no allowed type")
      _.bassert(5,!gns.has({}),"'{}' as no string argument is no allowed type")
    }
    function isTest() {
      let gns = new GenePool(cbkTypeOfLc,"Number")
      _.bassert(1,gns.is(22,"Number"),"22 is Number")
      _.bassert(2,!gns.is({},"Number"),"'{}' is no Number")
      _.bassert(3,!gns.is(),"no arguments given should return false")
      _.bassert(4,!gns.is({}),"2nd argument not given should return false")
      _.bassert(5,!gns.is({},{}),"2nd argument not a string should return false")
      _.bassert(6,!gns.is({},"String"),"2nd argument not allowed type should return false")

      let gns2 = new GenePool(cbkTypeOfLc,"Number","Boolean","String")
      _.bassert(11,gns2.is(["a","b","c"],"Array.<String>"),"array of strings should be recognized")
      _.bassert(12,!gns2.is(["a","b",3],"Array.<String>"),"array of strings with number should be rejected")
      _.bassert(13,gns2.is(3,"(String|Number)"),"Number should be recognized for String or Number")
      _.bassert(14,gns2.is("a","(String|Number)"),"String should be recognized for String or Number")
      _.bassert(15,!gns2.is(false,"(String|Number)"),"Boolean should not be recognized for String or Number")
      _.bassert(16,gns2.is(["a","b","c"],"(String|Array.<String>)"),"array of strings should be recognized for String or Array of Strings")
      _.bassert(17,gns2.is("a","(String|Array.<String>)"),"String should be recognized for String or Array of Strings")
      _.bassert(18,gns2.is(2,"(Number|Array.<String>)"),"Number should be recognized for Number or Array of Strings")      
    }
    function _tryConstruct0() { new GenePool() }
    function _tryConstruct1(a) { new GenePool(a) }
    function _tryConstruct2(a,b) { new GenePool(a,b) }
    function _tryConstruct3(a,b,c) { new GenePool(a,b,c) }
    function _tryConstruct4(a,b,c,d) { new GenePool(a,b,c,d) }
    function _tryAddAsGene(genes, arg1, arg2) {genes.addAsGene(arg1, arg2)}
  }
}
registeredTests.push(GenePool.test)
registeredExceptions.push("new GenePool().addAsGene('noGene','noCbk')")

/** @classdesc Essence is unrecognizable except through me.
 * Reads and stores specification attributes and removes them from literal.
 * So __SPEC becomes essence and nobody will no longer be bothered by it.
 * Essence is always there. Either as found in __SPEC or as given from parent (if one)
 * or hardcoded default. If some __SPEC entry has wrong  {@link Gene} it will be
 * {@link Essence#skipped|skipped} and parent essence or (if no parent)
 * hardcoded essence will be used.
 */
class Essence extends GenePool {
  get ROOT() {
    return this[Essence.#pre + "ROOT"]
  }
  /** RENDER essence
   * @type {Boolean}
   */
  get RENDER() {
    return this[Essence.#pre + "RENDER"]
  }
  /** TYPE essence
   * @type {String}
   */
  get TYPE() {
    return this[Essence.#pre + "TYPE"]
  }
  /** DEFAULT essence
   *  is of type given in {@link Essence#TYPE|Essence.TYPE}
   * @type {*}
   */
  get DEFAULT() {
    return this[Essence.#pre + "DEFAULT"]
  }
  /** IGNORE essence
   * @type {Boolean}
   */
  get IGNORE() {
    return this[Essence.#pre + "IGNORE"]
  }
  /** FLAT essence
   * @type {Boolean}
   */
  get FLAT() {
    return this[Essence.#pre + "FLAT"]
  }
  /** ONCE essence
   * @type {Boolean}
   */
  get ONCE() {
    return this[Essence.#pre + "ONCE"]
  }
  /** REPEAT essence
   * @type {Boolean}
   */
  get REPEAT() {
    return this[Essence.#pre + "REPEAT"]
  }
  /** skipped essences
   * @type {Array.<Object>}
   */
  get skipped() {
    return this.#skipped
  }
  static #pre = "__"
  #userPool = new GenePool(
    cbkTypeOfLc,
    "String",
    "Number",
    "Boolean",
    "Function"
  )
  static #SPEC_KEY = "__SPEC"
  static #RENDER_DEFT = false
  static #TYPE_DEFT = "String"
  static #DEFAULT_DEFT = ""
  static #IGNORE_DEFT = false
  static #FLAT_DEFT = false
  static #ONCE_DEFT = false
  static #REPEAT_DEFT = false
  #skipped = [] //[{.name,.value,.expectedType}]

  /** Creates instance, removes {@link ESSENCE.#SPEC_KEY|ESSENCE.__SPEC} attribute from {@link literal}
   * @param {String} literal
   * @param {GenePool} parent
   * @throws TypeError if {@link parent} is no {@link GenePool}
   */
  constructor(literal, parent) {
    super()
    if (parent != undefined && !this.is(parent, GenePool))
      throw new TypeError(
        `function 'Essence.constructor'${NL}2nd parameter '${parent}' is not of type 'GenePool'`
      )
    this.addAsGene(Essence)

    let u
    let p = parent
    let specLit = {}
    if (literal != u) specLit = literal[Essence.#SPEC_KEY]
    if (specLit == u) specLit = {}
    let litREN = specLit.RENDER
    let litTYP = specLit.TYPE
    let litIGN = specLit.IGNORE
    let litFLT = specLit.FLAT
    let litONC = specLit.ONCE
    let litREP = specLit.REPEAT
    delete specLit.RENDER
    delete specLit.TYPE
    delete specLit.IGNORE
    delete specLit.FLAT
    delete specLit.ONCE
    delete specLit.REPEAT
    if (!this.#validateOrInform(litREN, "Boolean", "RENDER")) litREN = u
    if (!this.#validateOrInform(litTYP, "String", "TYPE")) litTYP = u
    if (!this.#validateOrInform(litIGN, "Boolean", "IGNORE")) litIGN = u
    if (!this.#validateOrInform(litFLT, "Boolean", "FLAT")) litFLT = u
    if (!this.#validateOrInform(litONC, "Boolean", "ONCE")) litONC = u
    if (!this.#validateOrInform(litREP, "Boolean", "REPEAT")) litREP = u
    let ROOT = parent != u ? false : true
    let RENDER = litREN != u ? litREN : p != u ? p.RENDER : Essence.#RENDER_DEFT
    let TYPE = litTYP != u ? litTYP : p != u ? p.TYPE : Essence.#TYPE_DEFT
    let IGNORE = litIGN != u ? litIGN : p != u ? p.IGNORE : Essence.#IGNORE_DEFT
    let FLAT = litFLT != u ? litFLT : p != u ? p.FLAT : Essence.#FLAT_DEFT
    let ONCE = litONC != u ? litONC : p != u ? p.ONCE : Essence.#ONCE_DEFT
    let REPEAT = litREP != u ? litREP : p != u ? p.REPEAT : Essence.#REPEAT_DEFT
    Object.defineProperty(this, Essence.#pre + "ROOT", {
      value: ROOT,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    Object.defineProperty(this, Essence.#pre + "RENDER", {
      value: RENDER,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    Object.defineProperty(this, Essence.#pre + "TYPE", {
      value: TYPE,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    Object.defineProperty(this, Essence.#pre + "IGNORE", {
      value: IGNORE,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    Object.defineProperty(this, Essence.#pre + "FLAT", {
      value: FLAT,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    Object.defineProperty(this, Essence.#pre + "ONCE", {
      value: ONCE,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    Object.defineProperty(this, Essence.#pre + "REPEAT", {
      value: REPEAT,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    let litDEF = specLit.DEFAULT
    delete specLit.DEFAULT
    if (!this.#validateOrInform(litDEF, this.TYPE, "DEFAULT")) litDEF = u
    let DEFT = litDEF != u ? litDEF : p != u ? p.DEFAULT : Essence.#DEFAULT_DEFT
    Object.defineProperty(this, Essence.#pre + "DEFAULT", {
      value: DEFT,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    if (literal != u) delete literal[Essence.#SPEC_KEY]
  }
  #validateOrInform(value, type, name) {
    let ok = value == undefined || this.#userPool.is(value, type)
    if (!ok) {
      let errObj = {}
      errObj.name = name
      errObj.value = value
      errObj.expectedType = type
      this.#skipped.push(errObj)
    }
    return ok
  }
  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("Essence", outputObj)) {
      _.run(constructorTest)
      _.run(getterEssences)
      _.run(isTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      _.assert(1,_tryConstruct1,{__SPEC: {RENDER:true}},"Should construct")
      _.assert(2,_tryConstruct1,{__SPEC: {IGNORE:true}},"Should construct")
      _.assert(3,_tryConstruct1,{__SPEC: {ONCE:true}},"Should construct")
      _.assert(4,_tryConstruct1,{__SPEC: {FLAT:true}},"Should construct")
      _.assert(5,_tryConstruct1,{__SPEC: {REPEAT:true}},"Should construct")
      _.assert(6,_tryConstruct1,{__SPEC: {TYPE:"Boolean"}},"Should construct")
      _.assert(7,_tryConstruct1,{__SPEC: {DEFAULT:""}},"Should construct")
      _.assert(11,_tryConstruct1,{__SPEC: {RENDER:"abc"}},"Should construct")
      _.assert(12,_tryConstruct1,{__SPEC: {IGNORE:"abc"}},"Should construct")
      _.assert(13,_tryConstruct1,{__SPEC: {ONCE:"abc"}},"Should construct")
      _.assert(14,_tryConstruct1,{__SPEC: {FLAT:"abc"}},"Should construct")
      _.assert(15,_tryConstruct1,{__SPEC: {REPEAT:"abc"}},"Should construct")
      _.assert(16,_tryConstruct1,{__SPEC: {TYPE:false}},"Should construct")
      _.assert(17,_tryConstruct1,{__SPEC: {DEFAULT:false}},"Should construct")
      let wrong1 = new Essence({__SPEC: {RENDER:"abc"}})
      let wrong2 = new Essence({__SPEC: {IGNORE:"abc"}})
      let wrong3 = new Essence({__SPEC: {ONCE:"abc"}})
      let wrong4 = new Essence({__SPEC: {FLAT:"abc"}})
      let wrong5 = new Essence({__SPEC: {REPEAT:"abc"}})
      let wrong6 = new Essence({__SPEC: {TYPE:false}})
      let wrong7 = new Essence({__SPEC: {DEFAULT:false}})
      _.bassert(21,wrong1.skipped[0]["name"]=="RENDER","RENDER should be skipped")
      _.bassert(22,wrong2.skipped[0]["name"]=="IGNORE","IGNORE should be skipped")
      _.bassert(23,wrong3.skipped[0]["name"]=="ONCE","ONCE should be skipped")
      _.bassert(24,wrong4.skipped[0]["name"]=="FLAT","FLAT should be skipped")
      _.bassert(25,wrong5.skipped[0]["name"]=="REPEAT","REPEAT should be skipped")
      _.bassert(26,wrong6.skipped[0]["name"]=="TYPE","TYPE should be skipped")
      _.bassert(27,wrong7.skipped[0]["name"]=="DEFAULT","DEFAULT should be skipped")
      let lit = {__SPEC: {RENDER:true},myValue:"22"}
      _.bassert(31,lit.__SPEC != undefined,"just to show it is defined")
      _.bassert(32,lit.myValue != undefined,"just to show it is defined")
      let ess1 = new Essence(lit)
      _.bassert(33,lit.__SPEC == undefined,"SPEC should no longer be defined")
      _.bassert(34,lit.myValue != undefined,"just to show it is still defined")

      _.shouldAssert(41,_tryConstruct2,{__SPEC: {RENDER:true}},new Error(),"Should not be constructed")
      _.assert(42,_tryConstruct2,{__SPEC: {RENDER:true}},ess1,"Should be constructed")    
    }
    function getterEssences() {
      let ess0 = new Essence()
      _.bassert(1,ess0.ROOT==true,"Should always be defined")
      _.bassert(2,ess0.RENDER==false,"Should always be defined")
      _.bassert(3,ess0.IGNORE==false,"Should always be defined")
      _.bassert(4,ess0.ONCE==false,"Should always be defined")
      _.bassert(5,ess0.FLAT==false,"Should always be defined")
      _.bassert(6,ess0.REPEAT==false,"Should always be defined")
      _.bassert(7,ess0.TYPE=="String","Should always be defined")
      _.bassert(8,ess0.DEFAULT=="","Should always be defined")
      let lit1 = {__SPEC: {RENDER:true,IGNORE:true,ONCE:true,FLAT:true,REPEAT:true,TYPE:"Boolean",DEFAULT:false}}
      let ess1 = new Essence(lit1)
      _.bassert(11,ess1.ROOT==true,"Should always be defined")
      _.bassert(12,ess1.RENDER==true,"Should be set to literal value")
      _.bassert(13,ess1.IGNORE==true,"Should be set to literal value")
      _.bassert(14,ess1.ONCE==true,"Should be set to literal value")
      _.bassert(15,ess1.FLAT==true,"Should be set to literal value")
      _.bassert(16,ess1.REPEAT==true,"Should be set to literal value")
      _.bassert(17,ess1.TYPE=="Boolean","Should be set to literal value")
      _.bassert(18,ess1.DEFAULT==false,"Should be set to literal value")
      let ess2 = new Essence(undefined,ess1)
      _.bassert(11,ess2.ROOT==false,"Should always be defined")
      _.bassert(12,ess2.RENDER==true,"Should be set to parent value")
      _.bassert(13,ess2.IGNORE==true,"Should be set to parent value")
      _.bassert(14,ess2.ONCE==true,"Should be set to parent value")
      _.bassert(15,ess2.FLAT==true,"Should be set to parent value")
      _.bassert(16,ess2.REPEAT==true,"Should be set to parent value")
      _.bassert(17,ess2.TYPE=="Boolean","Should be set to parent value")
      _.bassert(18,ess2.DEFAULT==false,"Should be set to parent value")
    }
    function isTest() {
      let ess1 = new Essence()
      _.bassert(1,ess1.is(ess1,Essence),"Essence should be Essence")
      _.bassert(2,ess1.is(ess1,GenePool),"Essence should be GenePool")
      _.bassert(3,ess1.is(ess1,Object),"Essence should be Object")
    }
    function _tryConstruct1(arg1) { 
      new Essence(arg1) 
    }
    function _tryConstruct2(arg1, arg2) { 
      new Essence(arg1, arg2) 
    }
  }
}
registeredTests.push(Essence.test)
registeredExceptions.push("new Essence({}, new Error())")

class BreadCrumbs extends Essence {
  static sep = " \u00BB " // breadcrumbs separator \u2192
  #ident
  #caller
  #literal
  constructor(literal, key, parent) {
    let un
    super(literal, parent)
    this.addAsGene(BreadCrumbs)
    this.#literal = literal
    this.#ident = key
    this.#caller = parent
    this.throwIfNotOfType(literal, ["undefined", "Object"], un, "'literal'")
    this.throwIfUndefined(key, "key")
    this.throwIfNotOfType(key, ["string", "symbol"], un, "'key'")
    //this.throwIfNotOfType(parent, ["undefined", "BreadCrumbs"], un, "'parent'")
    if (typeof key == "symbol") this.#ident = "Symbol"
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
  /** Returns line of ancestors with keys given in BreadCrumbs constructor
   *
   * For this instance and its ancestors keys are returned, separated by
   * punctuation marks
   * @returns {String}
   */
  toBreadcrumbs() {
    let breadcrumbs = ""
    let sep = ""
    if (BC.isDefined(this.#caller)) {
      if (typeof this.#caller.toBreadcrumbs == "function")
        breadcrumbs += this.#caller.toBreadcrumbs()
      else breadcrumbs += "(" + this.#caller + ")"
      sep = BC.sep
    }
    breadcrumbs += sep + this.#ident
    return breadcrumbs
  }

  /** Throws if val is strictly undefined (null is defined)
   *
   * Does not throw on parameter type errors
   * @param {*} val
   * @param {String} vName - becomes part of Error message
   * @param {String} [fuName="constructor"] - becomes part of Error message
   * @param {String} [msg] - becomes part of Error message
   * @throws {SettingError}
   */
  throwIfUndefined(
    val,
    vName,
    fuName = "constructor",
    msg = "is undefined",
    lastMsg = ""
  ) {
    if (typeof vName != "string") vName = ""
    if (typeof fuName != "string") fuName = ""
    if (typeof msg != "string") msg = "is undefined"
    if (!BC.isDefined(val))
      throw new SettingError(
        `${this.constructor.name}.${fuName}`,
        lastMsg,
        `Path: ${this.toBreadcrumbs()}${NL}'${vName}' ${msg}`
      )
  }

  /** Throws if val is not of type or of one of the entries in type array
   *
   * Does not throw on other parameters type errors
   * @param {*} val
   * @param {(Array.<String>|String)} type
   * @param {String} [fuName="constructor"] - becomes part of Error message
   * @param {String} [msg] - becomes part of Error message
   * @throws {SettingError}
   */
  throwIfNotOfType(val, type, fuName = "constructor", msg = "", lastMsg = "") {
    if (typeof fuName != "string") fuName = ""
    if (typeof msg != "string") msg = "is not of type"
    else msg += " is not of type"
    if (Array.isArray(type)) {
      if (
        !type.some((t) => {
          return BC.isOfType(val, t)
        })
      )
        throw new SettingError(
          `${this.constructor.name}.${fuName}`,
          lastMsg,
          `Path: ${this.toBreadcrumbs()}${BC.nl}${msg} '${type.join(" or ")}'`
        )
    } else if (!BC.isOfType(val, type))
      throw new SettingError(
        `${this.constructor.name}.${fuName}`,
        lastMsg,
        `Path: ${this.toBreadcrumbs()}${BC.nl}${msg} '${type}'`
      )
  }

  /** static Returns whether val is not strictly undefined (null is defined)
   * @param {*} val
   * @returns {Boolean}
   */
  static isDefined(val) {
    return typeof val != "undefined"
  }

  /** static Returns whether val is of js type or BreadCrumbs (+ sub) instance
   * Returns whether val is of type, if type is js type (written in lowercase)
   * or "Array" or "BreadCrumbs" or class name of class derived from BreadCrumbs
   * @param {*} val
   * @param {String} type - js types have to be written lowercase
   *                        "Date" - Dateformat as String
   *                        "Frontmatter" - object (with attributes)
   *                        "Null" accepts Null
   *                        "Array" accepts Arrays
   *                        "Object" accepts js Object besides Null and Array
   *                        "BreadCrumbs" accepts BreadCrumb instance
   *                                      and subclass instance
   *                        "Setting" accepts Setting instance
   *                        "TypesManager" accepts TypesManager
   *                                           instance
   * @returns {Boolean} - true, if val is of type
   *                      false, if val is not of type
   *                      false, if type is not a String or no known String
   */
  static isOfType(val, type) {
    if (typeof type != "string" || type.length < 1) return false
    let answer = false
    if (type[0].toLowerCase() == type[0]) {
      answer = typeof val == type
    } else if (type == "Date") {
      if (typeof val == "string") {
        answer = true
      }
    } else if (type == "Frontmatter") {
      if (typeof val == "object") {
        answer = true
      }
    } else if (typeof val == "object") {
      //let fu = BC.#objTypes[type]
      //if (typeof fu == "function") answer = fu(val)
      answer = true
    }
    return answer
  }
  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("BreadCrumbs", outputObj)) {
      _.run(constructorTest)
      _.run(isATest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
    }
    function isATest() {}
    function _tryConstruct(arg1, arg2,arg3) {
      new BreadCrumbs(arg1,arg2,arg3)
    }
  }
}
registeredTests.push(Essence.test)
registeredExceptions.push("new BreadCrumbs({}, undefined, undefined)")

var BC = BreadCrumbs // shorthand
new BreadCrumbs({__SPEC: {DEFAULT: true, RENDER: "WAHR"}}, "key")
//#endregion code

/** exported function
 * <p>
 * name does not matter for templater, but if named 'main' interferes with jsdoc
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
  } catch (e) {
    if (e instanceof FotyError) {
      e.errOut(errYAML)
      return errYAML
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
