module.exports = main // templater call: "await tp.user.foty(tp, app)"
/** Script for obsidian, templater extension needed
 * Creates new notes with frontmatter and text skeleton based on note types
 *
 * Basics
 * ======
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
 *
 * Problem description
 * ===================
 * For each kind of note another template is needed. If needs change, the
 * template has to be changed. If general needs change, all templates have
 * to be changed. Elaborated Templates are difficult to maintain. Not all
 * users of obsidian can write javascript.
 *
 * Intention of foty
 * =================
 * Let user needs be configurable and write a full note skeleton from given
 * configuration.
 * For changing needs only configuration should have to be changed.
 *
 * Presumptions
 * ============
 * Note skeleton will contain a frontmatter header and a rendered part.
 * Frontmatter header has frontmatter entries. Rendered part has plain text
 * and text based on variable output, e.g. date or links to resources.
 *
 * On new unnamed note creation note name will be created. Some kinds of
 * notes have a marker in its names, which do not belong to the semantic
 * title.
 *
 * This all has to be configurable based on kind of note. Different kinds
 * of notes in foty are called 'types'. The configuration of a type should
 * lead to expected output, after foty has identified the type and the
 * (semantic) title.
 *
 * Note types can be bound to folders.
 *
 * Realization
 * ===========
 * foty consists of two parts: This javascript file and the template file,
 * which calls this script.
 *
 * The script will return a list of key/value entries. One of the keys
 * is '____'. Before this key all entries are frontmatter entries, entries
 * after this keys are variables to be used in render part.
 *
 * The template will write out all frontmatter entries in notes frontmatter
 * header section. Then it will write the render section depending on
 * variables.
 *
 * Connection between script and template is tight, the template has to know
 * the names of the variables.
 *
 * One could have realized it the way, that all the output is created from
 * script file, but than changes in rendering only would require javascript
 * editing.
 *
 * Usage
 * =====
 * Different parts of codes are in different regions.
 * A region starts with //#region REGIONNAME or //# regionname
 * and it ends with //#endregion REGIONNAME or //#endregion regionname
 * Regions can be nested.
 * Using Visual Studio Code (and perhaps other source code editors) regions
 * marked this way can be folded for convenience.
 *
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
//  #endregion DONTTOUCH
//  #region USER CONFIGURATION
//  #endregion USER CONFIGURATION
//  #region test configurations
//   Specification options:
//   - render
//     default: false, as long as not set
//              if set, the value will be inherited by contained collections
//              as long as set again
const TYPE_PROMPT = "Typ wählen"
const TYPE_MAX_ENTRIES = 10 // Max entries in "type" drop down list
const Test = {
  FOLDER2TYPE: {
    diary: ["diary"],
    others: ["citation"],
  },
  NOTETYPES: {
    diary: {
      MARKER: "",
      DATE: true,
      TITLE_BEFORE_DATE: "",
      DATEFORMAT: "YYYY-MM-DD",
    },
    citation: {MARKER: "°"},
  },
  a: 23,
  // => in frontmatter section
  // a:23
  c: {
    _SPEC: {render: true},
    pict: "ja",
    d: {
      _SPEC: {render: false},
      d: {
        gloria: "halleluja",
      },
    },
  },
  // => in render section
  // b:ja
}
const Test2 = {
  audio: {marker: "{a}", pict: "a.jpg", frontmatter: {private: true}},
  plant: {frontmatter: {kind: "", seed: ""}},
}
//  #endregion test configurations
//#endregion CONFIGURATION
//#region debug, base, error and test
var DEBUG = true
const TESTING = true
if (TESTING) DEBUG = false
// nach @todo und @remove suchen

/** Colors, to be used without quotation marks during development */
const cyan = "cyan"
const red = "orange"
const blue = "deepskyblue"
const yellow = "lightgoldenrodyellow"
const lime = "lime"
const green = "lightgreen"
const gray = "silver"

/** Logs all parameters to console, if "DEBUG" is set to true
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

/** Logs 'str' colored to console
 * @param  {String} str
 * @param {String} b - background color
 * @param {String} c - foreground color
 */
function aut(str, b = "yellow", c = "red") {
  console.log("%c" + str, `background:${b};color:${c};font-weight:normal`)
}

/** logs 'vn' and 'v' colored to console
 * @param {String} vn - variable name
 * @param {String} v - variable value
 * @param {String} b - background color
 * @param {String} c - foreground color
 */
function vaut(vn, v, b = "yellow", c = "red") {
  let str = vn + ": " + v
  console.log("%c" + str, `background:${b};color:${c};font-weight:normal`)
}

/** superclass for all Foty Errors (but not unit test Errors) */
class FotyError extends Error {
  constructor(...params) {
    super(...params)
    this.name = "Foty Error"
  }
}

/** User Error thrown from Setting tree */
class SettingError extends FotyError {
  //#region member variables
  section
  //#endregion member variables
  constructor(section = "Setting", ...params) {
    super(...params)
    this.name = "Setting Error"
    this.section = section
  }
}

/** Programming Error */
class CodingError extends FotyError {
  //#region member variables
  section
  //#endregion member variables
  constructor(section = "Setting", ...params) {
    super(...params)
    this.name = "Coding Error"
    this.section = section
  }
}

/** Runs unit tests */
class TestSuite {
  //#region member variables
  static ok = "\u2713"
  static nok = "\u2718"
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
  get name() {
    return this.#name
  }
  e = "none"
  //#endregion member variables

  /** Sets up the suite
   * @param {String} name - name of the suite
   * @param {Object} outputObj - javascript object for output in Obsidian
   */
  constructor(name, outputObj) {
    this.#name = name ? name : "Unknown"
    this.o = outputObj
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
    this.#cases++
    //aut(`${this.#name}/${this.#fname}/${errcase}`) // @remove
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
   * @param {...} ...params
   */
  assert(errcase, fn, ...params) {
    this.#cases++
    try {
      //aut(`${this.#name}/${this.#fname}/${errcase}`) // @remove
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
   * @param {...} ...params
   */
  shouldAssert(errcase, fn, ...params) {
    this.#cases++
    let hasAsserted = false
    let message = params.pop()
    try {
      //aut(`${this.#name}/${this.#fname}/${errcase}`) // @remove
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
    if (key != this.s && key != this.f && key != this.d) {
      let errstr = "%c" + key
      console.log(errstr, "background: rgba(255, 99, 71, 0.5)")
    } else if (this.o[key] == this.e) {
      this.o[key] = str
    } else if (str[0] == TestSuite.nok) {
      if (key == this.d) {
        let outParts = this.o[key].split(TestSuite.nok)
        let len = outParts.length
        let okPart = outParts[len - 1]
        if (len == 1) {
          let newLastPart = str.substring(1) + "\n          " + okPart
          outParts[outParts.length - 1] = newLastPart
          this.o[key] = outParts.join()
        } else {
          let newLastPart = "\n          " + str.substring(1) + okPart
          outParts[outParts.length - 1] = newLastPart
          this.o[key] = outParts.join(TestSuite.nok)
        }
      } else {
        this.o[key] = str.substring(1) + "\n          " + this.o[key]
      }
    } else {
      this.o[key] = this.o[key] + "\n          " + str
    }
  }
}

/** Error used for unit test  */
class TestError extends Error {
  constructor(message, ...params) {
    super(message, ...params)
    this.name = "TestError"
  }
  toString() {
    return " °°" + this.constructor.name + " " + this.name
  }
}
//#endregion debug,test and error
//#region globals
const Dialog = {
  Ok: "Ok",
  Cancel: "Cancel",
}
//#endregion globals
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
    Event._.bassert(1, str.contains("eventname"), "does not contain Event name")
  }
  static registerCallbackTest() {
    let e = new Error()
    Event._.assert(1, Event._tryRegisterCallback, undefined, undefined)
    Event._.assert(2, Event._tryRegisterCallback, "eventname", undefined)
    Event._.assert(3, Event._tryRegisterCallback, "eventname", e)
  }
  static _tryConstruct(arg1) {
    let event = new Event(arg1)
  }
  static _tryRegisterCallback(arg1, arg2) {
    let e = new Event("eventname")
    e.registerCallback(arg1, arg2)
  }
  //#endregion Event tests
}

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
    Event.test(outputObj)
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
      str.contains("°°"),
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
    let d = new Dispatcher()
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
//#endregion helper classes
//#region code
/** superclass for all settings classes
 * @classdesc
 * settings are organized in collections and items. A collection contains other
 * collections and items, each identified by a key. Content of collection/item
 * is given as literal description. So every collection has a key and a literal.
 * Besides root collection every collection has a parent BreadCrumbs. Only
 * literal is handled specifically by subclasses. But it always has to be an
 * Object (js object, but not null and not an array) if defined
 *
 * BreadCrumbs as superclass handles what all subclasses have in common: key and
 * parent; they are nothing the subclasses have to care with,so those are as
 * private members named differently: #ident and #caller.
 */
class BreadCrumbs {
  //#region member variables
  static #instanceCounter = 0
  #ident
  #caller
  #literal
  static #objTypes = {
    Null: (arg) => {
      return arg == undefined
    },
    Array: (arg) => {
      return Array.isArray(arg)
    },
    Object: (arg) => {
      return arg == undefined ? false : Array.isArray(arg) ? false : true
    },
  }
  /** Registers className for type checking with isOfType
   *
   * static function instanceOfMe has to be provided by caller
   * @param {String} className - name of a defined object, which has member
   *                             function instanceOfMe
   */
  set objTypes(className) {
    try {
      eval(className)
    } catch (e) {
      throw new SettingError(
        this.constructor.name + " " + "set objTypes",
        "Breadcrumbs: '" + this.toBreadcrumbs() + "'\n   " + e.message
      )
    }
    if (!eval(className).instanceOfMe) {
      throw new SettingError(
        this.constructor.name + " " + "set objTypes",
        "Breadcrumbs: '" +
          this.toBreadcrumbs() +
          "'\n   '" +
          className +
          ".instanceOfMe' has to be defined"
      )
    }
    BreadCrumbs.#objTypes[className] = eval(className).instanceOfMe
  }
  /** Returns literal given in BreadCrumbs constructor
   * @returns {*}
   */
  get literal() {
    return this.#literal
  }
  //#endregion member variables
  /** Constructs a new BreadCrumbs and registers its type
   * @constructor
   * @param {Undefined|Object} literal
   * @param {String|Symbol} key
   * @param {Undefined|BreadCrumbs} parent
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key, parent) {
    this.#literal = literal
    this.#ident = key
    this.#caller = parent
    this.throwIfNotOfType(literal, ["undefined", "Object"])
    this.throwIfUndefined(key, "key")
    this.throwIfNotOfType(key, ["string", "symbol"])
    this.throwIfNotOfType(parent, ["undefined", "BreadCrumbs"])
    if (!BreadCrumbs.#instanceCounter++) this.objTypes = "BreadCrumbs"
  }

  /** Returns whether arg is instance of BreadCrumbs
   * @param {Object} arg
   * @returns {Boolean}
   */
  static instanceOfMe(arg) {
    return arg instanceof BreadCrumbs
  }

  /** Returns string representing class instance for superclass and subclasses
   * @returns {String} string containing class name of deepest subclass and key
   *          as given in BreadCrumbs constructor
   */
  toString() {
    if (typeof this.#ident == "string")
      return "°°°" + this.constructor.name + " " + this.#ident
    else if (typeof this.#ident == "symbol")
      return "°°°" + this.constructor.name + " " + this.#ident.toString()
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
    if (BreadCrumbs.isDefined(this.#caller)) {
      if (typeof this.#caller.toBreadcrumbs == "function")
        breadcrumbs += this.#caller.toBreadcrumbs()
      else breadcrumbs += this.#caller + "NOBREADCRUMBS"
      sep = "."
    }
    breadcrumbs += sep + this.#ident
    return breadcrumbs
  }

  /** Returns whether instance has no ancestor
   * @returns {Boolean}
   */
  isRoot() {
    return !BreadCrumbs.isDefined(this.#caller)
  }

  /** Returns whether ancestor of instance is root
   * @returns {Boolean}
   */
  isFirstGeneration() {
    return !this.isRoot() && this.#caller.isRoot()
  }

  /** Throws if val is not strictly undefined (null is defined)
   *
   * Does not throw on parameter type errors
   * @param {*} val
   * @param {String} vname - becomes part of Error message
   * @param {String} [funame="constructor"] - becomes part of Error message
   * @param {String} [msg] - becomes part of Error message
   * @throws {SettingError}
   */
  throwIfUndefined(val, vname, funame = "constructor", msg = "is undefined") {
    if (typeof vname != "string") vname = ""
    if (typeof funame != "string") funame = ""
    if (typeof msg != "string") msg = "' is undefined"
    if (!BreadCrumbs.isDefined(val))
      throw new SettingError(
        this.constructor.name + " " + funame,
        "Breadcrumbs: '" + this.toBreadcrumbs() + "'\n   '" + vname + "' " + msg
      )
  }

  /** Throws if val is not of type or of one of the entries in type array
   *
   * Does not throw on other parameters type errors
   * @param {*} val
   * @param {({Array.<String}|String)} type
   * @param {String} [funame="constructor"] - becomes part of Error message
   * @param {String} [msg] - becomes part of Error message
   * @throws {SettingError}
   */
  throwIfNotOfType(val, type, funame = "constructor", msg = "is not of type") {
    if (typeof funame != "string") funame = ""
    if (typeof msg != "string") msg = "' is undefined"
    if (Array.isArray(type)) {
      if (
        !type.some((t) => {
          return BreadCrumbs.isOfType(val, t)
        })
      )
        throw new SettingError(
          this.constructor.name + " " + funame,
          "Breadcrumbs: '" +
            this.toBreadcrumbs() +
            "'\n   " +
            msg +
            " '" +
            type.join(" or ") +
            "'"
        )
    } else if (!BreadCrumbs.isOfType(val, type))
      throw new SettingError(
        this.constructor.name + " " + funame,
        "Breadcrumbs: '" +
          this.toBreadcrumbs() +
          "'\n   " +
          msg +
          " '" +
          type +
          "'"
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
   *                        "Null" accepts Null
   *                        "Array" accepts Arrays
   *                        "Object" accepts js Object besides Null and Array
   *                        "BreadCrumbs" accepts BreadCrumb instance
   *                                      and subclass instance
   *                        "Setting" accepts Setting instance
   *                        "SpecManager" accepts SpecManager instance
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
    } else if (typeof val == "object") {
      let fu = BreadCrumbs.#objTypes[type]
      if (typeof fu == "function") answer = fu(val)
    }
    return answer
  }

  // prettier-ignore
  static test(outputObj) { // BreadCrumbs
    let _ = null
    if(_ = new TestSuite("BreadCrumbs", outputObj)) {
      _.run(setterObjTypesTest)
      _.run(getterLiteralTest)
      _.run(constructorTest)
      _.run(instanceOfMeTest)
      _.run(toStringTest)
      _.run(toBreadCrumbsTest)
      _.run(isRootTest)
      _.run(isFirstGenerationTest)
      _.run(throwIfUndefinedTest)
      _.run(throwIfNotOfTypeTest)
      _.run(isDefinedTest)
      _.run(isOfTypeTest)
      _.destruct()
      _ = null
    }
    function setterObjTypesTest() {
      _.shouldAssert(1,_trySetterObjTypes,"Error","Error class has no 'instanceOfMe', should not be registered")
      _.shouldAssert(2,_trySetterObjTypes,"BreadCrumbs1","'BreadCrumbs1' is undefined, should not be registered")
      _.assert(3,_trySetterObjTypes,"BreadCrumbs", "BreadCrumbs should be registered")
    }
    function getterLiteralTest() {
      let breadcrumbs0 = new BreadCrumbs({}, "my name1")
      let breadcrumbs1 = new BreadCrumbs({"key1": 87673}, "my name2")
      _.bassert(1,breadcrumbs1.literal.key1 == 87673, "does not return literal given on construction ")
      _.bassert(2,BreadCrumbs.isDefined(breadcrumbs0.literal), "empty literal given should be defined")
    }
    function constructorTest() {
      let un
      _.assert(1,_tryConstruct,un,"myName1",un, "undefined for literal, string for name, undefined for parent should construct")
      _.assert(2,_tryConstruct,{},"myName2",un, "empty object for literal should construct")
      _.shouldAssert(3,_tryConstruct,2,"myName3",un, "number for literal should not construct")
      _.shouldAssert(4,_tryConstruct,null,"myName4",un, "null for literal should not construct")
      _.assert(5,_tryConstruct,new Error(),"myName5",un, "anyclass for literal should construct")
      _.shouldAssert(6,_tryConstruct,["a","b"],"myName6",un, "array for literal should not construct")
      _.shouldAssert(7,_tryConstruct,Symbol(),"myName7",un, "symbol for literal should not construct")
  
      _.assert(8,_tryConstruct,un,Symbol(),un, "symbol for key should construct")
      _.shouldAssert(9,_tryConstruct,{},un,un,"key has to be defined")
      _.shouldAssert(10,_tryConstruct,{},2,un,"key can not be a number")
      _.shouldAssert(11,_tryConstruct,{},null,un,"key may not be 'null'")
      _.shouldAssert(12,_tryConstruct,{},{},un,"key may not be an object")
      _.shouldAssert(13,_tryConstruct,{},new Error(),un,"key may not be 'Error' instance")
      _.shouldAssert(14,_tryConstruct,{},["a","b"],un,"key may not be an array")
  
      let breadcrumbs = new BreadCrumbs(un,"myName8")
      let parent = new BreadCrumbs({},"myName9")
      _.assert(15,_tryConstruct,un,"myName10",breadcrumbs,"BreadCrumbs with no literal for parent should construct")
      _.assert(16,_tryConstruct,un,"myName11",parent, "BreadCrumbs with literal for parent should construct")
      _.shouldAssert(17,_tryConstruct,un,"myName12",null,"parent may not be 'null'")
      _.shouldAssert(18,_tryConstruct,un,"myName13",new Error(),"parent may not be 'Error' instance")
      _.shouldAssert(19,_tryConstruct,un,"myName14",{},"parent may not be a plain js object")
      _.shouldAssert(20,_tryConstruct,un,"myName15",2,"parent may not be a number")
      _.shouldAssert(21,_tryConstruct,un,"myName16",["a","b"],"parent may not be an array")
      _.shouldAssert(22,_tryConstruct,un,"myName17",Symbol(),"parent may not be a symbol")
  
      _.bassert(101,breadcrumbs instanceof Object,"'BreadCrumbs' has to be an instance of 'Object'")
      _.bassert(102,breadcrumbs instanceof BreadCrumbs,"'BreadCrumbs' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,breadcrumbs.constructor == BreadCrumbs,"the constructor property is not 'BreadCrumbs'")
    }
    function instanceOfMeTest() {
      let un
      _.bassert(1,BreadCrumbs.instanceOfMe(new BreadCrumbs(un, "BInstance")),"BreadCrumbs instance should be an instance of BreadCrumbs")
      _.bassert(2,!BreadCrumbs.instanceOfMe(new Error()),"Error instance should not be an instance of BreadCrumbs")
      _.bassert(3,!BreadCrumbs.instanceOfMe("BreadCrumbs"),"String should not be an instance of BreadCrumbs")
      _.bassert(4,!BreadCrumbs.instanceOfMe(22),"number should not be an instance of BreadCrumbs")
    }
    function toStringTest() {
      let str = new BreadCrumbs(undefined, "my name11").toString()
      _.bassert(1,str.contains("my name11"),"result does not contain name given on construction")
      _.bassert(2,str.contains("BreadCrumbs"),"result does not contain class name")
      str = new BreadCrumbs({},"myName20").toString()
      _.bassert(3,str.contains("myName20"),"result does not contain name given on construction")
      _.bassert(4,str.contains("BreadCrumbs"),"result does not contain class name")
    }
    function toBreadCrumbsTest() {
      let parent = new BreadCrumbs(undefined, "parent1")
      let child = new BreadCrumbs(undefined, "child1", parent)
      let grandChild = new BreadCrumbs(undefined, "grandChild1", child)
      let parentStr = parent.toBreadcrumbs()
      let childStr = child.toBreadcrumbs()
      let grandChildStr = grandChild.toBreadcrumbs()
      _.bassert(1,parentStr == "parent1","breadCrumbs '" + parentStr + "' are wrong")
      _.bassert(2,childStr == "parent1.child1","breadCrumbs '" + childStr + "' are wrong")
      _.bassert(3,grandChildStr == "parent1.child1.grandChild1","breadCrumbs '" + grandChildStr + "' are wrong")
    }
    function isRootTest() {
      let parent = new BreadCrumbs(undefined, "parent11")
      let child = new BreadCrumbs(undefined, "child11", parent)
      let grandChild = new BreadCrumbs(undefined, "grandChild11", child)
      _.bassert(1,parent.isRoot(),"first parent should be root")
      _.bassert(2,!child.isRoot(),"child should not be root")
      _.bassert(3,!grandChild.isRoot(),"grandchild should not be root")
    } 
    function isFirstGenerationTest() {
      let parent = new BreadCrumbs(undefined, "parent21")
      let child = new BreadCrumbs(undefined, "child21", parent)
      let grandChild = new BreadCrumbs(undefined, "grandChild21", child)
      _.bassert(1,!parent.isFirstGeneration(),"root parent should not be first generation")
      _.bassert(2,child.isFirstGeneration(),"root child should be first generation")
      _.bassert(3,!grandChild.isFirstGeneration(),"root grandchild should not be first generation")
    }
    function throwIfUndefinedTest() {
      let un
      let vname
      _.assert(1,_tryThrowIfUndefined,22,un,un,un,"should accept all types for all parameter")
      _.shouldAssert(2, _tryThrowIfUndefined,vname, "vname", "test",un,"Should throw as 'vname' is undefined")
      _.assert(3,_tryThrowIfUndefined,null,un,un,un,"should not throw for null")
    }
    function throwIfNotOfTypeTest() {
      let un
      let str = "String"
      _.assert(1,_tryThrowIfNotOfType,22,"number",un,un,"should accept all types for all parameter, besides 2nd")
      _.shouldAssert(2, _tryThrowIfNotOfType,22, un, un,un,"should throw for 22 and no type given")
      _.shouldAssert(3, _tryThrowIfNotOfType,str, "String", "test",un,"should throw as 'String' is no valid type to check against")
      _.assert(4, _tryThrowIfNotOfType,str, ["String","string"], "test",un,"should not throw as 'string' is correct type and is contained in 2nd parameter")
    }
    function isDefinedTest() {
      _.bassert(1,BreadCrumbs.isDefined(""),"Empty String should be defined")
      _.bassert(2,BreadCrumbs.isDefined(null),"null should be defined")
      _.bassert(3,!BreadCrumbs.isDefined(undefined),"undefined should not be defined")
    }
    function isOfTypeTest() {
      let undef = undefined
      let nul   = null
      let bool1 = true
      let bool2 = false
      let num1 = 0
      let num2 = 22
      let num3 = -128
      let num4 = 45.7
      let num5 = -854.7234
      let num6 = NaN
      let num7 = Infinity
      let num8 = -Infinity
      let bigI1 = BigInt(Number.MAX_SAFE_INTEGER)+1n;
      let str1 = ""
      let str2 = "String"
      let sym1 = Symbol()
      let sym2 = Symbol("name_s1")
      let sym3 = Symbol("name_s2")
      let obj1 = {}
      let obj2 = {a: 1, b: 2,}
      let arr1 = []
      let arr2 = ["a", "b", 2,]
      let breadcrumb1 = new BreadCrumbs({},"name_b1")
      let breadcrumb2 = new BreadCrumbs(undefined,Symbol("name_s1"))

      _.bassert(1,!BreadCrumbs.isOfType(str2,"Unknown"), "Unknown" + " is not an accepted type")
      _.bassert(2,!BreadCrumbs.isOfType(undef,undef), "type of type 'Undefined' is not an accepted type")
      _.bassert(3,!BreadCrumbs.isOfType(num1,num1), "type of Type 'Number' is not an accepted type")
      _.bassert(4,BreadCrumbs.isOfType(undef,"undefined"), undef + " should be of type " + "undefined")
      _.bassert(5,BreadCrumbs.isOfType(nul,"object"), nul + " should be of type " + "object")
      _.bassert(6,BreadCrumbs.isOfType(bool1,"boolean"), bool1 + " should be of type " + "boolean")
      _.bassert(7,BreadCrumbs.isOfType(bool2,"boolean"), bool2 + " should be of type " + "boolean")
      _.bassert(8,BreadCrumbs.isOfType(num1,"number"), num1 + " should be of type " + "number")
      _.bassert(9,BreadCrumbs.isOfType(num2,"number"), num2 + " should be of type " + "number")
      _.bassert(10,BreadCrumbs.isOfType(num3,"number"), num3 + " should be of type " + "number")
      _.bassert(11,BreadCrumbs.isOfType(num4,"number"), num4 + " should be of type " + "number")
      _.bassert(12,BreadCrumbs.isOfType(num5,"number"), num5 + " should be of type " + "number")
      _.bassert(13,BreadCrumbs.isOfType(num6,"number"), num6 + " should be of type " + "number")
      _.bassert(14,BreadCrumbs.isOfType(num7,"number"), num7 + " should be of type " + "number")
      _.bassert(15,BreadCrumbs.isOfType(num8,"number"), num8 + " should be of type " + "number")
      _.bassert(16,BreadCrumbs.isOfType(bigI1,"bigint"), bigI1 + " should be of type " + "bigint")
      _.bassert(17,BreadCrumbs.isOfType(str1,"string"), str1 + " should be of type " + "string")
      _.bassert(18,BreadCrumbs.isOfType(str2,"string"), str2 + " should be of type " + "string")
      _.bassert(19,BreadCrumbs.isOfType(sym1,"symbol"), "Symbol()" + " should be of type " + "symbol")
      _.bassert(20,BreadCrumbs.isOfType(sym2,"symbol"), "Symbol(arg)" + " should be of type " + "symbol")
      _.bassert(21,BreadCrumbs.isOfType(sym3,"symbol"), "Symbol(arg)" + " should be of type " + "symbol")
      _.bassert(22,BreadCrumbs.isOfType(obj1,"object"), obj1 + " should be of type " + "object")
      _.bassert(23,BreadCrumbs.isOfType(obj2,"object"), obj2 + " should be of type " + "object")
      _.bassert(24,BreadCrumbs.isOfType(arr1,"object"), "Empty Array" + " should be of type " + "object")
      _.bassert(25,BreadCrumbs.isOfType(arr2,"object"), arr2 + " should be of type " + "object")
      _.bassert(26,BreadCrumbs.isOfType(nul,"Null"), nul + " should be of type " + "Null")
      _.bassert(27,BreadCrumbs.isOfType(arr1,"Array"), "Empty Array" + " should be of type " + "Array")
      _.bassert(28,BreadCrumbs.isOfType(arr2,"Array"), arr2 + " should be of type " + "Array")
      _.bassert(29,BreadCrumbs.isOfType(breadcrumb1,"object"), breadcrumb1 + " should be of type " + "object")
      _.bassert(30,BreadCrumbs.isOfType(breadcrumb1,"Object"), breadcrumb1 + " should be of type " + "Object")
      _.bassert(31,BreadCrumbs.isOfType(breadcrumb1,"BreadCrumbs"), breadcrumb1 + " should be of type " + "BreadCrumbs")
      _.bassert(32,BreadCrumbs.isOfType(breadcrumb2,"object"), breadcrumb2 + " should be of type " + "object")
      _.bassert(33,BreadCrumbs.isOfType(breadcrumb2,"Object"), breadcrumb2 + " should be of type " + "Object")
      _.bassert(34,BreadCrumbs.isOfType(breadcrumb2,"BreadCrumbs"), breadcrumb2 + " should be of type " + "BreadCrumbs")

      _.bassert(101,!BreadCrumbs.isOfType(undef,"object"), undef + " should not be of type " + "object")
      _.bassert(102,!BreadCrumbs.isOfType(undef,"Object"), undef + " should not be of type " + "Object")
      _.bassert(103,!BreadCrumbs.isOfType(undef,"Null"), undef + " should not be of type " + "Null")
      _.bassert(104,!BreadCrumbs.isOfType(nul,"undefined"), nul + " should not be of type " + "undefined")
      _.bassert(105,!BreadCrumbs.isOfType(nul,"Object"), nul + " should not be of type " + "Object")
      _.bassert(106,!BreadCrumbs.isOfType(arr1,"Object"), "Empty Array" + " should not be of type " + "Object")
      _.bassert(107,!BreadCrumbs.isOfType(arr2,"Object"), arr2 + " should not be of type " + "Object")
      _.bassert(108,!BreadCrumbs.isOfType(obj1,"BreadCrumbs"), obj1 + " should not be of type " + "BreadCrumbs")
      _.bassert(109,!BreadCrumbs.isOfType(breadcrumb2,"Setting"), breadcrumb2 + " should not be of type " + "Setting")
    }
    function _trySetterObjTypes(arg1) {
      let un
      let breadCrumbs = new BreadCrumbs(un,"ObjTypesTest",un)
      breadCrumbs.objTypes = arg1
    }
    function _tryConstruct(arg1, arg2, arg3) {
      new BreadCrumbs(arg1, arg2, arg3)
    }
    function _tryThrowIfUndefined(arg1, arg2, arg3, arg4) {
      let breadCrumbs = new BreadCrumbs({},"key")
      breadCrumbs.throwIfUndefined(arg1, arg2, arg3, arg4)
    }
    function _tryThrowIfNotOfType(arg1, arg2, arg3, arg4) {
      let breadCrumbs = new BreadCrumbs({},"key")
      breadCrumbs.throwIfNotOfType(arg1, arg2, arg3, arg4)
    }
  }
}

/** specification parser
 * @classdesc
 * Specification entries are literals of key SPEC_KEY '_SPEC'. SpecManager
 * parses those literals syntactically - it knows, what entries keys have valid
 * specification keys, it knows the defaults for spec entries, it knows, whether
 * and which way they are inherited.
 *
 * Those keys are valid specification options:
 * - render:
 *           type: Boolean
 *           default: false
 *           inherited: true
 *           overWriteable: true (descendants can set another value)
 *
 * SpecManager provides a getter for each specification option.
 * It provides a getter for its handler key,
 */
class SpecManager extends BreadCrumbs {
  //#region member variables
  static #instanceCounter = 0
  static #SPEC_KEY = "_SPEC"
  #render = false
  /** Returns key for entry handled by SpecManager
   * @returns {String}
   */
  static get handlerKey() {
    return SpecManager.#SPEC_KEY
  }
  /** Returns render option value calculated from literal, parent and default
   * @returns {Boolean}
   */
  get render() {
    return this.#render
  }
  //#endregion member variables
  /** Constructs a new SpecManager and registers its type
   * @constructor
   * @param {Object} literal
   * @param {String|Symbol} key
   * @param {BreadCrumbs} parent
   * @param {(Undefined|SpecManager)} grandParentsSpec
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key, parent, grandParentsSpec) {
    super(literal, key, parent)
    if (!SpecManager.#instanceCounter++) this.objTypes = "SpecManager"
    this.throwIfUndefined(literal, "literal")
    // literal {undefined|Object} checked by superclass
    // key {String|Symbol} checked by superclass
    this.throwIfUndefined(parent, "parent")
    // parent {Undefined|BreadCrumbs} checked by superclass
    this.throwIfNotOfType(grandParentsSpec, ["undefined", "SpecManager"])
    this.#setOptionRender(grandParentsSpec)
  }

  /** Returns whether arg is instance of BreadCrumbs
   * @param {Object} arg
   * @returns {Boolean}
   */
  static instanceOfMe(arg) {
    return arg instanceof SpecManager
  }

  /** Sets render option value for this instance
   *
   * Uses value of literal if value given,
   * if not it uses value of grandParentsSpec if grandParentsSpec given
   * as fallback it uses default value, which is false
   * @param {(Undefined|Object)} grandParentsSpec
   */
  #setOptionRender(grandParentsSpec) {
    let defaultRender = false
    let literalRender = BreadCrumbs.isDefined(this.literal)
      ? this.literal["render"]
      : undefined
    let parentRender = BreadCrumbs.isDefined(grandParentsSpec)
      ? grandParentsSpec["render"]
      : undefined
    this.#render =
      literalRender != undefined
        ? literalRender
        : parentRender != undefined
        ? parentRender
        : defaultRender
  }

  // prettier-ignore
  static test(outputObj) { // SpecManager
    let _ = null
    if(_ = new TestSuite("SpecManager", outputObj)) {
      _.run(getterHandlerKeyTest)
      _.run(getterLiteralTest)
      _.run(getterRenderTest)
      _.run(instanceOfMeTest)
      _.run(constructorTest)
      _.run(toStringTest)
      _.run(isOfTypeTest)
      _.run(setOptionRenderTest)      
      _.destruct()
      _ = null
    }
    function getterHandlerKeyTest() {
      _.bassert(1,SpecManager.handlerKey == "_SPEC")
      _.bassert(2,SpecManager.handlerKey != "SPEC")
    }
    function getterLiteralTest() {
      let un
      let parent = new BreadCrumbs(un, "getterLiteralTest", un, un)
      let sym = Symbol("a")
      let specMan1 = new SpecManager({},"getterLiteralTest02",parent,un)
      let specMan2 = new SpecManager({sym: "un"},"getterLiteralTest03",parent,un)
      let specMan3 = new SpecManager({"_SPEC": un},"getterLiteralTest04",parent,un)
      let lit1 = specMan1.literal
      let lit2 = specMan2.literal
      let lit3 = specMan3.literal
      _.bassert(1,lit1,"literal should be empty as given")
      _.bassert(2,lit2.sym == "un","value of Symbol('a') should be 'un' as given")
      _.bassert(3,Object.keys(lit2).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(4,BreadCrumbs.isOfType(lit3["_SPEC"],"undefined"),"value of '_SPEC' should be undefined")
    }
    function getterRenderTest() {
      /* At moment of creation of this test, it is a copy of
       * setOptionRenderTest, because #render is a private member, no setter
       * exists, #render will only be set on construction and never change later
       * But code can change, so the test is added nevertheless */
      let un
      let parent = new BreadCrumbs(un, "getterRenderTest", un, un)
      let spec1 = new SpecManager({},"getterRenderTest1",parent,un)
      let specFalse = new SpecManager({render:false},"getterRenderTest2",parent,un)
      let specTrue = new SpecManager({render:true},"getterRenderTest3",parent,un)
      let spec2 = new SpecManager({},"getterRenderTest1",parent,specFalse)
      let spec3 = new SpecManager({},"getterRenderTest1",parent,specTrue)
      let spec4 = new SpecManager({render:false},"getterRenderTest1",parent,specFalse)
      let spec5 = new SpecManager({render:true},"getterRenderTest1",parent,specFalse)
      let spec6 = new SpecManager({render:false},"getterRenderTest1",parent,specTrue)
      let spec7 = new SpecManager({render:true},"getterRenderTest1",parent,specTrue)

      _.bassert(1,BreadCrumbs.isDefined(spec1.render),"render should be set, if no specification for it is given")
      _.bassert(2,spec1.render === false,"render should be false, if no specification for it is given")
      _.bassert(3,specFalse.render === false,"render should be false, as set in specification")
      _.bassert(4,specTrue.render === true,"render should be true, as set in specification")
      _.bassert(5,spec2.render === false,"render should be false, as set in ancestor spec")
      _.bassert(6,spec3.render === true,"render should be true, as set in ancestor spec")
      _.bassert(7,spec4.render === false,"render should be false, as set in specification")
      _.bassert(8,spec5.render === true,"render should be true, as set in specification")
      _.bassert(9,spec6.render === false,"render should be false, as set in specification")
      _.bassert(10,spec7.render === true,"render should be true, as set in specification")
    }
    function instanceOfMeTest() {
      let un
      let parent = new BreadCrumbs(un, "instanceOfMeTest", un, un)
      let spec1 = new SpecManager({},"instanceOfMeTest1",parent,un)
      _.bassert(1,!SpecManager.instanceOfMe(parent),"BreadCrumbs instance should not be an instance of SpecManager")
      _.bassert(2,!SpecManager.instanceOfMe(new Error()),"Error instance should not be an instance of SpecManager")
      _.bassert(3,SpecManager.instanceOfMe(spec1),"SpecManager instance should be an instance of SpecManager")
      _.bassert(4,!SpecManager.instanceOfMe("SpecManager"),"String should not be an instance of SpecManager")
    }
    function constructorTest() {
      let un
      let p = new BreadCrumbs(un, "constructorTest", un, un)
      let sp = new SpecManager({}, "constructorTest1", p, un)
      _.assert(1,_tryConstruct,{},"cTest1",p,un,"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",p,un,"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",p,un,"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",p,un,"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",p,un,"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,p,un,"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,p,un,"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},p,un,"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},p,p,un,"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),p,un,"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"cTest11",un,un,"should not be be created, parent is undefined")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),un,"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},un,"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring",un,"should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,un,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,un,"should not be be created, parent is null")
      _.assert(17,_tryConstruct,{},"cTest17",p,sp,"should be created, grandParentsSpec is SpecManager")
      _.shouldAssert(18,_tryConstruct,{},"cTest18",p,p,"should not be created, grandParentsSpec is BreadCrumbs")
      _.shouldAssert(19,_tryConstruct,{},"cTest19",p,{},"should not be created, grandParentsSpec is object")
      _.shouldAssert(20,_tryConstruct,{},"cTest20",p,"SpecManager","should not be created, grandParentsSpec is string")

      let specManager = new SpecManager({},"constructorTest101",p)
      _.bassert(101,specManager instanceof Object,"'SpecManager' has to be an instance of 'Object'")
      _.bassert(102,specManager instanceof BreadCrumbs,"'SpecManager' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,specManager instanceof SpecManager,"'SpecManager' has to be an instance of 'SpecManager'")
      _.bassert(104,specManager.constructor == SpecManager,"the constructor property is not 'SpecManager'")
    }
    function toStringTest() {
      let un
      let parent = new BreadCrumbs(un, "toStringTest", un, un)
      let spec1 = new SpecManager({},"toStringTest1",parent,un)
      _.bassert(1,spec1.toString().contains("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,spec1.toString().contains("SpecManager"),"result does not contain class string"    )
    }
    function isOfTypeTest() {
      let un
      let parent = new BreadCrumbs(un, "isOfTypeTest", un, un)
      let spec1 = new SpecManager({},"isOfTypeTest1",parent,un)
      _.bassert(1,BreadCrumbs.isOfType(spec1,"object"), "'" + spec1 + "' should be of type " + "object")
      _.bassert(2,BreadCrumbs.isOfType(spec1,"Object"), "'" + spec1 + "' should be of type " + "Object")
      _.bassert(3,BreadCrumbs.isOfType(spec1,"BreadCrumbs"), "'" + spec1 + "' should be of type " + "BreadCrumbs")
      _.bassert(4,BreadCrumbs.isOfType(spec1,"SpecManager"), "'" + spec1 + "' should be of type " + "SpecManager")
      _.bassert(5,!BreadCrumbs.isOfType(spec1,"Error"), "'" + spec1 + "' should not be of type " + "Error")
    }
    function setOptionRenderTest() {
      let un
      let parent = new BreadCrumbs(un, "setOptionRenderTest", un, un)
      let spec1 = new SpecManager({},"setOptionRenderTest1",parent,un)
      let specFalse = new SpecManager({render:false},"setOptionRenderTest2",parent,un)
      let specTrue = new SpecManager({render:true},"setOptionRenderTest3",parent,un)
      let spec2 = new SpecManager({},"setOptionRenderTest4",parent,specFalse)
      let spec3 = new SpecManager({},"setOptionRenderTest5",parent,specTrue)
      let spec4 = new SpecManager({render:false},"setOptionRenderTest6",parent,specFalse)
      let spec5 = new SpecManager({render:true},"setOptionRenderTest7",parent,specFalse)
      let spec6 = new SpecManager({render:false},"setOptionRenderTest8",parent,specTrue)
      let spec7 = new SpecManager({render:true},"setOptionRenderTest9",parent,specTrue)

      _.bassert(1,BreadCrumbs.isDefined(spec1.render),"render should be set, if no specification for it is given")
      _.bassert(2,spec1.render === false,"render should be false, if no specification for it is given")
      _.bassert(3,specFalse.render === false,"render should be false, as set in specification")
      _.bassert(4,specTrue.render === true,"render should be true, as set in specification")
      _.bassert(5,spec2.render === false,"render should be false, as set in ancestor spec")
      _.bassert(6,spec3.render === true,"render should be true, as set in ancestor spec")
      _.bassert(7,spec4.render === false,"render should be false, as set in specification")
      _.bassert(8,spec5.render === true,"render should be true, as set in specification")
      _.bassert(9,spec6.render === false,"render should be false, as set in specification")
      _.bassert(10,spec7.render === true,"render should be true, as set in specification")
    }
    function _tryConstruct(arg1, arg2, arg3, arg4) {
      new SpecManager(arg1, arg2, arg3, arg4)
    }
  }
}

/** notetypes parser */
class TypesManager extends BreadCrumbs {
  //#region member variables
  static #instanceCounter = 0
  static #TYPES_KEY = "NOTETYPES"
  static #KEYS = ["MARKER", "DATE", "TITLE_BEFORE_DATE", "DATEFORMAT"]
  static #DEFAULT_TYPE = {
    MARKER: "",
    DATE: false,
    TITLE_BEFORE_DATE: "",
    DATEFORMAT: "YYYY-MM-DD",
  }
  #notetypes = {}
  /** Returns key for entry handled by TypesManager
   * @returns {String}
   */
  static get handlerKey() {
    return TypesManager.#TYPES_KEY
  }
  /** Returns keys a notetype has
   * @returns { @returns {Array.<String>}g}
   */
  static get keys() {
    return TypesManager.#KEYS
  }
  /** Returns default notetype with all its keys set to default values
   * @returns {Object.<String.*>}
   */
  static get defaultType() {
    return TypesManager.#DEFAULT_TYPE
  }
  /** Returns Object with all notetypes, bound to their names
   * @returns {Object.<String.Object.<String.*>>}
   */
  get notetypes() {
    return this.#notetypes
  }
  /** Returns names of notetypes
   * @returns {Array.<String>}
   */
  get names() {
    return this.getTypeNames()
  }
  //#endregion member variables
  constructor(literal, key, caller) {
    let typesLiteral
    if (literal != undefined) typesLiteral = literal[TypesManager.#TYPES_KEY]
    super(
      typesLiteral,
      key === undefined ? TypesManager.#TYPES_KEY : key,
      caller
    )
    if (!TypesManager.#instanceCounter++) this.objTypes = "TypesManager"
    this.throwIfUndefined(caller, "caller")
    this.throwIfNotOfType(caller, "BreadCrumbs")
    if (this.literal != undefined && !this.isFirstGeneration())
      throw new SettingError(
        this.constructor.name + " " + constructor,
        "Breadcrumbs: '" +
          this.toBreadcrumbs() +
          "'\n   " +
          "notetypes can only be defined at root level" +
          "\n   " +
          "Move your 'NOTETYPES' definition up."
      )
    this.throwIfUndefined(literal, "literal")
    if (this.literal == undefined) return
    this.createNoteTypesOrThrow()
  }
  createNoteTypesOrThrow() {
    for (const [name, entry] of Object.entries(this.literal)) {
      this.throwIfNotOfType(entry, "object")
      for (const [key, value] of Object.entries(entry)) {
        let allowedKeys = TypesManager.keys
        if (!allowedKeys.contains(key))
          throw new SettingError(
            this.constructor.name + " " + constructor,
            "Breadcrumbs: '" +
              this.toBreadcrumbs() +
              "'\n   '" +
              value +
              "' is no known note type definition key." +
              "\n    Remove unknown key from your note type definitions." +
              "\n   " +
              "Known keys are: '" +
              allowedKeys +
              "'"
          )
        switch (key) {
          case "DATE":
            this.throwIfNotOfType(value, "boolean")
            break
          case "MARKER":
          case "TITLE":
          case "DATEFORMAT":
            this.throwIfNotOfType(value, "string")
            break
        }
      }
      this.#notetypes[name] = Object.assign(
        {},
        TypesManager.#DEFAULT_TYPE,
        entry
      )
    }
  }
  getTypeNames() {
    return Object.keys(this.#notetypes)
  }
  // prettier-ignore
  static test(outputObj) { // TypesManager
    let _ = null
    if(_ = new TestSuite("TypesManager", outputObj)) {
      _.run(constructorTest)
      _.run(toStringTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let parent = new BreadCrumbs({}, "its Name")
      let breadCrumbs = new BreadCrumbs({}, "BreadCrumbs")
      _.shouldAssert(1,_tryConstruct,undefined,"myName",parent,"msg")
      //_.shouldAssert(2,_tryConstruct,{},undefined,parent,"msg")
      _.shouldAssert(3,_tryConstruct,{},"myName",undefined,"msg")
      _.assert(4,_tryConstruct,{},"my Name",parent)
      _.assert(5,_tryConstruct,{},"22",parent )
      _.assert(6,_tryConstruct,{},Symbol("a"),parent)
      let typeMan = new TypesManager({}, "myName", parent)
      _.bassert(7,typeMan instanceof BreadCrumbs,"'TypesManager' has to be an instance of 'BreadCrumbs'")
      _.bassert(8,typeMan.constructor == TypesManager,"the constructor property is not 'TypesManager'")
      _.shouldAssert(9,_tryConstruct,{},"NOTETYPES",breadCrumbs)
      typeMan = new TypesManager({}, "myName", parent)
      _.bassert(10,BreadCrumbs.isOfType(typeMan.notetypes, "object"),"for empty literal TypesManager should construct object,but does not")
      let typeKeys = Object.keys(typeMan.notetypes)
      _.bassert(11,typeKeys.length == 0,"For empty literal TypesManager with no types should be created")
      let defType = TypesManager.defaultType
      _.bassert(12,BreadCrumbs.isOfType(defType, "object"),"default type should always be present,but here it is not")
      let defaultTypeKeys = Object.keys(defType)
      let typesKeys = TypesManager.keys
      _.bassert(13,(typesKeys.length = defaultTypeKeys.length),"defaultType should have as many keys as 'TypesManager.#KEYS'")
      _.bassert(14,defaultTypeKeys.every((key) => {return typesKeys.includes(key)}),"any key of 'TypesManager.#KEYS' should be contained in defaultType,but is not")
    }
    function toStringTest() {
      let parent = new BreadCrumbs({}, "its Name")
      let str = new TypesManager({}, "myName", parent).toString()
      _.bassert(1,str.contains("myName"),"result does not contain name string")
    }
    function _tryConstruct(arg1, arg2, arg3) {
      let specMan = new TypesManager(arg1, arg2, arg3)
    }
  }
}

/** most elaborated subclass
 *
 */
class Setting extends BreadCrumbs {
  //#region member variables
  static #ROOT_KEY = "/"
  #children = {}
  #spec = {}
  #types = {}
  #frontmatterYAML = {}
  #renderYAML = {}
  get spec() {
    return this.#spec
  }
  get typeNames() {
    return this.#types.names
  }
  get defaultType() {
    return TypesManager.defaultType
  }
  get frontmatterYAML() {
    return this.getFrontmatterYAML()
  }
  get renderYAML() {
    return this.getRenderYAML()
  }
  //#endregion member variables
  constructor(
    literal,
    key = undefined,
    caller = undefined,
    callersSpec = undefined
  ) {
    super(literal, key === undefined ? Setting.#ROOT_KEY : key, caller)
    this.throwIfUndefined(literal, "literal")
    this.#spec = new SpecManager(
      this.literal[SpecManager.handlerKey],
      undefined,
      this,
      callersSpec
    )
    this.#types = new TypesManager(this.literal, undefined, this)
    for (const [key, value] of Object.entries(this.literal)) {
      if (BreadCrumbs.isOfType(value, "Object")) {
        if (!Setting.#isHandlersKey(key)) {
          this.#children[key] = new Setting(value, key, this, this.#spec)
        } else {
        }
      } else {
        if (this.spec.render) this.#renderYAML[key] = value
        else this.#frontmatterYAML[key] = value
      }
    }
  }
  getFrontmatterYAML() {
    let frontmatterYAML = {}
    Object.assign(frontmatterYAML, this.#frontmatterYAML)
    for (const [key, value] of Object.entries(this.#children)) {
      Object.assign(frontmatterYAML, value.getFrontmatterYAML())
    }
    return frontmatterYAML
  }
  getRenderYAML() {
    let renderYAML = {}
    Object.assign(renderYAML, this.#renderYAML)
    for (const [key, value] of Object.entries(this.#children)) {
      Object.assign(renderYAML, value.getRenderYAML())
    }
    return renderYAML
  }
  getType(key) {
    return this.#types.notetypes[key]
  }
  static #isHandlersKey(key) {
    return SpecManager.handlerKey == key || TypesManager.handlerKey == key
  }

  // prettier-ignore
  static test(outputObj) { // Setting
    let _ = null
    BreadCrumbs.test(outputObj)
    SpecManager.test(outputObj)
    TypesManager.test(outputObj)

    if(_ = new TestSuite("Setting", outputObj)) {
      //@todo
      /*
    _.run(getterTest)
    _.run(constructorTest)
    _.run(toStringTest)
    _.run(isHandlersKeyTest)
    _.run(getFrontmatterYAMLTest)
    _.run(getRenderYAMLTest)
    */
    _.destruct()
    _ = null
    }
    function getterTest() {
      // check whether getter assigned to correct function
      const desc1 = Object.getOwnPropertyDescriptor(Setting.prototype,"frontmatterYAML")
      const desc2 = Object.getOwnPropertyDescriptor(Setting.prototype,"renderYAML")
      _.bassert(1,typeof desc1.get == "function",`getter for 'frontmatterYAML' is not 'function'`)
      _.bassert(2,typeof desc2.get == "function",`getter for 'renderYAML' is not 'function'`)
      _.bassert(3,desc1.get.toString().contains("getFrontmatterYAML"),`getter for 'frontmatterYAML' is not 'getFrontmatterYAML'`)
      _.bassert(4,desc2.get.toString().contains("getRenderYAML"),`getter for 'renderYAML' is not 'getRenderYAML'`)
    }
    function constructorTest() {
      let un
      _.shouldAssert(1, _tryConstruct, un, un, un, un, "msg")
      _.assert(2, _tryConstruct, {}, "myName")
      _.assert(3, _tryConstruct, {}, "my Name")
      _.assert(4, _tryConstruct, {}, "22")
      _.assert(5, _tryConstruct, {}, Symbol("a"))
      let setting = new Setting({}, "myName")
      _.bassert(6,setting instanceof BreadCrumbs,"'Setting' has to be an instance of 'BreadCrumbs'")
      _.bassert(7,setting.constructor == Setting,"the constructor property is not 'Setting'")
    }
    function toStringTest() {
      let str = new Setting({}).toString()
        _.bassert(1,str.contains(Setting.#ROOT_KEY),"result does not contain root string")
        str = new Setting({}, "my Name").toString()
        _.bassert(2,str.contains("my Name"),"result does not contain Setting key")
        let setting = new Setting({}, "my Name")
    }
    function isHandlersKeyTest() {
      //_.bassert(1,Setting.#isHandlersKey(SpecManager.SPEC_KEY),SpecManager.SPEC_KEY + " should be recognized as handler key,but isn't")
      _.bassert(2,Setting.#isHandlersKey(TypesManager.TYPES_KEY),TypesManager.TYPES_KEY +  " should be recognized as handler key,but isn't")
      _.bassert(3,!Setting.#isHandlersKey(TypesManager.keys[0]),TypesManager.keys[0] +  " should not be recognized as handlers key,but is")
      _.bassert(4,!Setting.#isHandlersKey("no"),"'no' should not be recognized as handlers key,but is")
      _.bassert(5,!Setting.#isHandlersKey(""),"empty string should not be recognized as handlers key,but is")
      _.bassert(6,!Setting.#isHandlersKey(22),"22 should not be recognized as handlers key,but is")
      _.bassert(7,!Setting.#isHandlersKey(),"no argument should not be recognized as handlers key,but is")
    }
    function getFrontmatterYAMLTest() {
      const lit1 = {a: 23}
      const lit2 = {a: 23, b: "ja"}
      const lit3 = {a: 23, c: {b: "ja"}, d: "ja"}
      const lit4 = {a: 23, c: {b: "ja", c: {c: 25}}, d: "ja"}
      const lit5 = {a: 23, c: {_SPEC: {render: true}, pict: "ja"}}
      let setting1 = new Setting(lit1)
      let setting2 = new Setting(lit2)
      let setting3 = new Setting(lit3)
      let setting4 = new Setting(lit4)
      let setting5 = new Setting(lit5)
      let answ1f = setting1.getFrontmatterYAML()
      let answ2f = setting2.getFrontmatterYAML()
      let answ3f = setting3.getFrontmatterYAML()
      let answ4f = setting4.getFrontmatterYAML()
      let answ5f = setting5.getFrontmatterYAML()
      let expAnsw1f = '{"a":23}'
      let expAnsw2f = '{"a":23,"b":"ja"}'
      let expAnsw3f = '{"a":23,"d":"ja","b":"ja"}'
      let expAnsw4f = '{"a":23,"d":"ja","b":"ja","c":25}'
      let expAnsw5f = '{"a":23}'
      _.bassert(1,JSON.stringify(answ1f) == expAnsw1f,`output of JSON.stringify(result) is:'${JSON.stringify(answ1f)}',but should be:'${expAnsw1f}'`)
      _.bassert(2,JSON.stringify(answ2f) == expAnsw2f,`output of JSON.stringify(result) is:'${JSON.stringify(answ2f)}',but should be:'${expAnsw2f}'`)
      _.bassert(3,JSON.stringify(answ3f) == expAnsw3f,`output of JSON.stringify(result) is:'${JSON.stringify(answ3f)}',but should be:'${expAnsw3f}'`)
      _.bassert(4,JSON.stringify(answ4f) == expAnsw4f,`output of JSON.stringify(result) is:'${JSON.stringify(answ4f)}',but should be:'${expAnsw4f}'`)
      _.bassert(5,JSON.stringify(answ5f) == expAnsw5f,`output of JSON.stringify(result) is:'${JSON.stringify(answ5f)}',but should be:'${expAnsw5f}'`)
    }
    function getRenderYAMLTest() {
      const lit1 = {a: 23, c: {b: "ja", c: {c: 25}}, d: "ja"}
      const lit2 = {a: 23, c: {_SPEC: {render: true}, pict: "ja"}}
      const lit3 = {a: 23, c: {b: "ja"}, d: "ja"}
      let setting1 = new Setting(lit1)
      let setting2 = new Setting(lit2)
      let setting3 = new Setting(lit3)
      let answ1 = setting1.getRenderYAML()
      let answ2 = setting2.getRenderYAML()
      let answ3 = setting3.getRenderYAML()
      let expAnsw1 = "{}"
      let expAnsw2 = '{"pict":"ja"}'
      let expAnsw3 = "{}"
      _.bassert(1,JSON.stringify(answ1) == expAnsw1,`output of JSON.stringify(result) is:'${JSON.stringify(answ1)}',but should be:'${expAnsw1}'`)
      _.bassert(2,JSON.stringify(answ2) == expAnsw2,`output of JSON.stringify(result) is:'${JSON.stringify(answ2)}',but should be:'${expAnsw2}'`)
      _.bassert(3,JSON.stringify(answ3) == expAnsw3,`output of JSON.stringify(result) is:'${JSON.stringify(answ3)}',but should be:'${expAnsw3}'`)
      const lit6 = {
        c: {
          _SPEC: {render: true},
          pict: "ja",
          d: {_SPEC: {render: false}, private: true},
        },
      }
      let setting6 = new Setting(lit6)
      let answ6r = setting6.getRenderYAML()
      let expAnsw6r = '{"pict":"ja"}'
      _.bassert(5,JSON.stringify(answ6r) == expAnsw6r,`output of JSON.stringify(result) is:'${JSON.stringify(answ6r)}',but should be:'${expAnsw6r}'`)
    }
    function _tryConstruct(arg1, arg2, arg3, arg4) {
      let settings = new Setting(arg1, arg2, arg3, arg4)
    }
  }
}
//#endregion code
/** Runs all tests,if TESTING is set output to current note (indirect)
 * @param {*} outputObj
 */
function test(outputObj) {
  if (TESTING) {
    Dispatcher.test(outputObj)
    Setting.test(outputObj)
  }
}

async function createNote(tp, setting) {
  let type
  let typeKeys = setting.typeNames
  if (typeKeys.length == 0) {
    type = TypesManager.defaultType
  } else if (typeKeys.length == 1) {
    type = setting.getType(typeKeys[0])
  } else if (typeKeys.length > 1) {
    let typekey = await tp.system.suggester(
      typeKeys,
      typeKeys,
      false,
      TYPE_PROMPT,
      TYPE_MAX_ENTRIES
    )
    if (!typekey) {
      return Dialog.Cancel
    } else {
      type = setting.getType(typekey)
    }
  }
  return Dialog.Ok
}
/** exported function
 * @param {Object} tp - templater object
 * @param {Object} app - obsidian api object
 * @returns
 */
async function main(tp, app) {
  let testYAML = {}
  test(testYAML)
  let frontmatterYAML = {}
  let renderYAML = {____: ""}
  try {
    //@todo let setting = new Setting(Test, undefined, undefined)
    //@todo await createNote(tp, setting)
    //@todo frontmatterYAML = setting.frontmatterYAML
    //@todo Object.assign(renderYAML, setting.renderYAML)
  } catch (e) {
    /* returns errYAML or rethrows */
    if (e instanceof FotyError) {
      let errYAML = {}
      if (e instanceof SettingError) {
        errYAML = {
          "!": e.name + " in " + e.section,
          "-": e.message,
        }
      } else if (e instanceof CodingError) {
        errYAML = {
          "!": e.name + " in " + e.section,
          "-": e.message,
        }
      } else {
        errYAML = {
          "!": e.name,
          "-": e.message,
        }
      }
      return errYAML
    } else {
      aut("RETHROWING")
      throw e
    }
  }
  let dbgYAML = {
    __notePath: tp.file.path(true /*relative*/),
    __noteTitle: tp.file.title,
    __activeFile: tp.config.active_file.path,
    __runMode: tp.config.run_mode,
    __targetFile: tp.config.target_file.path,
    __templateFile: tp.config.template_file.path,
  }

  let developCheck = false
  if (developCheck) {
    let setting = new Setting()
    let developYAML = {}
    let e = new Event()
    e["key"] = "val"
    let d = Object.hasOwn(e, "addListener")
    developYAML = {DEV: d}
    console.log(d)
    return developYAML
  }

  if (!DEBUG) dbgYAML = undefined
  return Object.assign({}, frontmatterYAML, dbgYAML, testYAML, renderYAML)
}
