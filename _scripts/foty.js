module.exports = main // templater call: "await tp.user.foty(tp, app)"
//#region CONFIGURATION
//#endregion CONFIGURATION
//#region globals
/** Dialog return codes for functions which call dialogs
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
/** Color, to be used without quotation marks during development */
const black = "black"
/** Color, to be used without quotation marks during development */
const cyan = "cyan"
/** Color, to be used without quotation marks during development */
const red = "orange"
/** Color, to be used without quotation marks during development */
const blue = "deepskyblue"
/** Color, to be used without quotation marks during development */
const yellow = "lightgoldenrodyellow"
/** Color, to be used without quotation marks during development */
const lime = "lime"
/** Color, to be used without quotation marks during development */
const green = "lightgreen"
/** Color, to be used without quotation marks during development */
const gray = "silver"
/** Adds error message to YAML
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
  console.log(cnt.pad())
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
/** Returns string of inp attribute key value pairs, one level
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
//#endregion globals
//#region debug, error and test
/** For debugging purpose
 * @type {Boolean}
 */
var DEBUG = true
/** For testing purpose
 * @type {Boolean}
 */
var TESTING = true
if (TESTING) DEBUG = false
/** For checking error output
 * <p>
 * If set, all Errors messages are written to current node
 * @type {Boolean}
 */
var CHECK_ERROR_OUTPUT = false
if (CHECK_ERROR_OUTPUT) {
  DEBUG = false
  TESTING = false
}
/** Triggers each Exception once and puts all Error messages to YAML attributes,
 * if CHECK_ERROR_OUTPUT is true.
 *<p>
 * Does nothing if CHECK_ERROR_OUTPUT is false
 * @param {Object} YAML
 */
// prettier-ignore
function letAllThrow(YAML) {
  if (!CHECK_ERROR_OUTPUT) return
  let cnt = 0
  /*01*/try{a+b}catch(e){errOut(e,YAML,++cnt)}
}
/** Logs all parameters to console, if DEBUG is set to true
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
/** Logs str colored to console
 * @param  {String} str
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
/** Logs all parameters red on yellow to console
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
/** logs vn and v colored to console
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
/** superclass for all Foty Errors (but not unit test Errors)
 * @classdesc
 * Additionally to the Error properties FotyError on construction
 * receives callers name as string.
 */
class FotyError extends Error {
  //#region member variables
  caller = ""
  //#endregion member variables
  /** Constructs a FotyError instance, Error.name set to "Foty Error"
   *
   * @param {String} caller
   * @param  {...any} params - consists of message and cause
   */
  constructor(caller, ...params) {
    super(...params)
    this.name = "Foty Error"
    this.caller = caller
  }
}
/** User Error thrown from Setting tree
 * @classdesc
 * Some of the errors from Setting tree for sure can only occur if entries in
 * setting input are wrong. Those are user errors. Using the 2nd parameter
 * a user specific message can be given.
 */
class SettingError extends FotyError {
  //#region member variables
  usrMsg = ""
  //#endregion member variables
  /**
  /** Constructs a SettingError instance, .name set to "Setting Error"
   * @param {String} caller 
   * @param  {...String} params - consists of message only or usrMessage and 
   *                              message
   * 
   */
  constructor(caller, ...params) {
    let usrMsg = ""
    if (params.length > 1) usrMsg = params.shift()
    super(caller, ...params)
    this.name = "Setting Error"
    this.usrMsg = usrMsg
  }
}
/** Programming Error
 * @classdesc
 * Some errors only can occur if code is wrong. If this is for sure,
 * CodingError should be thrown.
 */
class CodingError extends FotyError {
  /** Constructs a CodingError instance, .name set to "Coding Error"
   *
   * @param {String} caller
   * @param  {...any} params - consists of message and cause
   */
  constructor(caller, ...params) {
    super(caller, ...params)
    this.name = "Coding Error"
  }
}
/** Runs unit tests */
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
/** Error used for unit tests */
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
//#endregion helper classes
//#region code
//#endregion code

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

/** Runs all tests, if TESTING is set; output to current note (indirect)
 * @param {*} outputObj
 */
function test(outputObj) {
  if (TESTING) {
    testGlobals(outputObj)
    Dispatcher.test(outputObj)
  }
}

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
