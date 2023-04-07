module.exports = main; // templater call: "await tp.user.foty(tp, app)"
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
 * of notes in foty are called `types`. The configuration of a type should
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
 * is `____`. Before this key all entries are frontmatter entries, entries
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
  //#region DONTTOUCH
  //#endregion DONTTOUCH
  //#region USER CONFIGURATION
  //#endregion USER CONFIGURATION
  //#region test configurations
  const TEST = {
    
  }
  const TEST2 = {
    audio: { marker: "{a}", pict: "a.jpg", frontmatter: { private: true, },},
    plant: { frontmatter: {kind: "", seed: "", } },
  }
  //#endregion test configurations
//#endregion CONFIGURATION
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

/** superclass for all Foty Errors (but not unit test Errors) */
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
  o = this.#outputObj;
  f = "failing";
  s = "success";
  d = "details"
  get name() { return this.#name }
  e = "none"
  //#endregion member variables

  /** Sets up the suite
   * @param {String} name - name of the suite
   * @param {Object} outputObj - javascript object for output in Obsidian
   */
  constructor(name, outputObj) {
    this.#name = name ? name : "Unknown";
    this.o = outputObj;
    if(this.o[this.f] == undefined) this.o[this.f] = this.e;
    if(this.o[this.s] == undefined) this.o[this.s] = this.e;
    if(this.o[this.d] == undefined) this.o[this.d] = this.e;
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
      console.error("ERROR in TestSuite:run\n" + 
        "You probably caused an error in one of your tests which is not test specific\n"+ e);
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
       console.log(`%c   ${this.#name}/${this.#fname}:case ${errcase} - ${message}`, "background: rgba(255, 99, 71, 0.5);");
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
      console.log(`%c   ${this.#name}/${this.#fname}:case ${errcase} - ${err.message}`, "background: rgba(255, 99, 71, 0.5);");
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
      console.log(`%c   ${this.#name}/${this.#fname}:case ${errcase} should assert - ${message}`, "background: rgba(255, 99, 71, 0.5);");
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
    } else if (this.o[key] == this.e) {
      this.o[key] = str;
    } else if (str[0] == TestSuite.nok) {
      if(key == this.d) {
        let outParts = this.o[key].split(TestSuite.nok)
        let len = outParts.length
        let okPart = outParts[len - 1];
        if(len==1) {
          let newLastPart = str.substring(1) + "\n          " + okPart;
          outParts[outParts.length - 1] = newLastPart
          this.o[key] = outParts.join();
        } else {
          let newLastPart = "\n          " + str.substring(1) + okPart;
          outParts[outParts.length - 1] = newLastPart
          this.o[key] = outParts.join(TestSuite.nok);
        }
      } else {  
        this.o[key] = str.substring(1) + "\n          " + this.o[key];
      }
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
    Event._ = new TestSuite("Event", outputObj);
    Event._.run(Event.constructorTest);
    Event._.run(Event.toStringTest);
    Event._.run(Event.registerCallbackTest);
    Event._.destruct();
    Event._ = null;
  }
  static constructorTest() {
    Event._.assert(1, Event._tryConstruct, undefined);
    Event._.assert(2, Event._tryConstruct, "eventname");
    let event = new Event()
    Event._.bassert(3, event.constructor == Event, "the constructor property is not Event")
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
    Dispatcher._ = new TestSuite("Dispatcher", outputObj);
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
    let dispatcher = new Dispatcher
    Dispatcher._.bassert(2, dispatcher.constructor == Dispatcher, "the constructor property is not Dispatcher")
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
/** superclass for all settings classes */
class BreadCrumbs {
  //#region member variables
  #literal
  #key
  #crumb
  get literal() {return this.#literal}
  get key() { return this.#key }
  get crumb() {return this.#crumb}
  //#endregion member variables
  constructor(literal, key, caller) {
    this.#literal = literal
    this.#key = key
    this.#crumb = caller
    this.throwIfUndefined(key, "key")
  }
  toString() { return "°°°" + this.constructor.name + " " + this.key }
  
  toBreadCrumbs() {
    let breadcrumbs = ""
    let sep = ""
    if(BreadCrumbs.isDefined(this.crumb)) {
      breadcrumbs += this.crumb.toBreadCrumbs() 
      sep = "."
    }
    breadcrumbs += sep + this.#key;
    return breadcrumbs 
  }

  throwIfUndefined(val, valname = "literal", funame = "constructor", msg = "' is undefined") {
    if(!BreadCrumbs.isDefined(val))
      throw new SettingError(this.constructor.name + " " + funame,
      "Breadcrumbs: '" + this.toBreadCrumbs() + 
        "'\n   '" + valname + msg)
  }

  static isDefined(val) {
    return (typeof val != "undefined")
  }

  //#region BreadCrumbs tests
  static _ = null;
  static test(outputObj) {
    BreadCrumbs._ = new TestSuite("BreadCrumbs", outputObj);
    BreadCrumbs._.run(BreadCrumbs.constructorTest);
    BreadCrumbs._.run(BreadCrumbs.toStringTest);
    BreadCrumbs._.run(BreadCrumbs.toBreadCrumbsTest);
    BreadCrumbs._.run(BreadCrumbs.getKeyTest);
    BreadCrumbs._.run(BreadCrumbs.getLiteralTest);
    BreadCrumbs._.run(BreadCrumbs.getCrumbTest);
    BreadCrumbs._.destruct();
    BreadCrumbs._ = null;
  }
  static constructorTest() {
    BreadCrumbs._.shouldAssert(1, BreadCrumbs._tryConstruct, {}, undefined);
    BreadCrumbs._.assert(2, BreadCrumbs._tryConstruct, undefined, "myName");
    let breadcrumbs = new BreadCrumbs(undefined,"TEST KEY")
    BreadCrumbs._.bassert(3, breadcrumbs instanceof Object, "`BreadCrumbs` has to be an instance of `Object`");
    BreadCrumbs._.bassert(4, breadcrumbs instanceof BreadCrumbs, "`BreadCrumbs` has to be an instance of `BreadCrumbs`");
    BreadCrumbs._.bassert(5, breadcrumbs.constructor == BreadCrumbs, "the constructor property is not `BreadCrumbs`")
  }
  static toStringTest() {
    let str = new BreadCrumbs(undefined, "my name").toString()
    BreadCrumbs._.bassert(1, str.contains("my name"), "result does not contain name given on construction ")
  }
  static toBreadCrumbsTest() {
    let parent = new BreadCrumbs(undefined, "parent")
    let child = new BreadCrumbs(undefined, "child", parent)
    let grandChild = new BreadCrumbs(undefined, "grandChild", child)
    let parentStr = parent.toBreadCrumbs()
    let childStr = child.toBreadCrumbs()
    let grandChildStr = grandChild.toBreadCrumbs()
    BreadCrumbs._.bassert(1, parentStr == "parent", "breadCrumbs: `" + parentStr + "` are wrong")
    BreadCrumbs._.bassert(2, childStr == "parent.child", "breadCrumbs: `" + childStr + "` are wrong")
    BreadCrumbs._.bassert(3, grandChildStr == "parent.child.grandChild", "breadCrumbs: `" + grandChildStr + "` are wrong")
  }
  static getKeyTest() {
    let breadcrumbs = new BreadCrumbs({}, "my name")
    BreadCrumbs._.bassert(1, breadcrumbs.key == "my name", "does not return name given on construction ");
  }
  static getLiteralTest() {
    const sym = Symbol("Symbol Descriptor");
    let breadcrumbs = new BreadCrumbs({sym: 87673}, "my name")
    BreadCrumbs._.bassert(1, breadcrumbs.literal.sym == 87673, "does not return literal given on construction ");
  }
  static getCrumbTest() {
    let parent = new BreadCrumbs(undefined, "parent")
    let breadcrumbs = new BreadCrumbs({}, "my name", parent)
    BreadCrumbs._.bassert(1, breadcrumbs.crumb == parent, "does not return parent given on construction ");
  }
  static _tryConstruct(arg1, arg2) {
    let breadcrumbs = new BreadCrumbs(arg1, arg2);
  }
  //#endregion BreadCrumbs tests
}

/** most elaborated subclass 
 * 
 */
class Setting extends BreadCrumbs {
  //#region member variables
  static #ROOT = "/"
  //#endregion member variables
  constructor(literal, key=undefined, caller=undefined) {
    super(literal, key === undefined ? Setting.#ROOT : key, caller)
    this.throwIfUndefined(literal)
  }
  //#region Setting tests
  static _ = null;
  static test(outputObj) {
    BreadCrumbs.test(outputObj)
    Setting._ = new TestSuite("Setting", outputObj);
    Setting._.run(Setting.constructorTest);
    Setting._.run(Setting.toStringTest);
    Setting._.destruct();
    Setting._ = null;
  }
  static constructorTest() {
    Setting._.shouldAssert(1, Setting._tryConstruct, undefined);
    Setting._.assert(2, Setting._tryConstruct, {}, "myName");
    Setting._.assert(3, Setting._tryConstruct, {}, "my Name");
    Setting._.assert(4, Setting._tryConstruct, {}, 22);
    Setting._.assert(5, Setting._tryConstruct, {}, Symbol('a'));   
    let setting = new Setting({},"myName")
    Setting._.bassert(6, setting instanceof BreadCrumbs, "`Setting` has to be an instance of `BreadCrumbs`");
    Setting._.bassert(7, setting.constructor == Setting, "the constructor property is not `Setting`")

  }
  static toStringTest() {
    let str = new Setting({}).toString()
    Setting._.bassert(1, str.contains(Setting.#ROOT), "`toString` result does not contain root string");
    str = new Setting({}, "my Name").toString()
    Setting._.bassert(2, str.contains("my Name"), "`toString` result does not contain Setting key");
    let setting = new Setting({}, "my Name")
  }
  static _tryConstruct(arg1,arg2) {
    let settings = new Setting(arg1,arg2);
  }
  //#endregion Setting tests
}
//#endregion code 
/** Runs all tests, if TESTING is set; output to current note (indirect)
 * @param {*} outputObj 
 */
function test(outputObj) {
  if(TESTING) {
    Dispatcher.test(outputObj)
    Setting.test(outputObj)
  }
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
    let settings = new Setting(TEST);
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
    let setting = new Setting()
    let developProps = {}
    let e = new Event()
    e["key"] = "val"
    let d = Object.hasOwn(e, "addListener")
    developProps = { "DEV": d }
    console.log(d)
    return developProps
  }

  if (!DEBUG) dbgProps = undefined 
  return Object.assign({}, dbgProps, testProps)
}
