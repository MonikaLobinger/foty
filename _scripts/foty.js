module.exports = main // templater call: "await tp.user.foty(tp, app)"
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
 * A region starts with //#region REGIONNAME or //# regionname
 * and it ends with //#endregion REGIONNAME or //#endregion regionname
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
// see in a configuration dialog, so it is named DONTTOUCH.
// And it contains the value section, which user can edit, so it is
// named USER CONFIGURATION.
//
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// Only make changes in region USER CONFIGURATION
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//  #region DONTTOUCH
/**@ignore */
function aliasCbk(tp, notename, type) {
  let alias = notename
  if (type != "ort" && type != "person") {
    alias = notename.replace(/,/g, ` `).replace(/  /g, ` `)
  } else {
    // ort, person
    alias = notename.replace(/, /g, `,`)
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
function tagsCbk(tp, notename, type) {
  return "0/" + type
}
function createdCbk(tp, notename, type) {
  return tp.date.now()
}
function cssClassCbk(tp, notename, type) {
  return type
}
//  #endregion DONTTOUCH
//  #region USER CONFIGURATION
//  #endregion USER CONFIGURATION
//  #region test configurations
/**
 * Defaults
 * __DIALOGSETTINGS: ONCE: true,
 * __NOTETYPES: ONCE: true, REPEAT: true
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
  __DIALOGSETTINGS: {ONCE:true, __:"...",
    TYPE_PROMPT: {TYPE:"String",DEFAULT:"Typ wählen", __:"...",},
    TYPE_MAX_ENTRIES: {TYPE:"Number",DEFAULT:10, __:"...",},
    TITLE_NEW_FILE: {TYPE:"(String|Array.<String>)",DEFAULT:["Unbenannt", "Untitled"], __:"...",},
  },
  __NOTETYPES: {ONCE:true,REPEAT:true, __:"...",
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
  __DIALOGSETTINGS: {__SPEC: {__ONCE:true},
    TYPE_PROMPT: {TYPE:"String",DEFAULT:"Typ wählen", __:"...",},
    TYPE_MAX_ENTRIES: {TYPE:"Number",DEFAULT:10, __:"...",},
    TITLE_NEW_FILE: {TYPE:"(String|Array.<String>)",DEFAULT:["Unbenannt", "Untitled"], __:"...",},
  },
  __NOTETYPES: {ONCE:true,REPEAT:true, __:"...",
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
  __DIALOGSETTINGS: {
    TYPE_PROMPT: "Typ wählen" /* String */,
    TYPE_MAX_ENTRIES: 10 /* Number */, // Max entries in "type" drop down list
    TITLE_NEW_FILE: ["Unbenannt", "Untitled"] /* String or Array of Strings */,
  },
  __FOLDER2TYPE: {
    /* Values are  String or Array of Strings */ test: "diary",
    "/": ["citation", "diary"],
  },
  __NOTETYPES: {
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
function errOut(e, YAML, cnt) {
  let prevPad = Number.prototype.pad
  Number.prototype.pad = function (size = 3) {
    var s = String(this)
    while (s.length < size) s = "0" + s
    return s
  }
  let nameKey
  let msgKey
  if (CHECK_ERROR_OUTPUT) {
    if (cnt == undefined) cnt = 0
    if (e instanceof SettingError) nameKey = cnt.pad(4)
    else if (e instanceof CodingError) nameKey = cnt.pad() + "!"
    else nameKey = cnt.pad() + "?"
    msgKey = cnt.pad() + "\u00A8"
  } else {
    if (e instanceof SettingError) nameKey = "ERR:"
    else if (e instanceof CodingError) nameKey = "!!!:"
    else nameKey = "???:"
    msgKey = "\u00A8\u00A8\u00A8"
  }
  let msg = e.message.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")
  if (e.usrMsg != undefined && e.usrMsg.length > 0)
    msg += "\n" + e.usrMsg.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")

  if (CHECK_ERROR_OUTPUT)
    YAML[cnt.pad()] = "---------------------------------------------------"
  if (e instanceof FotyError) {
    YAML[nameKey] = e.name + " in " + e.caller
  } else {
    YAML[nameKey] = e.name
  }
  YAML[msgKey] = msg

  Number.prototype.pad = prevPad
}

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

/** Triggers each Exception once and puts all Error messages to {@link YAML} attributes,
 * if {@link CHECK_ERROR_OUTPUT} is true.
 *<p>
 * Does nothing if {@link CHECK_ERROR_OUTPUT} is false
 * @param {Object} YAML
 */
// prettier-ignore
function letAllThrow(YAML) {
  if (!CHECK_ERROR_OUTPUT) return
  let cnt = 0
  /*01*/try{Gene.isA(1,"NonType")}catch(e){errOut(e,YAML,++cnt)}
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
  //#region member variables
  /** Newline for multi line error messages
   * <p>
   * As shorthand {@link NL} can be used.<br>
   * @type {String}
   */
  static nl = "\n     " // for multiLine messages

  caller = ""
  //#endregion member variables
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
}
/** Shorthand for {@link FotyError.nl} */
let NL = FotyError.nl
/** @classdesc User error thrown from setting tree.
 * <p>
 * Some of the errors from setting tree for sure can only occur if entries in
 * setting input are wrong. Those are user errors. Using the 2nd parameter
 * a user specific message can be given.
 * @extends FotyError
 */
class SettingError extends FotyError {
  //#region member variables
  usrMsg = ""
  //#endregion member variables
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
   *     let funame = "first_Test" //"second_Test", "third_Test"
   *     let result = asynchronousFunction(funame).then( () => {
   *       _.assert( 1, _check, result)
   *       _.assert( 2, _check, result)
   *       // destruct result (In use case it might be instance)
   *       resolve("IN" + funame + ": Result " + result + " destructed")
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
/** @description callback to check {@link variable} against {@link gene}
 * @callback isOfTypeCallback
 * @param {*} variable
 * @param {Gene} gene
 * @returns {Boolean}
 */

/** @classdesc Genes are types used in this application.
 * <p>
 * All genes have to be registered. There are no hardcoded genes. Only
 * <code>{@link Gene.NO_GENE}</code> is registered hardCoded
 * <p>
 * A gene can have an alias, even more than one. Names of genes and names of
 * aliases are unique. Case matters. ('String' is not the same as 'string'). No
 * alias can have a name a gene has and vice versa.
 * <p>
 * Every gene has a callback function associated with it. The default callback
 * function is
 * '<code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof|typeof}</code>
 * variable == {@link Gene}' . {@link Gene.isA} calls this callback.
 * <p>
 * No constructor is defined. All functionality is static. {@link Gene}s are managed
 * via registration. They are {@link String}s, but not every {@link String} is
 * a {@link Gene}.
 * <p>
 * <b>Why this name? </b>
 * Many types of types we have to deal with. Therefore another name for 'allowed
 * types' was searched for. It should be short, have a meaning near to
 * 'very basic' and it should reasonable not be used further in the code, so
 * that name is replaceable throughout whole file, if another one would be
 * used.
 */
class Gene {
  static #registeredGenes = {}
  static #aliases = {}
  static #NO_GENE = "noGene"
  /** default isOfTypeCallback
   * @param {*} v
   * @param {Gene} gene
   * @returns {Boolean}
   */
  static #typeOf(v, gene) {
    return typeof v == gene
  }
  /** The 'no gene' identification.
   * <p>
   * As shorthand {@link NO} can be used.<br>
   * @type {String}
   */
  static get NO_GENE() {
    return Gene.#NO_GENE
  }
  /** Registers {@link gene} if not yet registered and returns true, false else.
   * <p>
   * Does not register {@link name} it if is registered as {@link Gene} or as alias.
   * Does not register {@link name} if it is no String. Returns false in this case.
   * @param {String} gene
   * @param {isOfTypeCallback} cbk - if undefined typeof {@link v} == {@link name} is used
   * @returns {Boolean}
   */
  static register(name, cbk) {
    if (typeof name != "string") return false
    let answ = false
    let fu = cbk == undefined ? Gene.#typeOf : cbk
    if (!Gene.#nameExists(name)) {
      Gene.#registeredGenes[name] = fu
      answ = true
    }
    return answ
  }
  /** Registers an alias for a existing gene, it it does not exist and returns
   * true. Returns false otherwise. Returns false on wrong parameter types
   * @param {String} name
   * @param {String} gene
   * @returns {Boolean}
   */
  static registerAs(name, gene) {
    if (typeof name != "string" || typeof gene != "string") return false
    let answ = false
    if (!Gene.#nameExists(name) && Gene.isRegistered(gene)) {
      Gene.#aliases[name] = gene
      answ = true
    }
    return answ
  }
  /** Unregisters {@link gene} if registered and returns true, false else.
   * <p>
   * {@link gene} is unregistered even if aliases for it exist, they will be
   * removed
   * If {@link gene} is an alias, only that alias is removed, true will be
   * returned
   * @param {String} gene
   * @returns {Boolean}
   */
  static unRegister(gene) {
    if (typeof gene != "string") return false
    let answ = false
    if (Gene.#registeredGenes[gene] != undefined) {
      delete Gene.#registeredGenes[gene]
      answ = true
    }
    for (const [alias, value] of Object.entries(Gene.#aliases))
      if (value == gene) {
        delete Gene.#aliases[alias]
        answ = true
      }
    return answ
  }
  /** Returns whether {@link name} is registered gene or alias.
   * @param {String} name
   * @returns {Boolean}
   */
  static isRegistered(name) {
    if (typeof name != "string") return false
    return Gene.#nameExists(name)
  }
  /** Returns {@link Gene} for {@link name} if registered or alias, {@link Gene.NO_GENE} else
   * <p>
   * If {@link name} is registered {@link Gene}, {@link name} is returned,
   * if an alias is registered, the {@link Gene} it is bound to is returned,
   * if none of both is true, {@link Gene.NO_GENE} is returned
   * <p>
   * As shorthand {@link G} can be used.<br>
   * @param {String} name
   * @returns {String}
   */
  static gene(name) {
    if (typeof name != "string") return Gene.#NO_GENE
    return Gene.#aliases[name] != undefined
      ? Gene.#aliases[name]
      : Gene.#nameExists(name)
      ? name
      : Gene.#NO_GENE
  }
  /** Returns whether {@link v} fulfills {@link gene}'s requirements
   * <p>
   * In the use case {@link Gene} was written for, this means, if {@link v} is
   * of type {@link gene}. This is checked with the callback function of
   * {@link gene}, so other use cases are possible.
   * @param {*} v
   * @param {Gene} gene
   * @returns {Boolean}
   * @throws TypeError - if {@link gene} is no {@link Gene}
   */
  static isA(v, name) {
    if (!Gene.#nameExists(name))
      throw new TypeError(
        `function 'Gene.isA'${NL}2nd parameter '${name}' is not of type 'Gene'`
      )
    return Gene.#registeredGenes[Gene.gene(name)](v, Gene.gene(name))
  }
  static #nameExists(name) {
    return (
      Gene.#registeredGenes[name] != undefined ||
      Gene.#aliases[name] != undefined
    )
  }
  // prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("Gene", outputObj)) {
      _.run(registerTest)
      _.run(registerAsTest)
      _.run(unRegisterTest)
      _.run(isRegisteredTest)
      _.run(geneTest)
      _.run(GTest)
      _.run(NOTest)
      _.run(isATest)
      _.destruct()
      _ = null
    }
    function registerTest() {
      let name = "abc"
      let alias = "uv_wx"
      _.bassert(1,!Gene.register(22),"should register '22', as it is no 'String' and return true")
      _.bassert(2,Gene.register(name),"should register and return true")
      _.bassert(3,!Gene.register(name),"should not register 2nd time and return false")
      Gene.unRegister(name)
      _.bassert(4,Gene.register(name),"after unregistration registration should succeed")
      Gene.registerAs(alias,name)
      _.bassert(5,!Gene.register(alias), "registering a gene under an existing alias name should not work")
      Gene.unRegister(name)
    }
    function registerAsTest() {
      let name0 = "abc"
      let name = "xyz"
      let name2 = "SSS_xyz"
      let alias = "uv_wx"
      Gene.register(name)
      Gene.register(name2)
      _.bassert(1,!Gene.registerAs(22,name0),"should not register as '22' is not of type 'String'.")
      _.bassert(2,!Gene.registerAs(alias,22),"should not register as '22' is not of type 'String'.")
      _.bassert(3,!Gene.registerAs(alias,name0),"should not register as gene with this name does not exist.")
      _.bassert(4,Gene.registerAs(alias,name),"should register as gene with this name exists.")
      _.bassert(5,!Gene.registerAs(alias,name),"Second registration of same alias should not work")
      _.bassert(6,!Gene.registerAs(alias,name2),"Second registration of same alias should not work even with other gene")
      _.bassert(7,!Gene.registerAs(name,name),"Registration with alias which is a gene should not work")
      _.bassert(8,!Gene.registerAs(name,name2),"Registration with alias which is a gene should not work")
      Gene.unRegister(name2)
      Gene.unRegister(name)
    }
    function unRegisterTest() {
      let name = "abc"
      let aName = "xAbc"
      let alias = "Xyz"
      Gene.register(name)
      Gene.register(aName)
      Gene.registerAs(alias,aName)
      _.bassert(1,!Gene.unRegister(22),"should not unregister as '22' is no 'String'")
      _.bassert(2,Gene.unRegister(name),"should unregister and return true")
      _.bassert(3,!Gene.unRegister(name),"should not unregister 2nd time and return false")
      _.bassert(4,Gene.unRegister(aName),"should unregister and return true")
      _.bassert(5,!Gene.unRegister(aName),"should not unregister 2nd time and return false")
    }
    function isRegisteredTest() {
      let name0 = "abc_xyz"
      let name = "abc"
      Gene.register(name)
      _.bassert(1,!Gene.isRegistered(22),"'22' should be no gene")
      _.bassert(2,!Gene.isRegistered(name0),"should be no gene")
      _.bassert(3,Gene.isRegistered(name),"should be gene as registered")
      Gene.unRegister(name)
    }
    function geneTest() {
      let name0 = "abc_xyz"
      let name = "abc"
      let alias = "xyz"
      Gene.register(name)
      Gene.registerAs(alias, name)
      _.bassert(2,Gene.gene(22) == Gene.NO_GENE,"'22'should be no gene")
      _.bassert(2,Gene.gene(name0) == Gene.NO_GENE,"should be no gene")
      _.bassert(3,Gene.gene(name) == name,"should be a gene and return same name")
      _.bassert(4,Gene.gene(alias) == name, "should return bound gene")
      Gene.unRegister(name)
    }
    function GTest() {
      let name0 = "abc_xyz"
      let name = "abc"
      let alias = "xyz"
      Gene.registerAs(alias, name)
      Gene.register(name)
      _.bassert(1,G(name0) == Gene.gene(name0),"G should be short form of Gene.gene")
      _.bassert(2,G(name) == Gene.gene(name),"G should be short form of Gene.gene")
      _.bassert(3,G(alias) == Gene.gene(alias),"G should be short form of Gene.gene")
      Gene.unRegister(name)
    }
    function NOTest() {
      let name0 = "abc_xyz"
      _.bassert(1,Gene.NO_GENE == NO,"NO should be short form of Gene.NO_GENE")
      _.bassert(2,Gene.gene(name0) == NO,"NO should be short form of Gene.NO_GENE")
    }
    function isATest() {
      let gene = "number"     
      let genE = "Number"     
      _.shouldAssert(1,_tryIsA,22,22,`'22' is not a 'String'`)
      _.shouldAssert(2,_tryIsA,22,gene,`'$(gene)' is not registered as Gene`)
      Gene.register(gene)
      _.assert(3,_tryIsA,22,gene,`'$(gene)' is registered`)
      _.bassert(4,Gene.isA(22,gene),`22 should be '$(gene)'`)
      Gene.register(genE)
      _.bassert(5,!Gene.isA(22,genE),`22 should not be '${genE}'`)     
      Gene.unRegister(genE)
      Gene.registerAs(genE,gene)
      _.bassert(6,Gene.isA(22,genE),`22 should now be '${genE}', as it is registered as alias`)     
      Gene.unRegister(gene)
    }
    function _tryIsA(arg1, arg2) {
      Gene.isA(arg1, arg2)
    }
  }
}
registeredTests.push(Gene.test)
/** Shorthand for {@link Gene.gene} */
let G = Gene.gene
/** Shorthand for {@link Gene.NO_GENE} */
let NO = Gene.NO_GENE

// UserType: String, Number, Boolean, Function
// Gene: string,number,boolean,function
// UserType: String, Boolean, Number, Array, Date, Frontmatter,
class Genes {}
//            (ut|ut),Array.<ut>,(ut|Array.<ut>)
class Essence extends Genes {
  get ROOT() {
    return this[Essence.#pre + "ROOT"]
  }
  get RENDER() {
    return this[Essence.#pre + "RENDER"]
  }
  get TYPE() {
    return this[Essence.#pre + "TYPE"]
  }
  get DEFAULT() {
    return this[Essence.#pre + "DEFAULT"]
  }
  get IGNORE() {
    return this[Essence.#pre + "IGNORE"]
  }
  get FLAT() {
    return this[Essence.#pre + "FLAT"]
  }
  get ONCE() {
    return this[Essence.#pre + "ONCE"]
  }
  get REPEAT() {
    return this[Essence.#pre + "REPEAT"]
  }
  get skipped() {
    return this.#skipped
  }
  static #pre = "__"
  static #SPEC_KEY = "__SPEC"
  static #RENDER_DEFT = false
  static #TYPE_DEFT = "String"
  static #DEFAULT_DEFT = ""
  static #IGNORE_DEFT = false
  static #FLAT_DEFT = false
  static #ONCE_DEFT = false
  static #REPEAT_DEFT = false
  #skipped = [] //[["name","value","type"],["name2","value2","type2"]]

  constructor(literal, parent) {
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
    if (!this.#checkType(litREN, "boolean", "RENDER")) litREN = u
    if (!this.#checkType(litTYP, "string", "TYPE")) litTYP = u
    if (!this.#checkType(litIGN, "boolean", "IGNORE")) litIGN = u
    if (!this.#checkType(litFLT, "boolean", "FLAT")) litFLT = u
    if (!this.#checkType(litONC, "boolean", "ONCE")) litONC = u
    if (!this.#checkType(litREP, "boolean", "REPEAT")) litREP = u
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
    if (!this.#checkType(litDEF, this.TYPE, "DEFAULT", true)) litDEF = u
    let DEFT = litDEF != u ? litDEF : p != u ? p.DEFAULT : Essence.#DEFAULT_DEFT
    Object.defineProperty(this, Essence.#pre + "DEFAULT", {
      value: DEFT,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    if (literal != u) delete literal[Essence.#SPEC_KEY]
  }
  #checkType(value, type, name, isUserType = false) {
    let ok = false
    if (value == undefined) ok = true
    else {
      if (!isUserType) ok = typeof value == type
      else {
        type = Gene.gene(type)
        if (type[0] == type[0].toLowerCase()) {
          ok = typeof value == type
        } else if (Array.isArray(value) && type == "Array") {
          ok = true
        } else {
          ok = typeof value == "string"
        }
      }
    }
    if (!ok) this.#skipped.push(new Array(name, value, type))
    return ok
  }
}

class BreadCrumbs extends Essence {}
//#endregion code

/** exported function
 * @param {Object} tp - templater object
 * @param {Object} app - obsidian api object
 * @returns {Object}
 */
async function main(tp, app) {
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
      errOut(e, YAML)
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
