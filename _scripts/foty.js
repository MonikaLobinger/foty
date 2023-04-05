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
//#region debug, error and test
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
function aut(str, b, c) {
  let bgr = b ? b : "yellow"
  let clr = c ? c : "red"
  console.log("%c" + str, `background:${bgr};color:${clr};font-weight:normal`);
}

/** logs `vn` and `v` colored to console
 * @param {String} vn - variable name
 * @param {String} v - variable value
 * @param {String} b - background color
 * @param {String} c - foreground color
 */
function vaut(vn, v, b, c) {
  let bgr = b ? b : "yellow"
  let clr = c ? c : "red"
  let str = vn + ": " + v;
  console.log("%c" + str, `background:${bgr};color:${clr};font-weight:normal`);
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
  constructor(section = "Setting", ...params) {
    super(...params);
    this.name = "Setting Error";
    this.section = section;
  }
}

/** Programming Error */
class CodingError extends FotyError {
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
  get name() {return this.#name}
  //#endregion member variables

	/** Sets up the suite
	 * @param {String} name - name of the suite
   * @param {Object} outputObj - javascript object for output in Obsidian
	 */
	constructor(name, outputObj) {
		this.#name = name ? name : "Unknown";
    this.#outputObj = outputObj;
	}
  toString() { return " °°" + this.constructor.name + " " + this.name }

	/** Shows results; resets
	 */
	destruct() {
    let succStr = this.#succeeded == 1 ? "test" : "tests";
    let failStr = this.#failed == 1 ? "test" : "tests";
		if(this.#failed == 0) {
			this.#praut(`${TestSuite.ok}Suite "${this.#name}"`,  `${this.#succeeded} ${succStr} succeeded`);
		} else {
			this.#praut(`${TestSuite.nok}Suite "${this.#name}"`, `${this.#failed} ${failStr} failed (see console), ${this.#succeeded} succeeded`);
		}
		this.#name = null;
    this.#outputObj = null;
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
		this.#cases = 0;
		try {
			fn();
			if(0 == this.#asserts) this.#succeeded++;
			else                   this.#failed++;
		} catch (e) {
			console.error(e);
		}
		this.#fname = "";
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
			this.#cases = 0;
			try {
				fn()
				.then((fnAnswer) => {
					if(0 == this.#asserts) this.#succeeded++;
					else                   this.#failed++;
					this.#fname = "";
					resolve(fn.name + " resolved");
				});
			} catch (e) {
				console.error(e);
				this.#fname = "";
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
			 if(this.#asserts == 1) {
				this.#praut(`${TestSuite.nok}Suite "${this.#name}"`,`   test "${this.#fname}" failed`);
			 }
			 console.log(`%c   case ${errcase} - ${message}`, "background: rgba(255, 99, 71, 0.5);");
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
			if(this.#asserts == 1) {
				this.#praut(`${TestSuite.nok}Suite "${this.#name}"`,`   test "${this.#fname}" failed`);
			}
			console.log(`%c   case ${errcase} - ${err.message}`, "background: rgba(255, 99, 71, 0.5);");
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
			if(this.#asserts == 1) {
				this.#praut(`${TestSuite.nok}Suite "${this.#name}"`,`   test "${this.#fname}" failed`);
			}
			console.log(`%c   case ${errcase} should assert - ${message}`, "background: rgba(255, 99, 71, 0.5);");
			;
		}
	}

	/** output to current note (indirect) and for failures on console
	 * @param {string} str
	 */
	#praut(key, str) {
		if(key.charAt(0) == TestSuite.ok) {
      this.#outputObj[key] = str;
    } else if(key.charAt(0)==TestSuite.nok) {
      let value = this.#outputObj[key];
      if(value === undefined)
        this.#outputObj[key] = "";
      value = this.#outputObj[key];
      this.#outputObj[key] = value + "\n       " + str;
		} else {
			let errstr = "%c" + key;
			console.log(errstr, "background: rgba(255, 99, 71, 0.5);");
		}
	}
}

/** Error used for unit test  */
class TestError extends Error {
	constructor(message, ...params) {
		super(message, ...params);
		this.name = "TestError";
	}
}
//#endregion debug,test and error
//#region helper classes
/** Events that Dispatcher stores and dispatches to listeners
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
    Event._.destruct();
    Event._ = null;
  }
  static constructorTest() {
    Event._.assert(1, Event._tryConstruct, undefined);
    Event._.assert(2, Event._tryConstruct, "myName");
  }
  static _tryConstruct(arg1) {
    let event = new Event(arg1);
  }
  //#endregion Event tests}
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
  dispatchEvent(eventName, eventArgs) {
    this.events[eventName].callbacks.forEach((arr) => {
      let callback = arr[0]
      let instance = arr[1]
      callback(instance, eventArgs);
    });
  }
  addListener(eventName, callback, instance) {
    this.events[eventName].registerCallback(callback, instance);
  }
  //#region Dispatcher tests
  static _ = null;
  static test(outputObj) {
    Dispatcher._ = new TestSuite("class Dispatcher", outputObj);
    Dispatcher._.run(Dispatcher.constructorTest);
    Dispatcher._.destruct();
    Dispatcher._ = null;
    Event.test(outputObj)
  }
  static constructorTest() {
    Dispatcher._.assert(1, Dispatcher._tryConstruct, undefined);
    Dispatcher._.assert(2, Dispatcher._tryConstruct, "myName");
  }
  static _tryConstruct(arg1) {
    let dispatcher = new Dispatcher(arg1);
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
    Setting._ = new TestSuite("class Setting", outputObj);
    Setting._.run(Setting.constructorTest);
    Setting._.destruct();
    Setting._ = null;
  }
  static constructorTest() {
    Setting._.assert( 1, Setting._tryConstruct, undefined);
    Setting._.assert( 2, Setting._tryConstruct, "myName");
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
    Setting.test(outputObj)
    Dispatcher.test(outputObj)
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
    developProps = {"DEV" : "keys" in e}
    return developProps
  }

  if (!DEBUG) dbgProps = undefined 
  return Object.assign({}, dbgProps, testProps)
}
