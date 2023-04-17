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
 */
//prettier-ignore
const TestRead = {ROOT:true, __:"...",
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
const ttx = {
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
const Test = {
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
const Test2 = {
  audio: {marker: "{a}", pict: "a.jpg", frontmatter: {private: true}},
  plant: {frontmatter: {kind: "", seed: ""}},
}
//  #endregion test configurations
//#endregion CONFIGURATION
//#region debug, base, error and test
var DEBUG = false
var TESTING = false
if (TESTING) DEBUG = false
var CHECK_ERROR_OUTPUT = false
if (CHECK_ERROR_OUTPUT) {
  DEBUG = false
  TESTING = false
}

// prettier-ignore
/** Prints more than one error message (indirect) to current note
 *
 * If output in catch block of main function changes, output here has to be
 * adapted.
 * @param {object} YAML
 */
function letAllThrow(YAML) {
  if (!CHECK_ERROR_OUTPUT) return
  let oldPad = Number.prototype.pad
  Number.prototype.pad = function (size) {
    var s = String(this)
    while (s.length < (size || 3)) {
      s = "0" + s
    }
    return s
  }
  function out(e, YAML) {
    let msg
    YAML[cnt.pad()] = "---------------------------------------------------"
    if (e instanceof SettingError) {
      YAML[cnt.pad(4)] = e.name + " in " + e.caller
      msg = e.message.replace(/(?<!(\n[ ]*))[ ][ ]*/g,' ')
      if (e.lastMsg.length > 0)
      msg += "\n" + e.lastMsg.replace(/(?<!(\n[ ]*))[ ][ ]*/g,' ')
      } else if (e instanceof CodingError) {
      YAML[cnt.pad() + "!"] = e.name + " in " + e.caller
      msg = e.message.replace(/(?<!(\n[ ]*))[ ][ ]*/g,' ')
      msg += e.lastMsg.replace(/(?<!(\n[ ]*))[ ][ ]*/g,' ')
      } else {
      YAML[cnt.pad() + "?"] = e.name
      msg = e.message.replace(/(?<!(\n[ ]*))[ ][ ]*/g,' ')
    }
    YAML[cnt.pad() + "\u00A8"] = msg
  }
  let un
  let br = new BreadCrumbs({},"bcRoot",un)
  let root = new Setting({},"/",un)
  let rootT = new Setting({__NOTETYPES: {diary: {}}},"/",un)
  // @todo check why objTypes with Wrong does not work as I think it should
  let wrong = new Wrong(un,"wrongInstance",un)
  let cnt = 0
  /*01*/try{cnt++;new BreadCrumbs(1,"name1",un)}catch(e){out(e,YAML)}
  /*02*/try{cnt++;new BreadCrumbs("x","name2",root)}catch(e){out(e,YAML)}
  /*03*/try{cnt++;new BreadCrumbs({},un,un)}catch(e){out(e,YAML)}
  /*04*/try{cnt++;new BreadCrumbs({},2,root)}catch(e){out(e,YAML)}
  /*05*/try{cnt++;new BreadCrumbs({},"name5",{})}catch(e){out(e,YAML)}
  /*06*/try{cnt++;root.objTypes =root}catch(e){out(e,YAML)}
  /*07*/try{cnt++;root.objTypes ="a b"}catch(e){out(e,YAML)}
  /*08*/try{cnt++;root.objTypes ="a"}catch(e){out(e,YAML)}
  /*09*/try{cnt++;root.objTypes ="ab"}catch(e){out(e,YAML)}
  /*10*/try{cnt++;new DialogManager(un,"name10",root)}catch(e){out(e,YAML)}
  /*11*/try{cnt++;new DialogManager({},"name11",un)}catch(e){out(e,YAML)}
  /*12*/try{cnt++;new DialogManager({NONAME:12},"name12",root)}catch(e){out(e,YAML)}
  /*13*/try{cnt++;new DialogManager({TYPE_MAX_ENTRIES:false},"name13",root)}catch(e){out(e,YAML)}
  /*14*/try{cnt++;new DialogManager({TYPE_PROMPT:12},"name14",root)}catch(e){out(e,YAML)}
  /*20*/try{cnt++;new TypesManager(un,"name20",root)}catch(e){out(e,YAML)}
  /*21*/try{cnt++;new TypesManager({},"name21",un)}catch(e){out(e,YAML)}
  /*22*/try{cnt++;new TypesManager({diary: 22},"name22",root)}catch(e){out(e,YAML)}
  /*23*/try{cnt++;new TypesManager({diary: {NONAME: 23}},"name23",root)}catch(e){out(e,YAML)}
  /*24*/try{cnt++;new TypesManager({diary: {MARKER: 24}},"name24",root)}catch(e){out(e,YAML)}
  /*25*/try{cnt++;new FoTyManager(un,"name25",root)}catch(e){out(e,YAML)}
  /*26*/try{cnt++;new FoTyManager({},"name26",un)}catch(e){out(e,YAML)}
  /*27*/try{cnt++;new FoTyManager({},"name27",br)}catch(e){out(e,YAML)}
  /*28*/try{cnt++;new FoTyManager({diary:"diary"},"name28",root)}catch(e){out(e,YAML)}
  /*29*/try{cnt++;new FoTyManager({diary:"noNotetype"},"name29",rootT)}catch(e){out(e,YAML)}
  /*30*/try{cnt++;new FoTyManager({diary:root},"name30",rootT)}catch(e){out(e,YAML)}
  /*31*/try{cnt++;new Setting(un,"name31",un,un)}catch(e){out(e,YAML)}
  /*32*/try{cnt++;new Setting({},"name32",br,un)}catch(e){out(e,YAML)}
  /*33*/try{cnt++;new Setting({},"name33",un,root)}catch(e){out(e,YAML)}
  /*34*/try{cnt++;new DefaultsManager(un,"name34",root,[],[])}catch(e){out(e,YAML)}
  /*35*/try{cnt++;new DefaultsManager({},"name35",un,[],[])}catch(e){out(e,YAML)}
  /*36*/try{cnt++;new DefaultsManager({},"name36",root,un,[])}catch(e){out(e,YAML)}
  /*37*/try{cnt++;new DefaultsManager({},"name37",root,false,[])}catch(e){out(e,YAML)}
  /*38*/try{cnt++;new DefaultsManager({},"name38",root,[],un)}catch(e){out(e,YAML)}
  /*39*/try{cnt++;new DefaultsManager({},"name39",root,[],true)}catch(e){out(e,YAML)}
  /*40*/try{cnt++;new DefaultsManager({},"name40",root,[],["a"])}catch(e){out(e,YAML)}
  /*41*/try{cnt++;new DefaultsManager({},"name41",root,["a"],[false])}catch(e){out(e,YAML)}
  /*42*/try{cnt++;new DefaultsManager({bottle:42},"name42",root,["paragon"],["Boolean"])}catch(e){out(e,YAML)}
  /*43*/try{cnt++;new DefaultsManager({paragon:43},"name43",root,["paragon"],["Boolean"])}catch(e){out(e,YAML)}
  
  Number.prototype.pad = oldPad
}
// nach @todo und @remove suchen

/** Colors, to be used without quotation marks during development */
const black = "black"
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
  if (typeof str == "object") {
    let entries = Object.entries(str)
    if (entries.length == 0) {
      console.log("%c" + str, `background:${b};color:${c};font-weight:normal`)
    } else {
      entries.forEach(([key, value], idx) => {
        let indent = idx == 0 ? "OBJ " : "    "
        console.log(
          `%c${indent}${key}: ${value}`,
          `background:${b};color:${c};font-weight:normal`
        )
      })
    }
  } else {
    console.log("%c" + str, `background:${b};color:${c};font-weight:normal`)
  }
}

/** logs 'vn' and 'v' colored to console
 * @param {String} vn - variable name
 * @param {String} v - variable value
 * @param {String} b - background color
 * @param {String} c - foreground color
 */
function vaut(vn, v, b = "yellow", c = "red") {
  let str
  if (typeof v == "object") {
    let entries = Object.entries(v)
    if (entries.length == 0) {
      str = vn + ": " + v
    } else {
      str = vn + ": "
      entries.forEach(([key, value], idx) => {
        let indent = idx == 0 ? "" : "      "
        str += `${indent}${key}: ${value}`
      })
    }
  } else {
    str = vn + ": " + v
  }
  console.log("%c" + str, `background:${b};color:${c};font-weight:normal`)
}

/** superclass for all Foty Errors (but not unit test Errors) */
class FotyError extends Error {
  //#region member variables
  lastMsg = ""
  //#endregion member variables
  constructor(...params) {
    super(...params)
    this.name = "Foty Error"
  }
}

/** User Error thrown from Setting tree */
class SettingError extends FotyError {
  //#region member variables
  caller
  //#endregion member variables
  constructor(caller, ...params) {
    let lastMsg = ""
    if (params.length > 1) lastMsg = params.shift()
    super(...params)
    this.name = "Setting Error"
    this.caller = caller
    this.lastMsg = lastMsg
  }
}

/** Programming Error */
class CodingError extends FotyError {
  //#region member variables
  caller
  //#endregion member variables
  constructor(caller, ...params) {
    let lastMsg = ""
    if (params.length > 1) lastMsg = params.shift()
    super(...params)
    this.name = "Coding Error"
    this.caller = caller
    this.lastMsg = lastMsg
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
   * @param {...} ...params
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
   * @param {...} ...params
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
/** SuperSuperClass, adding __SPEC as essence */
class Essence {
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
    function checkType(me, value, type, name, isUserType = false) {
      let ok = false
      if (value == undefined) ok = true
      else {
        if (!isUserType) ok = typeof value == type
        else {
          type = BC.userType2BreadCrumbsType(type)
          if (type[0] == type[0].toLowerCase()) {
            ok = typeof value == type
          } else if (Array.isArray(value) && type == "Array") {
            ok = true
          } else {
            ok = typeof value == "string"
          }
        }
      }
      if (!ok) me.#skipped.push(new Array(name, value, type))
      return ok
    }
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
    if (!checkType(this, litREN, "boolean", "RENDER")) litREN = u
    if (!checkType(this, litTYP, "string", "TYPE")) litTYP = u
    if (!checkType(this, litIGN, "boolean", "IGNORE")) litIGN = u
    if (!checkType(this, litFLT, "boolean", "FLAT")) litFLT = u
    if (!checkType(this, litONC, "boolean", "ONCE")) litONC = u
    if (!checkType(this, litREP, "boolean", "REPEAT")) litREP = u
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
    if (!checkType(this, litDEF, this.TYPE, "DEFAULT", true)) litDEF = u
    let DEFT = litDEF != u ? litDEF : p != u ? p.DEFAULT : Essence.#DEFAULT_DEFT
    Object.defineProperty(this, Essence.#pre + "DEFAULT", {
      value: DEFT,
      writable: false,
      configurable: false,
      enumerable: false,
    })
    if (literal != u) delete literal[Essence.#SPEC_KEY]
  }
}

/** superclass for all settings classes
 * @classdesc
 * settings are organized in collections and items. A collection contains other
 * collections and items, each identified by a key. Content of collection/item
 * is given as literal description. So every collection has a key and a literal.
 * Besides root collection every collection has a parent BC. Only
 * literal is handled specifically by subclasses. But it always has to be an
 * Object (js object, but not null and not an array) if defined
 *
 * BreadCrumbs as superclass handles what all subclasses have in common: key and
 * parent; they are nothing the subclasses have to care with,so those are as
 * private members named differently: #ident and #caller.
 */
class BreadCrumbs extends Essence {
  //#region member variables
  static sep = " \u00BB " // breadcrumbs separator \u2192
  static nl = "\n    " //"\n    " // for multiLiner in SettingError
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
   * @throws {SettingError} - on wrong parameter type and if parameter string
   *                          contains characters which might be malicious in
   *                          eval
   */
  set objTypes(className) {
    this.throwIfNotOfType(className, "string", "objTypes", "'className'")
    this.throwIfMightBeMalicious(className)
    try {
      eval(className)
    } catch (e) {
      throw new SettingError(
        `${this.constructor.name}.set objTypes`,
        `Path: ${this.toBreadcrumbs()}${BC.nl}RETHROWING: ${e.message}`
      )
    }
    if (!eval(className).instanceOfMe) {
      throw new SettingError(
        `${this.constructor.name}.set objTypes`,
        `Path: ${this.toBreadcrumbs()}${BC.nl}'${className}.instanceOfMe' \
        has to be defined`
      )
    }
    BC.#objTypes[className] = eval(className).instanceOfMe
  }
  /** Returns literal given in BreadCrumbs constructor
   * @returns {*}
   */
  get literal() {
    return this.#literal
  }
  //#endregion member variables
  /** Constructs a new BreadCrumbs and registers its type once
   * @constructor
   * @param {(Undefined|Object)} literal
   * @param {(String|Symbol)} key
   * @param {(Undefined|BreadCrumbs)} parent
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key, parent) {
    let un
    super(literal, parent)
    this.#literal = literal
    this.#ident = key
    this.#caller = parent
    this.throwIfNotOfType(literal, ["undefined", "Object"], un, "'literal'")
    this.throwIfUndefined(key, "key")
    this.throwIfNotOfType(key, ["string", "symbol"], un, "'key'")
    this.throwIfNotOfType(parent, ["undefined", "BreadCrumbs"], un, "'parent'")
    if (typeof key == "symbol") this.#ident = "Symbol"
    if (!BC.#instanceCounter++) this.objTypes = "BreadCrumbs"
    if (this.skipped.length) {
      //prettier-ignore
      console.log("Breadcrumbs: " + this.toBreadcrumbs() + "\
\nNot all specification values had been correct. Wrong values \
\nare skipped and parents setting or hardcoded default is used.\
\nSkipped values are: [name,value,type]:" +
          this.skipped
      )
    }
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
    if (BC.isDefined(this.#caller)) {
      if (typeof this.#caller.toBreadcrumbs == "function")
        breadcrumbs += this.#caller.toBreadcrumbs()
      else breadcrumbs += "(" + this.#caller + ")"
      sep = BC.sep
    }
    breadcrumbs += sep + this.#ident
    return breadcrumbs
  }

  /** Returns whether instance has no ancestor
   * @returns {Boolean}
   */
  isRoot() {
    return !BC.isDefined(this.#caller)
  }

  /** Throws if val is strictly undefined (null is defined)
   *
   * Does not throw on parameter type errors
   * @param {*} val
   * @param {String} vname - becomes part of Error message
   * @param {String} [funame="constructor"] - becomes part of Error message
   * @param {String} [msg] - becomes part of Error message
   * @throws {SettingError}
   */
  throwIfUndefined(
    val,
    vname,
    funame = "constructor",
    msg = "is undefined",
    lastMsg = ""
  ) {
    if (typeof vname != "string") vname = ""
    if (typeof funame != "string") funame = ""
    if (typeof msg != "string") msg = "is undefined"
    if (!BC.isDefined(val))
      throw new SettingError(
        `${this.constructor.name}.${funame}`,
        lastMsg,
        `Path: ${this.toBreadcrumbs()}${BC.nl}'${vname}' ${msg}`
      )
  }

  /** Throws if val is not of type or of one of the entries in type array
   *
   * Does not throw on other parameters type errors
   * @param {*} val
   * @param {(Array.<String>|String)} type
   * @param {String} [funame="constructor"] - becomes part of Error message
   * @param {String} [msg] - becomes part of Error message
   * @throws {SettingError}
   */
  throwIfNotOfType(val, type, funame = "constructor", msg = "", lastMsg = "") {
    if (typeof funame != "string") funame = ""
    if (typeof msg != "string") msg = "is not of type"
    else msg += " is not of type"
    if (Array.isArray(type)) {
      if (
        !type.some((t) => {
          return BC.isOfType(val, t)
        })
      )
        throw new SettingError(
          `${this.constructor.name}.${funame}`,
          lastMsg,
          `Path: ${this.toBreadcrumbs()}${BC.nl}${msg} '${type.join(" or ")}'`
        )
    } else if (!BC.isOfType(val, type))
      throw new SettingError(
        `${this.constructor.name}.${funame}`,
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
      let fu = BC.#objTypes[type]
      if (typeof fu == "function") answer = fu(val)
    }
    return answer
  }

  /** Throws if string probably can not be safely evaluated
   * @param {String} evalString
   * @throws {SettingError} - on wrong parameter type and if parameter string
   *                          contains at least one of following characters:
   *                          .= +-,;?!(){}[]<>
   *                          this includes space character
   */
  throwIfMightBeMalicious(evalString) {
    this.throwIfNotOfType(
      evalString,
      "string",
      "throwIfMightBeMalicious",
      "'evalString'"
    )
    let isMalicious = false
    isMalicious = -1 != evalString.search(/[ .=\+\-,;?!(){}\[\]<>]/)
    if (isMalicious)
      throw new SettingError(
        `${this.constructor.name}.throwIfMightBeMalicious`,
        `Path: ${this.toBreadcrumbs()}${BC.nl}evalString '${evalString}' \
        might be malicious`
      )
  }

  /** Returns whether arg1 and arg2 are equal in depth
   * @param {*} arg1
   * @param {*} arg2
   * @param {(Undefined|Number)} lv
   * @returns {Boolean}
   */
  static areEqual(arg1, arg2, lv = 0) {
    function isObject(obj) {
      return obj != null && typeof obj === "object"
    }
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
        (areObjects && !BC.areEqual(val1, val2, ++lv)) ||
        (!areObjects && val1 !== val2)
      ) {
        return false
      }
    }
    return true
  }

  /** Converts allowed user type to type string used in BC.isOfType
   * @param {String} t
   * @returns {String}
   */
  static userType2BreadCrumbsType(t) {
    // UserTypes: String, Boolean, Number, Array, Date,  Frontmatter,
    // BCType: string,boolean,number,undefined,null,bigint,symbol,function,object,
    //         Date, Frontmatter, Null, Array, Object, BreadCrumbs, Setting,
    //         TypeManager,... all registered classes; not Essence (which
    //         does not register)
    // maps       String => string
    //            Number => number
    //            Boolean => boolean
    //            Function => function
    //            Null => null
    //            Array => Array
    //            Date => Date
    //            Frontmatter => Frontmatter
    //            ...
    //            EveryString else => EveryString else
    //            nonStrings => no
    let t2b = ["String", "Number", "Boolean", "Function", "Null"]
    return typeof t == "string" ? (t2b.includes(t) ? t.toLowerCase() : t) : "no"
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
      _.run(throwIfUndefinedTest)
      _.run(throwIfNotOfTypeTest)
      _.run(isDefinedTest)
      _.run(isOfTypeTest)
      _.run(throwIfMightBeMaliciousTest)
      _.run(areEqualTest)
      _.run(userType2BreadCrumbsTypeTest)
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
      _.bassert(2,BC.isDefined(breadcrumbs0.literal), "empty literal given should be defined")
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
      _.bassert(1,BC.instanceOfMe(new BreadCrumbs(un, "BInstance")),"BreadCrumbs instance should be an instance of BreadCrumbs")
      _.bassert(2,!BC.instanceOfMe(new Error()),"Error instance should not be an instance of BreadCrumbs")
      _.bassert(3,!BC.instanceOfMe("BreadCrumbs"),"String should not be an instance of BreadCrumbs")
      _.bassert(4,!BC.instanceOfMe(22),"number should not be an instance of BreadCrumbs")
    }
    function toStringTest() {
      let str = new BreadCrumbs(undefined, "my name11").toString()
      _.bassert(1,str.includes("my name11"),"result does not contain name given on construction")
      _.bassert(2,str.includes("BreadCrumbs"),"result does not contain class name")
      str = new BreadCrumbs({},"myName20").toString()
      _.bassert(3,str.includes("myName20"),"result does not contain name given on construction")
      _.bassert(4,str.includes("BreadCrumbs"),"result does not contain class name")
    }
    function toBreadCrumbsTest() {
      let sep = BC.sep
      let parent = new BreadCrumbs(undefined, "parent1")
      let child = new BreadCrumbs(undefined, "child1", parent)
      let grandChild = new BreadCrumbs(undefined, "grandChild1", child)
      let parentStr = parent.toBreadcrumbs()
      let childStr = child.toBreadcrumbs()
      let grandChildStr = grandChild.toBreadcrumbs()
      _.bassert(1,parentStr == "parent1","breadCrumbs '" + parentStr + "' are wrong")
      _.bassert(2,childStr == "parent1"+ sep +"child1","breadCrumbs '" + childStr + "' are wrong")
      _.bassert(3,grandChildStr == "parent1"+sep+"child1"+sep+"grandChild1","breadCrumbs '" + grandChildStr + "' are wrong")
    }
    function isRootTest() {
      let parent = new BreadCrumbs(undefined, "parent11")
      let child = new BreadCrumbs(undefined, "child11", parent)
      let grandChild = new BreadCrumbs(undefined, "grandChild11", child)
      _.bassert(1,parent.isRoot(),"first parent should be root")
      _.bassert(2,!child.isRoot(),"child should not be root")
      _.bassert(3,!grandChild.isRoot(),"grandchild should not be root")
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
      _.bassert(1,BC.isDefined(""),"Empty String should be defined")
      _.bassert(2,BC.isDefined(null),"null should be defined")
      _.bassert(3,!BC.isDefined(undefined),"undefined should not be defined")
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

      _.bassert(1,!BC.isOfType(str2,"Unknown"), "Unknown" + " is not an accepted type")
      _.bassert(2,!BC.isOfType(undef,undef), "type of type 'Undefined' is not an accepted type")
      _.bassert(3,!BC.isOfType(num1,num1), "type of Type 'Number' is not an accepted type")
      _.bassert(4,BC.isOfType(undef,"undefined"), undef + " should be of type " + "undefined")
      _.bassert(5,BC.isOfType(nul,"object"), nul + " should be of type " + "object")
      _.bassert(6,BC.isOfType(bool1,"boolean"), bool1 + " should be of type " + "boolean")
      _.bassert(7,BC.isOfType(bool2,"boolean"), bool2 + " should be of type " + "boolean")
      _.bassert(8,BC.isOfType(num1,"number"), num1 + " should be of type " + "number")
      _.bassert(9,BC.isOfType(num2,"number"), num2 + " should be of type " + "number")
      _.bassert(10,BC.isOfType(num3,"number"), num3 + " should be of type " + "number")
      _.bassert(11,BC.isOfType(num4,"number"), num4 + " should be of type " + "number")
      _.bassert(12,BC.isOfType(num5,"number"), num5 + " should be of type " + "number")
      _.bassert(13,BC.isOfType(num6,"number"), num6 + " should be of type " + "number")
      _.bassert(14,BC.isOfType(num7,"number"), num7 + " should be of type " + "number")
      _.bassert(15,BC.isOfType(num8,"number"), num8 + " should be of type " + "number")
      _.bassert(16,BC.isOfType(bigI1,"bigint"), bigI1 + " should be of type " + "bigint")
      _.bassert(17,BC.isOfType(str1,"string"), str1 + " should be of type " + "string")
      _.bassert(18,BC.isOfType(str2,"string"), str2 + " should be of type " + "string")
      _.bassert(19,BC.isOfType(sym1,"symbol"), "Symbol()" + " should be of type " + "symbol")
      _.bassert(20,BC.isOfType(sym2,"symbol"), "Symbol(arg)" + " should be of type " + "symbol")
      _.bassert(21,BC.isOfType(sym3,"symbol"), "Symbol(arg)" + " should be of type " + "symbol")
      _.bassert(22,BC.isOfType(obj1,"object"), obj1 + " should be of type " + "object")
      _.bassert(23,BC.isOfType(obj2,"object"), obj2 + " should be of type " + "object")
      _.bassert(24,BC.isOfType(arr1,"object"), "Empty Array" + " should be of type " + "object")
      _.bassert(25,BC.isOfType(arr2,"object"), arr2 + " should be of type " + "object")
      _.bassert(26,BC.isOfType(nul,"Null"), nul + " should be of type " + "Null")
      _.bassert(27,BC.isOfType(arr1,"Array"), "Empty Array" + " should be of type " + "Array")
      _.bassert(28,BC.isOfType(arr2,"Array"), arr2 + " should be of type " + "Array")
      _.bassert(29,BC.isOfType(breadcrumb1,"object"), breadcrumb1 + " should be of type " + "object")
      _.bassert(30,BC.isOfType(breadcrumb1,"Object"), breadcrumb1 + " should be of type " + "Object")
      _.bassert(31,BC.isOfType(breadcrumb1,"BreadCrumbs"), breadcrumb1 + " should be of type " + "BreadCrumbs")
      _.bassert(32,BC.isOfType(breadcrumb2,"object"), breadcrumb2 + " should be of type " + "object")
      _.bassert(33,BC.isOfType(breadcrumb2,"Object"), breadcrumb2 + " should be of type " + "Object")
      _.bassert(34,BC.isOfType(breadcrumb2,"BreadCrumbs"), breadcrumb2 + " should be of type " + "BreadCrumbs")

      _.bassert(101,!BC.isOfType(undef,"object"), undef + " should not be of type " + "object")
      _.bassert(102,!BC.isOfType(undef,"Object"), undef + " should not be of type " + "Object")
      _.bassert(103,!BC.isOfType(undef,"Null"), undef + " should not be of type " + "Null")
      _.bassert(104,!BC.isOfType(nul,"undefined"), nul + " should not be of type " + "undefined")
      _.bassert(105,!BC.isOfType(nul,"Object"), nul + " should not be of type " + "Object")
      _.bassert(106,!BC.isOfType(arr1,"Object"), "Empty Array" + " should not be of type " + "Object")
      _.bassert(107,!BC.isOfType(arr2,"Object"), arr2 + " should not be of type " + "Object")
      _.bassert(108,!BC.isOfType(obj1,"BreadCrumbs"), obj1 + " should not be of type " + "BreadCrumbs")
      _.bassert(109,!BC.isOfType(breadcrumb2,"Setting"), breadcrumb2 + " should not be of type " + "Setting")
    }
    function throwIfMightBeMaliciousTest() {
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a b", "space character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a.b", "point character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a=b", "equal sign character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a+b", "plus sign character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a-b", "minus sign character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a,b", "comma sign character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a;b", "semicolon sign character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a?b", "question mark sign character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a!b", "exclamation mark sign character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a(b", "'(' character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a)b", "')' character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a{b", "'{' character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a}b", "'}' character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a[b", "'[' character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a]b", "']' character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a>b", "'>' character considered malicious")
      _.shouldAssert(1,_tryThrowIfMightBeMalicious, "a<b", "'<' character considered malicious")
      _.assert(1,_tryThrowIfMightBeMalicious, "Ein_GanZ_5LankerSti2nk", "Only alphanumeric characters, number characters and underscore should be ok")
    }
    function areEqualTest() {
      let obj1 = {}
      let obj1_0 = {}
      let obj1_1 = {a}
      let obj1_2 = {a:true}
      _.assert(1,_tryAreEqual,22,obj1,"any arguments allowed")
      _.assert(2,_tryAreEqual,obj1, "a","any arguments allowed")
      _.bassert(3,BC.areEqual(obj1, obj1_0),"objs are equal - see code")
      _.bassert(4,!BC.areEqual(obj1, obj1_1),"objs are not equal - see code")
      _.bassert(5,!BC.areEqual(obj1, obj1_2),"objs are not equal - see code")

      let obj2 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined,i:_tryConstruct}}}
      let obj2_0 = {"a":{"b":{"c":true,"d":"alpha","e":22,"f":22n,"g":null,"h":undefined,"i":_tryConstruct}}}
      let obj2_1 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined,i:_tryConstruct,j:22}}}
      let obj2_2 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined}}}
      let obj2_3 = {a:{b:{c:false,d:"alpha",e:22,f:22n,g:null,h:undefined,i:_tryConstruct}}}
      let obj2_4 = {a:{b:{c:true,d:"Alpha",e:22,f:22n,g:null,h:undefined,i:_tryConstruct}}}
      let obj2_5 = {a:{b:{c:true,d:"alpha",e:23,f:22n,g:null,h:undefined,i:_tryConstruct}}}
      let obj2_6 = {a:{b:{c:true,d:"alpha",e:22,f:22,g:null,h:undefined,i:_tryConstruct}}}
      let obj2_7 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:undefined,h:undefined,i:_tryConstruct}}}
      let obj2_8 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:null,i:_tryConstruct}}}
      let obj2_9 = {a:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined,i:_tryAreEqual}}}
      let obj2_10 = {A:{b:{c:true,d:"alpha",e:22,f:22n,g:null,h:undefined,i:_tryConstruct}}}
      _.bassert(10,BC.areEqual(obj2, obj2_0),"objs are equal - see code")
      _.bassert(11,!BC.areEqual(obj2, obj2_1),"objs are not equal - see code")
      _.bassert(12,!BC.areEqual(obj2, obj2_2),"objs are not equal - see code")
      _.bassert(13,!BC.areEqual(obj2, obj2_3),"objs are not equal - see code")
      _.bassert(14,!BC.areEqual(obj2, obj2_4),"objs are not equal - see code")
      _.bassert(15,!BC.areEqual(obj2, obj2_5),"objs are not equal - see code")
      _.bassert(16,!BC.areEqual(obj2, obj2_6),"objs are not equal - see code")
      _.bassert(17,!BC.areEqual(obj2, obj2_7),"objs are not equal - see code")
      _.bassert(18,!BC.areEqual(obj2, obj2_8),"objs are not equal - see code")
      _.bassert(19,!BC.areEqual(obj2, obj2_9),"objs are not equal - see code")
      _.bassert(20,!BC.areEqual(obj2, obj2_10),"objs are not equal - see code")

      let obj3 = {a:[1]}
      let obj3_0 = {a:[1]}
      let obj3_1 = {a:1}
      let obj3_2 = {a:{}}
      let obj3_3 = {a:[2]}
      let obj3_4 = {a:[1,2]}
      _.bassert(30,BC.areEqual(obj3, obj3_0),"objs are equal - see code")
      _.bassert(31,!BC.areEqual(obj3, obj3_1),"objs are not equal - see code")
      _.bassert(32,!BC.areEqual(obj3, obj3_2),"objs are not equal - see code")
      _.bassert(33,!BC.areEqual(obj3, obj3_3),"objs are not equal - see code")
      _.bassert(34,!BC.areEqual(obj3, obj3_4),"objs are not equal - see code")

      let arr1 = []
      let arr1_0 = []
      let arr1_1 = [1]
      _.bassert(101,BC.areEqual(arr1, arr1_0),"arrays are equal - see code")
      _.bassert(102,!BC.areEqual(arr1, arr1_1),"arrays are not equal - see code")

      let arr2 = [undefined, null, true, 1, 1n, "string",_tryConstruct,{}]
      let arr2_0 = [undefined, null, true, 1, 1n, "string",_tryConstruct,{}]
      let arr2_1 = [null, null, true, 1, 1n, "string",_tryConstruct,{}]
      let arr2_2 = [undefined, undefined, true, 1, 1n, "string",_tryConstruct,{}]
      let arr2_3 = [undefined, null, false, 1, 1n, "string",_tryConstruct,{}]
      let arr2_4 = [undefined, null, true, 2, 1n, "string",_tryConstruct,{}]
      let arr2_5 = [undefined, null, true, 1, 1, "string",_tryConstruct,{}]
      let arr2_6 = [undefined, null, true, 1, 1n, "String",_tryConstruct,{}]
      let arr2_7 = [undefined, null, true, 1, 1n, "string",_tryAreEqual,{}]
      let arr2_8 = [undefined, null, true, 1, 1n, "string",_tryAreEqual,{a:1}]
      _.bassert(111,BC.areEqual(arr2, arr2_0),"arrays are equal - see code")
      _.bassert(112,!BC.areEqual(arr2, arr2_1),"arrays are not equal - see code")
      _.bassert(113,!BC.areEqual(arr2, arr2_2),"arrays are not equal - see code")
      _.bassert(114,!BC.areEqual(arr2, arr2_3),"arrays are not equal - see code")
      _.bassert(115,!BC.areEqual(arr2, arr2_4),"arrays are not equal - see code")
      _.bassert(116,!BC.areEqual(arr2, arr2_5),"arrays are not equal - see code")
      _.bassert(117,!BC.areEqual(arr2, arr2_6),"arrays are not equal - see code")
      _.bassert(118,!BC.areEqual(arr2, arr2_7),"arrays are not equal - see code")
      _.bassert(119,!BC.areEqual(arr2, arr2_8),"arrays are not equal - see code")

      let arr3 = [[[1,2,3]]]
      let arr3_0 = [[[1,2,3]]]
      let arr3_1 = [[[1,2]]]
      let arr3_2 = [[[1,2,3,4]]]
      _.bassert(131,BC.areEqual(arr3, arr3_0),"arrays are equal - see code")
      _.bassert(132,!BC.areEqual(arr3, arr3_1),"arrays are not equal - see code")
      _.bassert(133,!BC.areEqual(arr3, arr3_2),"arrays are not equal - see code")      
    }
    function userType2BreadCrumbsTypeTest() {
      _.bassert(1,BC.userType2BreadCrumbsType("Number")=="number","'Number' should be converted to 'number'")
      _.bassert(2,BC.userType2BreadCrumbsType("String")=="string","'String' should be converted to 'string'")
      _.bassert(3,BC.userType2BreadCrumbsType("Boolean")=="boolean","'Boolean' should be converted to 'boolean'")
      _.bassert(4,BC.userType2BreadCrumbsType("Array")=="Array","'Array' should be not converted")
      _.bassert(5,BC.userType2BreadCrumbsType("Date")=="Date","'Date' should be not converted")
      _.bassert(6,BC.userType2BreadCrumbsType("Frontmatter")=="Frontmatter","'Frontmatter' should be not converted")
      _.bassert(7,BC.userType2BreadCrumbsType("number")=="number","'number' should be converted to 'number'")
      _.bassert(8,BC.userType2BreadCrumbsType("UnKnown")=="UnKnown","'UnKnown' should be converted to 'UnKnown'")
      _.bassert(9,BC.userType2BreadCrumbsType(false)=="no","'false' should be converted to 'no'")
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
    function _tryThrowIfMightBeMalicious(arg1) {
      let un
      let breadcrumbs = new BreadCrumbs(un, "throwIfMightBeMaliciousTest1")
      breadcrumbs.throwIfMightBeMalicious(arg1)
    }
    function _tryAreEqual(arg1, arg2) {
      BC.areEqual(arg1, arg2)
    }
  }
}
var BC = BreadCrumbs // shorthand
class Wrong extends BreadCrumbs {} // for testing

/** dialog settings parser
 * @classdesc
 * Mainly for translation of strings used in dialogs
 * Some other values can be set there two, e.g. max length of drop down lists
 */
class DialogManager extends BreadCrumbs {
  //#region member variables
  static #instanceCounter = 0
  static #DIALOG_KEY = "__DIALOGSETTINGS"
  static #NAMES = ["TYPE_PROMPT", "TYPE_MAX_ENTRIES", "TITLE_NEW_FILE"]
  static #DEFAULTS = {
    TYPE_PROMPT: "Choose Type",
    TYPE_MAX_ENTRIES: 10,
    TITLE_NEW_FILE: ["Untitled"],
  }
  #TYPE_PROMPT = DialogManager.#DEFAULTS.TYPE_PROMPT
  #TYPE_MAX_ENTRIES = DialogManager.#DEFAULTS.TYPE_MAX_ENTRIES
  #TITLE_NEW_FILE = DialogManager.#DEFAULTS.TITLE_NEW_FILE
  /** Returns key for entry handled by DialogManager
   * @returns {String}
   */
  static get handlerKey() {
    return DialogManager.#DIALOG_KEY
  }
  /** Returns keys DialogManager manages
   * @returns @returns {Array.<String>}
   */
  static get names() {
    return DialogManager.#NAMES
  }
  /** Returns default values of keys
   * @returns {Object.<String.*>}
   */
  static get defaults() {
    return DialogManager.#DEFAULTS
  }
  /** Returns Prompt for tp.system.suggester
   * @returns {String}
   */
  get TYPE_PROMPT() {
    return this.#TYPE_PROMPT
  }
  /** Returns max entries for tp.system.suggester
   * @returns {Number}
   */
  get TYPE_MAX_ENTRIES() {
    return this.#TYPE_MAX_ENTRIES
  }
  /** Returns new note title (without counter) or array of new note titles
   * @returns {(String|Array.String)}
   */
  get TITLE_NEW_FILE() {
    return this.#TITLE_NEW_FILE
  }
  //#endregion member variables
  /** Constructs a new DialogManager and registers its type once
   * @constructor
   * @param {(Object|Object.<String.*>)} literal - key has to be from #NAMES
   * @param {(String|Symbol)} key
   * @param {BreadCrumbs} parent
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key, parent) {
    function _throwWrongKey(key, names, me) {
      throw new SettingError(
        `${me.constructor.name}.constructor`,
        `Path: ${me.toBreadcrumbs()}\
        ${BC.nl}'${key}' is no known dialog setting name.\
        ${BC.nl}Known names are: '${names}'\
        ${BC.nl}${BC.nl}Remove unknown name from your dialog settings.`
      )
    }
    function _throwIfWrongType(value, type, key, me) {
      let un
      me.throwIfNotOfType(
        value,
        type,
        un,
        `'${key}: ${value}' - value '${value}'`,
        `${BC.nl}${BC.nl}Change value to correct type.}`
      )
    }
    super(literal, key, parent)
    if (!DialogManager.#instanceCounter++) this.objTypes = "DialogManager"
    this.throwIfUndefined(literal, "literal")
    // literal {(Undefined|Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    // parent {(Undefined|BreadCrumbs)} checked by superclass

    for (const [key, value] of Object.entries(this.literal)) {
      if (!DialogManager.#NAMES.includes(key))
        _throwWrongKey(key, DialogManager.#NAMES, this)
      switch (key) {
        case "TYPE_MAX_ENTRIES":
          _throwIfWrongType(value, "number", key, this)
          this.#TYPE_MAX_ENTRIES = value
          break
        case "TYPE_PROMPT":
          _throwIfWrongType(value, "string", key, this)
          this.#TYPE_PROMPT = value
          break
        case "TITLE_NEW_FILE":
          _throwIfWrongType(value, ["string", "Array"], key, this)
          this.#TITLE_NEW_FILE = BreadCrumbs.isOfType(value, "Array")
            ? value
            : new Array(value)
          break
      }
    }
  }

  /** Returns whether arg is instance of DialogManager
   * @param {Object} arg
   * @returns {Boolean}
   */
  static instanceOfMe(arg) {
    return arg instanceof DialogManager
  }

  // prettier-ignore
  static test(outputObj) { // DialogManager
    let _ = null
    if(_ = new TestSuite("DialogManager", outputObj)) {
      _.run(getterHandlerKeyTest)
      _.run(getterLiteralTest)
      _.run(getterNamesTest)
      _.run(getterDefaultsTest)
      _.run(getterTYPE_PROMPTTest)
      _.run(getterTYPE_MAX_ENTRIESTest)
      _.run(getterTITLE_NEW_FILETest)
      _.run(constructorTest)
      _.run(instanceOfMeTest)
      _.run(toStringTest)
      _.run(isOfTypeTest)
      _.destruct()
      _ = null
    }
    function getterHandlerKeyTest() {
      _.bassert(1,DialogManager.handlerKey == "__DIALOGSETTINGS")
      _.bassert(2,DialogManager.handlerKey != "DIALOG_SETTINGS")
    }
    function getterLiteralTest() {
      let un
      let parent = new BreadCrumbs(un, "getterLiteralTest", un)
      let lit1 = {}
      let lit2 = {TYPE_PROMPT: "do choose!"}
      let lit3 = {"TYPE_MAX_ENTRIES": 12}
      let lit4 = {"TYPE_PROMPT": "choose!"}
      let lit5 = {"TYPE_MAX_ENTRIES": 13}
      let lit6 = {"TYPE_PROMPT": "wähle!", "TYPE_MAX_ENTRIES": 14}
      let dlgMan1 = new DialogManager(lit1,"getterLiteralTest02",parent)
      let dlgMan2 = new DialogManager(lit2,"getterLiteralTest03",parent)
      let dlgMan3 = new DialogManager(lit3,"getterLiteralTest04",parent)
      let dlgMan4 = new DialogManager(lit4,"getterLiteralTest05",parent)
      let dlgMan5 = new DialogManager(lit5,"getterLiteralTest06",parent)
      let dlgMan6 = new DialogManager(lit6,"getterLiteralTest07",parent)
      let res1 = dlgMan1.literal
      let res2 = dlgMan2.literal
      let res3 = dlgMan3.literal
      let res4 = dlgMan4.literal
      let res5 = dlgMan5.literal
      let res6 = dlgMan6.literal
      _.bassert(1,Object.keys(res1).length == 0,"literal should be empty as given")
      _.bassert(2,BC.areEqual(lit2,res2),"literal should not be changed")
      _.bassert(3,BC.areEqual(lit3,res3),"literal should not be changed")
      _.bassert(4,BC.areEqual(lit4,res4),"literal should not be changed")
      _.bassert(5,BC.areEqual(lit5,res5),"literal should not be changed")
      _.bassert(6,BC.areEqual(lit6,res6),"literal should not be changed")
    }
    function getterNamesTest() {
      let names = DialogManager.names
      _.bassert(1,BC.isOfType(names,"Array"),"should return an array")
      _.bassert(2,names.includes("TYPE_PROMPT"),"should contain 'TYPE_PROMPT'")
      _.bassert(3,names.includes("TYPE_MAX_ENTRIES"),"should contain 'TYPE_MAX_ENTRIES'")
      _.bassert(5,names.every((entry) => {return null == entry.match(/[a-z]/)}),"keys should be completely uppercase")
    }
    function getterDefaultsTest() {    
      let defs = DialogManager.defaults
      _.bassert(1, BC.isOfType(defs,"object","should be an object"))
      let defTypeKeys = Object.keys(defs)
      let names = DialogManager.names
      _.bassert(2,defTypeKeys.length == names.length,"Default type should contain as many names as there are in TypesManager.keys")
      _.bassert(3,defTypeKeys.every(key => names.includes(key)),"Each name should be given in DialogManager.names")
    }
    function getterTYPE_PROMPTTest() {
      let un
      let parent = new BreadCrumbs(un, "getterTYPE_PROMPTTest", un)
      let lit1 = {}
      let lit2 = {TYPE_MAX_ENTRIES:2}
      let lit3 = {TYPE_PROMPT:"opq"}
      let def = DialogManager.defaults.TYPE_PROMPT
      let dlgMan1 = new DialogManager(lit1,"getterTYPE_PROMPTTest01",parent)
      let dlgMan2 = new DialogManager(lit2,"getterTYPE_PROMPTTest02",parent)
      let dlgMan3 = new DialogManager(lit3,"getterTYPE_PROMPTTest03",parent)
      _.bassert(1,dlgMan1.TYPE_PROMPT == def,"Default prompt should be returned")
      _.bassert(2,dlgMan2.TYPE_PROMPT == def,"Default prompt should be returned")
      _.bassert(3,dlgMan3.TYPE_PROMPT == "opq","TYPE_PROMPT should be 'opq' as given ")
    }
    function getterTYPE_MAX_ENTRIESTest() {
      let un
      let parent = new BreadCrumbs(un, "getterTYPE_MAX_ENTRIESTest", un)
      let lit1 = {}
      let lit2 = {TYPE_PROMPT:"opq"}
      let lit3 = {TYPE_MAX_ENTRIES:2}
      let def = DialogManager.defaults.TYPE_MAX_ENTRIES
      let dlgMan1 = new DialogManager(lit1,"getterTYPE_MAX_ENTRIESTest01",parent)
      let dlgMan2 = new DialogManager(lit2,"getterTYPE_MAX_ENTRIESTest02",parent)
      let dlgMan3 = new DialogManager(lit3,"getterTYPE_MAX_ENTRIESTest03",parent)
      _.bassert(1,dlgMan1.TYPE_MAX_ENTRIES == def,"Default max entries should be returned")
      _.bassert(2,dlgMan2.TYPE_MAX_ENTRIES == def,"Default max entries should be returned")
      _.bassert(3,dlgMan3.TYPE_MAX_ENTRIES == 2,"TYPE_MAX_ENTRIES should be 2 as given ")
    }
    function getterTITLE_NEW_FILETest() {
      let un
      let parent = new BreadCrumbs(un, "getterTITLE_NEW_FILETest", un)
      let lit1 = {}
      let lit2 = {TITLE_NEW_FILE:"keinName"}
      let lit3 = {TITLE_NEW_FILE: ["notset","unknown"]}
      let def = DialogManager.defaults.TITLE_NEW_FILE
      let dlgMan1 = new DialogManager(lit1,"getterTITLE_NEW_FILETest01",parent)
      let dlgMan2 = new DialogManager(lit2,"getterTITLE_NEW_FILETest02",parent)
      let dlgMan3 = new DialogManager(lit3,"getterTITLE_NEW_FILETest03",parent)
      _.bassert(1,BC.areEqual(dlgMan1.TITLE_NEW_FILE,def),"Default new title should be returned")
      _.bassert(2,BC.areEqual(dlgMan2.TITLE_NEW_FILE,["keinName"]),"given title should be returned in an array")
      _.bassert(3,BC.areEqual(dlgMan3.TITLE_NEW_FILE,["notset", "unknown"]),"output should be the same as input")
    }
    function constructorTest() {
      let un
      let p = new BreadCrumbs(un, "constructorTest", un)
      let dlg = new DialogManager({}, "constructorTest1", p)
      _.assert(1,_tryConstruct,{},"cTest1",p,"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",p,"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",p,"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",p,"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",p,"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,p,"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,p,"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},p,"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},p,p,"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),p,"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"cTest11",un,"should not be be created, parent is undefined")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,"should not be be created, parent is null")

      let dialogManager = new DialogManager({},"constructorTest101",p)
      _.bassert(101,dialogManager instanceof Object,"'DialogManager' has to be an instance of 'Object'")
      _.bassert(102,dialogManager instanceof BreadCrumbs,"'DialogManager' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,dialogManager instanceof DialogManager,"'DialogManager' has to be an instance of 'DialogManager'")
      _.bassert(104,dialogManager.constructor == DialogManager,"the constructor property is not 'DialogManager'")
    }
    function instanceOfMeTest() {
      let un
      let parent = new BreadCrumbs(un, "instanceOfMeTest", un)
      let dlg1 = new DialogManager({},"instanceOfMeTest1",parent)
      let type1 = new TypesManager({},"instanceOfMeTest2",parent,un)
      _.bassert(1,!DialogManager.instanceOfMe(parent),"BreadCrumbs instance should not be an instance of DialogManager")
      _.bassert(2,!DialogManager.instanceOfMe(new Error()),"Error instance should not be an instance of DialogManager")
      _.bassert(3,DialogManager.instanceOfMe(dlg1),"DialogManager instance should be an instance of DialogManager")
      _.bassert(4,!DialogManager.instanceOfMe("DialogManager"),"String should not be an instance of DialogManager")
      _.bassert(5,!DialogManager.instanceOfMe(type1),"TypesManager should not be an instance of DialogManager")
    }
    function toStringTest() {
      let un
      let parent = new BreadCrumbs(un, "toStringTest", un)
      let dlg1 = new DialogManager({},"toStringTest1",parent)
      _.bassert(1,dlg1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,dlg1.toString().includes("DialogManager"),"result does not contain class string"    )
    }
    function isOfTypeTest() {
      let un
      let parent = new BreadCrumbs(un, "isOfTypeTest", un)
      let dlg1 = new DialogManager({},"isOfTypeTest1",parent)
      _.bassert(1, BC.isOfType(dlg1,"object"), "'" + dlg1 + "' should be of type " + "object")
      _.bassert(2, BC.isOfType(dlg1,"Object"), "'" + dlg1 + "' should be of type " + "Object")
      _.bassert(3, BC.isOfType(dlg1,"BreadCrumbs"), "'" + dlg1 + "' should be of type " + "BreadCrumbs")
      _.bassert(4, BC.isOfType(dlg1,"DialogManager"), "'" + dlg1 + "' should be of type " + "DialogManager")
      _.bassert(5,!BC.isOfType(dlg1,"Error"), "'" + dlg1 + "' should not be of type " + "Error")
      _.bassert(6,!BC.isOfType(dlg1,"TypesManager"), "'" + dlg1 + "' should not be of type " + "TypesManager")
    }
    function _tryConstruct(arg1, arg2, arg3) {
      new DialogManager(arg1, arg2, arg3)
    }
  }
}

/** defaults parser */
class DefaultsManager extends BreadCrumbs {
  //#region member variables
  static #instanceCounter = 0
  static #DEFAULTS_KEY = "__DEFAULTS"
  static #ALLOWED_TYPES = [
    "String",
    "Boolean",
    "Date",
    "Number",
    "Array",
    "Frontmatter",
  ]
  #GIVEN_NAMES = []
  #GIVEN_TYPES = []
  #GIVEN_DEFAULTS = {}
  /** Returns key for entry handled by DefaultsManager
   * @returns {String}
   */
  static get handlerKey() {
    return DefaultsManager.#DEFAULTS_KEY
  }
  /** Returns types DefaultsManager accepts
   * @returns @returns {Array.<String>}
   */
  static get allowedTypes() {
    return DefaultsManager.#ALLOWED_TYPES
  }
  /** Returns given defaults names
   * @returns {Array.<String>}
   */
  get givenNames() {
    return this.#GIVEN_NAMES
  }
  /** Returns given types or if [] given, array containing "String" entries
   * @returns {Array.<String>}
   */
  get givenTypes() {
    return this.#GIVEN_TYPES
  }
  /** Returns object with all given defaults set to given values
   * @returns {Object.<String.*>}
   */
  get givenDefaults() {
    return this.#GIVEN_DEFAULTS
  }
  //#endregion member variables
  /** Constructs a new DefaultsManager and registers its type once
   * @constructor
   * @param {(Object|Object.<String.*>)} literal
   * @param {(String|Symbol)} key
   * @param {BreadCrumbs} parent
   * @param {Array.String} defaultNames
   * @param {Array.String} typesForNames
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key, parent, defaultNames, typesForNames) {
    let un
    super(literal, key, parent)
    if (!DefaultsManager.#instanceCounter++) this.objTypes = "DefaultsManager"
    this.throwIfUndefined(literal, "literal")
    // literal {(Undefined|Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    // parent {(Undefined|BreadCrumbs)} checked by superclass
    this.throwIfUndefined(defaultNames, "defaultNames")
    this.throwIfNotOfType(defaultNames, "Array", un, "'defaultNames'")
    this.throwIfUndefined(typesForNames, "typesForNames")
    this.throwIfNotOfType(typesForNames, "Array", un, "'typesForNames'")
    this.#GIVEN_NAMES = defaultNames

    this.#setGivenTypesOrThrow(typesForNames)
    this.#setDefaultsOrThrow()
  }

  /** Returns whether arg is instance of DefaultsManager
   * @param {Object} arg
   * @returns {Boolean}
   */
  static instanceOfMe(arg) {
    return arg instanceof DefaultsManager
  }

  #setGivenTypesOrThrow(typesForNames) {
    function _throwIfLengthNotMatch(l1, l2, me) {
      if (l2 != 0 && l1 != l2)
        throw new SettingError(
          `${me.constructor.name}.#setGivenTypesOrThrow`,
          `Path: ${me.toBreadcrumbs()}\
           ${BC.nl}if 'typesForNames' is not empty \
           it has to have same length as 'defaultNames'`
        )
    }
    function _throwIfNoAllowedType(type, idx, me) {
      me.throwIfNotOfType(
        type,
        "string",
        "#setGivenTypesOrThrow",
        `'typesForNames[${idx}]:${type}' - value`
      )
      if (!DefaultsManager.#ALLOWED_TYPES.includes(type))
        throw new SettingError(
          `${me.constructor.name}.#setGivenTypesOrThrow`,
          `Path: ${me.toBreadcrumbs()}\
           ${BC.nl}value '${type}' at 'typesForNames[${idx}]' \
           is no allowed type.\
           ${BC.nl}${BC.nl}Allowed types are: ${DefaultsManager.#ALLOWED_TYPES}`
        )
    }
    _throwIfLengthNotMatch(this.#GIVEN_NAMES.length, typesForNames.length, this)
    typesForNames.forEach((type, idx) => _throwIfNoAllowedType(type, idx, this))
    this.#GIVEN_TYPES = typesForNames.length
      ? typesForNames
      : new Array(this.#GIVEN_NAMES.length).fill("String")
  }

  #setDefaultsOrThrow() {
    function _throwWrongKey(name, names, me) {
      throw new SettingError(
        `${me.constructor.name}.constructor`,
        `Path: ${me.toBreadcrumbs()}\
        ${BC.nl}'${name}' is no known defaults setting name.\
        ${BC.nl}Known names are: '${names}'\
        ${BC.nl}${BC.nl}Remove unknown name from your defaults settings.`
      )
    }
    function _throwIfWrongType(value, t, key, me) {
      let un
      let type = BC.userType2BreadCrumbsType(t)
      me.throwIfNotOfType(
        value,
        type,
        un,
        `'${key}: ${value}' - value`,
        `${BC.nl}${BC.nl}Change value to correct type.`
      )
    }
    for (const [key, value] of Object.entries(this.literal)) {
      if (!this.#GIVEN_NAMES.includes(key))
        _throwWrongKey(key, this.#GIVEN_NAMES, this)
      let idx = this.#GIVEN_NAMES.indexOf(key)
      _throwIfWrongType(value, this.#GIVEN_TYPES[idx], key, this)
      this.#GIVEN_DEFAULTS[key] = value
    }
  }

  // prettier-ignore
  static test(outputObj) { // DefaultsManager
    let _ = null
    if(_ = new TestSuite("DefaultsManager", outputObj)) {
      _.run(getterHandlerKeyTest)
      _.run(getterAllowedTypesTest)
      _.run(getterLiteralTest)
      _.run(getterGivenNamesTest)
      _.run(getterGivenTypesTest)
      _.run(getterGivenDefaultsTest)
      _.run(constructorTest)
      _.run(instanceOfMeTest)
      _.run(toStringTest)
      _.run(isOfTypeTest)
      _.run(setGivenTypesOrThrowTest)
      _.run(setDefaultsOrThrowTest)
      _.destruct()
      _ = null
    }
    function getterHandlerKeyTest() {
      _.bassert(1,DefaultsManager.handlerKey == "__DEFAULTS", "should be __DEFAULTS")
      _.bassert(2,DefaultsManager.handlerKey != "DEFAULTS", "should not be DEFAULTS")
    }
    function getterAllowedTypesTest() {
      _.bassert(1,DefaultsManager.allowedTypes.includes("Boolean"), "'Boolean' should be allowed Type")
      _.bassert(2,DefaultsManager.allowedTypes.includes("String"), "'String' should be allowed Type")
      _.bassert(3,DefaultsManager.allowedTypes.includes("Date"), "'Date' should be allowed Type")
      _.bassert(4,DefaultsManager.allowedTypes.includes("Number"), "'Number' should be allowed Type")
      _.bassert(5,DefaultsManager.allowedTypes.includes("Frontmatter"), "'Frontmatter' should be allowed Type")
      _.bassert(6,DefaultsManager.allowedTypes.includes("Array"), "'Frontmatter' should be allowed Type")
      _.bassert(7,!DefaultsManager.allowedTypes.includes("date"), "'date' should not be allowed Type")
    }
    function getterLiteralTest() {
      let un
      let parent = new BreadCrumbs(un, "getterLiteralTest", un)
      let lit1 = {}
      let lit2 = {MARKER: "do choose!"}
      let lit3 = {"MARKER": "12"}
      let lit4 = {"MARKER": "choose!"}
      let lit5 = {"MARKER": "13"}
      let lit6 = {"MARKER": "wähle!", "DATE": "14"}
      let defMan1 = new DefaultsManager(lit1,"getterLiteralTest01",parent,[],[])
      let defMan2 = new DefaultsManager(lit2,"getterLiteralTest02",parent,["MARKER"],["String"])
      let defMan3 = new DefaultsManager(lit3,"getterLiteralTest03",parent,["MARKER"],["String"])
      let defMan4 = new DefaultsManager(lit4,"getterLiteralTest04",parent,["MARKER"],["String"])
      let defMan5 = new DefaultsManager(lit5,"getterLiteralTest05",parent,["MARKER"],["String"])
      let defMan6 = new DefaultsManager(lit6,"getterLiteralTest06",parent,["MARKER","DATE"],["String","Date"])
      let res1 = defMan1.literal
      let res2 = defMan2.literal
      let res3 = defMan3.literal
      let res4 = defMan4.literal
      let res5 = defMan5.literal
      let res6 = defMan6.literal
      _.bassert(1,Object.keys(res1).length == 0,"literal should be empty as given")
      _.bassert(2,BC.areEqual(lit2,res2),"literal should not be changed")
      _.bassert(3,BC.areEqual(lit3,res3),"literal should not be changed")
      _.bassert(4,BC.areEqual(lit4,res4),"literal should not be changed")
      _.bassert(5,BC.areEqual(lit5,res5),"literal should not be changed")
      _.bassert(6,BC.areEqual(lit6,res6),"literal should not be changed")
    }
    function getterGivenNamesTest() {
      let un
      let p = new BreadCrumbs(un, "getterGivenNamesTest", un)
      let lit1 = {MARKER: "abc"}
      let names1 = ["MARKER","DATE"]
      let types1 = ["String", "Date"]
      let def1 = new DefaultsManager(lit1, "getterGivenNamesTest1", p,names1, types1)
      let answ1 = def1.givenNames
      _.bassert(1,BC.areEqual(names1,answ1),"should return names as given")
    }
    function getterGivenTypesTest() {
      let un
      let p = new BreadCrumbs(un, "getterGivenTypesTest", un)
      let lit1 = {MARKER: "abc"}
      let names1 = ["MARKER","DATE"]
      let types1 = ["String", "Date"]
      let def1 = new DefaultsManager(lit1, "getterGivenTypesTest1", p,names1, types1)
      let answ1 = def1.givenTypes
      _.bassert(1,BC.areEqual(types1,answ1),"should return types as given")
      let lit2 = {MARKER: "abc"}
      let names2 = ["MARKER","DATE"]
      let types2 = []
      let exp2 = ["String", "String"]
      let def2 = new DefaultsManager(lit2, "getterGivenTypesTest1", p,names2, types2)
      let answ2 = def2.givenTypes
      _.bassert(2,BC.areEqual(exp2,answ2),"should return array repeatedly containing type 'String'")
    }
    function getterGivenDefaultsTest() {
      let un
      let p = new BreadCrumbs(un, "getterGivenDefaultsTest", un)
      let lit1 = {MARKER: "abc"}
      let names1 = ["MARKER","DATE"]
      let types1 = ["String", "Date"]
      let def1 = new DefaultsManager(lit1, "getterGivenDefaultsTest1", p,names1, types1)
      let answ1 = def1.givenDefaults
      _.bassert(1,BC.areEqual(lit1,answ1),"should return defaults")

      let lit2 = {MARKER: "def"}
      let names2 = ["MARKER","DATE"]
      let types2 = ["String", "Date"]
      let def2 = new DefaultsManager(lit2, "getterGivenDefaultsTest2", p,names2, types2)
      let answ2 = def2.givenDefaults
      _.bassert(2,BC.areEqual(lit2,answ2),"should return defaults")

      let lit3 = {MARKER: "abc"}
      let names3 = ["MARKER","TITLE_BEFORE_DATE"]
      let types3 = []
      let def3 = new DefaultsManager(lit3, "getterGivenDefaultsTest3", p,names3, types3)
      let answ3 = def3.givenDefaults
      _.bassert(3,BC.areEqual(lit3,answ3),"should return defaults as given")
    }
    function constructorTest() {
      let un
      let p = new BreadCrumbs(un, "constructorTest", un)
      let def = new DefaultsManager({}, "constructorTest1", p,[],[])
      _.assert(1,_tryConstruct,{},"cTest1",p,[],[],"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",p,[],[],"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",p,[],[],"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",p,[],[],"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",p,[],[],"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,p,[],[],"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,p,[],[],"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},p,[],[],"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},p,p,[],[],"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),p,[],[],"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"cTest11",un,[],[],"should not be be created, parent is undefined")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),[],[],"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},[],[],"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring",[],[],"should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,[],[],"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,[],[],"should not be be created, parent is null")
      
      let lit17 = {MARKER: "abc"}
      let names17 = ["MARKER"]
      _.assert(17,_tryConstruct,lit17,"cTest17",p,names17,[],"should be be created, literal fully consists of names in defaultNames")
      _.shouldAssert(18,_tryConstruct,lit17,"cTest18",p,[],[],"should not be be created, literal contains entry not in defaultNames")
      _.shouldAssert(19,_tryConstruct,lit17,"cTest19",p,["abc","def"],[],"should not be be created, literal contains entry not in defaultNames")

      let defaultsManager = new DefaultsManager({},"constructorTest101",p,[],[])
      _.bassert(101,defaultsManager instanceof Object,"'DefaultsManager' has to be an instance of 'Object'")
      _.bassert(102,defaultsManager instanceof BreadCrumbs,"'DefaultsManager' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,defaultsManager instanceof DefaultsManager,"'DefaultsManager' has to be an instance of 'DefaultsManager'")
      _.bassert(104,defaultsManager.constructor == DefaultsManager,"the constructor property is not 'DefaultsManager'")
    }
    function instanceOfMeTest() {
      let un
      let parent = new BreadCrumbs(un, "instanceOfMeTest", un)
      let def1 = new DefaultsManager({},"instanceOfMeTest1",parent,[],[])
      let spec1 = new TypesManager({},"instanceOfMeTest2",parent,un)
      _.bassert(1,!DefaultsManager.instanceOfMe(parent),"BreadCrumbs instance should not be an instance of DefaultsManager")
      _.bassert(2,!DefaultsManager.instanceOfMe(new Error()),"Error instance should not be an instance of DefaultsManager")
      _.bassert(3,DefaultsManager.instanceOfMe(def1),"DefaultsManager instance should be an instance of DefaultsManager")
      _.bassert(4,!DefaultsManager.instanceOfMe("DefaultsManager"),"String should not be an instance of DefaultsManager")
      _.bassert(5,!DefaultsManager.instanceOfMe(spec1),"TypesManager should not be an instance of DefaultsManager")
    }
    function toStringTest() {
      let un
      let parent = new BreadCrumbs(un, "toStringTest", un)
      let def1 = new DefaultsManager({},"toStringTest1",parent,[],[])
      _.bassert(1,def1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,def1.toString().includes("DefaultsManager"),"result does not contain class string"    )
    }
    function isOfTypeTest() {
      let un
      let parent = new BreadCrumbs(un, "isOfTypeTest", un)
      let def1 = new DefaultsManager({},"isOfTypeTest1",parent,[],[])
      _.bassert(1, BC.isOfType(def1,"object"), "'" + def1 + "' should be of type " + "object")
      _.bassert(2, BC.isOfType(def1,"Object"), "'" + def1 + "' should be of type " + "Object")
      _.bassert(3, BC.isOfType(def1,"BreadCrumbs"), "'" + def1 + "' should be of type " + "BreadCrumbs")
      _.bassert(4, BC.isOfType(def1,"DefaultsManager"), "'" + def1 + "' should be of type " + "DefaultsManager")
      _.bassert(5,!BC.isOfType(def1,"Error"), "'" + def1 + "' should not be of type " + "Error")
      _.bassert(6,!BC.isOfType(def1,"TypesManager"), "'" + def1 + "' should not be of type " + "TypesManager")
    }
    function setGivenTypesOrThrowTest() {
      let un
      let p = new BreadCrumbs(un, "setGivenTypesOrThrowTest", un)
      let lit0 = {}
      let names = ["MARKER","DATE"]
      let types1 = ["String", "Date"]
      _.assert(1,_tryConstruct,lit0,"sg1", p, names, types1, "should construct")
      let types2 = []
      _.assert(2,_tryConstruct,lit0,"sg2", p, names, types2, "should construct")
      let types3 = ["String"]
      _.shouldAssert(3,_tryConstruct,lit0,"sg3", p, names, types3, "less types than names, should not construct")
      let types4 = ["String", "String", "String"]
      _.shouldAssert(4,_tryConstruct,lit0,"sg4", p, names, types4, "more types than names, should not construct")
      let types5 = ["string", "Date"]
      _.shouldAssert(5,_tryConstruct,lit0,"sg5", p, names, types5, "wrong type name, should not construct")
      let types6 = [22, "Date"]
      _.shouldAssert(6,_tryConstruct,lit0,"sg6", p, names, types6, "not all type names are of type string, should not construct")
    }
    function setDefaultsOrThrowTest() {
      let un
      let p = new BreadCrumbs(un, "setDefaultsOrThrowTest", un)
      let lit0 = {}
      let lit1 = {MARKER:"p_", "DATE":true, DATEFORMAT: "abc"}
      let names = ["MARKER","DATEFORMAT","DATE"]
      let types0 = []
      let types = ["String", "Date", "Boolean"]
      let lit2 = {MARKER:"p_",DATEFORMAT:"abc"}
      _.assert(0,_tryConstruct,lit0,"sd0", p, names, types, "should construct")
      _.assert(1,_tryConstruct,lit1,"sd1", p, names, types, "should construct")
      _.assert(2,_tryConstruct,lit2,"sd1", p, names, types0, "should construct")
      let lit3 = {UNKNOWN:"p_", "DATE":true, DATEFORMAT: "abc"}
      _.shouldAssert(3,_tryConstruct,lit3,"sd3", p, names, types, "should not construct")
      let lit4 = {MARKER:2, "DATE":true, DATEFORMAT: "abc"}
      _.shouldAssert(4,_tryConstruct,lit4,"sd4", p, names, types, "should not construct")
      let lit5 = {MARKER:"p_", "DATE":"boolean", DATEFORMAT: "abc"}
      _.shouldAssert(5,_tryConstruct,lit5,"sd4", p, names, types, "should not construct")
    }
    function _tryConstruct(arg1, arg2, arg3, arg4, arg5) {
      new DefaultsManager(arg1, arg2, arg3, arg4, arg5)
    }
  }
}

/** notetypes parser
 * @classdesc
 * notetypes are the core of foty, which is shorthand for foldertypes.
 * Each notetypes definition describes, what the script gives to template.
 * But script and template is nothing TypesManager knows about.
 *
 * Notetypes have tnames, which's values describe how they should behave. An 
 * array of valid tnames can be retrieved with TypesManager.tnames
 *
 * Those keys have default values, all together describing a default type. This
 * type can be retrieved with TypesManager.defaultType
 *
 * Each user defined notetype has a name, an array of those names can be
 * retrieved with this.names.
 *
 * A user defined notetype can set none, some or all of the
 * keys. Keys not mentioned in the notetype definition are automatically set
 * to their default values.
 *
 * this.notetypes returns all user defined types, each with a full set of
 * keys. Value is user set value, if set or default value, if not set by user.
 * 
 * TypesManager provides a getter for its handler key,

 */
class TypesManager extends BreadCrumbs {
  //#region member variables
  static #instanceCounter = 0
  static #TYPES_KEY = "__NOTETYPES"
  static #TNAMES = [
    "MARKER",
    "DATE",
    "TITLE_BEFORE_DATE",
    "DATEFORMAT",
    "FRONTMATTER",
  ]
  static #TNAMESTYPES = ["String", "Boolean", "String", "Date", "Frontmatter"]
  static #DEFAULT_TYPE = {
    MARKER: "",
    DATE: false,
    TITLE_BEFORE_DATE: "",
    DATEFORMAT: "YYYY-MM-DD",
    FRONTMATTER: {},
  }
  #defMan
  #notetypes = {}
  /** Returns key for entry handled by TypesManager
   * @returns {String}
   */
  static get handlerKey() {
    return TypesManager.#TYPES_KEY
  }
  /** Returns keys a notetype has
   * @returns @returns {Array.<String>}
   */
  static get tnames() {
    return TypesManager.#TNAMES
  }
  /** Returns types notetype names have
   * @returns @returns {Array.<String>}
   */
  static get tnamestypes() {
    return TypesManager.#TNAMESTYPES
  }
  /** Returns hardcoded default notetype with all its keys set to default values
   * @returns {Object.<String.*>}
   */
  static get defaultType() {
    return TypesManager.#DEFAULT_TYPE
  }
  /** Returns default values given from setting
   * @returns {Object.<String.*>}
   */
  get givenDefaults() {
    return this.#defMan.givenDefaults
  }
  /** Returns Object with all notetypes, bound to their names, all values set
   * @returns {Object.<String.Object.<String.*>>}
   */
  get notetypes() {
    return this.#notetypes
  }
  /** Returns names of notetypes
   * @returns {Array.<String>}
   */
  get names() {
    return Object.keys(this.#notetypes)
  }
  //#endregion member variables
  /** Constructs a new TypesManager and registers its type once
   * @constructor
   * @param {(Object|Object.<String.Object>|Object.<String.Object.<String.*>>)} literal
   * @param {(String|Symbol)} key
   * @param {BreadCrumbs} parent
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key, parent) {
    super(literal, key, parent)
    if (!TypesManager.#instanceCounter++) this.objTypes = "TypesManager"
    this.throwIfUndefined(literal, "literal")
    // literal {(Undefined|Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    // parent {(Undefined|BreadCrumbs)} checked by superclass

    let defLiteral = {}
    if (BC.isDefined(this.literal[DefaultsManager.handlerKey]))
      defLiteral = this.literal[DefaultsManager.handlerKey]
    this.#defMan = new DefaultsManager(
      defLiteral,
      DefaultsManager.handlerKey,
      this,
      TypesManager.#TNAMES,
      TypesManager.#TNAMESTYPES
    )
    this.#createNoteTypesOrThrow()
  }

  /** Returns whether arg is instance of TypesManager
   * @param {Object} arg
   * @returns {Boolean}
   */
  static instanceOfMe(arg) {
    return arg instanceof TypesManager
  }

  /** Creates the notetypes from literal, throws for wrong entries
   */
  #createNoteTypesOrThrow() {
    function _throwWrongKey(name, names, me) {
      throw new SettingError(
        `${me.constructor.name}.constructor`,
        `Path: ${me.toBreadcrumbs()}\
        ${BC.nl}'${name}' is no known notetype setting name.\
        ${BC.nl}Known names are: '${names}'\
        ${BC.nl}${BC.nl}Remove unknown name from your notetype settings.`
      )
    }
    function _throwIfWrongType(value, type, name, me) {
      me.throwIfNotOfType(
        value,
        type,
        "#createNoteTypesOrThrow",
        `'${name}: ${value}' - value`,
        `${BC.nl}${BC.nl}Change value to correct type.`
      )
    }
    for (const [name, entry] of Object.entries(this.literal)) {
      if (name == DefaultsManager.handlerKey) continue
      _throwIfWrongType(entry, "Object", name, this)
      for (const [key, value] of Object.entries(entry)) {
        let allowedKeys = TypesManager.tnames
        if (!allowedKeys.includes(key)) _throwWrongKey(key, allowedKeys, this)
        switch (key) {
          case "DATE":
            _throwIfWrongType(value, "boolean", key, this)
            break
          case "MARKER":
          case "TITLE_BEFORE_DATE":
            _throwIfWrongType(value, "string", key, this)
            break
          case "DATEFORMAT":
            _throwIfWrongType(value, "Date", key, this)
            break
          case "FRONTMATTER":
            _throwIfWrongType(value, "Frontmatter", key, this)
            break
        }
      }
      this.#notetypes[name] = Object.assign(
        {},
        TypesManager.#DEFAULT_TYPE,
        this.givenDefaults,
        entry
      )
    }
  }

  // prettier-ignore
  static test(outputObj) { // TypesManager
    let _ = null
    if(_ = new TestSuite("TypesManager", outputObj)) {
      _.run(getterHandlerKeyTest)
      _.run(getterLiteralTest)
      _.run(getterTnamesTest)
      _.run(getterDefaultTypeTest)
      _.run(getterGivenDefaultsTest)
      _.run(getterNotetypesTest)
      _.run(getterNamesTest)
      _.run(getterTnamestypesTest)
      _.run(constructorTest)
      _.run(instanceOfMeTest)
      _.run(toStringTest)
      _.run(isOfTypeTest)
      _.run(createNoteTypesOrThrowTest)      
      _.destruct()
      _ = null
    }
    function getterHandlerKeyTest() {
      _.bassert(1,TypesManager.handlerKey == "__NOTETYPES")
      _.bassert(2,TypesManager.handlerKey != "NOTETYPES")
    }
    function getterLiteralTest() {
      let un
      let parent = new BreadCrumbs(un, "getterLiteralTest", un)
      let sym = Symbol("a")
      let typesMan1 = new TypesManager({},"getterLiteralTest02",parent)
      let typesMan2 = new TypesManager({sym: {}},"getterLiteralTest03",parent)
      let typesMan3 = new TypesManager({"__NOTETYPES": {}},"getterLiteralTest04",parent)
      let typesMan4 = new TypesManager({"a": {"MARKER":"2"}},"getterLiteralTest05",parent)
      let typesMan5 = new TypesManager({"a": {"MARKER":"2","DATE":true,}},"getterLiteralTest06",parent)
      let typesMan6 = new TypesManager({"a": {MARKER:"2",DATE:false,},"d": {TITLE_BEFORE_DATE:"abc"}},"getterLiteralTest07",parent)
      let lit1 = typesMan1.literal
      let lit2 = typesMan2.literal
      let lit3 = typesMan3.literal
      let lit4 = typesMan4.literal
      let lit5 = typesMan5.literal
      let lit6 = typesMan6.literal
      _.bassert(1,Object.keys(lit1).length == 0,"literal should be empty as given")
      _.bassert(2,Object.keys(lit2).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(3,Object.keys(lit2.sym).length == 0,"object assigned to symbol key should be empty as given")
      _.bassert(4,Object.keys(lit3).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(5,Object.keys(lit3.__NOTETYPES).length == 0,"object assigned to '__NOTETYPES' key should be empty as given")
      _.bassert(6,Object.keys(lit4).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(7,Object.keys(lit4.a).length == 1,"object assigned to 'a' should only contain one entry as only one given")
      _.bassert(8,lit4.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(9,Object.keys(lit5).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(10,Object.keys(lit5.a).length == 2,"object assigned to 'a' should contain 2 entries as two given")
      _.bassert(11,lit5.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(12,lit5.a.DATE === true,"value of a.DATE should be 'true' as given")
      _.bassert(13,Object.keys(lit6).length == 2,"2 values should be contained, as two given")
      _.bassert(14,Object.keys(lit6.a).length == 2,"object assigned to 'a' should contain 2 entries as two given")
      _.bassert(15,Object.keys(lit6.d).length == 1,"object assigned to 'd' should only contain one entry as only one given")
      _.bassert(16,lit6.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(17,lit6.a.DATE === false,"value of a.DATE should be 'false' as given")
      _.bassert(18,lit6.d.TITLE_BEFORE_DATE === "abc","value of d.TITLE_BEFORE_DATE should be 'abc' as given")
    }
    function getterTnamesTest() {
      let tnames = TypesManager.tnames
      _.bassert(1,BC.isOfType(tnames,"Array"),"should return an array")
      _.bassert(2,tnames.includes("MARKER"),"should contain 'MARKER'")
      _.bassert(3,tnames.includes("DATE"),"should contain 'DATE'")
      _.bassert(4,tnames.includes("DATEFORMAT"),"should contain 'DATEFORMAT'")
      _.bassert(5,tnames.every((entry) => {return null == entry.match(/[a-z]/)}),"tnames should be completely uppercase")
    }
    function getterTnamestypesTest() {
      let tNames = TypesManager.tnames
      let tTypes = TypesManager.tnamestypes
      let idxMarker = tNames.indexOf("MARKER")
      let idxDate = tNames.indexOf("DATE")
      let idxDateFormat = tNames.indexOf("DATEFORMAT")
      let idxTitleBeforeDate = tNames.indexOf("TITLE_BEFORE_DATE")
      let typeMarker = tTypes[idxMarker]
      let typeDate = tTypes[idxDate]
      let typeDateFormat = tTypes[idxDateFormat]
      let typeTitleBeforeDate = tTypes[idxTitleBeforeDate]
      _.bassert(1,BC.isOfType(tTypes,"Array"),"should return an array")
      _.bassert(2,tNames.length == tTypes.length, "Type should be defined for each name")
      _.bassert(3,typeMarker == "String", "type for 'MARKER' should be String")
      _.bassert(4,typeDate == "Boolean", "type for 'DATE' should be Boolean")
      _.bassert(5,typeDateFormat == "Date", "type for 'DATEFORMAT' should be Date")
      _.bassert(6,typeTitleBeforeDate == "String", "type for 'TITLE_BEFORE_DATE' should be String")
    }
    function getterDefaultTypeTest() {    
      let defType = TypesManager.defaultType
      _.bassert(1, BC.isOfType(defType,"object","should be an object"))
      let defTypeKeys = Object.keys(defType)
      let tnames = TypesManager.tnames
      _.bassert(2,defTypeKeys.length == tnames.length,"Default type should contain as many tnames as there are in TypesManager.tnames")
      _.bassert(3,defTypeKeys.every(key => tnames.includes(key)),"Each key should be given in TypesManager.tnames")
    }
    function getterGivenDefaultsTest() {
      let un
      let p = new BreadCrumbs(un, "getterGivenDefaultsTest", un)
      let lit1 = {__DEFAULTS: {DATEFORMAT: "YY-MM-DD"}}
      let exp1 = {DATEFORMAT: "YY-MM-DD"}
      let types1 = new TypesManager(lit1,"GDT1",p)
      let out1 = types1.givenDefaults
      _.bassert(1,BC.areEqual(out1,exp1),"output should be: see test code")
      _.bassert(2,out1.DATEFORMAT == exp1.DATEFORMAT,`DATEFORMAT is '${out1.DATEFORMAT}' but should be '${exp1.DATEFORMAT}'`)
      let lit3 = {}
      let exp3 = {}
      let types3 = new TypesManager(lit3,"GDT1",p)
      let out3 = types3.givenDefaults
      _.bassert(3,BC.areEqual(out3,exp3),"output should be: see test code")
    }
    function getterNotetypesTest() {
      let un
      let p = new BreadCrumbs(un, "getterNotetypesTest", un)
      let lit1 = {}
      let lit2 = {diary: {}}
      let lit3 = {book: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD"}}
      let lit4 = {diary: {MARKER: "x"}}
      let lit5 = {diary: {}, citation: {}, film: {}, book: {}}
      let lit6 = {diary: {MARKER: "x"}, citation: {DATE: true}, film: {TITLE_BEFORE_DATE: "xyz"}, book: {DATEFORMAT: "YYYY"}}
      let exp2 = {diary: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}}}
      let exp3 = {book: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}}}
      let exp4 = {diary: {MARKER: "x", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}}}
      let exp5 = {diary: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}},
                  citation: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}},
                  film: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}},
                  book: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}},
                 }
      let exp6 = {diary: {MARKER: "x", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}},
                  citation: {MARKER: "", DATE: true, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}},
                  film: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "xyz", DATEFORMAT: "YYYY-MM-DD",FRONTMATTER: {}},
                  book: {MARKER: "", DATE: false, TITLE_BEFORE_DATE: "", DATEFORMAT: "YYYY",FRONTMATTER: {}},
                 }
      let types1 = new TypesManager(lit1,"TT1",p)
      let types2 = new TypesManager(lit2,"TT2",p)
      let types3 = new TypesManager(lit3,"TT3",p)
      let types4 = new TypesManager(lit4,"TT4",p)
      let types5 = new TypesManager(lit5,"TT5",p)
      let types6 = new TypesManager(lit6,"TT6",p)
      let out1 = types1.notetypes
      let out2 = types2.notetypes
      let out3 = types3.notetypes
      let out4 = types4.notetypes
      let out5 = types5.notetypes
      let out6 = types6.notetypes
      _.bassert(1,Object.keys(out1).length == 0, "no notetypes defined")
      _.bassert(2,BC.areEqual(out2,exp2),"output should be: see test code")
      _.bassert(3,BC.areEqual(out3,exp3),"output should be: see test code")
      _.bassert(4,BC.areEqual(out4,exp4),"output should be: see test code")
      _.bassert(5,BC.areEqual(out5,exp5),"output should be: see test code")
      _.bassert(6,BC.areEqual(out6,exp6),"output should be: see test code")
    }
    function getterNamesTest() {
      let un
      let parent = new BreadCrumbs(un, "getterNamesTest", un)
      let typesMan1 = new TypesManager({},"getterNamesTest1",parent)
      let typesMan2 = new TypesManager({"__NOTETYPES": {}},"getterNamesTest3",parent)
      let typesMan3 = new TypesManager({"a": {"MARKER":"2"}},"getterNamesTest4",parent)
      let typesMan4 = new TypesManager({"a": {"DATE":false,},"d": {"TITLE_BEFORE_DATE":"abc"},"c": {}},"getterNamesTest5",parent)
      let names1 = typesMan1.names
      let names2 = typesMan2.names
      let names3 = typesMan3.names
      let names4 = typesMan4.names
      _.bassert(1,names1.length == 0,"no names given")
      _.bassert(2,names2.length == 1,"one names given")
      _.bassert(3,names2[0] == "__NOTETYPES","'__NOTETYPES' is the names")
      _.bassert(4,names3.length == 1,"one name given")
      _.bassert(5,names3[0] == "a","'a' is the name")
      _.bassert(6,names4.length == 3,"three names given")
      _.bassert(7,names4[0] == "a","'a' is the name")
      _.bassert(8,names4[1] == "d","'d' is the name")
      _.bassert(9,names4[2] == "c","'c' is the name")
    }
    function constructorTest() {
      let un
      let p = new BreadCrumbs(un, "constructorTest", un)
      let ty = new TypesManager({}, "constructorTest1", p)
      _.assert(1,_tryConstruct,{},"cTest1",p,"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",p,"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",p,"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",p,"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",p,"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,p,"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,p,"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},p,"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},p,p,"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),p,"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"cTest11",un,"should not be be created, parent is undefined")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,"should not be be created, parent is null")

      let typesManager = new TypesManager({},"constructorTest101",p)
      _.bassert(101,typesManager instanceof Object,"'TypesManager' has to be an instance of 'Object'")
      _.bassert(102,typesManager instanceof BreadCrumbs,"'TypesManager' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,typesManager instanceof TypesManager,"'TypesManager' has to be an instance of 'TypesManager'")
      _.bassert(104,typesManager.constructor == TypesManager,"the constructor property is not 'TypesManager'")
    }
    function instanceOfMeTest() {
      let un
      let parent = new BreadCrumbs(un, "instanceOfMeTest", un)
      let type1 = new TypesManager({},"instanceOfMeTest1",parent)
      let def1 = new DefaultsManager({},"instanceOfMeTest2",parent,[],[])
      _.bassert(1,!TypesManager.instanceOfMe(parent),"BreadCrumbs instance should not be an instance of TypesManager")
      _.bassert(2,!TypesManager.instanceOfMe(new Error()),"Error instance should not be an instance of TypesManager")
      _.bassert(3,TypesManager.instanceOfMe(type1),"TypesManager instance should be an instance of TypesManager")
      _.bassert(4,!TypesManager.instanceOfMe("TypesManager"),"String should not be an instance of TypesManager")
      _.bassert(5,!TypesManager.instanceOfMe(def1),"DefaultsManager should not be an instance of TypesManager")
    }
    function toStringTest() {
      let un
      let parent = new BreadCrumbs(un, "toStringTest", un)
      let type1 = new TypesManager({},"toStringTest1",parent)
      _.bassert(1,type1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,type1.toString().includes("TypesManager"),"result does not contain class string"    )
    }
    function isOfTypeTest() {
      let un
      let parent = new BreadCrumbs(un, "isOfTypeTest", un)
      let type1 = new TypesManager({},"isOfTypeTest1",parent)
      _.bassert(1,BC.isOfType(type1,"object"), "'" + type1 + "' should be of type " + "object")
      _.bassert(2,BC.isOfType(type1,"Object"), "'" + type1 + "' should be of type " + "Object")
      _.bassert(3,BC.isOfType(type1,"BreadCrumbs"), "'" + type1 + "' should be of type " + "BreadCrumbs")
      _.bassert(4,BC.isOfType(type1,"TypesManager"), "'" + type1 + "' should be of type " + "TypesManager")
      _.bassert(5,!BC.isOfType(type1,"Error"), "'" + type1 + "' should not be of type " + "Error")
      _.bassert(6,!BC.isOfType(type1,"DefaultsManager"), "'" + type1 + "' should not be of type " + "DefaultsManager")
    }
    function createNoteTypesOrThrowTest() {
      let un
      let p = new BreadCrumbs(un, "createNoteTypesOrThrowTest", un)
      let types1 = new TypesManager({},"TT0",p)
      let ok1 = {}
      let ok2 = {diary: {}}
      let ok3 = {diary: {}, citation: {}, film: {}, book: {}}
      let ok4 = {diary: {MARKER: ""}, citation: {DATE: true}, film: {TITLE_BEFORE_DATE: "xyz"}, book: {DATEFORMAT: "YYYY"}}
      let ok5 = {diary: {MARKER: "x", MARKER: "y"}}
      let ok6 = {diary: {MARKER: "", DATE: true, TITLE_BEFORE_DATE: "", DATEFORMAT: "YY"}}
      let ok7 = {diary: {"MARKER": "", "DATE": true, "TITLE_BEFORE_DATE": "", "DATEFORMAT": "YY"}}
      let nok1 = {diary: ""}
      let nok2 = {diary: 22}
      let nok3 = {diary: [1,2,3]}
      let nok4 = {diary: null}
      let nok5 = {diary: {NOT_KNOWN: ""}}
      let nok6 = {diary: {MARKER: 22}}
      let nok7 = {diary: {DATE: 22, }}
      let nok8 = {diary: {TITLE_BEFORE_DATE: 22}}
      let nok9 = {diary: {DATEFORMAT: 22}}
      let nok10 = {diary: {MARKER: true}}
      let nok11 = {diary: {DATE: "str", }}
      let nok12 = {diary: {TITLE_BEFORE_DATE: false}}
      let nok13 = {diary: {DATEFORMAT: true}}
      let nok14 = {diary: {MARKER: {}}}
      let nok15 = {diary: {DATE: {}, }}
      let nok16 = {diary: {TITLE_BEFORE_DATE: {}}}
      let nok17 = {diary: {DATEFORMAT: {}}}
      let nok18 = {diary: {MARKER: []}}
      let nok19 = {diary: {DATE: [], }}
      let nok20 = {diary: {TITLE_BEFORE_DATE: []}}
      let nok21 = {diary: {DATEFORMAT: []}}
      _.assert(1,_tryConstruct,ok1,"TT1",p,"should construct, literal is ok")
      _.assert(2,_tryConstruct,ok2,"TT2",p,"should construct, literal is ok")
      _.assert(3,_tryConstruct,ok3,"TT3",p,"should construct, literal is ok")
      _.assert(4,_tryConstruct,ok4,"TT4",p,"should construct, literal is ok")
      _.assert(5,_tryConstruct,ok5,"TT5",p,"should construct, literal is ok")
      _.assert(6,_tryConstruct,ok6,"TT6",p,"should construct, literal is ok")
      _.assert(7,_tryConstruct,ok7,"TT7",p,"should construct, literal is ok")
      _.shouldAssert(8,_tryConstruct,nok1,"TT8",p,"should assert, literal is not ok")
      _.shouldAssert(9,_tryConstruct,nok2,"TT9",p,"should assert, literal is not ok")
      _.shouldAssert(10,_tryConstruct,nok3,"TT10",p,"should assert, literal is not ok")
      _.shouldAssert(11,_tryConstruct,nok4,"TT11",p,"should assert, literal is not ok")
      _.shouldAssert(12,_tryConstruct,nok5,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(13,_tryConstruct,nok6,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(14,_tryConstruct,nok7,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(15,_tryConstruct,nok8,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(16,_tryConstruct,nok9,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(17,_tryConstruct,nok10,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(18,_tryConstruct,nok11,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(19,_tryConstruct,nok12,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(20,_tryConstruct,nok13,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(21,_tryConstruct,nok14,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(22,_tryConstruct,nok15,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(23,_tryConstruct,nok16,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(24,_tryConstruct,nok17,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(25,_tryConstruct,nok18,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(26,_tryConstruct,nok19,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(27,_tryConstruct,nok20,"TT12",p,"should assert, literal is not ok")
      _.shouldAssert(28,_tryConstruct,nok21,"TT12",p,"should assert, literal is not ok")
    }
    function _tryConstruct(arg1, arg2, arg3) {
      new TypesManager(arg1, arg2, arg3)
    }
  }
}

/** folder to types parser
 * @classdesc
 * maps notetypes to folder names
 */
class FoTyManager extends BreadCrumbs {
  //#region member variables
  static #instanceCounter = 0
  static #FOTY_KEY = "__FOLDER2TYPE"
  #FOLDER2TYPE = {}
  /** Returns key for entry handled by FoTyManager
   * @returns {String}
   */
  static get handlerKey() {
    return FoTyManager.#FOTY_KEY
  }
  /** Returns given FOLDER2TYPE setting, single string values converted to array
   * @returns {Object.<Array.<String>>}
   */
  get FOLDER2TYPE() {
    return this.#FOLDER2TYPE
  }
  //#endregion member variables
  /** Constructs a new FoTyManager and registers its type once
   * @constructor
   * @param {(Object|Object.<String.(String|Array.String)>)} literal
   * @param {(String|Symbol)} key
   * @param {Setting} parent
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key, parent) {
    let un
    super(literal, key, parent)
    if (!FoTyManager.#instanceCounter++) this.objTypes = "FoTyManager"
    this.throwIfUndefined(literal, "literal")
    // literal {(Undefined|Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    this.throwIfNotOfType(parent, "Setting", un, "'parent'")
    this.#FOLDER2TYPE = this.#validateLiteralOrThrow(parent.typeNames)
  }

  /** Returns whether arg is instance of FoTyManager
   * @param {Object} arg
   * @returns {Boolean}
   */
  static instanceOfMe(arg) {
    return arg instanceof FoTyManager
  }

  /** Returns notetypes for a foldername, if set, or empty array else
   * @param {String} folder
   * @returns {Array.<String>}
   * @throws {SettingError} on wrong parameter type
   */
  getTypesForFolder(folder) {
    this.throwIfNotOfType(folder, "string", "getTypesForFolder", "folder")
    let types = this.#FOLDER2TYPE[folder]
    if (!BC.isDefined(types)) types = []
    return types
  }

  /** Returns input, only single string values changed to array of string
   * @param {Array.<String>} typeNames
   * @returns {Array.<String>}
   * @throws {SettingError}
   */
  #validateLiteralOrThrow(typeNames) {
    function _throwNoType(type, typeNames, me) {
      throw new SettingError(
        `${me.constructor.name}.#validateLiteralOrThrow`,
        `Path: ${me.toBreadcrumbs()}\
        ${BC.nl}'${type}' is no is no given notetype.\
        ${BC.nl}Given notetypes are: '${typeNames}'\
        ${BC.nl}${BC.nl}Remove unknown notetypes from your FOLDER2TYPE settings\
        ${BC.nl}or add a notetype definition for '${type}'`
      )
    }
    function _throwIfWrongType(value, type, key, me) {
      me.throwIfNotOfType(
        value,
        type,
        "#validateLiteralOrThrow",
        `'${key}: ${value}' - value '${value}'`,
        `${BC.nl}${BC.nl}Change value to correct type.`
      )
    }
    function _throwNothingSet(value, me) {
      throw new SettingError(
        `${me.constructor.name}.#validateLiteralOrThrow`,
        `Path: ${me.toBreadcrumbs()}\
        ${BC.nl}You have no __NOTETYPES defined, you can not use __FOLDER2TYPE\
        ${BC.nl}${BC.nl}Define a notetype for '${value}'`
      )
    }

    let folder2types = {}
    for (const [key, value] of Object.entries(this.literal)) {
      _throwIfWrongType(value, ["string", "Array"], key, this)

      let valueNames = []
      if (BC.isOfType(value, "string")) valueNames.push(value)
      else valueNames = value
      if (typeNames.length == 0) _throwNothingSet(valueNames[0], this)
      valueNames.forEach((type) => {
        if (!typeNames.includes(type)) _throwNoType(type, typeNames, this)
      })
      folder2types[key] = valueNames
    }
    return folder2types
  }

  // prettier-ignore
  static test(outputObj) { // FoTyManager
    let _ = null
    if(_ = new TestSuite("FoTyManager", outputObj)) {
      _.run(getterHandlerKeyTest)
      _.run(getterLiteralTest)
      _.run(getterFOLDER2TYPETest)
      _.run(constructorTest)
      _.run(instanceOfMeTest)
      _.run(toStringTest)
      _.run(isOfTypeTest)
      _.run(getTypesForFolderTest)
      _.run(validateLiteralOrThrowTest)
      _.destruct()
      _ = null
    }
    function getterHandlerKeyTest() {
      _.bassert(1,FoTyManager.handlerKey == "__FOLDER2TYPE")
      _.bassert(2,FoTyManager.handlerKey != "FOLDER2TYPE")
    }
    function getterLiteralTest() {
      let un
      let parent = new Setting({}, "getterLiteralTest", un)
      let lit1 = {}
      let lit2 = {}
      let lit3 = {}
      let lit4 = {}
      let lit5 = {}
      let lit6 = {}
      let ftMan1 = new FoTyManager(lit1,"getterLiteralTest01",parent)
      let ftMan2 = new FoTyManager(lit2,"getterLiteralTest02",parent)
      let ftMan3 = new FoTyManager(lit3,"getterLiteralTest03",parent)
      let ftMan4 = new FoTyManager(lit4,"getterLiteralTest04",parent)
      let ftMan5 = new FoTyManager(lit5,"getterLiteralTest05",parent)
      let ftMan6 = new FoTyManager(lit6,"getterLiteralTest06",parent)
      let res1 = ftMan1.literal
      let res2 = ftMan2.literal
      let res3 = ftMan3.literal
      let res4 = ftMan4.literal
      let res5 = ftMan5.literal
      let res6 = ftMan6.literal
      _.bassert(1,Object.keys(res1).length == 0,"literal should be empty as given")
      _.bassert(2,BC.areEqual(lit2,res2),"literal should not be changed")
      _.bassert(3,BC.areEqual(lit3,res3),"literal should not be changed")
      _.bassert(4,BC.areEqual(lit4,res4),"literal should not be changed")
      _.bassert(5,BC.areEqual(lit5,res5),"literal should not be changed")
      _.bassert(6,BC.areEqual(lit6,res6),"literal should not be changed")
    }
    function getterFOLDER2TYPETest() {
      let un
      let types = {__NOTETYPES: { diary: {}, citation: {}, books: {}}}
      let lit1 = {home: "diary"}
      let exp1 = {home: ["diary"]}
      let lit2 = {home: ["diary","books","citation"]}
      let exp2 = {home: ["diary","books","citation"]}
      let lit3 = {home: ["books","citation"], diary: "diary"}
      let exp3 = {home: ["books","citation"],diary: ["diary"]}
      let parent = new Setting(types, "getterFOLDER2TYPETest", un)
      let foty1 = new FoTyManager(lit1,"getterFOLDER2TYPETest1",parent)
      let foty2 = new FoTyManager(lit2,"getterFOLDER2TYPETest2",parent)
      let foty3 = new FoTyManager(lit3,"getterFOLDER2TYPETest3",parent)
      let res1 = foty1.FOLDER2TYPE
      let res2 = foty2.FOLDER2TYPE
      let res3 = foty3.FOLDER2TYPE
      _.bassert(1,BC.areEqual(exp1,res1),"foldertypes string should be converted to array of this string")
      _.bassert(2,BC.areEqual(exp2,res2),"foldertypes string should be converted to array of this string")
      _.bassert(3,BC.areEqual(exp3,res3),"foldertypes string should be converted to array of this string")
    }
    function constructorTest() {
      let un
      let p = new Setting({}, "constructorTest", un)
      let ft = new FoTyManager({}, "constructorTest1", p)
      _.assert(1,_tryConstruct,{},"cTest1",p,"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",p,"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",p,"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",p,"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",p,"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,p,"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,p,"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},p,"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},p,p,"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),p,"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"cTest11",un,"should not be be created, parent is undefined")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,"should not be be created, parent is null")

      let dialogManager = new FoTyManager({},"constructorTest101",p)
      _.bassert(101,dialogManager instanceof Object,"'FoTyManager' has to be an instance of 'Object'")
      _.bassert(102,dialogManager instanceof BreadCrumbs,"'FoTyManager' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,dialogManager instanceof FoTyManager,"'FoTyManager' has to be an instance of 'FoTyManager'")
      _.bassert(104,dialogManager.constructor == FoTyManager,"the constructor property is not 'FoTyManager'")
    }
    function instanceOfMeTest() {
      let un
      let parent = new Setting({}, "instanceOfMeTest", un)
      let ft1 = new FoTyManager({},"instanceOfMeTest1",parent)
      let spec1 = new TypesManager({},"instanceOfMeTest2",parent,un)
      _.bassert(1,!FoTyManager.instanceOfMe(parent),"BreadCrumbs instance should not be an instance of FoTyManager")
      _.bassert(2,!FoTyManager.instanceOfMe(new Error()),"Error instance should not be an instance of FoTyManager")
      _.bassert(3,FoTyManager.instanceOfMe(ft1),"FoTyManager instance should be an instance of FoTyManager")
      _.bassert(4,!FoTyManager.instanceOfMe("FoTyManager"),"String should not be an instance of FoTyManager")
      _.bassert(5,!FoTyManager.instanceOfMe(spec1),"TypesManager should not be an instance of FoTyManager")
    }
    function toStringTest() {
      let un
      let parent = new Setting({}, "toStringTest", un)
      let ft1 = new FoTyManager({},"toStringTest1",parent)
      _.bassert(1,ft1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,ft1.toString().includes("FoTyManager"),"result does not contain class string"    )
    }
    function isOfTypeTest() {
      let un
      let parent = new Setting({}, "isOfTypeTest", un)
      let ft1 = new FoTyManager({},"isOfTypeTest1",parent)
      _.bassert(1, BC.isOfType(ft1,"object"), "'" + ft1 + "' should be of type " + "object")
      _.bassert(2, BC.isOfType(ft1,"Object"), "'" + ft1 + "' should be of type " + "Object")
      _.bassert(3, BC.isOfType(ft1,"BreadCrumbs"), "'" + ft1 + "' should be of type " + "BreadCrumbs")
      _.bassert(4, BC.isOfType(ft1,"FoTyManager"), "'" + ft1 + "' should be of type " + "FoTyManager")
      _.bassert(5,!BC.isOfType(ft1,"Error"), "'" + ft1 + "' should not be of type " + "Error")
      _.bassert(6,!BC.isOfType(ft1,"TypesManager"), "'" + ft1 + "' should not be of type " + "TypesManager")
    }
    function getTypesForFolderTest() {
      let un
      let types0 = {}
      let types1 = {__NOTETYPES: { diary: {}}}
      let types2 = {__NOTETYPES: { diary: {}, citation: {}}}
      let lit0 = {}
      let lit1 = {home: "diary"}
      let lit2 = {home: ["diary", "citation"]}
      let parent0 = new Setting(types0, "getTypesForFolderTest_p0", un)
      let parent1 = new Setting(types1, "getTypesForFolderTest_p1", un)
      let parent2 = new Setting(types2, "getTypesForFolderTest_p2", un)
      let foty0_0 = new FoTyManager(lit0,"ff0",parent0)
      let foty0_1 = new FoTyManager(lit0,"ff01",parent1)
      let foty0_2 = new FoTyManager(lit0,"ff02",parent2)
      let foty1_1 = new FoTyManager(lit1,"ff1_1",parent1)
      let foty1_2 = new FoTyManager(lit1,"ff1_2",parent2)
      let foty2_2 = new FoTyManager(lit2,"ff2_2",parent2)
      _.bassert(1,BC.areEqual(foty0_0.getTypesForFolder("home"),[]), "no foldertypes set")
      _.bassert(2,BC.areEqual(foty0_1.getTypesForFolder("home"),[]), "no foldertypes set")
      _.bassert(3,BC.areEqual(foty0_2.getTypesForFolder("home"),[]), "no foldertypes set")
      let res4 = foty1_1.getTypesForFolder("home")     
      _.bassert(4,BC.areEqual(res4,["diary"]),"diary folder type set")
    }
    function validateLiteralOrThrowTest() {
      let un
      let types0 = {}
      let types1 = {__NOTETYPES: { diary: {}}}
      let types2 = {__NOTETYPES: { diary: {}, citation: {}}}
      let lit1 = {home: "diary"}
      let lit1_1 = {home: ["diary"]}
      let lit1_2 = {home: "citation"}
      let lit2 = {home: ["diary", "citation"]}
      let lit2_1 = {home: ["diary", "books"]}
      let parent0 = new Setting(types0, "validateValuesOrThrowTest_p0", un)
      let parent1 = new Setting(types1, "validateValuesOrThrowTest_p1", un)
      let parent2 = new Setting(types2, "validateValuesOrThrowTest_p2", un)
      _.assert(1,_tryConstruct,lit1,"f1",parent1, "should construct")
      _.assert(2,_tryConstruct,lit1_1,"f2",parent1, "should construct")
      _.shouldAssert(3,_tryConstruct,lit1,"f3",parent0, "should assert")
      _.shouldAssert(4,_tryConstruct,lit1_2,"f4",parent1, "should assert")
      _.assert(5,_tryConstruct,lit2,"f5",parent2, "should construct")
      _.shouldAssert(6,_tryConstruct,lit2_1,"f6",parent2, "should assert")
    }
    function _tryConstruct(arg1, arg2, arg3) {
      new FoTyManager(arg1, arg2, arg3)
    }
  }
}

/** setting parser; traverses deep literal to flat output
 * @classdesc
 * Setting is the only subclass which should be constructed from outside, with
 * only literal given as argument.
 *
 * It calls the managers and traverses given literal to flat output; thereby
 * respecting manager configuration rules and removing manager literals from
 * output.
 *
 */
class Setting extends BreadCrumbs {
  //#region member variables
  static #instanceCounter = 0
  static #ROOT_KEY = "/"
  #children = {}
  #spec = {}
  #types = {}
  #dlg = {}
  #foty = {}
  #frontmatterYAML = {}
  #renderYAML = {}
  /** Returns names of notetypes
   * @returns @returns {Array.<String>}
   */
  get typeNames() {
    return this.#types.names
  }
  /** Returns all frontmatter entries of this instance (not filtered by type)
   * @returns {Object.<String.*>}
   */
  get frontmatterYAML() {
    return this.#frontmatterYAML
  }
  /** Returns all render entries of this instance (not filtered by type)
   * @returns {Object.<String.*>}
   */
  get renderYAML() {
    return this.#renderYAML
  }
  /** Returns Dialog settings */
  get dlg() {
    return this.#dlg
  }
  //#endregion member variables
  /** Constructs a new Setting and registers its type once
   * @constructor
   * @param {Object} literal
   * @param {(Undefined|String|Symbol)} key
   * @param {(Undefined|Setting)} parent
   * @throws {SettingError} on wrong parameter types
   */
  constructor(literal, key = undefined, parent = undefined) {
    let un
    super(literal, key === undefined ? Setting.#ROOT_KEY : key, parent)
    if (!Setting.#instanceCounter++) this.objTypes = "Setting"
    this.throwIfUndefined(literal, "literal")
    // literal {(Undefined|Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|BreadCrumbs)} checked by superclass
    this.throwIfNotOfType(parent, ["undefined", "Setting"], un, "'parent'")

    if (this.isRoot()) {
      let types = {}
      if (BC.isDefined(this.literal[TypesManager.handlerKey]))
        types = this.literal[TypesManager.handlerKey]
      this.#types = new TypesManager(types, TypesManager.handlerKey, this)

      let dlg = {}
      if (BC.isDefined(this.literal[DialogManager.handlerKey]))
        dlg = this.literal[DialogManager.handlerKey]
      this.#dlg = new DialogManager(dlg, DialogManager.handlerKey, this)

      let foty = {}
      if (BC.isDefined(this.literal[FoTyManager.handlerKey]))
        foty = this.literal[FoTyManager.handlerKey]
      this.#foty = new FoTyManager(foty, FoTyManager.handlerKey, this)
    }

    for (const [key, value] of Object.entries(this.literal)) {
      if (BC.isOfType(value, "Object")) {
        if (!Setting.#isHandlersKey(key)) {
          this.#children[key] = new Setting(value, key, this, this.#spec)
        }
      } else {
        if (this.RENDER) this.#renderYAML[key] = value
        else this.#frontmatterYAML[key] = value
      }
    }
  }

  /** Returns whether arg is instance of Setting
   * @param {Object} arg
   * @returns {Boolean}
   */
  static instanceOfMe(arg) {
    return arg instanceof Setting
  }

  /** Returns all frontmatter entries of this instance and descendants
   * @returns  {Object.<String.*>}
   */
  getFrontmatterYAML() {
    let frontmatterYAML = {}
    Object.assign(frontmatterYAML, this.#frontmatterYAML)
    for (const [key, value] of Object.entries(this.#children)) {
      Object.assign(frontmatterYAML, value.getFrontmatterYAML())
    }
    return frontmatterYAML
  }

  /** Returns all render entries of this instance and descendants
   * @returns  {Object.<String.*>}
   */
  getRenderYAML() {
    let renderYAML = {}
    Object.assign(renderYAML, this.#renderYAML)
    for (const [key, value] of Object.entries(this.#children)) {
      Object.assign(renderYAML, value.getRenderYAML())
    }
    return renderYAML
  }

  /** Returns full notetype for name; all type keys set, if not given to default
   *
   * If no type for name is given, full default type is returned
   * @param {*} name
   * @returns  {Object.<String.*>}
   */
  getType(name) {
    if (BC.isDefined(this.#types.notetypes[name])) {
      return this.#types.notetypes[name]
    } else {
      return TypesManager.defaultType
    }
  }

  /** Returns whether key is main key of known handlers
   * @param {*} key
   * @returns {Boolean}
   */
  static #isHandlersKey(key) {
    return (
      TypesManager.handlerKey == key ||
      DialogManager.handlerKey == key ||
      FoTyManager.handlerKey == key
    )
  }

  // prettier-ignore
  static test(outputObj) { // Setting
    BC.test(outputObj)
    DialogManager.test(outputObj)
    DefaultsManager.test(outputObj)
    TypesManager.test(outputObj)
    FoTyManager.test(outputObj)
    let _ = null
    if(_ = new TestSuite("Setting", outputObj)) {
      _.run(getterLiteralTest)
      _.run(getterTypeNamesTest)
      _.run(getterFrontmatterYAMLTest)
      _.run(getterRenderYAMLTest)
      _.run(getterDlgTest)
      _.run(constructorTest)
      _.run(instanceOfMeTest)
      _.run(toStringTest)
      _.run(isOfTypeTest)
      _.run(getFrontmatterYAMLTest)
      _.run(getRenderYAMLTest)
      _.run(getTypeTest)
      _.run(isHandlersKeyTest)
      _.destruct()
    _ = null
    }
    function getterLiteralTest() {
      let un
      let sym = Symbol("a")
      let setting1 = new Setting({},"getterLiteralTest02",un)
      let setting2 = new Setting({sym: {}},"getterLiteralTest03",un)
      let setting3 = new Setting({"__NOTETYPES": {}},"getterLiteralTest04",un)
      let setting4 = new Setting({"a": {"MARKER":"2"}},"getterLiteralTest05",un)
      let setting5 = new Setting({"a": {"MARKER":"2","DATE":true,}},"getterLiteralTest06",un)
      let setting6 = new Setting({"a": {MARKER:"2",DATE:false,},"d": {TITLE_BEFORE_DATE:"abc"}},"getterLiteralTest07",un)
      let lit1 = setting1.literal
      let lit2 = setting2.literal
      let lit3 = setting3.literal
      let lit4 = setting4.literal
      let lit5 = setting5.literal
      let lit6 = setting6.literal
      _.bassert(1,Object.keys(lit1).length == 0,"literal should be empty as given")
      _.bassert(2,Object.keys(lit2).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(3,Object.keys(lit2.sym).length == 0,"object assigned to symbol key should be empty as given")
      _.bassert(4,Object.keys(lit3).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(5,Object.keys(lit3.__NOTETYPES).length == 0,"object assigned to '__NOTETYPES' key should be empty as given")
      _.bassert(6,Object.keys(lit4).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(7,Object.keys(lit4.a).length == 1,"object assigned to 'a' should only contain one entry as only one given")
      _.bassert(8,lit4.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(9,Object.keys(lit5).length == 1,"only 1 value should be contained, as only one given")
      _.bassert(10,Object.keys(lit5.a).length == 2,"object assigned to 'a' should contain 2 entries as two given")
      _.bassert(11,lit5.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(12,lit5.a.DATE === true,"value of a.DATE should be 'true' as given")
      _.bassert(13,Object.keys(lit6).length == 2,"2 values should be contained, as two given")
      _.bassert(14,Object.keys(lit6.a).length == 2,"object assigned to 'a' should contain 2 entries as two given")
      _.bassert(15,Object.keys(lit6.d).length == 1,"object assigned to 'd' should only contain one entry as only one given")
      _.bassert(16,lit6.a.MARKER === "2","value of a.MARKER should be '2' as given")
      _.bassert(17,lit6.a.DATE === false,"value of a.DATE should be 'false' as given")
      _.bassert(18,lit6.d.TITLE_BEFORE_DATE === "abc","value of d.TITLE_BEFORE_DATE should be 'abc' as given")
    }    
    function getterTypeNamesTest() {
      let lit1 = {}
      let lit2 = {SPEC: {RENDER: true},a:1}
      let lit3 = {__NOTETYPES: {}}
      let lit4 = {__NOTETYPES: {diary:{}}}
      let lit5 = {__NOTETYPES: {diary:{MARKER: "d"}}}
      let lit6 = {__NOTETYPES: {diary:{DATE: true,},cit:{},book:{MARKER: "b"}}}
      let lit7 = {a: {SPEC: {RENDER: true},__NOTETYPES: {diary:{}},x:"y"}}
      let setting1 = new Setting(lit1)
      let setting2 = new Setting(lit2)
      let setting3 = new Setting(lit3)
      let setting4 = new Setting(lit4)
      let setting5 = new Setting(lit5)
      let setting6 = new Setting(lit6)
      let setting7 = new Setting(lit7)
      let answ1 = setting1.typeNames
      let answ2 = setting2.typeNames
      let answ3 = setting3.typeNames
      let answ4 = setting4.typeNames
      let answ5 = setting5.typeNames
      let answ6 = setting6.typeNames
      let answ7 = setting7.typeNames
      let expAnsw1 = '[]'
      let expAnsw2 = '[]'
      let expAnsw3 = '[]'
      let expAnsw4 = '["diary"]'
      let expAnsw5 = '["diary"]'
      let expAnsw6 = '["diary","cit","book"]'
      let expAnsw7 = '[]'
      _.bassert(1,JSON.stringify(answ1) == expAnsw1,`output of JSON.stringify(result) is:'${JSON.stringify(answ1)}',but should be:'${expAnsw1}'`)
      _.bassert(2,JSON.stringify(answ2) == expAnsw2,`output of JSON.stringify(result) is:'${JSON.stringify(answ2)}',but should be:'${expAnsw2}'`)
      _.bassert(3,JSON.stringify(answ3) == expAnsw3,`output of JSON.stringify(result) is:'${JSON.stringify(answ3)}',but should be:'${expAnsw3}'`)
      _.bassert(4,JSON.stringify(answ4) == expAnsw4,`output of JSON.stringify(result) is:'${JSON.stringify(answ4)}',but should be:'${expAnsw4}'`)
      _.bassert(5,JSON.stringify(answ5) == expAnsw5,`output of JSON.stringify(result) is:'${JSON.stringify(answ5)}',but should be:'${expAnsw5}'`)
      _.bassert(6,JSON.stringify(answ6) == expAnsw6,`output of JSON.stringify(result) is:'${JSON.stringify(answ6)}',but should be:'${expAnsw6}'`)
      _.bassert(7,JSON.stringify(answ7) == expAnsw7,`output of JSON.stringify(result) is:'${JSON.stringify(answ7)}',but should be:'${expAnsw7}'`)
    }
    function getterFrontmatterYAMLTest() {
      const lit1 = {a: 23}
      const lit2 = {a: 23, b: "ja"}
      const lit3 = {a: 23, c: {b: "ja"}, d: "ja"}
      const lit4 = {a: 23, c: {b: "ja", c: {c: 25}}, d: "ja"}
      const lit5 = {__SPEC: {RENDER: true}, a: 23, pict: "ja"}
      let setting1 = new Setting(lit1)
      let setting2 = new Setting(lit2)
      let setting3 = new Setting(lit3)
      let setting4 = new Setting(lit4)
      let setting5 = new Setting(lit5)
      let answ1f = setting1.frontmatterYAML
      let answ2f = setting2.frontmatterYAML
      let answ3f = setting3.frontmatterYAML
      let answ4f = setting4.frontmatterYAML
      let answ5f = setting5.frontmatterYAML
      let expAnsw1f = '{"a":23}'
      let expAnsw2f = '{"a":23,"b":"ja"}'
      let expAnsw3f = '{"a":23,"d":"ja"}'
      let expAnsw4f = '{"a":23,"d":"ja"}'
      let expAnsw5f = '{}'
      _.bassert(1,JSON.stringify(answ1f) == expAnsw1f,`output of JSON.stringify(result) is:'${JSON.stringify(answ1f)}',but should be:'${expAnsw1f}'`)
      _.bassert(2,JSON.stringify(answ2f) == expAnsw2f,`output of JSON.stringify(result) is:'${JSON.stringify(answ2f)}',but should be:'${expAnsw2f}'`)
      _.bassert(3,JSON.stringify(answ3f) == expAnsw3f,`output of JSON.stringify(result) is:'${JSON.stringify(answ3f)}',but should be:'${expAnsw3f}'`)
      _.bassert(4,JSON.stringify(answ4f) == expAnsw4f,`output of JSON.stringify(result) is:'${JSON.stringify(answ4f)}',but should be:'${expAnsw4f}'`)
      _.bassert(5,JSON.stringify(answ5f) == expAnsw5f,`output of JSON.stringify(result) is:'${JSON.stringify(answ5f)}',but should be:'${expAnsw5f}'`)

    }
    function getterRenderYAMLTest() {
      const lit1 = {a: 23, c: {b: "ja", c: {c: 25}}, d: "ja"}
      const lit2 = {a: 23, c: {__SPEC: {RENDER: true}, pict: "ja"}}
      const lit3 = {a: 23, c: {b: "ja"}, d: "ja"}
      const lit4 = {__SPEC: {RENDER: true}, pict: "ja", d: {__SPEC: {RENDER: false}, private: true},}
      let setting1 = new Setting(lit1)
      let setting2 = new Setting(lit2)
      let setting3 = new Setting(lit3)
      let setting4 = new Setting(lit4)
      let answ1 = setting1.renderYAML
      let answ2 = setting2.renderYAML
      let answ3 = setting3.renderYAML
      let answ4 = setting4.renderYAML
      let expAnsw1 = "{}"
      let expAnsw2 = '{}'
      let expAnsw3 = "{}"
      let expAnsw4 = '{"pict":"ja"}'
      _.bassert(1,JSON.stringify(answ1) == expAnsw1,`output of JSON.stringify(result) is:'${JSON.stringify(answ1)}',but should be:'${expAnsw1}'`)
      _.bassert(2,JSON.stringify(answ2) == expAnsw2,`output of JSON.stringify(result) is:'${JSON.stringify(answ2)}',but should be:'${expAnsw2}'`)
      _.bassert(3,JSON.stringify(answ3) == expAnsw3,`output of JSON.stringify(result) is:'${JSON.stringify(answ3)}',but should be:'${expAnsw3}'`)
      _.bassert(4,JSON.stringify(answ4) == expAnsw4,`output of JSON.stringify(result) is:'${JSON.stringify(answ4)}',but should be:'${expAnsw4}'`)
    }
    function getterDlgTest() {
      let lit1 = {}
      let lit2 = {__DIALOGSETTINGS: {TYPE_PROMPT: "abcdef", TYPE_MAX_ENTRIES: 137}}
      let lit3 = {a:{__DIALOGSETTINGS: {TYPE_PROMPT: "abcdef", TYPE_MAX_ENTRIES: 137}}}
      let setting1 = new Setting(lit1)
      let setting2 = new Setting(lit2)
      let setting3 = new Setting(lit3)
      let dlg1 = setting1.dlg
      let dlg2 = setting2.dlg
      let dlg3 = setting3.dlg
      _.bassert(1,dlg1.TYPE_PROMPT==DialogManager.defaults.TYPE_PROMPT,"should be default value")
      _.bassert(2,dlg1.TYPE_MAX_ENTRIES==DialogManager.defaults.TYPE_MAX_ENTRIES,"should be default value")
      _.bassert(3,dlg2.TYPE_PROMPT=="abcdef","should be 'abcdef' as given")
      _.bassert(4,dlg2.TYPE_MAX_ENTRIES==137,"should be '137' as given")
      _.bassert(5,dlg3.TYPE_PROMPT==DialogManager.defaults.TYPE_PROMPT,"should be default value")
      _.bassert(6,dlg3.TYPE_MAX_ENTRIES==DialogManager.defaults.TYPE_MAX_ENTRIES,"should be default value")
    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "constructorTest", un)
      let st = new Setting({}, "constructorTest1", un, un)
      _.assert(1,_tryConstruct,{},"cTest1",un,un,"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",un,un,"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",un,un,"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",un,un,"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",un,un,"should not be created, literal is null")
      _.assert(6,_tryConstruct,{},un,un,un,"should be created, undefined key is ok")
      _.shouldAssert(7,_tryConstruct,{},22,un,un,"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},un,un,"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,un,un,"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),un,un,"should be created, key is Symbol")
      _.assert(11,_tryConstruct,{},"cTest11",un,un,"should  be created, undefined parent is ok")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),un,"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},un,"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring",un,"should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,un,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,un,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",b,un,"should not be be created, parent is BreadCrumbs")
      let setting = new Setting({},"constructorTest101")
      _.bassert(101,setting instanceof Object,"'Setting' has to be an instance of 'Object'")
      _.bassert(102,setting instanceof BreadCrumbs,"'Setting' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,setting instanceof Setting,"'Setting' has to be an instance of 'Setting'")
      _.bassert(104,setting.constructor == Setting,"the constructor property is not 'Setting'")
    }
    function instanceOfMeTest() {
      let un
      let breadcrumbs = new BreadCrumbs(un, "instanceOfMeTest", un)
      let setting1 = new Setting({},"instanceOfMeTest1",un,un)
      let type1 = new TypesManager({},"instanceOfMeTest3",breadcrumbs)
      _.bassert(1,!Setting.instanceOfMe(breadcrumbs),"BreadCrumbs instance should not be an instance of Setting")
      _.bassert(2,!Setting.instanceOfMe(new Error()),"Error instance should not be an instance of Setting")
      _.bassert(3,Setting.instanceOfMe(setting1),"Setting instance should be an instance of Setting")
      _.bassert(4,!Setting.instanceOfMe("Setting"),"String should not be an instance of Setting")
      _.bassert(6,!Setting.instanceOfMe(type1),"TypesManager should not be an instance of Setting")
    }
    function toStringTest() {
      let un
      let setting1 = new Setting({},"toStringTest1",un,un)
      _.bassert(1,setting1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,setting1.toString().includes("Setting"),"result does not contain class string"    )
    }
    function isOfTypeTest() {
      let un
      let setting1 = new Setting({},"isOfTypeTest1",un,un)
      _.bassert(1,BC.isOfType(setting1,"object"), "'" + setting1 + "' should be of type " + "object")
      _.bassert(2,BC.isOfType(setting1,"Object"), "'" + setting1 + "' should be of type " + "Object")
      _.bassert(3,BC.isOfType(setting1,"BreadCrumbs"), "'" + setting1 + "' should be of type " + "BreadCrumbs")
      _.bassert(4,BC.isOfType(setting1,"Setting"), "'" + setting1 + "' should be of type " + "Setting")
      _.bassert(5,!BC.isOfType(setting1,"Error"), "'" + setting1 + "' should not be of type " + "Error")
      _.bassert(7,!BC.isOfType(setting1,"TypesManager"), "'" + setting1 + "' should not be of type " + "TypesManager")
    }
    function getFrontmatterYAMLTest() {
      const lit1 = {a: 23}
      const lit2 = {a: 23, b: "ja"}
      const lit3 = {a: 23, c: {b: "ja"}, d: "ja"}
      const lit4 = {a: 23, c: {b: "ja", c: {c: 25}}, d: "ja"}
      const lit5 = {a: 23, c: {__SPEC: {RENDER: true}, pict: "ja", d: {__SPEC: {RENDER: false}, x: "y"}}}
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
      let expAnsw5f = '{"a":23,"x":"y"}'
      _.bassert(1,JSON.stringify(answ1f) == expAnsw1f,`output of JSON.stringify(result) is:'${JSON.stringify(answ1f)}',but should be:'${expAnsw1f}'`)
      _.bassert(2,JSON.stringify(answ2f) == expAnsw2f,`output of JSON.stringify(result) is:'${JSON.stringify(answ2f)}',but should be:'${expAnsw2f}'`)
      _.bassert(3,JSON.stringify(answ3f) == expAnsw3f,`output of JSON.stringify(result) is:'${JSON.stringify(answ3f)}',but should be:'${expAnsw3f}'`)
      _.bassert(4,JSON.stringify(answ4f) == expAnsw4f,`output of JSON.stringify(result) is:'${JSON.stringify(answ4f)}',but should be:'${expAnsw4f}'`)
      _.bassert(5,JSON.stringify(answ5f) == expAnsw5f,`output of JSON.stringify(result) is:'${JSON.stringify(answ5f)}',but should be:'${expAnsw5f}'`)
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
      let setting1 = new Setting(lit1)
      let setting2 = new Setting(lit2)
      let setting3 = new Setting(lit3)
      let setting4 = new Setting(lit4)
      let answ1 = setting1.getRenderYAML()
      let answ2 = setting2.getRenderYAML()
      let answ3 = setting3.getRenderYAML()
      let answ4 = setting4.getRenderYAML()
      let expAnsw1 = "{}"
      let expAnsw2 = '{"pict":"ja"}'
      let expAnsw3 = "{}"
      let expAnsw4 = '{"pict":"ja","y":"z"}'
      _.bassert(1,JSON.stringify(answ1) == expAnsw1,`output of JSON.stringify(result) is:'${JSON.stringify(answ1)}',but should be:'${expAnsw1}'`)
      _.bassert(2,JSON.stringify(answ2) == expAnsw2,`output of JSON.stringify(result) is:'${JSON.stringify(answ2)}',but should be:'${expAnsw2}'`)
      _.bassert(3,JSON.stringify(answ3) == expAnsw3,`output of JSON.stringify(result) is:'${JSON.stringify(answ3)}',but should be:'${expAnsw3}'`)
      _.bassert(4,JSON.stringify(answ4) == expAnsw4,`output of JSON.stringify(result) is:'${JSON.stringify(answ4)}',but should be:'${expAnsw4}'`)
    }
    function getTypeTest() {
      let lit1 = {}
      let lit2 = {SPEC: {RENDER: true},a:1}
      let lit3 = {__NOTETYPES: {}}
      let lit4 = {__NOTETYPES: {diary:{}}}
      let lit5 = {__NOTETYPES: {diary:{MARKER: "d"}}}
      let lit6 = {__NOTETYPES: {diary:{DATE: true,},cit:{},book:{MARKER: "b"}}}
      let lit7 = {a: {SPEC: {RENDER: true},__NOTETYPES: {diary:{}},x:"y"}}
      let setting1 = new Setting(lit1)
      let setting2 = new Setting(lit2)
      let setting3 = new Setting(lit3)
      let setting4 = new Setting(lit4)
      let setting5 = new Setting(lit5)
      let setting6 = new Setting(lit6)
      let setting7 = new Setting(lit7)
      let answ1 = setting1.getType(1)
      let answ2 = setting2.getType("a")
      let answ3 = setting3.getType(new Error)
      let answ4 = setting4.getType("diary")
      let answ5 = setting5.getType("diary")
      let answ6 = setting6.getType("book")
      let answ7 = setting7.getType("diary")
      let expAnsw1 = JSON.stringify(TypesManager.defaultType)
      let expAnsw2 = JSON.stringify(TypesManager.defaultType)
      let expAnsw3 = JSON.stringify(TypesManager.defaultType)
      let expAnsw4 = JSON.stringify(TypesManager.defaultType)
      let expAnsw5 = '{"MARKER":"d","DATE":false,"TITLE_BEFORE_DATE":"","DATEFORMAT":"YYYY-MM-DD","FRONTMATTER":{}}'
      let expAnsw6 = '{"MARKER":"b","DATE":false,"TITLE_BEFORE_DATE":"","DATEFORMAT":"YYYY-MM-DD","FRONTMATTER":{}}'
      let expAnsw7 = JSON.stringify(TypesManager.defaultType)
      _.bassert(1,JSON.stringify(answ1) == expAnsw1,`output of JSON.stringify(result) is:'${JSON.stringify(answ1)}',but should be:'${expAnsw1}'`)
      _.bassert(2,JSON.stringify(answ2) == expAnsw2,`output of JSON.stringify(result) is:'${JSON.stringify(answ2)}',but should be:'${expAnsw2}'`)
      _.bassert(3,JSON.stringify(answ3) == expAnsw3,`output of JSON.stringify(result) is:'${JSON.stringify(answ3)}',but should be:'${expAnsw3}'`)
      _.bassert(4,JSON.stringify(answ4) == expAnsw4,`output of JSON.stringify(result) is:'${JSON.stringify(answ4)}',but should be:'${expAnsw4}'`)
      _.bassert(5,JSON.stringify(answ5) == expAnsw5,`output of JSON.stringify(result) is:'${JSON.stringify(answ5)}',but should be:'${expAnsw5}'`)
      _.bassert(6,JSON.stringify(answ6) == expAnsw6,`output of JSON.stringify(result) is:'${JSON.stringify(answ6)}',but should be:'${expAnsw6}'`)
      _.bassert(7,JSON.stringify(answ7) == expAnsw7,`output of JSON.stringify(result) is:'${JSON.stringify(answ7)}',but should be:'${expAnsw7}'`)
    }
    function isHandlersKeyTest() {
      _.bassert(2,Setting.#isHandlersKey(TypesManager.handlerKey),TypesManager.handlerKey +  " should be recognized as handler key,but isn't")
      _.bassert(3,!Setting.#isHandlersKey(TypesManager.tnames[0]),TypesManager.tnames[0] +  " should not be recognized as handlers key,but is")
      _.bassert(4,!Setting.#isHandlersKey("no"),"'no' should not be recognized as handlers key,but is")
      _.bassert(5,!Setting.#isHandlersKey(""),"empty string should not be recognized as handlers key,but is")
      _.bassert(6,!Setting.#isHandlersKey(22),"22 should not be recognized as handlers key,but is")
      _.bassert(7,!Setting.#isHandlersKey(),"no argument should not be recognized as handlers key,but is")
      _.bassert(9,!Setting.#isHandlersKey(TypesManager.TYPES_KEY),TypesManager.TYPES_KEY +  " should be recognized as handler key,but isn't")
    }
    function _tryConstruct(arg1, arg2, arg3, arg4) {
      new Setting(arg1, arg2, arg3, arg4)
    }
  }
}
//#endregion code
/** Runs all tests, if TESTING is set; output to current note (indirect)
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
      setting.dlg.TYPE_PROMPT,
      setting.dlg.TYPE_MAX_ENTRIES
    )
    if (!typekey) {
      return Dialog.Cancel
    } else {
      type = setting.getType(typekey)
    }
  }
  //aut(type)
  return Dialog.Ok
}
function entries2pairs(entries) {
  let pairs = {}
  for (const [key, val] of Object.entries(entries)) {
    if (val.ignore == undefined || val.ignore == false) {
      pairs[key] = undefined
    }
  }
  return pairs
}

/** exported function
 * @param {Object} tp - templater object
 * @param {Object} app - obsidian api object
 * @returns
 */
async function main(tp, app) {
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
    /*
    let lit0 = {__SPEC: {DEFAULT: 22}}
    let lit = {__SPEC: {IGNORE: true, TYPE: "String", DEFAULT: "olla"}}
    let x = new Setting(lit)
    vaut("SKIPPED", x.skipped)
    vaut("ROOT", x.ROOT)
    vaut("RENDER", x.RENDER)
    vaut("TYPE", x.TYPE)
    vaut("DEFAULT", x.DEFAULT)
    vaut("IGNORE", x.IGNORE)
    */
    let setting = new Setting(Test)
    await createNote(tp, setting)
    frontmatterYAML = setting.getFrontmatterYAML()
    Object.assign(renderYAML, setting.getRenderYAML())
  } catch (e) {
    /* returns errYAML or rethrows */
    if (e instanceof FotyError) {
      let errYAML = {}
      if (e instanceof SettingError) {
        errYAML = {ERR: e.name + " in " + e.caller}
      } else if (e instanceof CodingError) {
        errYAML = {"!!!": e.name + " in " + e.caller}
      } else {
        errYAML = {"???": e.name}
      }
      let msg = e.message.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")
      if (e.lastMsg.length > 0)
        msg += "\n" + e.lastMsg.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")
      errYAML["\u00A8\u00A8\u00A8"] = msg
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
