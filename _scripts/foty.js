module.exports = main; // templater call: "await tp.user.foty(tp, app)"
/** Script for obsidian, 
 * templater extension needed
 * 
 * Usage: Different parts of codes are in different regions.
 * A region starts with //#region REGIONNAME or //# regionname
 * and it ends with //#endregion REGIONNAME or //#endregion regionname
 * Regions can be nested.
 * Using Visual Studio Code (and perhaps other source code editors) regions
 * marked this way can be folded for convenience.
 * 
 */
//#region debug, base, error and test
var DEBUG = true;
const TESTING = true;
if(TESTING) DEBUG = false;
// nach @todo und @remove suchen

/** Logs all parameters to console, if "DEBUG" is set to true
 * @param  {...any} strs 
 */
function dbg(...strs) {
  function dbgLevel(callStack) {
    let answer = 0;
    let stack = callStack.split("\n");
    stack.every(str => {
      answer++;
      if(str.includes("at Object.main [")) return false;
      return true;
    });
    return answer;
  }
  if(DEBUG) {
    let output = "";
    let lvl = dbgLevel((new Error()).stack);
    while(--lvl) output += " ";
    for (const str of strs) {
      output += str + " ";
    }
    output = "%c" + output;
    console.log(output, "background: LightSkyBlue;");
  }
}

/** Logs `str` colored to console
 * @param  {String} str
 * @param {String} b - background color
 * @param {String} c - foreground color
 */
function aut(str, b="yellow", c="red") {
  console.log("%c" + str, `background:${b};color:${c};font-weight:normal`);
}

/** logs `vn` and `v` colored to console
 * @param {String} vn - variable name
 * @param {String} v - variable value
 * @param {String} b - background color
 * @param {String} c - foreground color
 */
function vaut(vn, v, b="yellow", c="red") {
  let str = vn + ": " + v;
  console.log("%c" + str, `background:${b};color:${c};font-weight:normal`);
}

class Base {

}
/** Base class for all Foty Errors (but not unit test Errors) */
class FotyError extends Error {
  constructor(...params) {
    super(...params);
    this.name ="Foty Error";
  }
}

/** User Error thrown from Setting tree */
class SettingError extends FotyError {
  //#region member variables
  section
  //#endregion member variables
  constructor(section = "Setting", ...params) {
    super(...params);
    this.name = "Setting Error";
    this.section = section;
  }
}

/** Programming Error */
class CodingError extends FotyError {
  //#region member variables
  section
  //#endregion member variables
  constructor(section = "Setting", ...params) {
    super(...params);
    this.name = "Coding Error";
    this.section = section;
  }
}

/** Runs unit tests */
class TestSuite { 
  //#region member variables
  static ok = "\u2713";
  static nok = "\u2718";
  #name;
  #outputObj = undefined;
  #succeeded = 0;
  #failed = 0;
  #fname = "";
  #asserts = 0;
  #cases = 0;
  o = this.o;
  f = "___failed";
  s = "succeeded";
  d = "__details"
  get name() { return this.#name }
  //#endregion member variables

  /** Sets up the suite
   * @param {String} name - name of the suite
   * @param {Object} outputObj - javascript object for output in Obsidian
   */
  constructor(name, outputObj) {
    this.#name = name ? name : "Unknown";
    this.o = outputObj;
    if(this.o[this.f] == undefined) this.o[this.f] = "";
    if(this.o[this.s] == undefined) this.o[this.s] = "";
    if(this.o[this.d] == undefined) this.o[this.d] = "";
  }
  toString() { return " °°" + this.constructor.name + " " + this.name }

  /** Shows results; resets
   */
  destruct() {
    let succStr = this.#succeeded == 1 ? "test" : "tests";
    let failStr = this.#failed == 1 ? "test" : "tests";
    if(this.#failed == 0) {
      this.#praut(this.s, `Suite "${this.#name}": ${this.#succeeded} ${succStr} succeeded`);
    } else {
      this.#praut(this.f, `Suite "${this.#name}": ${this.#failed} ${failStr} failed, ${this.#succeeded} succeeded`);
    }
    if(this.#praut(this.f) == "") delete this.#praut(this.f);
    this.#name = null;
    this.o = null;
    this.#succeeded = 0;
    this.#failed = 0;
    this.#fname = "";
    this.#asserts = 0;
    this.#cases = 0;
  }

  /** runs test
   * @param {Function} fn
   */
  run(fn) {
    this.#fname = fn.name;
    this.#asserts = 0;
    try {
      fn();
      let cases = this.#cases == 1 ? "case" : "cases";
      if(0 == this.#asserts) {
        this.#succeeded++;
        this.#praut(this.d, `${this.#name}:${this.#fname}(${this.#cases} ${cases}) ${TestSuite.ok}`)
      } else { 
        this.#failed++;
        this.#praut(this.d, `${TestSuite.nok}${this.#name}:${this.#fname}(${this.#cases} ${cases}) ${TestSuite.nok}`)
      }
    } catch (e) {
      console.error(e);
    }
    this.#fname = "";
    this.#cases = 0;
  }

  /** runs test containing promised functions
   * @param {Function} fn
   * @example
   * let _ = null;
   * function testIt() {
   *   _ = new TestSuite("testIt", null);
   *   _.prun(first_Test)
   *   .then ( (asw) => {return _.prun(second_Test);} )
   *   .then ( (asw) => {return _.prun(third_Test);} )
   *   .then ( (asw) => { _.destruct(); _ = null; } )
   *   .catch(( asw) => log("CATCH " + asw) );
   * }
   * function first_Test() { //second_Test, third_Test
   *   let p = new Promise((resolve, reject) => {
   *     let funame = "first_Test"; //"second_Test", "third_Test"
   *     let result = asynchronousFunction(funame).then( () => {
   *       _.assert( 1, _check, result);
   *       _.assert( 2, _check, result);
   *       // destruct result; (In use case it might be instance)
   *       resolve("IN" + funame + ": Result " + result + " destructed");
   *     });
   *   });
   *   return p;
   * }
   * function _check(result) {
   *   if(typeof result !== "string")
   *     throw new TestError(`${result} should be a string`);
   * }
   */
  prun(fn) {
    return new Promise((resolve, reject) => {
      this.#fname = fn.name;
      this.#asserts = 0;
      try {
        fn()
        .then((fnAnswer) => {
          let cases = this.#cases == 1 ? "case" : "cases";
          if (0 == this.#asserts) {
            this.#succeeded++;
            this.#praut(this.d, `${this.#name}:${this.#fname}(${this.#cases} ${cases}) ${TestSuite.ok}`)
          } else {
            this.#failed++;
            this.#praut(this.d, `${TestSuite.nok}${this.#name}:${this.#fname}(${this.#cases} ${cases}) ${TestSuite.nok}`)
          }
          this.#fname = "";
          this.#cases = 0;
          resolve(fn.name + " resolved");
        });
      } catch (e) {
        console.error(e);
        this.#fname = "";
        this.#cases = 0;
        resolve(fn.name + " catch");
      }
    })
  }

  /** asserts boolean one case in a test, shows message on failure
   * @param {number} errcase
   * @param {boolean} isTrue
   * @param {string} message
   */
  bassert(errcase, isTrue,  message) {
    this.#cases++;
     if (!isTrue) {
       this.#asserts++;
       console.log(`%c   ${this.#fname}:case ${errcase} - ${message}`, "background: rgba(255, 99, 71, 0.5);");
     }
  }

  /** asserts catching exceptions one case in a test, shows message on failure
   * @param {number} errcase
   * @param {Function} fn
   * @param {...} ...params
   */
  assert(errcase, fn, ...params) {
    this.#cases++;
    try {
      fn(...params);
    } catch(err) {
      this.#asserts++;
      console.log(`%c   ${this.#fname}:case ${errcase} - ${err.message}`, "background: rgba(255, 99, 71, 0.5);");
      ;
    }
  }

  /** silents exception of one testcase, asserts & shows message if no exception
   * @param {number} errcase
   * @param {Function} fn
   * @param {...} ...params
   */
  shouldAssert(errcase, fn, message, ...params) {
    this.#cases++;
    let hasAsserted = false;
    try {
      fn(...params);
    } catch(err) {
      hasAsserted = true;
    }
    if(!hasAsserted) {
      this.#asserts++;
      console.log(`%c   ${this.#fname}:case ${errcase} should assert - ${message}`, "background: rgba(255, 99, 71, 0.5);");
      ;
    } 
  }

  /** output to current note (indirect) and for failures on console
   * @param {string} str
   */
  #praut(key, str) {
    if (key != this.s && key != this.f && key != this.d) {
      let errstr = "%c" + key;
      console.log(errstr, "background: rgba(255, 99, 71, 0.5);");
    } else if (this.o[key] == "") {
      this.o[key] = str;
    } else if (str[0] == TestSuite.nok) {
      this.o[key] = str.substring(1) + "\n          " + this.o[key];
    } else {
      this.o[key] = this.o[key] + "\n          " + str;
    } 
  }
}

/** Error used for unit test  */
class TestError extends Error {
  constructor(message, ...params) {
    super(message, ...params);
    this.name = "TestError";
  }
  toString() { return " °°" + this.constructor.name + " " + this.name }
}
//#endregion debug,test and error
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
    this.name = name;
    this.callbacks = [];
  }
  toString() { return " °°" + this.constructor.name + " " + this.name }
  registerCallback(callback, instance) {
    this.callbacks.push([callback, instance]);
  }
  //#region Event tests
  static _ = null;
  static test(outputObj) {
    Event._ = new TestSuite("class Event", outputObj);
    Event._.run(Event.constructorTest);
    Event._.run(Event.toStringTest);
    Event._.run(Event.registerCallbackTest);
    Event._.destruct();
    Event._ = null;
  }
  static constructorTest() {
    Event._.assert(1, Event._tryConstruct, undefined);
    Event._.assert(2, Event._tryConstruct, "eventname");
  }
  static toStringTest() {
    let str = new Event("eventname").toString()
    Event._.bassert(1, str.contains("eventname"), "does not contain Event name");
  }
  static registerCallbackTest() {
    let e = new Error();
    Event._.assert(1, Event._tryRegisterCallback, undefined, undefined);
    Event._.assert(2, Event._tryRegisterCallback, "eventname", undefined);
    Event._.assert(3, Event._tryRegisterCallback, "eventname", e);
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
    this.events = {};
  }
  toString() { return " °°" + this.constructor.name}
  registerEvent(eventName) {
    var event = new Event(eventName);
    this.events[eventName] = event;
  }
  addListener(eventName, callback, instance) {
    this.events[eventName].registerCallback(callback, instance);
  }
  dispatchEvent(eventName, eventArgs) {
    this.events[eventName].callbacks.forEach((arr) => {
      let callback = arr[0]
      let instance = arr[1]
      callback(instance, eventArgs);
    });
  }
  //#region Dispatcher tests
  static _ = null;
  static test(outputObj) {
    Dispatcher._ = new TestSuite("class Dispatcher", outputObj);
    Dispatcher._.run(Dispatcher.constructorTest);
    Dispatcher._.run(Dispatcher.toStringTest);
    Dispatcher._.run(Dispatcher.registerEventTest);
    Dispatcher._.run(Dispatcher.dispatchEventTest);
    Dispatcher._.run(Dispatcher.addListenerTest);
    Dispatcher._.destruct();
    Dispatcher._ = null;
    Event.test(outputObj)
  }
  static constructorTest() {
    Dispatcher._.assert(1, Dispatcher._tryConstruct);
  }
  static toStringTest() {
    let str = new Dispatcher().toString()
    Dispatcher._.bassert(1, str.contains("°°"), "does not contain module mark °°");
  }
  static registerEventTest() {
    Dispatcher._.assert(1, Dispatcher._tryRegisterEvent, undefined);
    Dispatcher._.assert(1, Dispatcher._tryRegisterEvent, "big bang");
  }
  static addListenerTest() {
    Dispatcher._.assert(1, Dispatcher._tryAddListener, "big bang", undefined, undefined);
  }
  static dispatchEventTest() {
    Dispatcher._.assert(1, Dispatcher._tryDispatchEvent, "big bang", undefined);
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
/** Base class for all settings classes */
class BreadCrumbs {
  //#region member variables
  #key
  get key() {return this.#key}
  //#endregion member variables
  constructor(key) {
    this.#key = key;
  }
  toString() { return "°°°" + this.constructor.name + " " + this.key }
  //#region BreadCrumbs tests
  static _ = null;
  static test(outputObj) {
    BreadCrumbs._ = new TestSuite("class BreadCrumbs", outputObj);
    BreadCrumbs._.run(BreadCrumbs.constructorTest);
    BreadCrumbs._.run(BreadCrumbs.toStringTest);
    BreadCrumbs._.run(BreadCrumbs.getKeyTest);
    BreadCrumbs._.destruct();
    BreadCrumbs._ = null;
  }
  static constructorTest() {
    BreadCrumbs._.assert(1, BreadCrumbs._tryConstruct, undefined);
    BreadCrumbs._.assert(2, BreadCrumbs._tryConstruct, "myName");
    let breadcrumbs = new BreadCrumbs()
    BreadCrumbs._.bassert(3, breadcrumbs instanceof Object, "`BreadCrumbs` has to be an instance of `Object`");
  }
  static toStringTest() {
    let str = new BreadCrumbs("my name").toString()
    BreadCrumbs._.bassert(1, str.contains("my name"), "`toString` result does not contain name given on construction ");
  }
  static getKeyTest() {
    let breadcrumbs = new BreadCrumbs("my name")
    BreadCrumbs._.bassert(1, breadcrumbs.key == "my name", "`key` does not return name given on construction ");
  }
  static _tryConstruct(arg1) {
    let settings = new Setting(arg1);
  }
  //#endregion BreadCrumbs tests
}

/** Main class
 * 
 */
class Setting extends BreadCrumbs {
  //#region member variables
  static #ROOT = "/"
  //#endregion member variables
  constructor(key) {
    super(key === undefined ? Setting.#ROOT : key)
  }
  //#region Setting tests
  static _ = null;
  static test(outputObj) {
    BreadCrumbs.test(outputObj)
    Setting._ = new TestSuite("class Setting", outputObj);
    Setting._.run(Setting.constructorTest);
    Setting._.run(Setting.toStringTest);
    Setting._.destruct();
    Setting._ = null;
  }
  static constructorTest() {
    Setting._.assert( 1, Setting._tryConstruct, undefined);
    Setting._.assert( 2, Setting._tryConstruct, "myName");
    Setting._.assert( 3, Setting._tryConstruct, "my Name");
    Setting._.assert( 4, Setting._tryConstruct, 22);
    Setting._.assert(5, Setting._tryConstruct, Symbol('a'));   
    let setting = new Setting()
    Setting._.bassert(6, setting instanceof BreadCrumbs, "`Setting` has to be an instance of `BreadCrumbs`");

  }
  static toStringTest() {
    let str = new Setting().toString()
    Setting._.bassert(1, str.contains(Setting.#ROOT), "`toString` result does not contain root string");
    str = new Setting("my Name").toString()
    Setting._.bassert(2, str.contains("my Name"), "`toString` result does not contain Setting key");
  }
  static _tryConstruct(arg1) {
    let settings = new Setting(arg1);
  }
  //#endregion Setting tests
}
//#endregion code 
/** Runs all tests, if TESTING is set; output to current note (indirect)
 * @param {*} outputObj 
 */
function test(outputObj) {
  if(TESTING) 
  Dispatcher.test(outputObj)
  Setting.test(outputObj)
}

/** exported function
 * @param {Object} tp - templater object
 * @param {Object} app - obsidian api object
 * @returns 
 */
async function main(tp, app) { 
  let testProps = {}
  test(testProps)
  try {
    let settings = new Setting();
  } catch(e) { /* returns errProps or rethrows */
    if(e instanceof FotyError) {
      let errProps = {}
      if (e instanceof SettingError) {
        errProps = { 
          "!": e.name + " in " + e.section,
          "-": e.message,
        }
      } else if(e instanceof CodingError) {
        errProps = { 
          "!": e.name + " in " + e.section,
          "-": e.message,
        }
      } else {
        errProps = { 
          "!": e.name,
          "-": e.message,
        }
      }
      return errProps
    } else { aut("RETHROWING"); throw(e) }
  }
  let dbgProps = { 
    __notePath: tp.file.path(true/*relative*/), 
    __noteTitle: tp.file.title,
    __activeFile: tp.config.active_file.path,
    __runMode: tp.config.run_mode,
    __targetFile: tp.config.target_file.path,
    __templateFile: tp.config.template_file.path,
  }

  let developCheck = false
  if(developCheck) {
    let developProps = {}
    let e = new Setting("xx")
    developProps = {"DEV" : "keys"}
    developProps = {"DEV" : "pre" + developProps["DEV"]}
    return developProps
  }

  if (!DEBUG) dbgProps = undefined 
  return Object.assign({}, dbgProps, testProps)
}
