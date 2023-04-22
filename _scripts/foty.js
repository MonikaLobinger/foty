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
 * ====================<br>
 * For each kind of note another template is needed. If needs change, the
 * template has to be changed. If general needs change, all templates have
 * to be changed. Elaborated Templates are difficult to maintain. Not all
 * users of obsidian can write javascript.
 *<p>
 * Intention of foty<br>
 * ==================<br>
 * Let user needs be configurable and write a full note skeleton from given
 * configuration.
 * For changing needs only configuration should have to be changed.
 *<p>
 * Presumptions<br>
 * =============<br>
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
    if (type === "ort") {
      alias += "(" + strArr.join(" ") + ")"
    } else if (type === "person") {
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
//  #region onne configuration data
/*@convert*/ function createCbk(tp, noteName, type) {
  return tp.date.now()
}
/*@convert*/ function autoTagCbk(tp, noteName, type) {
  return "0/" + type
}
/*@convert*/ function aliasCbk(tp, noteName, type) {
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
/*@convert*/ function cssClsCbk(tp, noteName, type) {
  return type
}

const ONNE_FRONTMATTER_ENTRIES = {
  /*@convert*/ aliases: {isList: true, defaultValue: aliasCbk},
  /*@convert*/ date_created: {isList: false, defaultValue: createCbk},
  /*@convert*/ tags: {isList: true, defaultValue: autoTagCbk},
  /*@convert*/ publish: {isList: false, defaultValue: false},
  /*@convert*/ cssclass: {isList: true, defaultValue: cssClsCbk},
  /*@convert*/ private: {isList: false, defaultValue: false},
  /*@convert*/ position: {ignore: true},
}
const TYPES = {
  /*@convert*/ audio: {
    marker: "{a}",
    isDiary: false,
    photo: "pexels-foteros-352505_200.jpg",
    name_prompt: "?Podcast/Reihe - Autornachname - Audiotitel",
  },
  /*@convert*/ buch: {
    marker: "{b}",
    isDiary: false,
    photo: "pexels-gül-işık-2203051_200.jpg",
    name_prompt: "Autornachname - Buchtitel",
  },
  /*@convert*/ ort: {
    marker: "",
    isDiary: false,
    photo: "pexels-dzenina-lukac-1563005_200.jpg",
    name_prompt: "Ortsname, Land",
  },
  /*@convert*/ person: {
    marker: "",
    isDiary: false,
    photo: "pexels-lucas-andrade-14097235_200.jpg",
    name_prompt: "Personnachname, Personvorname ?Geburtsdatum",
  },
  /*@convert*/ video: {
    marker: "{v}",
    isDiary: false,
    photo: "pexels-vlad-vasnetsov-2363675_200.jpg",
    name_prompt: "?Reihe - ?Autornachname - Videotitel",
  },
  /*@convert*/ web: {
    marker: "{w}",
    isDiary: false,
    photo: "pexels-sururi-ballıdağ-_200.jpeg",
    name_prompt: "?Autor - Webseitentitel - ?Datum",
  },
  /*@convert*/ zitat: {
    marker: "°",
    isDiary: false,
    name_prompt: "Titel Autornachname",
  },
  /*@convert*/ zitate: {
    marker: "°°",
    isDiary: false,
    name_prompt: "Titel Autornachname",
  },
  /*@convert*/ exzerpt: {
    marker: "$",
    isDiary: false,
    name_prompt: "Autornachname - Buchtitel",
  },
  /*@convert*/ garten: {marker: "", isDiary: false, name_prompt: "Gartenthema"},
  /*@convert*/ gartentagebuch: {
    marker: "",
    isDiary: true,
    dateformat: "YY-MM-DD",
    before_date: "Garten ",
  },
  /*@convert*/ lesetagebuch: {
    marker: "",
    isDiary: true,
    firstline: "## ArticleTitle\n[NtvZdf]link\n\n",
    dateformat: "YY-MM-DD",
    before_date: "Lesetagebucheintrag ",
  },
  /*@convert*/ pflanze: {
    marker: "",
    isDiary: false,
    name_prompt: "Pflanzenname",
  },
  /*@convert*/ unbedacht: {
    marker: "",
    isDiary: true,
    dateformat: "YY-MM-DD",
    before_date: "Unbedacht ",
  },
  /*@convert*/ verwaltung: {
    marker: "",
    isDiary: false,
    name_prompt: "Verwaltungsthema",
  },
  /*@convert*/ diary: {marker: "", isDiary: true, dateformat: "YYYY-MM-DD"},
  /*@convert*/ note: {marker: "", isDiary: false, name_prompt: "Notizthema"},
}
/*@convert*/ TYPES["diary"].frontmatter = {private: true}
/*@convert*/ TYPES["verwaltung"].frontmatter = {private: true}
/*@convert*/ TYPES["gartentagebuch"].frontmatter = {
  cssclass: "garten, tagebuch",
}
/*@convert*/ TYPES["pflanze"].frontmatter = {
  cssclass: "garten",
  Name: "",
  Sorte: "",
  Firma: "",
  vorhanden: "",
  Aussaat_geschützt: "-FM---------",
  Aussaat_Freiland: "",
  Auspflanzen: "",
  Ernte_geschützt: "",
  Ernte_Freiland: "",
  Keimtemperatur_Grad: "",
  Keimdauer_Tage: "",
  Standort: "",
  Boden: "",
  Dauer: "",
  Saattiefe_cm: "",
  Abstand_x_cm: "",
  Abstand_y_cm: "",
}
/*@convert*/ TYPES["lesetagebuch"].frontmatter = {cssclass: "tagebuch"}
/*@convert*/ TYPES["unbedacht"].frontmatter = {cssclass: "tagebuch"}
/*@convert*/ const FOLDER2TYPES = {
  exzerpte: ["exzerpt"],
  garten: ["garten"],
  gartentagebuch: ["gartentagebuch"],
  lesetagebuch: ["lesetagebuch"],
  pflanzen: ["pflanze"],
  unbedacht: ["unbedacht"],
  verwaltung: ["verwaltung"],
  zwischenreich: [
    "audio",
    "buch",
    "ort",
    "person",
    "video",
    "web",
    "zitat",
    "zitate",
  ],
  diary: ["diary"],
  vaultroot: ["note"],
  temp: ["diary", "garten"],
}
/*@convert*/ const DEFAULT_TYPE = "note"
/*@convert*/ const ROOT_KEY = "vaultRoot"
/*@convert*/ const RESOURCE_FOLDER = "_resources/"
/*@convert*/ const RESOURCE_TYPES = ["jpg", "jpeg", "png", "mp3", "midi"]
const NEW_TITLES_ARRAY = ["Unbenannt", "Untitled"]
const DEFAULT_NAME_PROMPT = "Name der Notiz (ohne Kenner/Marker)"
const TYPE_PROMPT = "Typ wählen"
const TYPE_MAX_ENTRIES = 10 // Max entries in "type" drop down list
//  #endregion onne configuration data
//  #region onne => foty
/**
 * Defaults
 * __DIALOG_SETTINGS:
 * __TRANSLATE:
 * __NOTE_TYPES: ONCE: true, REPEAT: true
 * __FOLDER2TYPE: ONCE: true, REPEAT: true
 * __SPEC:
 * - __SPEC explicit for atoms is anything but an Object
 *   -- generalType: (Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>)
 *   -- true means: just convert to spec'd atom, use generalType
 *   -- anything else means: I have thought about this and care of TYPE by myself
 *   - if true generalType is added as TYPE
 *   - else (anything but not true) TYPE is the inherited or default TYPE
 *   - has to contain value as VALUE property
 * - __SPEC implicit for atoms (is created always for atoms or FLAT values)
 *   - generalType is added as TYPE
 *   - value is added as VALUE
 * - __SPEC for nodes is an Object
 * ESSENCE  |for what |type   |default |inherited |remark|
 * ---------------------------------------------------------
 *  ROOT    |Node     |Boolean|false   |automatic ||
 *  RENDER  |Node Atom|Boolean|false   |inherited ||
 *  TYPE    |         |String |"String"|inherited ||
 *  DEFAULT |         |TYPE   |""      |individual||
 *  VALUE   |     Atom|TYPE   |""      |individual||
 *  IGNORE  |Node Atom|Boolean|false   |inherited |It is possible to IGNORE ancestors, but not descendants|
 *  FLAT    |Node     |Boolean|false   |individual|values are not parsed, even if they are objects|
 *  ONCE    |Node     |Boolean|false   |individual|if true, has to be the outermost possible|
 *  REPEAT  |         |Boolean|false   |individual|same entryType can be added several times under diff. keys|
 *  LOCAL   |Node Atom|Boolean|false   |inherited |should be/can be localized (translated)|
 *  //@todo DEFAULTS  |       |Object |object  |individual|makes only sense for REPEAT: sections|
 * @ignore
 */
//prettier-ignore
let onne = {
   __TRANSLATE: //localType: (String|Array.<String>)
   { 
     TYPE_PROMPT:         "Typ wählen",
     TITLE_NEW_FILE:      ["Unbenannt", "Untitled"],
     DEFAULT_NAME_PROMPT: "Name der Notiz (ohne Kenner/Marker)",
   },
   __DIALOG_SETTINGS: { //localType: (Number|Array.<Number>)
     TYPE_MAX_ENTRIES: 10,
   },
   sosa: {VALUE: "naga", __SPEC: true, RENDER: false},
   c:    {pict: "Russian-Matroshka2.jpg", __SPEC: {RENDER: true}, },
}
//prettier-ignore
let FoTy = { __SPEC: {TYPE: "Number"},
  pict: {VALUE: "Russian-Matroshka2.jpg", 
         __SPEC: true, RENDER: true},
  integer: {VALUE: 127, __SPEC: false, },
  noValue: {__SPEC: true, },
  sosa: [128,127]
}
//  #endregion  onne => foty
//  #region test configurations

//prettier-ignore

//  #endregion test configurations
//#endregion CONFIGURATION
//#region globals and externals
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
    if (entries.length != 0) {
      res = ""
      entries.forEach(([key, value], idx) => {
        let indent = idx === 0 ? "OBJ  " : "\n                        "
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
          console.log(`%c${indent}${key}: ${value}`, css)
        else console.log(`%c${indent}${key}: ${value}}`, css)
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

/** @classdesc superclass for all foty errors (but not unit test errors).
 * <p>
 * Additionally to the {@link external:Error} properties <code>FotyError</code>
 * receives callers name as string on construction.
 * @extends external:Error
 */
class FotyError extends Error {
  static #nl = "\n     "
  /** Newline for multi line error messages
   * <p>
   * As shorthand {@link NL} can be used.<br>
   * @type {String}
   */
  static get nl() {
    return FotyError.#nl
  }

  /** Set on construction. Will be part of {FotyError#errOut|output message}.
   * @type {String}
   */
  #caller = ""

  /** Constructs a FotyError instance, with
   * <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/name|Error.name&#x2348;}</code>
   * set to "Foty Error".
   *
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
  /** Puts error information formatted to {@link YAML} properties.
   * <p>
   * If {@link cnt} is a number, {@link YAML} keys will be created using this
   * number, otherwise fully hardcoded keys will be used.
   * <p>
   * The key which's value contains the <code>{@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/message|message&#x2348;}</code>
   * is returned.
   *<p>
   * <b>Usage of cnt</b>
   * Frontmatter output to current note works with 'key: value'.<br>
   * In production mode no cnt argument should be given. A short key for e.name
   * and another for e.message will created. They are added to YAML.
   * In every call always the same keys are used. This means, that only the last
   * message is contained in YAML.
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
  /** Puts error information formatted to {@link YAML} properties.
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
  /** Creates and returns key for this instances name in dependence of value of {@link cnt}.
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
  /** Creates and returns key for error name in dependence of value of {@link cnt}.
   * @param {(undefined|Number)} cnt
   * @returns {String}
   */
  static getNameKey(cnt) {
    return cnt === undefined || typeof cnt != "number"
      ? "????"
      : cnt.pad() + "?"
  }
  /** Creates and returns key for error msg in dependence of value of {@link cnt}.
   * @param {(undefined|Number)} cnt
   * @returns {String}
   */
  static getMsgKey(cnt) {
    return cnt === undefined || typeof cnt != "number"
      ? "\u00A8\u00A8\u00A8\u00A8"
      : cnt.pad() + "\u00A8"
  }
  /** Creates and returns key for separator in dependence of value of {@link cnt}.
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
  /** Appends user message if given to output object.
   * @param {Object} YAML
   * @param {Undefined|Number} cnt
   */
  errOut(YAML, cnt) {
    cnt = cnt === undefined ? 0 : cnt
    let msgKey = super.errOut(YAML, cnt)
    if (this.usrMsg.length > 0)
      YAML[msgKey] += NL + this.usrMsg.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")
  }
  /** Returns subclass specific name.
   * @param {Undefined|Number} cnt
   * @returns {String}
   */
  getNameKey(cnt) {
    return cnt === undefined ? "_ERR" : cnt.pad(4)
  }
  /** prettier-ignore jsdoc shall not add caller as override
   * @ignore */ caller
}

/** @classdesc Programming error.
 * <p>
 * Some errors only can occur if code is wrong. If this is for sure,
 * CodingError should be thrown.
 * @extends FotyError
 */
class CodingError extends FotyError {
  /** Constructs a CodingError instance,
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
  /** prettier-ignore jsdoc shall not add errOut as override
   * @ignore */ errOut(YAML, cnt) {}
  /** prettier-ignore jsdoc shall not add caller as override
   * @ignore */ caller
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
//prettier-ignore
function testGlobals(outputObj) {
  let _
  _ = new TestSuite("Globals", outputObj)
  _.run(flattenTest)
  _.run(areEqualTest)
  _.destruct()
  _ = null
  function flattenTest() {
    let obj0 = {}
    let flat0 = flatten(obj0)
    let exp0 = obj0.toString()
    _.bassert(1,flat0 == exp0, "empty object should be same as toString output")
  }
  function areEqualTest() {
    let obj1 = {}
    let obj1_0 = {}
    let obj1_1 = {a}
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

/** @classdesc Gene is type used in this application.
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

/** @classdesc Collection of  Genes.
 * <p>
 * Stores  {@link Gene}s. The default {@link GeneCallback|callback} function for newly created
 * {@link Gene}s is '{@link cbkTypeOfLc}'. (Whereas the default {@link GeneCallback}|callback)
 * function for plain {@link Gene}s is '{@link cbkTypeOf}').
 * '.
 */
class GenePool {
  #genes = {}
  #defaultCallback = cbkInstanceOf

  /** Creates new instance of {@link GenePool}.
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
    while (params.length > 0) this.add(params.shift(), this.#defaultCallback)
  }

  /** Adds {@link ident} as new Gene with {@link cbk} as {@link GeneCallback|callback} function.
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
  add(ident, cbk) {
    if (this.#genes[ident] === undefined)
      this.#genes[ident] = new Gene(
        ident,
        cbk === undefined ? this.#defaultCallback : cbk
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
   * Returns false, if {@link ident} is no {@link Gene} of this pool.
   * <p>
   * {@link ident}s, which are strings, compounds {@link ident}s are possible:<br>
   * - ({@link ident1}|{@link ident2}|{@link ident3})<br>
   * - Array.&lt;{@link ident1}&gt;<br>
   * - combination of both
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
      if (!this.has(ident)) return false
      return this.#genes[ident].is(v)
    }
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
      let gn = gns.add("Number")
      let gn2
      _.bassert(1, gn = gns.add("Number"),"Trying to add existing Gene should return it")
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
      _.bassert(11, gnNull = gns.add(idNull),"null should be added")
      _.bassert(12, gnUndE = gns.add(idUndE),"null should be added")
      _.bassert(13, gnBool = gns.add(idBool),"null should be added")
      _.bassert(14, gnNumb = gns.add(idNumb),"null should be added")
      _.bassert(15, gnBigI = gns.add(idBigI),"null should be added")
      _.bassert(16, gnStrI = gns.add(idStrI),"null should be added")
      _.bassert(17, gnSymB = gns.add(idSymB),"null should be added")
      _.bassert(18, gnFunc = gns.add(idFunc),"null should be added")
      _.bassert(19, gnObjE = gns.add(idObjE),"null should be added")


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
      _.bassert(1,gns.has("Number"),"'Number' was given to constructor")
      _.bassert(2,!gns.has("number"),"'number' was not given to constructor")
      _.bassert(3,!gns.has("string"),"'string' was not given to constructor")
      _.bassert(4,!gns.has(),"undefined is not given to constructor")
      _.bassert(5,!gns.has({}),"'{}' is not given to constructor")

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
      gns2.add(idNull)
      gns2.add(idUndE)
      gns2.add(idBool)
      gns2.add(idNumb)
      gns2.add(idBigI)
      gns2.add(idStrI)
      gns2.add(idSymB)
      gns2.add(idFunc)
      gns2.add(idObjE)
      _.bassert(11,gns2.has(idNull), "id had been added")
      _.bassert(12,gns2.has(idUndE), "id had been added")
      _.bassert(13,gns2.has(idBool), "id had been added")
      _.bassert(14,gns2.has(idNumb), "id had been added")
      _.bassert(15,gns2.has(idBigI), "id had been added")
      _.bassert(16,gns2.has(idStrI), "id had been added")
      _.bassert(17,gns2.has(idSymB), "id had been added")
      _.bassert(18,gns2.has(idFunc), "id had been added")
      _.bassert(19,gns2.has(idObjE), "id had been added")
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
      gns3.add(idNull,cbkNull)
      gns3.add(idUndE,cbkUndE)
      gns3.add(idBool,cbkBool)
      gns3.add(idNumb,cbkNumb)
      gns3.add(idBigI,cbkBigI)
      gns3.add(idStrI,cbkStrI)
      gns3.add(idSymB,cbkSymB)
      gns3.add(idFunc,cbkFunc)
      gns3.add(idObjE,cbkObjE)
      
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

/** @classdesc Essence is unrecognizable except through me.
 * Reads and stores specification properties and removes them from literal.
 * So __SPEC becomes essence and nobody will no longer be bothered by it.
 * Essence is always there. Either as found in __SPEC or as given from parent (if one)
 * or hardcoded default. If some __SPEC entry has wrong  {@link Gene} it will be
 * {@link Essence#skipped|skipped} and parent essence or (if no parent)
 * hardcoded essence will be used.
 * <p>
 * Essence has to do with two {@link GenePool}s. The one that it is and that it's
 * subclasses will be. And the one it uses to remove _SPEC from the literal given
 * to it.
 * <p>
 * All known keys in the literals __SPEC object are changed to invisible and unremovable
 * properties of this instance, which represents the literal for subclass instances.
 * They also are added to the literal containing the __SPEC object as invisible
 * and unremovable properties. Those can be questioned using static get functions
 * ({@link Essence.getDEFAULT} - {@link Essence.getVALUE})
 * of {@link Essence}
 * <p>
 * <b>For clarity</b>
 * In fact, this is not Essence but a Essence, as it is specialized. It could be
 * called UserEssence. But as I only need this special case of Essence, I do not
 * build the general class. I even do not know, how I should realize it, so that
 * the members are described generalized and could be created specialized. I would
 * need a member generation procedure in the general Essence, to build the
 * members used in the special essence, e.g. for this UserEssence ROOT or RENDER.
 */
class Essence extends GenePool {
  /** ROOT essence, set automatically
   * @type {Boolean}
   */
  get ROOT() {
    return this[Essence.#pre + "ROOT"]
  }
  /** RENDER essence, inherited
   * @type {Boolean}
   */
  get RENDER() {
    return this[Essence.#pre + "RENDER"]
  }
  /** TYPE essence, individual
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
  //@todo DEFAULTS, individual
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
  /** private member SPEC key
   * @type {String}
   */
  static #SPEC_KEY = "__SPEC"
  static #RENDER_DEFT = false
  static #TYPE_DEFT = "String"
  static #DEFAULT_DEFT = ""
  static #VALUE_DEFT = ""
  static #IGNORE_DEFT = false
  static #FLAT_DEFT = false
  static #LOCAL_DEFT = false
  static #ONCE_DEFT = false
  static #REPEAT_DEFT = false
  #skipped = [] //[{.name,.value,.expectedType}]

  /** Creates {@link Essence} instance,
   * removes {@link Essence#SPEC_KEY|__SPEC} property from {@link literal} and
   * removes all <code>__SPEC properties</code> from literal if value of
   * {@link Essence#SPEC_KEY|__SPEC} property is no {@link Object}.
   * <p>
   * Adds {@link Object}, {@link Gene}, {@link GenePool} and {@link Essence}
   * to its pool as Genes with {@link GeneCallback|callback} {@link cbkInstanceOf}.
   * <p>
   * <p> Recognizes <code>__SPEC properties</code>
   * ({@link Essence#DEFAULT|DEFAULT} - {@link Essence#VALUE|VALUE})
   * in {@link literal}.<br>
   * Adds <code>__SPEC properties</code> from {@link literal} as hidden properties
   * to this instance and {@link literal}.<br>
   * Adds hidden properties which are not given in {@link literal}
   * with parent value (if inherited) or hardcoded default value
   * to this instance and {@link literal}.
   * <p>
   * Recognized {@link Essence#SPEC_KEY|__SPEC} properties are:
   * {@link Essence#RENDER|RENDER} (inherited),
   * {@link Essence#TYPE|TYPE} (inherited),
   * {@link Essence#DEFAULT|DEFAULT},
   * {@link Essence#VALUE|VALUE},
   * {@link Essence#IGNORE|IGNORE} (inherited),
   * {@link Essence#FLAT|FLAT},
   * {@link Essence#LOCAL|LOCAL} (inherited),
   * {@link Essence#ONCE|ONCE} and
   * {@link Essence#REPEAT|REPEAT}.
   * Additionally {@link Essence#ROOT|ROOT} is added, dependent whether {@link parent}
   * is defined. Other entries in {@link literal} are ignored.
   * <p>
   * Values in literal with wrong type (e.g. if value of Essence#RENDER|RENDER}
   * is <code>yes</code>) will be skipped and added to {@link skipped}.
   * @param {(Undefined|Object)} literal
   * @param {(Undefined|GenePool)} parent
   * @throws TypeError
   */
  constructor(literal, parent) {
    super()
    this.add(Object)
    this.add(Gene)
    this.add(GenePool)
    if (parent != undefined && !this.isA(parent, GenePool))
      throw new TypeError(
        `function 'Essence.constructor'${NL}2nd parameter '${parent}' is not of type 'GenePool'`
      )
    if (literal != undefined && typeof literal != "object")
      throw new TypeError(
        `function 'Essence.constructor'${NL}1st parameter '${literal}' is not of type 'Object'`
      )
    this.add(Essence)

    let un
    let p = parent
    let specLit = {}
    if (literal != un) specLit = literal[Essence.#SPEC_KEY]
    if (typeof specLit == "boolean") specLit = literal
    if (specLit === un) specLit = {}

    function changeToHiddenProp(me, lit, specLit, key, type, p, def, val) {
      let v
      if (val != undefined) v = val
      else {
        let given = specLit[key]
        delete specLit[key]
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
      if (lit !== undefined)
        // Add hidden property to containing literal
        Object.defineProperty(lit, Essence.#pre + key, {
          value: v,
          writable: false,
          configurable: false,
          enumerable: false,
        })
    }
    let hide = changeToHiddenProp
    let lit = literal
    hide(this, lit, specLit, "ROOT", "Boolean", p, un, parent == un)
    hide(this, lit, specLit, "RENDER", "Boolean", p, Essence.#RENDER_DEFT)
    hide(this, lit, specLit, "TYPE", "String", p, Essence.#TYPE_DEFT)
    hide(this, lit, specLit, "IGNORE", "Boolean", p, Essence.#IGNORE_DEFT)
    hide(this, lit, specLit, "FLAT", "Boolean", un, Essence.#FLAT_DEFT)
    hide(this, lit, specLit, "LOCAL", "Boolean", p, Essence.#LOCAL_DEFT)
    hide(this, lit, specLit, "ONCE", "Boolean", un, Essence.#ONCE_DEFT)
    hide(this, lit, specLit, "REPEAT", "Boolean", un, Essence.#REPEAT_DEFT)
    hide(this, lit, specLit, "DEFAULT", this.TYPE, un, Essence.#DEFAULT_DEFT)
    hide(this, lit, specLit, "VALUE", this.TYPE, un, Essence.#VALUE_DEFT)

    if (literal != un) delete literal[Essence.#SPEC_KEY]
  }

  /** Returns {@link Essence} for <code>atomic literal</code>,
   * <code>undefined</code> for <code>node literal</code>
   * <p>
   * If value of {@link Essence#SPEC_KEY|__SPEC} property
   * of {@link literal}[{@link key}] is
   * <code>undefined</code> or an {@link Object}
   * {@link literal} is <code>node literal</code>,
   * in any other case it is <code>atomic literal</code>
   * <p>
   * For atomic literals:<br>
   * If value of {@link Essence#SPEC_KEY|__SPEC} is true,
   * {@link Essence#TYPE|TYPE} property with value  {@link type}
   * is added to {@link literal}[{@link key}]. This only if {@link type}
   * is a <code>String</code>. Nothing is added in any other case.<br>
   * A new {@link Essence} from (possibly changed, see above){@link literal}[{@link key}]
   * is created with <code>this</code> instance as parent.<br>
   * Value of {@link literal}[{@link key}] becomes {@link Essence#VALUE|VALUE} of
   * this newly created instance.
   * <p>
   * Returns <code>undefined</code> on wrong parameter types
   * <p><b>Simply said:</b> Changes value of {@link literal}[{@link key}]
   * to given {@link Essence#VALUE|VALUE}.
   * @param {Object} literal
   * @param {*} key
   * @param {String} type
   * @returns {(Essence|Undefined)}
   */
  essenceOfAtom(literal, key, type) {
    let un
    let aEss = undefined
    if (typeof literal != "object") return undefined
    let specLit = literal[key][Essence.#SPEC_KEY]
    if (specLit != un && (specLit === null || typeof specLit != "object")) {
      if (specLit == true && typeof type == "string")
        literal[key]["TYPE"] = type
      aEss = new Essence(literal[key], this)
      literal[key] = aEss.VALUE
    }
    return aEss
  }
  #validateOrInform(value, type, name) {
    let ok = value === undefined || this.#userPool.isA(value, type)
    if (!ok) {
      let errObj = {}
      errObj.name = name
      errObj.value = value
      errObj.expectedType = type
      this.#skipped.push(errObj)
    }
    return ok
  }

  /** ROOT essence, set automatically
   * @param {Object} lit
   * @type {Boolean}
   */
  static getROOT(lit) {
    return lit[Essence.#pre + "ROOT"]
  }
  /** RENDER essence, inherited
   * @param {Object} lit
   * @type {Boolean}
   */
  static getRENDER(lit) {
    return lit[Essence.#pre + "RENDER"]
  }
  /** TYPE essence, individual
   * @param {Object} lit
   * @type {String}
   */
  static getTYPE(lit) {
    return lit[Essence.#pre + "TYPE"]
  }
  /** DEFAULT essence, individual<br>
   *  is of type given in {@link Essence#TYPE|Essence.TYPE}
   * @param {Object} lit
   * @type {*}
   */
  static getDEFAULT(lit) {
    return lit[Essence.#pre + "DEFAULT"]
  }
  /** VALUE essence, individual<br>
   *  is of type given in {@link Essence#TYPE|Essence.TYPE}
   * @param {Object} lit
   * @type {*}
   */
  static getVALUE(lit) {
    return lit[Essence.#pre + "VALUE"]
  }
  /** IGNORE essence, inherited
   * @param {Object} lit
   * @type {Boolean}
   */
  static getIGNORE(lit) {
    return lit[Essence.#pre + "IGNORE"]
  }
  /** FLAT essence, inherited
   * @param {Object} lit
   * @type {Boolean}
   */
  static getFLAT(lit) {
    return lit[Essence.#pre + "FLAT"]
  }
  /** LOCAL essence, individual
   * @param {Object} lit
   * @type {Boolean}
   */
  static getLOCAL(lit) {
    return lit[Essence.#pre + "LOCAL"]
  }
  /** ONCE essence, individual
   * @param {Object} lit
   * @type {Boolean}
   */
  static getONCE(lit) {
    return lit[Essence.#pre + "ONCE"]
  }
  /** REPEAT essence, individual
   * @param {Object} lit
   * @type {Boolean}
   */
  static getREPEAT(lit) {
    return lit[Essence.#pre + "REPEAT"]
  }

  //prettier-ignore
  static test(outputObj) {
    let _ = null
    if(_ = new TestSuite("Essence", outputObj)) {
      _.run(getterEssencesTest)
      _.run(constructorTest)
      _.run(isATest)
      _.run(getEssencesTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
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
      let wrong1 = new Essence({__SPEC: {RENDER:"abc"}})
      let wrong2 = new Essence({__SPEC: {IGNORE:"abc"}})
      let wrong3 = new Essence({__SPEC: {ONCE:"abc"}})
      let wrong4 = new Essence({__SPEC: {FLAT:"abc"}})
      let wrong5 = new Essence({__SPEC: {LOCAL:"abc"}})
      let wrong6 = new Essence({__SPEC: {REPEAT:"abc"}})
      let wrong7 = new Essence({__SPEC: {TYPE:false}})
      let wrong8 = new Essence({__SPEC: {DEFAULT:false}})
      let wrong9 = new Essence({__SPEC: {VALUE:false}})
      let wrong10 = new Essence({__SPEC: {NO_SPEC_KEY:false}})
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
      let ess1 = new Essence(lit)
      _.bassert(33,lit.__SPEC === undefined,"SPEC should no longer be defined")
      _.bassert(34,lit.myValue != undefined,"just to show it is still defined")

      _.shouldAssert(41,_tryConstruct2,{__SPEC: {RENDER:true}},new Error(),"Should not be constructed")
      _.assert(42,_tryConstruct2,{__SPEC: {RENDER:true}},ess1,"Should be constructed")    
    }
    function getterEssencesTest() {
      let ess0 = new Essence()
      _.bassert(1,ess0.ROOT===true,"Should always be defined")
      _.bassert(2,ess0.RENDER===false,"Should always be defined")
      _.bassert(3,ess0.IGNORE===false,"Should always be defined")
      _.bassert(4,ess0.ONCE===false,"Should always be defined")
      _.bassert(5,ess0.FLAT===false,"Should always be defined")
      _.bassert(6,ess0.LOCAL===false,"Should always be defined")
      _.bassert(7,ess0.REPEAT===false,"Should always be defined")
      _.bassert(8,ess0.TYPE==="String","Should always be defined")
      _.bassert(9,ess0.DEFAULT==="","Should always be defined")
      _.bassert(10,ess0.VALUE==="","Should always be defined")
      let lit1 = {__SPEC: {RENDER:true,
                           IGNORE:true,
                           ONCE:true,
                           FLAT:true,
                           LOCAL:true,
                           REPEAT:true,
                           TYPE:"Boolean",
                           DEFAULT:false,
                           VALUE:false}}
      let ess1 = new Essence(lit1)
      _.bassert(11,ess1.ROOT===true,"Should always be defined")
      _.bassert(12,ess1.RENDER===true,"Should be set to literal value")
      _.bassert(13,ess1.IGNORE===true,"Should be set to literal value")
      _.bassert(14,ess1.ONCE===true,"Should be set to literal value")
      _.bassert(15,ess1.FLAT===true,"Should be set to literal value")
      _.bassert(16,ess1.LOCAL===true,"Should be set to literal value")
      _.bassert(17,ess1.REPEAT===true,"Should be set to literal value")
      _.bassert(18,ess1.TYPE==="Boolean","Should be set to literal value")
      _.bassert(19,ess1.DEFAULT===false,"Should be set to literal value")
      _.bassert(20,ess1.VALUE===false,"Should be set to literal value")
      let ess2 = new Essence(undefined,ess1)
      _.bassert(21,ess2.ROOT===false,"Should always be defined")
      _.bassert(22,ess2.RENDER===true,"Should be set to parent value")
      _.bassert(23,ess2.IGNORE===true,"Should be set to parent value")
      _.bassert(24,ess2.ONCE===false,"Should be set to default value")
      _.bassert(25,ess2.FLAT===false,"Should be set to default value")
      _.bassert(26,ess2.LOCAL===true,"Should be set to parent value")
      _.bassert(27,ess2.REPEAT===false,"Should be set to default value")
      _.bassert(28,ess2.TYPE==="Boolean","Should be set to parent value")
      _.bassert(29,ess2.DEFAULT==="","Should be set to default value")
      _.bassert(30,ess2.VALUE==="","Should be set to default value")
    }
    function isATest() {
      let ess1 = new Essence()
      let gn1 = new Gene("abc")
      // Object, Gene, GenePool, Essence added for each Essence instance
      _.bassert(1,ess1.isA(ess1,Essence),"Essence should be Essence")
      _.bassert(2,ess1.isA(ess1,GenePool),"Essence should be GenePool")
      _.bassert(3,ess1.isA(ess1,Object),"Essence should be Object")
      _.bassert(4,ess1.isA(gn1,Object),"Gene should be Object")
      _.bassert(5,ess1.isA(gn1,Gene),"Gene should be Gene")

      _.bassert(11,!ess1.isA(new Error(),Error),"should return false for Error, as not in pool")
      _.bassert(12,!ess1.isA("String",String),"should return false for string, as not in pool")
      _.bassert(13,!ess1.isA("String","String"),"should return false for string, as not in pool")
      _.bassert(14,!ess1.isA("String","string"),"should return false for string, as not in pool")
      _.bassert(15,!ess1.isA("String",Object),"should return false as string is not an Object")
    }
    function getEssencesTest() {
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
      new Essence(lit1)
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
      _.bassert(30,Object.keys(lit1).length === 0,"Hidden properties are not enumerable")
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
registeredExceptions.push(
  "new Essence({}, new Error())",
  "new Essence('thisIsNotAnObject')"
)

//#endregion Gene, Pool and Essence
//#region code

/**@classdesc Parsing tree superclass.
 * <p>
 * As shorthand {@link BC} can be used.
 */
class BreadCrumbs extends Essence {
  static sep = " \u00BB " // breadcrumbs separator (or \u2192 ?)
  #ident
  #caller
  #literal
  /** Returns literal given in BreadCrumbs constructor, __SPEC property removed.
   * @returns {Object}
   */
  get literal() {
    return this.#literal
  }
  /** Creates new instance.
   * <p>
   * Adds {@link BreadCrumbs}
   * to its pool as Gene with {@link GeneCallback|callback} {@link cbkInstanceOf}.<br>
   * Adds <code>undefined</code>, <code>boolean</code>, <code>number</code>,
   * <code>bigint</code>, <code>string</code>, <code>symbol</code>
   * and <code>function</code> to this pool with
   * {@link GeneCallback|callback} {@link cbkTypeOf}.<br>
   * Adds <code>object</code> with {@link GeneCallback|callback} {@link cbkIsObjectNotNullNotArray},
   * <code>null</code> with {@link GeneCallback|callback} {@link cbkIsNull}
   * and <code>array</code> with {@link GeneCallback|callback} {@link cbkIsNull}
   * to this pool.
   * @param {(Undefined|Object)} literal
   * @param {(String|Symbol)} key
   * @param {(Undefined|BreadCrumbs)} parent
   */
  constructor(literal, key, parent) {
    let un
    super(literal, parent)
    this.add(BreadCrumbs)
    this.add("undefined", cbkTypeOf)
    this.add("null", cbkIsNull)
    this.add("boolean", cbkTypeOf)
    this.add("number", cbkTypeOf)
    this.add("bigint", cbkTypeOf)
    this.add("string", cbkTypeOf)
    this.add("symbol", cbkTypeOf)
    this.add("function", cbkTypeOf)
    this.add("object", cbkIsObjectNotNullNotArray)
    this.add("array", cbkIsArray)
    if (!this.isA(parent, "undefined"))
      this.throwIfNotOfType(parent, "parent", BreadCrumbs)
    this.#caller = parent
    this.throwIfUndefined(key, "key")
    this.throwIfNotOfType(key, "key", "(string|symbol)")
    if (typeof key === "symbol") this.#ident = "Symbol"
    this.#ident = key
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

  /** Returns string representing class instance for BreadCrumbs and derived instances .
   * @returns {String} string containing class name of deepest subclass and key
   *          as given in BreadCrumbs constructor.
   */
  toString() {
    if (typeof this.#ident === "string")
      return "°°°" + this.constructor.name + " " + this.#ident
    else if (typeof this.#ident === "symbol")
      return "°°°" + this.constructor.name + " " + "Symbol"
  }

  /** Returns line of ancestors with keys given in BreadCrumbs constructor.
   *
   * For this instance and its ancestors keys are returned, separated by
   * {@link BreadCrumbs.sep}.
   * @returns {String}
   */
  toBreadcrumbs() {
    let breadcrumbs = ""
    let sep = ""
    if (!this.isA(this.#caller, "undefined")) {
      if (this.isA(this.#caller, BreadCrumbs))
        breadcrumbs += this.#caller.toBreadcrumbs()
      else breadcrumbs += "(" + this.#caller + ")"
      sep = BC.sep
    }
    breadcrumbs += sep + this.#ident
    return breadcrumbs
  }

  /** Throws if {@link val} is strictly undefined (null is defined).
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

  /** Throws if val is not of type or compound type, if type is defined with string.
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
    function constructorTest() {
      let un
      _.assert(1,_tryConstruct,un,"myName1",un, "undefined for literal, string for name, undefined for parent should construct")
      _.assert(2,_tryConstruct,{},"myName2",un, "empty object for literal should construct")
      _.shouldAssert(3,_tryConstruct,2,"myName3",un, "number for literal should not construct")
      _.shouldAssert(4,_tryConstruct,null,"myName4",un, "null for literal should not construct")
      _.assert(5,_tryConstruct,new Error(),"myName5",un, "any class for literal should construct")
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
      _.bassert(103,breadcrumbs.constructor === BreadCrumbs,"the constructor property is not 'BreadCrumbs'")
    }
    function isATest() {
      // Object, Gene, GenePool, Essence added for each Essence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      let un
      let bc = new BreadCrumbs(un, "NameIsATest")
      _.bassert(1,bc.isA(new BreadCrumbs(un, "NameIsATest"),BreadCrumbs),"BreadCrumbs instance should be a BreadCrumbs")
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

      _.bassert(21,!bc.isA(null,"undefined"),"should be registered and fail")
      _.bassert(22,!bc.isA(undefined,"null"),"should be registered and fail")
      _.bassert(23,!bc.isA(null,"boolean"),"should be registered and fail")
      _.bassert(24,!bc.isA(12n,"number"),"should be registered and fail")
      _.bassert(25,!bc.isA(12,"bigint"),"should be registered and fail")
      _.bassert(26,!bc.isA(String,"string"),"should be registered and fail")
      _.bassert(27,!bc.isA({},"symbol"),"should be registered and fail")
      _.bassert(28,!bc.isA({},"function"),"should be registered and fail")
      _.bassert(29,!bc.isA([],"object"),"should be registered and fail")
      _.bassert(30,!bc.isA({},"array"),"should be registered and fail")
      _.bassert(31,!bc.isA(null,"object"),"should be registered and fail")
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
      _.bassert(1,parentStr === "parent1","breadCrumbs '" + parentStr + "' are wrong")
      _.bassert(2,childStr === "parent1"+ sep +"child1","breadCrumbs '" + childStr + "' are wrong")
      _.bassert(3,grandChildStr === "parent1"+sep+"child1"+sep+"grandChild1","breadCrumbs '" + grandChildStr + "' are wrong")
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
      let bc = new BreadCrumbs({},"testThrowNotOfType")
      _.assert      (1,_tryThrowIfNotOfType,bc,22 ,"vName","number",un,un,un,"should accept all types for all parameter, besides 2nd")
      _.shouldAssert(2,_tryThrowIfNotOfType,bc,22 ,"vName",un,un, un,un,"should throw for 22 and no type given")
      _.shouldAssert(3,_tryThrowIfNotOfType,bc,str,"vName", "String", "test",un,un,"should throw as 'String' is no valid type to check against")
      _.assert      (4,_tryThrowIfNotOfType,bc,str,"vName", "(String|string)", "test",un,un,"should not throw as 'string' is correct type and is contained in 2nd parameter")
    }
    function _tryConstruct(arg1, arg2,arg3) {
      new BreadCrumbs(arg1,arg2,arg3)
    }
    function _tryThrowIfUndefined(arg1, arg2, arg3, arg4) {
      let breadCrumbs = new BreadCrumbs({},"key")
      breadCrumbs.throwIfUndefined(arg1, arg2, arg3, arg4)
    }
    function _tryThrowIfNotOfType(bc,arg1, arg2, arg3, arg4,arg5,arg6) {
      bc.throwIfNotOfType(arg1, arg2, arg3, arg4,arg5,arg6)
    }
  }
}
/** shorthand for {@link BreadCrumbs} */
var BC = BreadCrumbs
registeredTests.push(BreadCrumbs.test)
registeredExceptions.push(
  "new BreadCrumbs({},'goodName', new GenePool())",
  "new BreadCrumbs({}, undefined, undefined)",
  "new BreadCrumbs({}, 22, undefined)",
  "new BreadCrumbs(22,'goodName', undefined)"
)

/** setting parser; traverses deep literal to flat output
 * @classdesc
 * Setting is the only subclass which should be constructed from outside, with
 * only literal given as argument.
 *
 * It calls the workers and traverses given literal to flat output; thereby
 * respecting worker configuration rules and removing worker literals from
 * output.
 *
 */
class Setting extends BreadCrumbs {
  static #ROOT_KEY = "/"
  static #workers = {}
  #works = {}
  #children = {}
  #atoms = {}
  #frontmatterYAML = {}
  #renderYAML = {}
  static #generalType =
    "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>)"
  /** Workers registers by setting themselves <code>Setting.worker = WorkerClass</code>
   * @type {Object.<string, Setting>}
   * @param {Setting} workerClass
   */
  static set worker(workerClass) {
    Setting.#workers[workerClass.workerKey] = workerClass
  }
  /** Returns all frontmatter entries of this instance (not filtered by type)
   * @returns {Object.<String.any>}
   */
  get frontmatterYAML() {
    return this.#frontmatterYAML
  }
  /** Returns all render entries of this instance (not filtered by type)
   * @returns {Object.<String.any>}
   */
  get renderYAML() {
    return this.#renderYAML
  }

  /** Constructs a new Setting instance.
   * Adds {@link Setting}
   * to its pool as Gene with {@link GeneCallback|callback} {@link cbkInstanceOf}.
   * <p>
   * Recurses into {@link Object} entries and creates {@link Setting} instances
   * for them with <code>this</code> instance as parent and entry key as {@link key}.
   * <p>
   * Creates {@link Essence} instances for all other entries.
   * <p>
   * Throws on wrong parameter types
   * @param {Object} literal
   * @param {(Undefined|String|Symbol)} key - if undefined, becomes root key
   * @param {(Undefined|Setting)} parent
   * @throws {SettingError}
   */
  constructor(literal, key = undefined, parent = undefined) {
    let un
    super(literal, key === undefined ? Setting.#ROOT_KEY : key, parent)
    this.add(Setting)
    this.throwIfUndefined(literal, "literal")
    // literal {(Undefined|Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|BreadCrumbs)} checked by superclass
    if (!this.isA(parent, "undefined"))
      this.throwIfNotOfType(parent, "parent", Setting)
    this.#parse()
  }
  #parse() {
    let un
    for (const [key, value] of Object.entries(this.literal)) {
      let type = Setting.#generalType
      if (Setting.#isWorkerKey(key)) {
        this.#works[key] = new Setting.#workers[key](value, key, this)
        this.#works[key].parse()
        continue
      }
      if (this.isA(value, "object")) {
        let aEss = this.essenceOfAtom(this.literal, key, type)
        if (aEss != un) this.#atoms[key] = aEss
        else this.#children[key] = new Setting(value, key, this)
      } else {
        let litAtom = {VALUE: this.literal[key], __SPEC: true}
        this.literal[key] = litAtom
        this.#atoms[key] = this.essenceOfAtom(this.literal, key, type)
      }
      if (this.#atoms[key] != undefined) {
        if (this.#atoms[key].RENDER) this.#renderYAML[key] = this.literal[key]
        else this.#frontmatterYAML[key] = this.literal[key]
      }
    }
  }
  getValue(worker, valueKey, ...params) {
    if (this.#works[worker] !== undefined) {
      return this.#works[worker].getValue(valueKey, params)
    }
  }

  /** Returns all frontmatter entries of this instance and descendants
   * @returns  {Object.<String.any>}
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
   * @returns  {Object.<String.any>}
   */
  getRenderYAML() {
    let renderYAML = {}
    Object.assign(renderYAML, this.#renderYAML)
    for (const [key, value] of Object.entries(this.#children)) {
      Object.assign(renderYAML, value.getRenderYAML())
    }
    return renderYAML
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
      _.run(getterFrontmatterYAMLTest)
      _.run(getterRenderYAMLTest)
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.run(getFrontmatterYAMLTest)
      _.run(getRenderYAMLTest)
      _.run(deepLiteralTest)
      _.destruct()
    _ = null
    }
    function getterLiteralTest() {
      let un
      let sym = Symbol("a")
      let setting1 = new Setting({},"getterLiteralTest02",un)
      let setting2 = new Setting({sym: {}},"getterLiteralTest03",un)
      let setting3 = new Setting({"__NOTE_TYPES": {}},"getterLiteralTest04",un)
      let setting4 = new Setting({"a": {"MARKER":"2"}},"getterLiteralTest05",un)
      let setting5 = new Setting({"a": {"MARKER":"2","DATE":true,}},"getterLiteralTest06",un)
      let setting6 = new Setting({"a": {MARKER:"2",DATE:false,},"d": {TITLE_BEFORE_DATE:"abc"}},"getterLiteralTest07",un)
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
      _.bassert(1,JSON.stringify(answ1f) === expAnsw1f,`output of JSON.stringify(result) is:'${JSON.stringify(answ1f)}',but should be:'${expAnsw1f}'`)
      _.bassert(2,JSON.stringify(answ2f) === expAnsw2f,`output of JSON.stringify(result) is:'${JSON.stringify(answ2f)}',but should be:'${expAnsw2f}'`)
      _.bassert(3,JSON.stringify(answ3f) === expAnsw3f,`output of JSON.stringify(result) is:'${JSON.stringify(answ3f)}',but should be:'${expAnsw3f}'`)
      _.bassert(4,JSON.stringify(answ4f) === expAnsw4f,`output of JSON.stringify(result) is:'${JSON.stringify(answ4f)}',but should be:'${expAnsw4f}'`)
      _.bassert(5,JSON.stringify(answ5f) === expAnsw5f,`output of JSON.stringify(result) is:'${JSON.stringify(answ5f)}',but should be:'${expAnsw5f}'`)

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
      _.bassert(1,JSON.stringify(answ1) === expAnsw1,`output of JSON.stringify(result) is:'${JSON.stringify(answ1)}',but should be:'${expAnsw1}'`)
      _.bassert(2,JSON.stringify(answ2) === expAnsw2,`output of JSON.stringify(result) is:'${JSON.stringify(answ2)}',but should be:'${expAnsw2}'`)
      _.bassert(3,JSON.stringify(answ3) === expAnsw3,`output of JSON.stringify(result) is:'${JSON.stringify(answ3)}',but should be:'${expAnsw3}'`)
      _.bassert(4,JSON.stringify(answ4) === expAnsw4,`output of JSON.stringify(result) is:'${JSON.stringify(answ4)}',but should be:'${expAnsw4}'`)
    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "constructorTest", un)
      let st = new Setting({}, "constructorTest1", un)
      _.assert(1,_tryConstruct,{},"cTest1",un,"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",un,"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",un,"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",un,"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",un,"should not be created, literal is null")
      _.assert(6,_tryConstruct,{},un,un,"should be created, undefined key is ok")
      _.shouldAssert(7,_tryConstruct,{},22,un,"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},un,"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,un,"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),un,"should be created, key is Symbol")
      _.assert(11,_tryConstruct,{},"cTest11",un,"should  be created, undefined parent is ok")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",b,"should not be be created, parent is BreadCrumbs")
      let setting = new Setting({},"constructorTest101")
      _.bassert(101,setting instanceof Object,"'Setting' has to be an instance of 'Object'")
      _.bassert(102,setting instanceof BreadCrumbs,"'Setting' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,setting instanceof Setting,"'Setting' has to be an instance of 'Setting'")
      _.bassert(104,setting.constructor === Setting,"the constructor property is not 'Setting'")
    }
    function isATest() {
      // Object, Gene, GenePool, Essence added for each Essence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      // Setting added for each Setting instance
      let un
      let setting1 = new Setting({},"NameIsATest",un)
      _.bassert(1,setting1.isA(setting1,"object"), "'" + setting1 + "' should be a " + "object")
      _.bassert(2,setting1.isA(setting1,Object), "'" + setting1 + "' should be a " + "Object")
      _.bassert(3,setting1.isA(setting1,BreadCrumbs), "'" + setting1 + "' should be a " + "BreadCrumbs")
      _.bassert(4,setting1.isA(setting1,Setting), "'" + setting1 + "' should be a " + "Setting")
      _.bassert(5,!setting1.isA(setting1,Error), "'" + setting1 + "' should not be a " + "Error")
      _.bassert(7,!setting1.isA(setting1,Gene), "'" + setting1 + "' should not be a " + "Gene")
    }
    function toStringTest() {
      let un
      let setting1 = new Setting({},"toStringTest1",un)
      _.bassert(1,setting1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,setting1.toString().includes("Setting"),"result does not contain class string"    )
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
      _.bassert(1,JSON.stringify(answ1) === expAnsw1,`output of JSON.stringify(result) is:'${JSON.stringify(answ1)}',but should be:'${expAnsw1}'`)
      _.bassert(2,JSON.stringify(answ2) === expAnsw2,`output of JSON.stringify(result) is:'${JSON.stringify(answ2)}',but should be:'${expAnsw2}'`)
      _.bassert(3,JSON.stringify(answ3) === expAnsw3,`output of JSON.stringify(result) is:'${JSON.stringify(answ3)}',but should be:'${expAnsw3}'`)
      _.bassert(4,JSON.stringify(answ4) === expAnsw4,`output of JSON.stringify(result) is:'${JSON.stringify(answ4)}',but should be:'${expAnsw4}'`)
    }
    function deepLiteralTest() {
      let lit0 = { __SPEC: {TYPE: "Number"},
        pict: {VALUE: "Russian-Matroshka2.jpg", 
              __SPEC: true, RENDER: true, },
        integer: {VALUE: 127, __SPEC: false, },
        sosa: [128,127],
        noValue: {__SPEC: true, },
        noValueButType: {__SPEC: false, },
      }
      let set0 = new Setting(lit0)
      let frontMY0 = set0.getFrontmatterYAML()
      let renderY0 = set0.getRenderYAML()
      _.bassert(1,frontMY0["integer"] == 127,"Type of 'Number' should be inherited")
      _.bassert(2,areEqual(frontMY0["sosa"],[128,127]),"Type of 'Array<Number>' should be general")
      _.bassert(3,frontMY0["noValue"] == "","No value should become default empty string")
      _.bassert(4,frontMY0["noValueButType"] === "","No value should become default empty string, even if type is set to 'Number'")
      _.bassert(5,Object.keys(frontMY0).length == 4,"only added entries should appear in frontmatter YAML")
      _.bassert(6,renderY0["pict"] == "Russian-Matroshka2.jpg","'pict' should be in render YAML as given")
      _.bassert(7,renderY0["integer"] == undefined,"'integer' should not appear in render YAML")
      _.bassert(8,renderY0["sosa"] == undefined,"'sosa' should not appear in render YAML")
      _.bassert(9,Object.keys(renderY0).length == 1,"only added entries should appear in render YAML")

      /************************************************************************/
      let lit1 = {  a:2,
                    b:"stg",
                    c:true,
                    d:false,
                    e:undefined,
                    f:null,
                    g:Symbol("abc"),
                    h:cbkTypeOf,
                    i:22n,
                   }
      let set1 = new Setting(lit1)
      let frontMY1 = set1.getFrontmatterYAML()
      let renderY1 = set1.getRenderYAML()
      _.bassert(20,Object.keys(renderY1).length == 0,"no render entries given")
      _.bassert(21,frontMY1["a"] === 2,"should be as given")
      _.bassert(22,frontMY1["b"] === "stg","should be as given")
      _.bassert(23,frontMY1["c"] === true,"should be as given")
      _.bassert(24,frontMY1["d"] === false,"should be as given")
      _.bassert(25,frontMY1["e"] === "","Value should be removed, 'undefined' no generalType")
      _.bassert(26,frontMY1["f"] === "","Value should be removed, 'null' no generalType")
      _.bassert(27,frontMY1["g"] === "","Value should be removed, 'symbol' no generalType")
      _.bassert(28,frontMY1["h"] === "","Value should be removed, 'function' no generalType")
      _.bassert(29,frontMY1["i"] === "","Value should be removed, 'bigint' no generalType")

      /************************************************************************/
      let lit2 = {  a:[],
                    b:[1,2,3],
                    c:[false,false,true],
                    d:["a"],
                    e:[undefined],
                    f:[null],
                    g:[Symbol("abc")],
                    h:[cbkTypeOf],
                    i:[22n],
                   }
      let set2 = new Setting(lit2)
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
      _.bassert(39,frontMY1["e"] === "","Value should be removed, array of 'undefined' no generalType")
      _.bassert(40,frontMY1["f"] === "","Value should be removed, array of 'null' no generalType")
      _.bassert(41,frontMY1["g"] === "","Value should be removed, array of 'symbol' no generalType")
      _.bassert(42,frontMY1["h"] === "","Value should be removed, array of 'function' no generalType")
      _.bassert(43,frontMY1["i"] === "","Value should be removed, array of 'bigint' no generalType")

      /************************************************************************/
      let lit3 = { __SPEC: {TYPE: "Number"},
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
      let set3 = new Setting(lit3)
      let frontMY3 = set3.getFrontmatterYAML()
      let renderY3 = set3.getRenderYAML()
      _.bassert(50,Object.keys(renderY3).length == 0,"no render entries given")
      _.bassert(51,frontMY3["a"] === 2,"should be as given")
      _.bassert(52,frontMY3["b"] === "stg","should be as given, generalType is used")
      _.bassert(53,frontMY3["c"] === true,"should be as given, generalType is used")
      _.bassert(54,frontMY3["d"] === false,"should be as given, generalType is used")
      _.bassert(55,frontMY3["e"] === "","Value should be removed, 'undefined' no generalType")
      _.bassert(56,frontMY3["f"] === "","Value should be removed, 'null' no generalType")
      _.bassert(57,frontMY3["g"] === "","Value should be removed, 'symbol' no generalType")
      _.bassert(58,frontMY3["h"] === "","Value should be removed, 'function' no generalType")
      _.bassert(59,frontMY3["i"] === "","Value should be removed, 'bigint' no generalType")

      /************************************************************************/
      let lit4 = {  __SPEC: {TYPE: "Number"},
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
      let set4 = new Setting(lit4)
      let frontMY4 = set4.getFrontmatterYAML()
      let renderY4 = set4.getRenderYAML()
      _.bassert(60,Object.keys(renderY4).length === 0,"no render entries given")
      _.bassert(61,Array.isArray(frontMY4.a),"should be as given, generalType is used")
      _.bassert(62,Array.isArray(frontMY4.b),"should be as given, generalType is used")
      _.bassert(63,Array.isArray(frontMY4.c),"should be as given, generalType is used")
      _.bassert(64,Array.isArray(frontMY4.d),"should be as given, generalType is used")
      _.bassert(65,areEqual(frontMY4.a,[]),"empty array should be returned as empty array")
      _.bassert(66,areEqual(frontMY4.b,[1,2,3]),"array of numbers should be returned as same array")
      _.bassert(67,areEqual(frontMY4.c,[false,false,true]),"array of booleans should be returned as same array")
      _.bassert(68,areEqual(frontMY4.d,["a"]),"array of strings should be returned as same array")
      _.bassert(69,frontMY4["e"] === "","Value should be removed, array of 'undefined' no generalType")
      _.bassert(70,frontMY4["f"] === "","Value should be removed, array of 'null' no generalType")
      _.bassert(71,frontMY4["g"] === "","Value should be removed, array of 'symbol' no generalType")
      _.bassert(72,frontMY4["h"] === "","Value should be removed, array of 'function' no generalType")
      _.bassert(73,frontMY4["i"] === "","Value should be removed, array of 'bigint' no generalType")

      /************************************************************************/
      let lit5 = { __SPEC: {TYPE: "Number"},
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
      let set5 = new Setting(lit5)
      let frontMY5 = set5.getFrontmatterYAML()
      let renderY5 = set5.getRenderYAML()
      _.bassert(80,Object.keys(renderY5).length == 0,"no render entries given")
      _.bassert(81,frontMY5["a"] === 2,"should be as given")
      _.bassert(82,frontMY5["b"] === "stg","should be as given, generalType is used")
      _.bassert(83,frontMY5["c"] === true,"should be as given, generalType is used")
      _.bassert(84,frontMY5["d"] === false,"should be as given, generalType is used")
      _.bassert(85,frontMY5["e"] === "","Value should be removed, 'undefined' no generalType")
      _.bassert(86,frontMY5["f"] === "","Value should be removed, 'null' no generalType")
      _.bassert(87,frontMY5["g"] === "","Value should be removed, 'symbol' no generalType")
      _.bassert(88,frontMY5["h"] === "","Value should be removed, 'function' no generalType")
      _.bassert(89,frontMY5["i"] === "","Value should be removed, 'bigint' no generalType")

      /************************************************************************/
      let lit6 = {  __SPEC: {TYPE: "Number"},
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
      let set6 = new Setting(lit6)
      let frontMY6 = set6.getFrontmatterYAML()
      let renderY6 = set6.getRenderYAML()
      _.bassert(90,Object.keys(renderY6).length === 0,"no render entries given")
      _.bassert(91,Array.isArray(frontMY6.a),"should be as given, generalType is used")
      _.bassert(92,Array.isArray(frontMY6.b),"should be as given, generalType is used")
      _.bassert(93,Array.isArray(frontMY6.c),"should be as given, generalType is used")
      _.bassert(94,Array.isArray(frontMY6.d),"should be as given, generalType is used")
      _.bassert(95,areEqual(frontMY6.a,[]),"empty array should be returned as empty array")
      _.bassert(96,areEqual(frontMY6.b,[1,2,3]),"array of numbers should be returned as same array")
      _.bassert(97,areEqual(frontMY6.c,[false,false,true]),"array of booleans should be returned as same array")
      _.bassert(98,areEqual(frontMY6.d,["a"]),"array of strings should be returned as same array")
      _.bassert(99,frontMY6["e"] === "","Value should be removed, array of 'undefined' no generalType")
      _.bassert(100,frontMY6["f"] === "","Value should be removed, array of 'null' no generalType")
      _.bassert(101,frontMY6["g"] === "","Value should be removed, array of 'symbol' no generalType")
      _.bassert(102,frontMY6["h"] === "","Value should be removed, array of 'function' no generalType")
      _.bassert(103,frontMY6["i"] === "","Value should be removed, array of 'bigint' no generalType")

      /************************************************************************/
      let lit7 = { __SPEC: {TYPE: "Number"},
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
      let set7 = new Setting(lit7)
      let frontMY7 = set7.getFrontmatterYAML()
      let renderY7 = set7.getRenderYAML()
      _.bassert(110,Object.keys(renderY7).length == 0,"no render entries given")
      _.bassert(111,frontMY7["a"] === 2,"should be as given")
      _.bassert(112,frontMY7["b"] === "","Value should be removed, generalType is not used")
      _.bassert(113,frontMY7["c"] === "","Value should be removed, generalType is not used")
      _.bassert(114,frontMY7["d"] === "","Value should be removed, generalType is not used")
      _.bassert(115,frontMY7["e"] === "","Value should be removed, 'undefined' no generalType")
      _.bassert(116,frontMY7["f"] === "","Value should be removed, 'null' no generalType")
      _.bassert(117,frontMY7["g"] === "","Value should be removed, 'symbol' no generalType")
      _.bassert(118,frontMY7["h"] === "","Value should be removed, 'function' no generalType")
      _.bassert(119,frontMY7["i"] === "","Value should be removed, 'bigint' no generalType")

      /************************************************************************/
      let lit8 = {  __SPEC: {TYPE: "Number"},
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
      let set8 = new Setting(lit8)
      let frontMY8 = set8.getFrontmatterYAML()
      let renderY8 = set8.getRenderYAML()
      _.bassert(120,Object.keys(renderY8).length === 0,"no render entries given")
      _.bassert(111,frontMY8["a"] === "","Value should be removed, generalType is not used")
      _.bassert(112,frontMY8["b"] === "","Value should be removed, generalType is not used")
      _.bassert(113,frontMY8["c"] === "","Value should be removed, generalType is not used")
      _.bassert(114,frontMY8["d"] === "","Value should be removed, generalType is not used")
      _.bassert(115,frontMY8["e"] === "","Value should be removed, 'undefined' no generalType")
      _.bassert(116,frontMY8["f"] === "","Value should be removed, 'null' no generalType")
      _.bassert(117,frontMY8["g"] === "","Value should be removed, 'symbol' no generalType")
      _.bassert(118,frontMY8["h"] === "","Value should be removed, 'function' no generalType")
      _.bassert(119,frontMY8["i"] === "","Value should be removed, 'bigint' no generalType")

      /************************************************************************/      
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
/** For translation
 * @classdesc
 */
class LocalizationWorker extends Setting {
  static #KEY = "__TRANSLATE"
  static get workerKey() {
    return LocalizationWorker.#KEY
  }
  #phrases = {}
  constructor(literal, key, parent) {
    let un
    super(literal, key, parent)
    this.add(LocalizationWorker)
    // literal {(Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|Setting)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    this.throwIfUndefined(key, "key")
  }
  parse() {
    let un
    let type = "(String|Array<String>)"
    for (const [key, value] of Object.entries(this.literal)) {
      if (this.isA(value, "object")) {
      } else {
        let litAtom = {VALUE: this.literal[key], __SPEC: true}
        this.literal[key] = litAtom
        this.#phrases[key] = this.essenceOfAtom(this.literal, key, type)
      }
    }
  }
  getValue(key, ...params) {
    return this.#phrases[key].VALUE
  }
  //prettier-ignore
  static test(outputObj) { // LocalizationWorker
    let _ = null
    if(_ = new TestSuite("LocalizationWorker", outputObj)) {
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "constructorTest", un)
      let lm = new LocalizationWorker({}, "constructorTest1", new Setting({}))
      _.assert(1,_tryConstruct,{},"cTest1",new Setting({}),"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",new Setting({}),"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",new Setting({}),"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",new Setting({}),"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",new Setting({}),"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,new Setting({}),"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,new Setting({}),"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},new Setting({}),"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,new Setting({}),"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),new Setting({}),"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"cTest11",un,"should  not be created, undefined parent is not ok")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",b,"should not be be created, parent is BreadCrumbs")
      let locMan = new LocalizationWorker({},"constructorTest101", new Setting({}))
      _.bassert(101,locMan instanceof Object,"'LocalizationWorker' has to be an instance of 'Object'")
      _.bassert(102,locMan instanceof BreadCrumbs,"'LocalizationWorker' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,locMan instanceof LocalizationWorker,"'LocalizationWorker' has to be an instance of 'LocalizationWorker'")
      _.bassert(104,locMan.constructor === LocalizationWorker,"the constructor property is not 'LocalizationWorker'")
    }
    function isATest() {
      // Object, Gene, GenePool, Essence added for each Essence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      // LocalizationWorker added for each LocalizationWorker instance
      let locMan1 = new LocalizationWorker({},"NameIsATest",new Setting({}))
      _.bassert(1,locMan1.isA(locMan1,"object"), "'" + locMan1 + "' should be a " + "object")
      _.bassert(2,locMan1.isA(locMan1,Object), "'" + locMan1 + "' should be a " + "Object")
      _.bassert(3,locMan1.isA(locMan1,BreadCrumbs), "'" + locMan1 + "' should be a " + "BreadCrumbs")
      _.bassert(4,locMan1.isA(locMan1,Setting), "'" + locMan1 + "' should be a " + "Setting")
      _.bassert(5,locMan1.isA(locMan1,LocalizationWorker), "'" + locMan1 + "' should be a " + "LocalizationWorker")
      _.bassert(6,!locMan1.isA(locMan1,Error), "'" + locMan1 + "' should not be a " + "Error")
      _.bassert(7,!locMan1.isA(locMan1,Gene), "'" + locMan1 + "' should not be a " + "Gene")
    }
    function toStringTest() {
      let locMan1 = new LocalizationWorker({},"toStringTest1",new Setting({}))
      _.bassert(1,locMan1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,locMan1.toString().includes("LocalizationWorker"),"result does not contain class string"    )
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
  "new LocalizationWorker({},undefined, new Setting({}))"
)

/** For Dialogs
 * @classdesc
 */
class DialogWorker extends Setting {
  static #KEY = "__DIALOG_SETTINGS"
  static get workerKey() {
    return DialogWorker.#KEY
  }
  #preferences = {}
  constructor(literal, key, parent) {
    let un
    super(literal, key, parent)
    this.add(DialogWorker)
    // literal {(Object)} checked by superclass
    // key {(String|Symbol)} checked by superclass
    // parent {(Undefined|Setting)} checked by superclass
    this.throwIfUndefined(parent, "parent")
    this.throwIfUndefined(key, "key")
  }
  parse() {
    let type = "(Number|Array<Number>)"
    for (const [key, value] of Object.entries(this.literal)) {
      if (this.isA(value, "object")) {
      } else {
        let litAtom = {VALUE: this.literal[key], __SPEC: true}
        this.literal[key] = litAtom
        this.#preferences[key] = this.essenceOfAtom(this.literal, key, type)
      }
    }
  }
  getValue(key, ...params) {
    return this.#preferences[key].VALUE
  }
  //prettier-ignore
  static test(outputObj) { // DialogWorker
    let _ = null
    if(_ = new TestSuite("DialogWorker", outputObj)) {
      _.run(constructorTest)
      _.run(isATest)
      _.run(toStringTest)
      _.destruct()
      _ = null
    }
    function constructorTest() {
      let un
      let b = new BreadCrumbs(un, "constructorTest", un)
      let dlgMan0 = new DialogWorker({}, "constructorTest1", new Setting({}))
      _.assert(1,_tryConstruct,{},"cTest1",new Setting({}),"should be created, all parameters ok")
      _.shouldAssert(2,_tryConstruct,un,"cTest2",new Setting({}),"should not be created, literal is undefined")
      _.shouldAssert(3,_tryConstruct,22,"cTest3",new Setting({}),"should not be created, literal is number")
      _.shouldAssert(4,_tryConstruct,"literal","cTest4",new Setting({}),"should not be created, literal is string")
      _.shouldAssert(5,_tryConstruct,null,"cTest5",new Setting({}),"should not be created, literal is null")
      _.shouldAssert(6,_tryConstruct,{},un,new Setting({}),"should not be created, key is undefined")
      _.shouldAssert(7,_tryConstruct,{},22,new Setting({}),"should not be created, key is number")
      _.shouldAssert(8,_tryConstruct,{},{},new Setting({}),"should not be created, key is object")
      _.shouldAssert(9,_tryConstruct,{},b,new Setting({}),"should not be created, key is Object")
      _.assert(10,_tryConstruct,{},Symbol("a"),new Setting({}),"should be created, key is Symbol")
      _.shouldAssert(11,_tryConstruct,{},"cTest11",un,"should  not be created, undefined parent is not ok")
      _.shouldAssert(12,_tryConstruct,{},"cTest12",new Error(),"should not be be created, parent is Error")
      _.shouldAssert(13,_tryConstruct,{},"cTest13",{},"should not be be created, parent is object")
      _.shouldAssert(14,_tryConstruct,{},"cTest14","ring","should not be be created, parent is string")
      _.shouldAssert(15,_tryConstruct,{},"cTest15",22,"should not be be created, parent is number")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",null,"should not be be created, parent is null")
      _.shouldAssert(16,_tryConstruct,{},"cTest16",b,"should not be be created, parent is BreadCrumbs")
      let dlgMan = new DialogWorker({},"constructorTest101", new Setting({}))
      _.bassert(101,dlgMan instanceof Object,"'DialogWorker' has to be an instance of 'Object'")
      _.bassert(102,dlgMan instanceof BreadCrumbs,"'DialogWorker' has to be an instance of 'BreadCrumbs'")
      _.bassert(103,dlgMan instanceof DialogWorker,"'DialogWorker' has to be an instance of 'DialogWorker'")
      _.bassert(104,dlgMan.constructor === DialogWorker,"the constructor property is not 'DialogWorker'")
    }
    function isATest() {
      // Object, Gene, GenePool, Essence added for each Essence instance
      // BreadCrumbs added for each BreadCrumbs instance
      // "undefined", "null", "boolean", "number", "bigint", "string", "symbol",
      // "function", "object", "array" added for each BreadCrumbs instance
      // DialogWorker added for each DialogWorker instance
      let dlgMan1 = new DialogWorker({},"NameIsATest",new Setting({}))
      _.bassert(1,dlgMan1.isA(dlgMan1,"object"), "'" + dlgMan1 + "' should be a " + "object")
      _.bassert(2,dlgMan1.isA(dlgMan1,Object), "'" + dlgMan1 + "' should be a " + "Object")
      _.bassert(3,dlgMan1.isA(dlgMan1,BreadCrumbs), "'" + dlgMan1 + "' should be a " + "BreadCrumbs")
      _.bassert(4,dlgMan1.isA(dlgMan1,Setting), "'" + dlgMan1 + "' should be a " + "Setting")
      _.bassert(5,dlgMan1.isA(dlgMan1,DialogWorker), "'" + dlgMan1 + "' should be a " + "DialogWorker")
      _.bassert(6,!dlgMan1.isA(dlgMan1,Error), "'" + dlgMan1 + "' should not be a " + "Error")
      _.bassert(7,!dlgMan1.isA(dlgMan1,Gene), "'" + dlgMan1 + "' should not be a " + "Gene")
    }
    function toStringTest() {
      let dlgMan1 = new DialogWorker({},"toStringTest1",new Setting({}))
      _.bassert(1,dlgMan1.toString().includes("toStringTest1"),"result does not contain name string"    )
      _.bassert(2,dlgMan1.toString().includes("DialogWorker"),"result does not contain class string"    )
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
  "new DialogWorker({},undefined, new Setting({}))"
)
//  #endregion workers
//#endregion code

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
    let lit = onne
    let setting = new Setting(lit)
    frontmatterYAML = setting.getFrontmatterYAML()
    Object.assign(renderYAML, setting.getRenderYAML())
    aut(setting.getValue("__TRANSLATE", "TYPE_PROMPT"))
    aut(setting.getValue("__DIALOG_SETTINGS", "TYPE_MAX_ENTRIES"))
  } catch (e) {
    if (e instanceof FotyError) {
      let errYAML = {}
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
