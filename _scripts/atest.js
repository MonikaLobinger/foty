module.exports = atest 

function cbkFmtAlias(tp, noteName, noteType) {
  let alias = noteName
  if (noteType != "ort" && noteType != "person") {
    alias = noteName.replace(/,/g, ` `).replace(/  /g, ` `)
  } else {
    alias = noteName.replace(/, /g, `,`)
    let strArr = alias.split(",")
    alias = strArr[0]
    strArr.shift()
    if (noteType === "ort") {
      alias += "(" + strArr.join(" ") + ")"
    } else if (noteType === "person") {
      alias = strArr.join(" ") + " " + alias
    }
  }
  return alias
}
function cbkFmtTags(tp, noteName, noteType) {
  return "0/" + noteType
}
function cbkFmtCreated(tp, noteName, noteType) {
  return tp.date.now()
}
function cbkFmtCssClass(tp, noteName, noteType) {
  return noteType
}
let onne = {
  __TRANSLATE: 
  { 
    TYPE_PROMPT:         [ ["en", "Choose type"], ["de", "Typ wählen"] ],
    TITLE_NEW_FILE:      [ ["en", "Untitled"], ["de", "Unbenannt"] ],
    DEFAULT_NAME_PROMPT: [ ["en", "Pure Name of Note"], ["de", "Name der Notiz (ohne Kenner/Marker)"] ],
  },
  __DIALOG_SETTINGS: 
  { 
    TYPE_MAX_ENTRIES: 10,
  },
  __NOTE_TYPES: 
  {
    __SPEC: {REPEAT: true, },
    DEFAULTS: {
        marker: {__SPEC:false,TYPE:"String",DEFAULT:"",},
        date: {__SPEC:false,TYPE:"Boolean",DEFAULT:false, },
           frontmatter: {__SPEC: {},
               aliases: {__SPEC:false,TYPE: "(Array.<String>|Function)", DEFAULT: cbkFmtAlias},
               date_created: {__SPEC:false,TYPE: "(Date|Function)", DEFAULT: cbkFmtCreated},
         },
        language: {__SPEC:false,IGNORE:true, },
    },
    diary: {
      date: true,
      dateformat: "YYYY-MM-DD",
      frontmatter: {private: true},
      language: "Portuguese",
    },
    citation: {
      marker: "°",
      frontmatter: {cssclass: "garten, tagebuch"},
    },
  },
  soso: {VALUE: "naja", __SPEC: true, RENDER: false},
  c:    {pict: "Russian-Matroshka2.jpg", __SPEC: {RENDER: true}, },
}
var GLOBAL_SYMBOL_COUNTER = 0
const Dialog = {
  Ok: "Ok",
  Cancel: "Cancel",
}
let GLOBAL_TYPES_MANAGER_KEY = "__NOTE_TYPES"
let GLOBAL_TYPES_TYPE =
  "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>|Function)"
let GLOBAL_LOCALIZATION_WORKER_KEY = "__TRANSLATE"
let GLOBAL_LOCALIZATION_TYPE = "(String|Array.<String>|Array.<Array.<String>>)"
let GLOBAL_DIALOG_WORKER_KEY = "__DIALOG_SETTINGS"
let GLOBAL_DIALOG_TYPE = "(Number|Boolean|Array.<Number>|Array.<Boolean>)"
let GLOBAL_ROOT_KEY = "/"
let GLOBAL_GENERAL_TYPE =
  "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>)"
let GLOBAL_BREADCRUMBS_SEPARATOR = " \u00BB "
let GLOBAL__SPEC = "__SPEC"
let GLOBAL_namePartHiddenPropertiesStartWith = "__"
let GLOBAL_RENDER_DEFAULT = false
let GLOBAL_TYPE_DEFAULT = "String"
let GLOBAL_DEFAULT_DEFAULT = ""
let GLOBAL_VALUE_DEFAULT = ""
let GLOBAL_IGNORE_DEFAULT = false
let GLOBAL_PARSE_DEFAULT = true
let GLOBAL_INTERNAL_DEFAULT = false
let GLOBAL_FLAT_DEFAULT = false
let GLOBAL_LOCAL_DEFAULT = false
let GLOBAL_ONCE_DEFAULT = false
let GLOBAL_REPEAT_DEFAULT = false
let GLOBAL_DEFAULTS_DEFAULT = {}
class FotyError extends Error {
  static #nl = "\n     "
  static get nl() {
    return FotyError.#nl
  }
  #caller = ""
  constructor(caller, ...params) {
    super(...params)
    this.name = "Foty Error"
    this.#caller = typeof caller === "string" ? caller : ""
  }
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
  getNameKey(cnt) {
    return cnt === undefined || typeof cnt != "number"
      ? "????"
      : cnt.pad() + "?"
  }
  static getNameKey(cnt) {
    return cnt === undefined || typeof cnt != "number"
      ? "????"
      : cnt.pad() + "?"
  }
  static getMsgKey(cnt) {
    return cnt === undefined || typeof cnt != "number"
      ? "\u00A8\u00A8\u00A8\u00A8"
      : cnt.pad() + "\u00A8"
  }
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
const NL = FotyError.nl
class SettingError extends FotyError {
  usrMsg = ""
  constructor(caller, usrMsg, ...params) {
    super(caller, ...params)
    this.name = "Setting Error"
    this.usrMsg = usrMsg === undefined ? "" : usrMsg
  }
  errOut(YAML, cnt) {
    cnt = cnt === undefined ? 0 : cnt
    let msgKey = super.errOut(YAML, cnt)
    if (this.usrMsg.length > 0)
      YAML[msgKey] += NL + this.usrMsg.replace(/(?<!(\n[ ]*))[ ][ ]*/g, " ")
  }
  getNameKey(cnt) {
    return cnt === undefined ? "_ERR" : cnt.pad(4)
  }
}
function cbkIsObjectNotNullNotArray(v, gene) {
  return typeof v === "object" && v != undefined && !Array.isArray(v)
}
function cbkIsNull(v, gene) {
  return typeof v === "object" && v == undefined && v !== undefined
}
function cbkIsArray(v, gene) {
  return typeof v === "object" && Array.isArray(v)
}
function cbkInstanceOf(v, gene) {
  return v instanceof gene.ident
}
function cbkTypeOf(v, gene) {
  return typeof v === gene.ident
}
function cbkTypeOfLc(v, gene) {
  return typeof v === gene.ident.toLowerCase()
}
function cbkIsDate(v, gene) {
  return typeof v === "string"
}
class Gene {
  #cbk
  #ident
  get ident() {
    return this.#ident
  }
  constructor(ident, cbk) {
    if (cbk != undefined && typeof cbk != "function")
      throw new TypeError(
        `function 'Gene.constructor'${NL}2nd parameter '${cbk}' is not of type 'Function'`
      )
    this.#ident = ident
    this.#cbk = cbk === undefined ? cbkTypeOf : cbk
  }
  is(v) {
    return this.#cbk(v, this)
  }
}
class GenePool {
  #genes = {}
  #defaultCallback = cbkInstanceOf
  constructor(...params) {
    if (params.length > 0 && typeof params[0] === "function")
      this.#defaultCallback = params.shift()
    while (params.length > 0)
      this.addGene(params.shift(), this.#defaultCallback)
  }
  addGene(ident, cbk) {
    if (this.#genes[ident] === undefined)
      this.#genes[ident] = new Gene(
        ident,
        cbk === undefined ? this.#defaultCallback : cbk
      )
    return this.#genes[ident]
  }
  hasGene(ident) {
    return this.#genes[ident] != undefined
  }
  length() {
    return Object.keys(this.#genes).length
  }
  isA(v, ident) {
    if (GenePool.isCompoundOr(ident)) {
      let ids = ident.slice(1, -1).split("|")
      return ids.some((id) => this.isA(v, id), this)
    } else if (GenePool.isCompoundArr(ident)) {
      if (!Array.isArray(v)) return false
      let innerIdent = ident.slice("Array.<".length, -1)
      return v.every((innerV) => this.isA(innerV, innerIdent), this)
    } else {
      if (!this.hasGene(ident)) return false
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
}
class Essence extends GenePool {
  static #DEFAULT_HARDCODED_SPEC_KEY = "_S_P_E_C_"
  #specificationPool = new GenePool()
  #SPEC_KEY = Essence.#DEFAULT_HARDCODED_SPEC_KEY
  #skipped = [] 
  get specificationPool() {
    return this.#specificationPool
  }
  get SPEC_KEY() {
    return this.#SPEC_KEY
  }
  get skipped() {
    return this.#skipped
  }
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
  get VALUE() {
    return this[Essence.#pre + "VALUE"]
  }
  get IGNORE() {
    return this[Essence.#pre + "IGNORE"]
  }
  get PARSE() {
    return this[Essence.#pre + "PARSE"]
  }
  get INTERNAL() {
    return this[Essence.#pre + "INTERNAL"]
  }
  get FLAT() {
    return this[Essence.#pre + "FLAT"]
  }
  get LOCAL() {
    return this[Essence.#pre + "LOCAL"]
  }
  get ONCE() {
    return this[Essence.#pre + "ONCE"]
  }
  get REPEAT() {
    return this[Essence.#pre + "REPEAT"]
  }
  get DEFAULTS() {
    return this[Essence.#pre + "DEFAULTS"]
  }
  static #pre =
    GLOBAL_namePartHiddenPropertiesStartWith !== undefined
      ? GLOBAL_namePartHiddenPropertiesStartWith
      : "__"
  static #RENDER_DEFT =
    GLOBAL_RENDER_DEFAULT !== undefined ? GLOBAL_RENDER_DEFAULT : false
  static #TYPE_DEFT =
    GLOBAL_TYPE_DEFAULT !== undefined ? GLOBAL_TYPE_DEFAULT : "String"
  static #DEFAULT_DEFT =
    GLOBAL_DEFAULT_DEFAULT !== undefined ? GLOBAL_DEFAULT_DEFAULT : ""
  static #VALUE_DEFT =
    GLOBAL_VALUE_DEFAULT !== undefined ? GLOBAL_VALUE_DEFAULT : ""
  static #IGNORE_DEFT =
    GLOBAL_IGNORE_DEFAULT !== undefined ? GLOBAL_IGNORE_DEFAULT : false
  static #PARSE_DEFT =
    GLOBAL_PARSE_DEFAULT !== undefined ? GLOBAL_PARSE_DEFAULT : true
  static #INTERNAL_DEFT =
    GLOBAL_INTERNAL_DEFAULT !== undefined ? GLOBAL_INTERNAL_DEFAULT : false
  static #FLAT_DEFT =
    GLOBAL_FLAT_DEFAULT !== undefined ? GLOBAL_FLAT_DEFAULT : false
  static #LOCAL_DEFT =
    GLOBAL_LOCAL_DEFAULT !== undefined ? GLOBAL_LOCAL_DEFAULT : false
  static #ONCE_DEFT =
    GLOBAL_ONCE_DEFAULT !== undefined ? GLOBAL_ONCE_DEFAULT : false
  static #REPEAT_DEFT =
    GLOBAL_REPEAT_DEFAULT !== undefined ? GLOBAL_REPEAT_DEFAULT : false
  static #DEFAULTS_DEFT =
    GLOBAL_DEFAULTS_DEFAULT !== undefined ? GLOBAL_DEFAULTS_DEFAULT : {}
  constructor(spec_key = Essence.#DEFAULT_HARDCODED_SPEC_KEY) {
    super()
    this.#SPEC_KEY = spec_key
    this.addGene(Object)
    this.addGene(Gene)
    this.addGene(GenePool)
    this.addGene(Essence)
  }
  parse(literal, parent, name) {
    if (parent != undefined && !this.isA(parent, GenePool))
      throw new TypeError(
        `function 'Essence.parse'${NL}2nd parameter '${parent}' is not of type 'GenePool'`
      )
    if (literal != undefined && typeof literal != "object")
      throw new TypeError(
        `function 'Essence.parse'${NL}1st parameter '${literal}' is not of type 'Object'`
      )
    let un
    let p = parent
    let specLit = {}
    if (literal != un) specLit = literal[this.#SPEC_KEY]
    if (typeof specLit == "boolean") {
      specLit = literal
      specLit["FLAT"] = true
    }
    if (specLit === un) specLit = {}
    if (specLit["PARSE"] === false) return
    function changeToHiddenProp(me, lit, specL, key, type, p, def, val, name) {
      let v
      if (val != undefined) v = val
      else {
        let given = specL[key]
        delete specL[key]
        if (!me.#validateOrInform(given, type, key)) given = undefined
        v = given != undefined ? given : p != undefined ? p[key] : def
      }
      Object.defineProperty(me, Essence.#pre + key, {
        value: v,
        writable: false,
        configurable: false,
        enumerable: false,
      })
      try {
        Object.defineProperty(lit, Essence.#pre + key, {
          value: v,
          writable: false,
          configurable: false,
          enumerable: false,
        })
      } catch (e) {
        let col = undefined
        if (lit != undefined && Essence.getINTERNAL(lit)) col = "orange"
        if (!col) {
          console.log("RETHROWING")
          throw e
        }
      }
    }
    let hide = changeToHiddenProp
    let l = literal
    let s = specLit
    let n = name
    hide(this, l, s, "ROOT", "Boolean", p, un, parent == un, n)
    hide(this, l, s, "RENDER", "Boolean", p, Essence.#RENDER_DEFT, un, n)
    hide(this, l, s, "TYPE", "String", p, Essence.#TYPE_DEFT, un, n)
    hide(this, l, s, "IGNORE", "Boolean", p, Essence.#IGNORE_DEFT, un, n)
    hide(this, l, s, "PARSE", "Boolean", p, Essence.#PARSE_DEFT, un, n)
    hide(this, l, s, "INTERNAL", "Boolean", un, Essence.#INTERNAL_DEFT, un, n)
    hide(this, l, s, "FLAT", "Boolean", un, Essence.#FLAT_DEFT, un, n)
    hide(this, l, s, "LOCAL", "Boolean", p, Essence.#LOCAL_DEFT, un, n)
    hide(this, l, s, "ONCE", "Boolean", un, Essence.#ONCE_DEFT, un, n)
    hide(this, l, s, "REPEAT", "Boolean", un, Essence.#REPEAT_DEFT, un, n)
    hide(this, l, s, "DEFAULT", this.TYPE, un, Essence.#DEFAULT_DEFT, un, n)
    hide(this, l, s, "VALUE", this.TYPE, un, Essence.#VALUE_DEFT, un, n)
    hide(this, l, s, "DEFAULTS", "Object", un, Essence.#DEFAULTS_DEFT, un, n)
    if (literal != un) delete literal[this.#SPEC_KEY]
  }
  #validateOrInform(value, type, name) {
    let ok = value === undefined || this.#specificationPool.isA(value, type)
    if (!ok) {
      let errObj = {}
      errObj.name = name
      errObj.value = value
      errObj.expectedType = type
      this.#skipped.push(errObj)
    }
    return ok
  }
  static setDoNotParse(literal) {
    if (typeof literal != "object" || literal == null) return
    let spec = literal["__SPEC"]
    if (typeof spec != "object" || spec == null) literal["__SPEC"] = {}
    literal["__SPEC"]["PARSE"] = false
  }
  static doParse(literal) {
    let answ = true
    if (typeof literal == "object" && literal != null) {
      let spec = literal["__SPEC"]
      if (typeof spec == "object" && spec != null) {
        if (spec["PARSE"] !== undefined) answ = spec["PARSE"] !== false
      }
    }
    return answ
  }
  static removeDoNotParse(literal) {
    if (typeof literal != "object" || literal == null) return
    let spec = literal["__SPEC"]
    if (typeof spec != "object" || spec == null) return
    delete literal["__SPEC"]["PARSE"]
  }
  static getROOT(lit) {
    return lit[Essence.#pre + "ROOT"]
  }
  static getRENDER(lit) {
    return lit[Essence.#pre + "RENDER"]
  }
  static getTYPE(lit) {
    return lit[Essence.#pre + "TYPE"]
  }
  static getDEFAULT(lit) {
    return lit[Essence.#pre + "DEFAULT"]
  }
  static getVALUE(lit) {
    return lit[Essence.#pre + "VALUE"]
  }
  static getIGNORE(lit) {
    return lit[Essence.#pre + "IGNORE"]
  }
  static getPARSE(lit) {
    return lit[Essence.#pre + "PARSE"]
  }
  static getINTERNAL(lit) {
    return lit[Essence.#pre + "INTERNAL"]
  }
  static getFLAT(lit) {
    return lit[Essence.#pre + "FLAT"]
  }
  static getLOCAL(lit) {
    return lit[Essence.#pre + "LOCAL"]
  }
  static getONCE(lit) {
    return lit[Essence.#pre + "ONCE"]
  }
  static getREPEAT(lit) {
    return lit[Essence.#pre + "REPEAT"]
  }
  static getDEFAULTS(lit) {
    return lit[Essence.#pre + "DEFAULTS"]
  }
}
class AEssence extends Essence {
  static #SPEC_KEY = GLOBAL__SPEC !== undefined ? GLOBAL__SPEC : "__SPEC"
  static get SPEC_KEY() {
    return AEssence.#SPEC_KEY
  }
  constructor(literal, parent, name) {
    super(AEssence.#SPEC_KEY)
    if (parent != undefined && !this.isA(parent, GenePool))
      throw new TypeError(
        `function 'AEssence.constructor'${NL}2nd parameter '${parent}' is not of type 'GenePool'`
      )
    if (literal != undefined && typeof literal != "object")
      throw new TypeError(
        `function 'AEssence.constructor'${NL}1st parameter '${literal}' is not of type 'Object'`
      )
    this.addGene(AEssence)
    this.specificationPool.addGene("String", cbkTypeOfLc)
    this.specificationPool.addGene("Number", cbkTypeOfLc)
    this.specificationPool.addGene("Boolean", cbkTypeOfLc)
    this.specificationPool.addGene("Function", cbkTypeOfLc)
    this.specificationPool.addGene("Object", cbkTypeOfLc)
    this.specificationPool.addGene("Date", cbkIsDate)
    this.parse(
      literal,
      parent,
      typeof name == "symbol" ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++ : name
    )
  }
}
class BreadCrumbs extends AEssence {
  static sep =
    GLOBAL_BREADCRUMBS_SEPARATOR !== undefined
      ? GLOBAL_BREADCRUMBS_SEPARATOR
      : " \u00BB "
  #name
  #parent
  #literal
  get literal() {
    return this.#literal
  }
  get parent() {
    return this.#parent
  }
  get name() {
    return this.#name
  }
  get root() {
    return this.ROOT ? this : this.parent.root
  }
  constructor(literal, name, parent) {
    super(
      literal,
      parent,
      typeof name == "symbol" ? "_Symbol_" + GLOBAL_SYMBOL_COUNTER++ : name
    )
    this.addGene(BreadCrumbs)
    this.addGene("undefined", cbkTypeOf)
    this.addGene("null", cbkIsNull)
    this.addGene("boolean", cbkTypeOf)
    this.addGene("number", cbkTypeOf)
    this.addGene("bigint", cbkTypeOf)
    this.addGene("string", cbkTypeOf)
    this.addGene("symbol", cbkTypeOf)
    this.addGene("function", cbkTypeOf)
    this.addGene("date", cbkIsDate)
    this.addGene("object", cbkIsObjectNotNullNotArray)
    this.addGene("array", cbkIsArray)
    if (!this.isA(parent, "undefined"))
      this.throwIfNotOfType(parent, "parent", BreadCrumbs)
    this.#parent = parent
    this.throwIfUndefined(name, "name")
    this.throwIfNotOfType(name, "name", "(string|symbol)")
    if (typeof name === "symbol")
      this.#name = "_Symbol_" + GLOBAL_SYMBOL_COUNTER++
    this.#name = name
    if (!this.isA(literal, "undefined"))
      this.throwIfNotOfType(literal, "literal", "object")
    this.#literal = literal
    if (this.skipped.length) {
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
  toString() {
    if (typeof this.#name === "string")
      return "°°°" + this.constructor.name + " " + this.#name
    else if (typeof this.#name === "symbol")
      return (
        "°°°" +
        this.constructor.name +
        " " +
        "_Symbol_" +
        GLOBAL_SYMBOL_COUNTER++
      )
  }
  toBreadcrumbs() {
    let breadcrumbs = ""
    let sep = ""
    if (!this.isA(this.#parent, "undefined")) {
      if (this.isA(this.#parent, BreadCrumbs))
        breadcrumbs += this.#parent.toBreadcrumbs()
      else breadcrumbs += "(" + this.#parent + ")"
      sep = BC.sep
    }
    breadcrumbs += sep + this.#name
    return breadcrumbs
  }
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
}
var BC = BreadCrumbs
class Setting extends BreadCrumbs {
  static #ROOT_KEY = GLOBAL_ROOT_KEY !== undefined ? GLOBAL_ROOT_KEY : "/"
  static #generalType =
    GLOBAL_GENERAL_TYPE !== undefined
      ? GLOBAL_GENERAL_TYPE
      : "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>)"
  #workersTypeForChildren
  static #workers = {} 
  #works = {}
  #children = {}
  #tp
  static set worker(workerClass) {
    Setting.#workers[workerClass.workerKey] = workerClass
  }
  set workersTypeForChildren(type) {
    this.#workersTypeForChildren = type
  }
  get tp() {
    return this.ROOT ? this.#tp : this.parent.tp
  }
  constructor(
    literal,
    key = undefined,
    parent = undefined,
    templater = undefined,
    add2parent = false
  ) {
    super(literal, key === undefined ? Setting.#ROOT_KEY : key, parent)
    this.addGene(Setting)
    this.throwIfUndefined(literal, "literal")
    if (!this.isA(parent, "undefined"))
      this.throwIfNotOfType(parent, "parent", Setting)
    this.#tp = this.ROOT ? templater : undefined
    if (!this.ROOT)
      this.#workersTypeForChildren = this.parent.#workersTypeForChildren
    if (add2parent && !this.ROOT) this.parent.#children[key] = this
    this.#parse()
  }
  #parse() {
    let un
    let type =
      !this.ROOT && this.parent.#workersTypeForChildren !== undefined
        ? this.parent.#workersTypeForChildren
        : Setting.#generalType
    for (const [key, value] of Object.entries(this.literal)) {
      if (!AEssence.doParse(value)) continue
      if (Setting.#isWorkerKey(key)) {
        this.#works[key] = new Setting.#workers[key](value, key, this)
      } else if (this.isA(value, "object")) {
        let aEss = this.#essenceOfAtom(this.literal, key, type)
        if (aEss != un) this.#children[key] = aEss
        else this.#children[key] = new Setting(value, key, this)
      } else {
        let litAtom = {VALUE: this.literal[key], __SPEC: true}
        this.literal[key] = litAtom
        this.#children[key] = this.#essenceOfAtom(this.literal, key, type)
      }
    }
  }
  #essenceOfAtom(literal, key, type) {
    if (typeof literal != "object") return undefined
    let aEss = undefined
    let specLit = literal[key][AEssence.SPEC_KEY]
    if (typeof specLit == "boolean") {
      if (
        specLit == true &&
        typeof type == "string" &&
        literal[key]["TYPE"] == undefined
      )
        literal[key]["TYPE"] = type
      aEss = new AEssence(literal[key], this, key)
      literal[key] = aEss.VALUE
    }
    return aEss
  }
  iterator() {
  }
  [Symbol.iterator]() {
    let index = 0
    return {
      next: () => {
        let keys = Object.keys(this.#children)
        if (index < keys.length)
          return {
            value: [keys[index], this.#children[keys[index++]]],
            done: false,
          }
        else return {done: true}
      },
    }
  }
  at(key) {
    if (typeof key == "string") {
      let subKeys = key.split(".")
      if (subKeys.length > 1) {
        if (this.#works[subKeys[0]] !== undefined)
          return this.#works[subKeys.shift()].at(subKeys.join("."))
        if (this.#children[subKeys[0]] !== undefined)
          return this.#children[subKeys.shift()].at(subKeys.join("."))
      }
    }
    if (this.#works[key]) return this.#works[key]
    else return this.#children[key]
  }
  getValue(key, ...params) {
    let works = this.#getWorks(key)
    if (works !== undefined) {
      return works[0].getValue(works[1], params)
    } else if (this.at(key) !== undefined) return this.at(key).VALUE
  }
  #getWorks(key) {
    let answ
    if (typeof key == "string") {
      let subKeys = key.split(".")
      let workerKey = subKeys.length > 1 ? subKeys[0] : key
      if (this.#works[workerKey] !== undefined) {
        answ = []
        answ.push(this.#works[workerKey])
        subKeys.shift()
        answ.push(subKeys.join("."))
      }
    }
    return answ
  }
  getFrontmatterYAML() {
    let frontmatterYAML = {}
    for (const [key, value] of Object.entries(this.#children)) {
      if (value.FLAT) {
        if (!value.RENDER && !value.IGNORE) frontmatterYAML[key] = value.VALUE
      } else Object.assign(frontmatterYAML, value.getFrontmatterYAML())
    }
    return frontmatterYAML
  }
  getRenderYAML() {
    let renderYAML = {}
    for (const [key, value] of Object.entries(this.#children)) {
      if (value.FLAT) {
        if (value.RENDER && !value.IGNORE) renderYAML[key] = value.VALUE
      } else Object.assign(renderYAML, value.getRenderYAML())
    }
    return renderYAML
  }
  static #isWorkerKey(key) {
    return Setting.#workers[key] !== undefined
  }
}
class DialogWorker extends Setting {
    static #KEY =
      GLOBAL_DIALOG_WORKER_KEY !== undefined
        ? GLOBAL_DIALOG_WORKER_KEY
        : "__DIALOG_SETTINGS"
    static #localType =
      GLOBAL_DIALOG_TYPE !== undefined
        ? GLOBAL_DIALOG_TYPE
      : "(Number|Boolean|Array.<Number>|Array.<Boolean>)"
    static get workerKey() {
      return DialogWorker.#KEY
    }
    constructor(literal, key, parent) {
      parent.workersTypeForChildren = DialogWorker.#localType
      super(literal, key, parent)
      this.addGene(DialogWorker)
      this.throwIfUndefined(parent, "parent")
      this.throwIfUndefined(key, "key")
    }
}
Setting.worker = DialogWorker
class LocalizationWorker extends Setting {
  static #KEY =
    GLOBAL_LOCALIZATION_WORKER_KEY !== undefined
      ? GLOBAL_LOCALIZATION_WORKER_KEY
      : "__TRANSLATE"
  static #localType =
    GLOBAL_LOCALIZATION_TYPE !== undefined
      ? GLOBAL_LOCALIZATION_TYPE
      : "(String|Array.<String>|Array.<Array.<String>>)"
  static #defaultLang = "en"
  static get workerKey() {
    return LocalizationWorker.#KEY
  }
  static set defaultLang(lang) {
    if (typeof lang == "string") LocalizationWorker.#defaultLang = lang
  }
  constructor(literal, key, parent) {
    parent.workersTypeForChildren = LocalizationWorker.#localType
    super(literal, key, parent)
    this.addGene(LocalizationWorker)
    this.throwIfUndefined(parent, "parent")
    this.throwIfUndefined(key, "key")
  }
  getValue(key, ...params) {
    let atom = this.at(key)
    if (atom != undefined && params.length > 0 && Array.isArray(atom.VALUE)) {
      let lang = params[0]
      let fallback
      for (const langPair of atom.VALUE) {
        if (Array.isArray(langPair) && langPair.length > 1) {
          if (langPair[0] == lang) return langPair[1]
          if (fallback == undefined) fallback = langPair[1]
          if (langPair[0] == LocalizationWorker.#defaultLang)
            fallback = langPair[1]
        } else break
      }
      if (fallback != undefined) return fallback
      if (atom.VALUE.length > 1) return atom.VALUE[1]
    }
    if (atom != undefined) return atom.VALUE
  }
}
Setting.worker = LocalizationWorker
class TypesManager extends Setting {
  static #KEY =
    GLOBAL_TYPES_MANAGER_KEY !== undefined
      ? GLOBAL_TYPES_MANAGER_KEY
      : "__NOTE_TYPES"
  static #localType =
    GLOBAL_TYPES_TYPE !== undefined
      ? GLOBAL_TYPES_TYPE
      : "(Number|String|Boolean|Array.<Number>|Array.<String>|Array.<Boolean>|Function)"
  static get workerKey() {
    return TypesManager.#KEY
  }
  constructor(literal, key, parent) {
    parent.workersTypeForChildren = TypesManager.#localType
    TypesManager.#setDoNotParse(literal)
    super(literal, key, parent)
    this.addGene(TypesManager)
    this.throwIfUndefined(parent, "parent")
    this.throwIfUndefined(key, "key")
    this.#parse()
  }
  #parse() {
    if (!this.REPEAT) return
    for (const [key, value] of Object.entries(this.literal)) {
      if (key == "DEFAULTS") continue
      AEssence.removeDoNotParse(value)
      new Setting(value, key, this, undefined, true)
    }
  }
  static #setDoNotParse(literal) {
    if (typeof literal != "object" || literal == null) return
    let spec = literal[AEssence.SPEC_KEY]
    if (typeof spec != "object" || spec == null) return
    if (literal["DEFAULTS"] != undefined && spec["REPEAT"] === true) {
      for (const [key, value] of Object.entries(literal)) {
        if (key == AEssence.SPEC_KEY || key == "DEFAULTS") continue
        AEssence.setDoNotParse(value)
      }
    }
  }
}
Setting.worker = TypesManager
async function atest(tp, app) {
  let frontmatterYAML = {}
  let renderYAML = {____: ""}

  try {
    let lit = onne
    let setting = new Setting(lit, undefined, undefined, tp)
    frontmatterYAML = setting.getFrontmatterYAML()
    Object.assign(renderYAML, setting.getRenderYAML())
  } catch (e) {
    if (e instanceof FotyError) {
      let errYAML = {}
      e.errOut(errYAML)
      return errYAML
    } else {
      console.log("RETHROWING")
      throw e
    }
  }
  return Object.assign({}, frontmatterYAML, renderYAML)
}

