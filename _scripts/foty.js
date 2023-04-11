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
   * @param {number} errcase
   * @param {boolean} isTrue
   * @param {string} message
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
   * @param {number} errcase
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
   * @param {number} errcase
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
   * @param {string} str
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
 * collections and items,each identified by a key. Content of collection/item
 * is given as literal description. So every collection has a key and a literal.
 * Besides root collection every collection has a parent. Only literal is
 * specific for a subclass
 *
 * BreadCrumbs as superclass handles what all subclasses have in common: key and
 * parent; they are nothing the subclasses have to care with,so those are as
 * private members named differently: #ident and #caller.
 */
class BreadCrumbs {
  //#region member variables
  #ident
  #caller
  #literal
  /**
   * @returns literal given in BreadCrumbs constructor
   */
  get literal() {
    return this.#literal
  }
  //#endregion member variables
  /** Constructs a new BreadCrumbs
   * @desc
   * @constructor
   * @param {*} literal
   * @param {string|symbol} key
   * @param {undefined|BreadCrumbs} parent
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key, parent) {
    this.#literal = literal
    this.#ident = key
    this.#caller = parent
    this.throwIfUndefined(key, "key")
    this.throwIfIsNotOfType(key, ["string", "symbol"])
    if (BreadCrumbs.isDefined(parent))
      this.throwIfIsNotOfType(parent, "BreadCrumbs")
  }

  /** returns string representing class instance for superclass and subclasses
   * @returns string containing class name of deepest subclass and key as given
   *          in BreadCrumbs constructor
   */
  toString() {
    return "°°°" + this.constructor.name + " " + this.#ident
  }

  toBreadCrumbs() {
    let breadcrumbs = ""
    let sep = ""
    if (BreadCrumbs.isDefined(this.#caller)) {
      breadcrumbs += this.#caller.toBreadCrumbs()
      sep = "."
    }
    breadcrumbs += sep + this.#ident
    return breadcrumbs
  }

  isRoot() {
    return !BreadCrumbs.isDefined(this.#caller)
  }

  isFirstGeneration() {
    return this.#caller.isRoot()
  }

  throwIfUndefined(
    val,
    valname = "literal",
    funame = "constructor",
    msg = "' is undefined"
  ) {
    if (!BreadCrumbs.isDefined(val))
      throw new SettingError(
        this.constructor.name + " " + funame,
        "Breadcrumbs: '" + this.toBreadCrumbs() + "'\n   '" + valname + msg
      )
  }
  throwIfIsNotOfType(
    val,
    type = "object",
    funame = "constructor",
    msg = "is not of javascript type"
  ) {
    if (Array.isArray(type)) {
      if (
        !type.some((t) => {
          return BreadCrumbs.isOfType(val, t)
        })
      )
        throw new SettingError(
          this.constructor.name + " " + funame,
          "Breadcrumbs: '" +
            this.toBreadCrumbs() +
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
          this.toBreadCrumbs() +
          "'\n   " +
          msg +
          " '" +
          type +
          "'"
      )
  }

  static isDefined(val) {
    return typeof val != "undefined"
  }
  static isOfType(val, type) {
    // + array null Setting SpecMan Option
    let answer = false
    if (type == "null" && val === null) answer = true
    if (type == "array" && typeof val == "object") answer = Array.isArray(val)
    else if (typeof val == "object" && type != "object")
      switch (type) {
        case "BreadCrumbs":
          answer = val instanceof BreadCrumbs
          break
        case "Setting":
          answer = val instanceof Setting
          break
        case "SpecManager":
          answer = val instanceof SpecManager
          break
        case "NoteTypesManager":
          answer = val instanceof NoteTypesManager
          break
        case "Object": // object but not an array
          answer = !Array.isArray(val)
          break
        default:
          break
      }
    else answer = typeof val == type
    return answer
  }

  // prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("BreadCrumbs", outputObj)) {
      _.run(constructorTest)
      _.run(toStringTest)
      _.run(toBreadCrumbsTest)
      _.run(getKeyTest)
      _.run(getLiteralTest)
      _.run(getCrumbTest)
      _.run(isDefinedTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      _.assert(1,_tryConstruct,undefined,"myName")
      _.assert(2,_tryConstruct,{},"myName")
      _.assert(3,_tryConstruct,2,"myName")
      _.assert(4,_tryConstruct,null,"myName")
      _.assert(5,_tryConstruct,new Error(),"myName")
      _.assert(6,_tryConstruct,["a","b"],"myName")
      _.assert(7,_tryConstruct,Symbol(),"myName")
  
      _.assert(8,_tryConstruct,undefined,Symbol())
      _.shouldAssert(9,_tryConstruct,{},undefined,undefined,"key has to be defined")
      _.shouldAssert(10,_tryConstruct,{},2,undefined,"key can not be a number")
      _.shouldAssert(11,_tryConstruct,{},null,undefined,"key may not be 'null'")
      _.shouldAssert(12,_tryConstruct,{},{},undefined,"key may not be an object")
      _.shouldAssert(13,_tryConstruct,{},new Error(),undefined,"key may not be 'Error' instance")
      _.shouldAssert(14,_tryConstruct,{},["a","b"],undefined,"key may not be an array")
  
      let breadcrumbs = new BreadCrumbs(undefined,"myName")
      let setting = new Setting({},"myName")
      _.assert(15,_tryConstruct,undefined,"myName",breadcrumbs)
      _.assert(16,_tryConstruct,undefined,"myName",setting)
      _.shouldAssert(17,_tryConstruct,undefined,"myName",null,"parent may not be 'null'")
      _.shouldAssert(18,_tryConstruct,undefined,"myName",new Error(),"parent may not be 'Error' instance")
      _.shouldAssert(19,_tryConstruct,undefined,"myName",{},"parent may not be an object")
      _.shouldAssert(20,_tryConstruct,undefined,"myName",2,"parent may not be a number")
      _.shouldAssert(21,_tryConstruct,undefined,"myName",["a","b"],"parent may not be an array")
      _.shouldAssert(22,_tryConstruct,undefined,"myName",Symbol(),"parent may not be a symbol")
  
      _.bassert(23,breadcrumbs instanceof Object,"'BreadCrumbs' has to be an instance of 'Object'")
      _.bassert(24,breadcrumbs instanceof BreadCrumbs,"'BreadCrumbs' has to be an instance of 'BreadCrumbs'")
      _.bassert(25,breadcrumbs.constructor == BreadCrumbs,"the constructor property is not 'BreadCrumbs'")
    }
    function toStringTest() {
      let str = new BreadCrumbs(undefined, "my name").toString()
      _.bassert(1,str.contains("my name"),"result does not contain name given on construction")
      _.bassert(2,str.contains("BreadCrumbs"),"result does not contain class name")
      str = new Setting({},"myName").toString()
      _.bassert(3,str.contains("myName"),"result does not contain name given on construction")
      _.bassert(4,str.contains("Setting"),"result does not contain class name")
    }
    function toBreadCrumbsTest() {
      let parent = new BreadCrumbs(undefined, "parent")
      let child = new BreadCrumbs(undefined, "child", parent)
      let grandChild = new BreadCrumbs(undefined, "grandChild", child)
      let parentStr = parent.toBreadCrumbs()
      let childStr = child.toBreadCrumbs()
      let grandChildStr = grandChild.toBreadCrumbs()
      _.bassert(
        1,
        parentStr == "parent",
        "breadCrumbs: '" + parentStr + "' are wrong"
      )
      _.bassert(
        2,
        childStr == "parent.child",
        "breadCrumbs: '" + childStr + "' are wrong"
      )
      _.bassert(
        3,
        grandChildStr == "parent.child.grandChild",
        "breadCrumbs: '" + grandChildStr + "' are wrong"
      )
    }
    function getKeyTest() {
      let breadcrumbs = new BreadCrumbs({}, "my name")
      _.bassert(
        1,
        breadcrumbs.#ident == "my name",
        "does not return name given on construction "
      )
    }
    function getLiteralTest() {
      const sym = Symbol("Symbol Descriptor")
      let breadcrumbs = new BreadCrumbs({sym: 87673}, "my name")
      _.bassert(
        1,
        breadcrumbs.literal.sym == 87673,
        "does not return literal given on construction "
      )
    }
    function getCrumbTest() {
      let parent = new BreadCrumbs(undefined, "parent")
      let breadcrumbs = new BreadCrumbs({}, "my name", parent)
      _.bassert(
        1,
        breadcrumbs.#caller == parent,
        "does not return parent given on construction "
      )
    }
    function isDefinedTest() {
      _.bassert(
        1,
        BreadCrumbs.isDefined(""),
        "Empty String is not accepted as defined"
      )
      _.bassert(
        2,
        BreadCrumbs.isDefined(null),
        "null is not accepted as defined"
      )
      _.bassert(
        3,
        !BreadCrumbs.isDefined(undefined),
        "undefined accepted as defined"
      )
    }
    function _tryConstruct(arg1, arg2, arg3) {
      let breadcrumbs = new BreadCrumbs(arg1, arg2, arg3)
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
  get typeNames() {
    return this.#types.names
  }
  get defaultType() {
    return this.#types.defaultType
  }
  get spec() {
    return this.#spec
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
    this.throwIfUndefined(literal)
    this.#spec = new SpecManager(this.literal, undefined, this, callersSpec)
    this.#types = new NoteTypesManager(this.literal, undefined, this)
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
    return SpecManager.isHandlerKey(key) || NoteTypesManager.isHandlerKey(key)
  }
  //#region Setting tests
  static _ = null
  static test(outputObj) {
    BreadCrumbs.test(outputObj)
    SpecManager.test(outputObj)
    NoteTypesManager.test(outputObj)
    Setting._ = new TestSuite("Setting", outputObj)
    Setting._.run(Setting.constructorTest)
    Setting._.run(Setting.toStringTest)
    Setting._.run(Setting.isHandlersKeyTest)
    Setting._.run(Setting.getFrontmatterYAMLTest)
    Setting._.run(Setting.getRenderYAMLTest)
    Setting._.run(Setting.getterTest)
    Setting._.destruct()
    Setting._ = null
  }
  // prettier-ignore
  static constructorTest() {
    Setting._.shouldAssert(1, Setting._tryConstruct, undefined, undefined, "msg")
    Setting._.assert(2, Setting._tryConstruct, {}, "myName")
    Setting._.assert(3, Setting._tryConstruct, {}, "my Name")
    Setting._.assert(4, Setting._tryConstruct, {}, "22")
    Setting._.assert(5, Setting._tryConstruct, {}, Symbol("a"))
    let setting = new Setting({}, "myName")
    Setting._.bassert(6,setting instanceof BreadCrumbs,"'Setting' has to be an instance of 'BreadCrumbs'")
    Setting._.bassert(7,setting.constructor == Setting,"the constructor property is not 'Setting'")
  }
  static toStringTest() {
    let str = new Setting({}).toString()
    Setting._.bassert(
      1,
      str.contains(Setting.#ROOT_KEY),
      "result does not contain root string"
    )
    str = new Setting({}, "my Name").toString()
    Setting._.bassert(
      2,
      str.contains("my Name"),
      "result does not contain Setting key"
    )
    let setting = new Setting({}, "my Name")
  }
  static isHandlersKeyTest() {
    Setting._.bassert(
      1,
      Setting.#isHandlersKey(SpecManager.SPEC_KEY),
      SpecManager.SPEC_KEY + " should be recognized as handler key,but isn't"
    )
    Setting._.bassert(
      2,
      Setting.#isHandlersKey(NoteTypesManager.NOTETYPES_KEY),
      NoteTypesManager.NOTETYPES_KEY +
        " should be recognized as handler key,but isn't"
    )
    Setting._.bassert(
      3,
      !Setting.#isHandlersKey(NoteTypesManager.TYPES_KEYS[0]),
      NoteTypesManager.TYPES_KEYS[0] +
        " should not be recognized as handlers key,but is"
    )
    Setting._.bassert(
      4,
      !Setting.#isHandlersKey("no"),
      "'no' should not be recognized as handlers key,but is"
    )
    Setting._.bassert(
      5,
      !Setting.#isHandlersKey(""),
      "empty string should not be recognized as handlers key,but is"
    )
    Setting._.bassert(
      6,
      !Setting.#isHandlersKey(22),
      "22 should not be recognized as handlers key,but is"
    )
    Setting._.bassert(
      7,
      !Setting.#isHandlersKey(),
      "no argument should not be recognized as handlers key,but is"
    )
  }
  static getFrontmatterYAMLTest() {
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
    Setting._.bassert(
      1,
      JSON.stringify(answ1f) == expAnsw1f,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ1f
      )}',but should be:'${expAnsw1f}'`
    )
    Setting._.bassert(
      2,
      JSON.stringify(answ2f) == expAnsw2f,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ2f
      )}',but should be:'${expAnsw2f}'`
    )
    Setting._.bassert(
      3,
      JSON.stringify(answ3f) == expAnsw3f,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ3f
      )}',but should be:'${expAnsw3f}'`
    )
    Setting._.bassert(
      4,
      JSON.stringify(answ4f) == expAnsw4f,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ4f
      )}',but should be:'${expAnsw4f}'`
    )
    Setting._.bassert(
      5,
      JSON.stringify(answ5f) == expAnsw5f,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ5f
      )}',but should be:'${expAnsw5f}'`
    )
  }
  static getRenderYAMLTest() {
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
    Setting._.bassert(
      1,
      JSON.stringify(answ1) == expAnsw1,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ1
      )}',but should be:'${expAnsw1}'`
    )
    Setting._.bassert(
      2,
      JSON.stringify(answ2) == expAnsw2,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ2
      )}',but should be:'${expAnsw2}'`
    )
    Setting._.bassert(
      3,
      JSON.stringify(answ3) == expAnsw3,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ3
      )}',but should be:'${expAnsw3}'`
    )
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
    Setting._.bassert(
      5,
      JSON.stringify(answ6r) == expAnsw6r,
      `output of JSON.stringify(result) is:'${JSON.stringify(
        answ6r
      )}',but should be:'${expAnsw6r}'`
    )
  }
  static getterTest() {
    // check whether getter assigned to correct function
    const desc1 = Object.getOwnPropertyDescriptor(
      Setting.prototype,
      "frontmatterYAML"
    )
    const desc2 = Object.getOwnPropertyDescriptor(
      Setting.prototype,
      "renderYAML"
    )
    Setting._.bassert(
      1,
      typeof desc1.get == "function",
      `getter for 'frontmatterYAML' is not 'function'`
    )
    Setting._.bassert(
      2,
      typeof desc2.get == "function",
      `getter for 'renderYAML' is not 'function'`
    )
    Setting._.bassert(
      1,
      desc1.get.toString().contains("getFrontmatterYAML"),
      `getter for 'frontmatterYAML' is not 'getFrontmatterYAML'`
    )
    Setting._.bassert(
      2,
      desc2.get.toString().contains("getRenderYAML"),
      `getter for 'renderYAML' is not 'getRenderYAML'`
    )
  }
  static _tryConstruct(arg1, arg2) {
    let settings = new Setting(arg1, arg2)
  }
  //#endregion Setting tests
}

/** specification parser */
class SpecManager extends BreadCrumbs {
  //#region member variables
  static SPEC_KEY = "_SPEC"
  #render = false
  get render() {
    return this.#render
  }
  //#endregion member variables
  constructor(literal, key, caller, callersParentSpec) {
    let specLiteral
    if (literal != undefined) specLiteral = literal[SpecManager.SPEC_KEY]
    super(specLiteral, key === undefined ? SpecManager.SPEC_KEY : key, caller)
    specLiteral = undefined
    this.throwIfUndefined(literal)
    this.throwIfUndefined(caller)
    this.throwIfIsNotOfType(caller, "Setting")
    let callersParent = caller.caller
    // render
    // ======
    let defaultRender = false
    let literalRender =
      this.literal != undefined ? this.literal["render"] : undefined
    let parentRender =
      callersParentSpec != undefined ? callersParentSpec["render"] : undefined
    this.#render =
      literalRender != undefined
        ? literalRender
        : parentRender != undefined
        ? parentRender
        : defaultRender
  }
  static isHandlerKey(key) {
    return key == SpecManager.SPEC_KEY
  }
  //#region SpecManager tests
  static _ = null
  static test(outputObj) {
    SpecManager._ = new TestSuite("SpecManager", outputObj)
    SpecManager._.run(SpecManager.constructorTest)
    SpecManager._.run(SpecManager.toStringTest)
    SpecManager._.run(SpecManager.isHandlerKeyTest)
    SpecManager._.run(SpecManager.renderOptionTest)
    SpecManager._.destruct()
    SpecManager._ = null
  }
  // prettier-ignore
  static constructorTest() {
    let setting = new Setting({}, "its Name")
    let breadCrumbs = new BreadCrumbs({}, "BreadCrumbs")
    SpecManager._.shouldAssert(1,SpecManager._tryConstruct,undefined,"myName",setting,"msg")
    //SpecManager._.shouldAssert(2,SpecManager._tryConstruct,{},undefined,setting,"msg")
    SpecManager._.shouldAssert(3,SpecManager._tryConstruct,{},"myName",undefined,"msg")
    SpecManager._.assert(4, SpecManager._tryConstruct, {}, "my Name", setting)
    SpecManager._.assert(5, SpecManager._tryConstruct, {}, "22", setting)
    SpecManager._.assert(6, SpecManager._tryConstruct, {}, Symbol("a"), setting)
    let specMan = new SpecManager({}, "myName", setting)
    SpecManager._.bassert(
      7,
      specMan instanceof BreadCrumbs,
      "'SpecManager' has to be an instance of 'BreadCrumbs'"
    )
    SpecManager._.bassert(
      8,
      specMan.constructor == SpecManager,
      "the constructor property is not 'SpecManager'"
    )
    SpecManager._.shouldAssert(9,SpecManager._tryConstruct,{},"SPEC",breadCrumbs,"msg")
    specMan = new SpecManager({}, "myName", setting)
    SpecManager._.bassert(
      10,
      BreadCrumbs.isOfType(specMan, "object"),
      "for empty literal SpecManager should construct object,but does not"
    )
    let render = specMan.render
    SpecManager._.bassert(
      11,
      render != undefined,
      "For empty literal SpecManager should create render attribute,but does not"
    )
  }
  static toStringTest() {
    let setting = new Setting({}, "its Name")
    let str = new SpecManager({}, "myName", setting).toString()
    SpecManager._.bassert(
      1,
      str.contains("myName"),
      "result does not contain name string"
    )
  }
  static isHandlerKeyTest() {
    SpecManager._.bassert(
      1,
      SpecManager.isHandlerKey("_SPEC"),
      "key is not identified as '_SPEC'"
    )
    SpecManager._.bassert(
      2,
      !SpecManager.isHandlerKey("SPEC"),
      "'SPEC' is accepted as key"
    )
  }
  static renderOptionTest() {
    let literal1 = {}
    let literal2 = {_SPEC: {render: true}}
    let literal3 = {_SPEC: {render: false}}
    let setting1 = new Setting(literal1)
    let setting2 = new Setting(literal2)
    let setting3 = new Setting(literal3)
    let spec1 = setting1.spec
    let spec2 = setting2.spec
    let spec3 = setting3.spec
    SpecManager._.bassert(
      1,
      !spec1.render,
      "unset OPTION 'render' defaults to false,but here it is true."
    )
    SpecManager._.bassert(
      2,
      spec2.render,
      "OPTION 'render' is set to true in 'literal',but here it is false."
    )
    SpecManager._.bassert(
      3,
      !spec3.render,
      "OPTION 'render' is set to false in 'literal',but here it is true."
    )
    let literal4 = {a: {b: {c: {d: true}}}}
    let setting4 = new Setting(literal4)
    let f = setting4.frontmatterYAML
    let r = setting4.renderYAML
    SpecManager._.bassert(
      4,
      f.d == true && r.d == undefined,
      "Value should appear in frontmatter output and should not appear in render output"
    )
    let literal5 = {a: {_SPEC: {render: true}, b: {c: {d: true}}}}
    let setting5 = new Setting(literal5)
    f = setting5.frontmatterYAML
    r = setting5.renderYAML
    SpecManager._.bassert(
      5,
      f.d == undefined && r.d == true,
      "Value should not appear in frontmatter output and should appear in render output"
    )
    let literal6 = {
      a: {
        _SPEC: {render: true},
        b: {
          c: {_SPEC: {render: false}, d: true},
        },
      },
    }
    let setting6 = new Setting(literal6)
    f = setting6.frontmatterYAML
    r = setting6.renderYAML
    SpecManager._.bassert(
      6,
      f.d == true && r.d == undefined,
      "Value should appear in frontmatter output and should not appear in render output"
    )
  }
  static _tryConstruct(arg1, arg2, arg3) {
    let specMan = new SpecManager(arg1, arg2, arg3)
  }
  //#endregion SpecManager tests
}

/** notetypes parser */
class NoteTypesManager extends BreadCrumbs {
  //#region member variables
  static NOTETYPES_KEY = "NOTETYPES"
  static TYPES_KEYS = ["MARKER", "DATE", "TITLE_BEFORE_DATE", "DATEFORMAT"]
  static #DEFAULT_TYPE = {
    MARKER: "",
    DATE: false,
    TITLE_BEFORE_DATE: "",
    DATEFORMAT: "YYYY-MM-DD",
  }
  #notetypes = {}
  get defaultType() {
    return NoteTypesManager.#DEFAULT_TYPE
  }
  get notetypes() {
    return this.#notetypes
  }
  get names() {
    return this.getTypeNames()
  }
  //#endregion member variables
  constructor(literal, key, caller) {
    let typesLiteral
    if (literal != undefined)
      typesLiteral = literal[NoteTypesManager.NOTETYPES_KEY]
    super(
      typesLiteral,
      key === undefined ? NoteTypesManager.NOTETYPES_KEY : key,
      caller
    )
    this.throwIfUndefined(caller)
    this.throwIfIsNotOfType(caller, "Setting")
    if (this.literal != undefined && !this.isFirstGeneration())
      throw new SettingError(
        this.constructor.name + " " + constructor,
        "Breadcrumbs: '" +
          this.toBreadCrumbs() +
          "'\n   " +
          "notetypes can only be defined at root level" +
          "\n   " +
          "Move your 'NOTETYPES' definition up."
      )
    this.throwIfUndefined(literal)
    if (this.literal == undefined) return
    this.createNoteTypesOrThrow()
  }
  createNoteTypesOrThrow() {
    for (const [name, entry] of Object.entries(this.literal)) {
      this.throwIfIsNotOfType(entry, "object")
      for (const [key, value] of Object.entries(entry)) {
        let allowedKeys = NoteTypesManager.TYPES_KEYS
        if (!allowedKeys.contains(key))
          throw new SettingError(
            this.constructor.name + " " + constructor,
            "Breadcrumbs: '" +
              this.toBreadCrumbs() +
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
            this.throwIfIsNotOfType(value, "boolean")
            break
          case "MARKER":
          case "TITLE":
          case "DATEFORMAT":
            this.throwIfIsNotOfType(value, "string")
            break
        }
      }
      this.#notetypes[name] = Object.assign(
        {},
        NoteTypesManager.#DEFAULT_TYPE,
        entry
      )
    }
  }
  static isHandlerKey(key) {
    return key == NoteTypesManager.NOTETYPES_KEY
  }
  getTypeNames() {
    return Object.keys(this.#notetypes)
  }
  //#region NoteTypesManager tests
  static _ = null
  static test(outputObj) {
    NoteTypesManager._ = new TestSuite("NoteTypesManager", outputObj)
    NoteTypesManager._.run(NoteTypesManager.constructorTest)
    NoteTypesManager._.run(NoteTypesManager.toStringTest)
    NoteTypesManager._.run(NoteTypesManager.isHandlerKeyTest)
    NoteTypesManager._.destruct()
    NoteTypesManager._ = null
  }
  // prettier-ignore
  static constructorTest() {
    let setting = new Setting({}, "its Name")
    let breadCrumbs = new BreadCrumbs({}, "BreadCrumbs")
    NoteTypesManager._.shouldAssert(1,NoteTypesManager._tryConstruct,undefined,"myName",setting,"msg")
    //NoteTypesManager._.shouldAssert(2,NoteTypesManager._tryConstruct,{},undefined,setting,"msg")
    NoteTypesManager._.shouldAssert(3,NoteTypesManager._tryConstruct,{},"myName",undefined,"msg")
    NoteTypesManager._.assert(
      4,
      NoteTypesManager._tryConstruct,
      {},
      "my Name",
      setting
    )
    NoteTypesManager._.assert(
      5,
      NoteTypesManager._tryConstruct,
      {},
      "22",
      setting
    )
    NoteTypesManager._.assert(
      6,
      NoteTypesManager._tryConstruct,
      {},
      Symbol("a"),
      setting
    )
    let typeMan = new NoteTypesManager({}, "myName", setting)
    NoteTypesManager._.bassert(
      7,
      typeMan instanceof BreadCrumbs,
      "'NoteTypesManager' has to be an instance of 'BreadCrumbs'"
    )
    NoteTypesManager._.bassert(
      8,
      typeMan.constructor == NoteTypesManager,
      "the constructor property is not 'NoteTypesManager'"
    )
    NoteTypesManager._.shouldAssert(
      9,
      NoteTypesManager._tryConstruct,
      {},
      "NOTETYPES",
      breadCrumbs
    )
    typeMan = new NoteTypesManager({}, "myName", setting)
    NoteTypesManager._.bassert(
      10,
      BreadCrumbs.isOfType(typeMan.notetypes, "object"),
      "for empty literal NoteTypesManager should construct object,but does not"
    )
    let typeKeys = Object.keys(typeMan.notetypes)
    NoteTypesManager._.bassert(
      11,
      typeKeys.length == 0,
      "For empty literal NoteTypesManager with no types should be created"
    )
    let defaultType = typeMan.defaultType
    NoteTypesManager._.bassert(
      12,
      BreadCrumbs.isOfType(defaultType, "object"),
      "default type should always be present,but here it is not"
    )
    let defaultTypeKeys = Object.keys(defaultType)
    let typesKeys = NoteTypesManager.TYPES_KEYS
    NoteTypesManager._.bassert(
      13,
      (typesKeys.length = defaultTypeKeys.length),
      "defaultType should have as many keys as 'NoteTypesManager.TYPES_KEYS'"
    )
    NoteTypesManager._.bassert(
      14,
      defaultTypeKeys.every((key) => {
        return typesKeys.includes(key)
      }),
      "any key of 'NoteTypesManager.TYPES_KEYS' should be contained in defaultType,but is not"
    )
  }
  static toStringTest() {
    let setting = new Setting({}, "its Name")
    let str = new NoteTypesManager({}, "myName", setting).toString()
    NoteTypesManager._.bassert(
      1,
      str.contains("myName"),
      "result does not contain name string"
    )
  }
  static isHandlerKeyTest() {
    NoteTypesManager._.bassert(
      1,
      NoteTypesManager.isHandlerKey("NOTETYPES"),
      "key is not identified as 'NOTETYPES'"
    )
    NoteTypesManager._.bassert(
      2,
      !NoteTypesManager.isHandlerKey("_NOTETYPES"),
      "'_NOTETYPES' is accepted as key"
    )
  }

  static _tryConstruct(arg1, arg2, arg3) {
    let specMan = new NoteTypesManager(arg1, arg2, arg3)
  }
  //#endregion NoteTypesManager tests
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
    type = setting.defaultType
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
    let setting = new Setting(Test, undefined, undefined)
    await createNote(tp, setting)
    frontmatterYAML = setting.frontmatterYAML
    Object.assign(renderYAML, setting.renderYAML)
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
