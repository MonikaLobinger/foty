module.exports = aa

let user_configuration = {
  __GENERAL:
  { 
    LANGUAGE: "de",
    RELATIVE_PATH: true,
  },
  __TRANSLATE:
  { 
    TYPE_PROMPT:         [ ["en", "Choose type"], ["de", "Typ wählen"] ],
    TITLE_NEW_FILE:      [ ["en", "Untitled"], ["de", "Unbenannt"] ],
    DEFAULT_NAME_PROMPT: [ ["en", "Pure Name of Note"], ["de", "Name der Notiz (ohne Kenner/Marker)"] ],
  },
  __DIALOG:
  { 
    TYPE_MAX_ENTRIES: 10,
  },  
  __NOTES: 
  {
    DEFAULTS:  {
      date: { DEFAULT:false, },
      aliases: {VALUE: "nochnname", RENDER: true,},
    },
    note: {
      ISNOTETYPE: true,
      folder: "/", 
      krummel: {VALUE: 2025, RENDER: true}
    },
    diary: {
      ISNOTETYPE: true,
      RENDER: true,
      VALUE: "WERT",
      showdate: true, 
      dateformat: "YYYY-MM-DD",
      date: {VALUE: 2025, RENDER: true}
    },
    soso: {VALUE: "naja", RENDER: false,},
    c:    {pict2: "Russian-Matroshka2.jpg", RENDER: true, },
    pict: {VALUE: "Russian-Matroshka2.jpg", RENDER: true, },
    }    
}

class Setting {
  //#region members
  #tp
  #cfg
  #generalcfg
  #translatecfg
  #dialogcfg
  #notescfg
  #type
  #typecfg
  #types = {}
  //#endregion members
  constructor(cfg,tp) {
    this.#cfg = cfg
    this.#tp = tp
    this.#generalcfg = this.#cfg.__GENERAL
    this.#translatecfg = this.#cfg.__TRANSLATE
    this.#dialogcfg = this.#cfg.__DIALOG
    this.#notescfg = this.#cfg.__NOTES
    this.#cfg.__GENERAL = undefined
    this.#cfg.__TRANSLATE = undefined
    this.#cfg.__DIALOG = undefined
    this.#cfg.__NOTES = undefined
    for (const key in this.#notescfg) {
      if (this.#notescfg[key].ISNOTETYPE === true) {
        this.deepCopy(this.#notescfg.DEFAULTS, this.#notescfg[key])
        this.#types[key] = this.#notescfg[key]
        this.#notescfg[key] = undefined
      }
    }
    this.#notescfg.DEFAULTS = undefined
  }
  setType(type) {
    this.#type = type
    this.#typecfg = this.#types[this.#type]
  }
  getFrontmatterYAML() {
    let frontmatterYAML = {}
    this.assignVALUES(this.#typecfg, frontmatterYAML, this.#type, false)
    this.assignVALUES(this.#notescfg, frontmatterYAML, "__NOTES", false)
    this.showProps(this.#type, frontmatterYAML)

    return frontmatterYAML
  }
  getRenderYAML() {
    let renderYAML = {}
    this.assignVALUES(this.#typecfg, renderYAML, this.#type, true)
    this.assignVALUES(this.#notescfg, renderYAML, "__NOTES", true)
    this.showProps(this.#type, renderYAML)

    return renderYAML
  }

  deepCopy(from, to) {
    for (const key in from) {
      if(typeof from[key] === "object") {
        if(to[key] === undefined) {
          to[key] = {}
        } 
        this.deepCopy(from[key], to[key])
      } else {
        to[key] = from[key]
      }
    }
    return to
  }
  
  assignVALUES(rootval, dst, rootname, isrender) {
    if(rootval.RENDER === isrender && rootval.VALUE != undefined) {
      dst[rootname] = rootval.VALUE
    }
    for (const key in rootval) {
      if(typeof rootval[key] === "object") {
        this.assignVALUES(rootval[key], dst, key, isrender)        
      }
    }
    return dst
  }

  showProps(rootkey, rootval) {
    //console.log(rootval)
    //return
    let result = "";
    for (const key in rootval) {
      // Object.hasOwn() is used to exclude properties from the object's
      // prototype chain and only show "own properties"
      if (Object.hasOwn(rootval, key)) {
        result += `${rootkey}.${key} = ${rootval[key]}\n`;
      }
    }
    console.log(result);
  }
}

class Templater {
  #setting
  #tp
  #isNew
  #type
  #name

  constructor(setting,tp) {
    this.#setting = setting
    this.#tp = tp
  }
  
  async doTheWork() {
    this.#checkIsNewNote()
    await this.#findType()
    await this.#findName()
    await this.#rename()
  }

  getType() {
    return this.#type
  }

  #checkIsNewNote() {
    this.#isNew = true
  }

  async #findType() {
    this.#type="diary"
  }

  async #findName() {
    this.#name = "Notizname"
  }

  async #rename() {

  }

}



async function aa(tp, app) {
  let frontmatterYAML = {}
  let renderYAML = {____: ""}
  try {
    let cfg = user_configuration
    let setting = new Setting(cfg, tp)

    let templ = new Templater(setting, tp)
    await templ.doTheWork()
    setting.setType(templ.getType())

    frontmatterYAML = setting.getFrontmatterYAML()
    Object.assign(renderYAML, setting.getRenderYAML())
  } catch (e) {
    console.log("RETHROWING")
    throw e
  }

  return Object.assign({}, frontmatterYAML, renderYAML)
}

