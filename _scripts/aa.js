module.exports = aa

let user_configuration = {
  __GENERAL:
  { 
    language: "de",
    relative_path: true,
  },
  __TRANSLATE:
  { 
    type_prompt:         [ ["en", "Choose type"], ["de", "Typ wählen"] ],
    title_new_file:      [ ["en", "Untitled"], ["de", "Unbenannt"] ],
    default_name_prompt: [ ["en", "Pure Name of Note"], ["de", "Name der Notiz (ohne Kenner/Marker)"] ],
  },
  __DIALOG:
  { 
    type_max_entries: 10,
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
  //#region members, with getter
  #tp
  #cfg
  #general
  #translate
  #dialog
  #notes

  get general() { return this.#general}
  get translate() { return this.#translate}
  get dialog() { return this.#dialog}
  get notes() { return this.#notes}
  //#endregion members
  constructor(cfg, tp) {
    this.#cfg = cfg
    this.#tp = tp
    this.#general = new GeneralSetting(this.#cfg.__GENERAL)
    this.#translate = new TranslateSetting(this.#cfg.__TRANSLATE)
    this.#dialog = new DialogSetting(this.#cfg.__DIALOG)
    this.#notes = new NotesSetting(this.#cfg.__NOTES)
    this.#cfg.__GENERAL = undefined
    this.#cfg.__TRANSLATE = undefined
    this.#cfg.__DIALOG = undefined
    this.#cfg.__NOTES = undefined
  }

  static deepCopy(from, to) {
    for (const key in from) {
      if(typeof from[key] === "object") {
        if(to[key] === undefined) {
          to[key] = {}
        } 
        Setting.deepCopy(from[key], to[key])
      } else {
        to[key] = from[key]
      }
    }
    return to
  }
  
  static assignVALUES(rootval, dst, rootname, isrender) {
    if(rootval.RENDER === isrender && rootval.VALUE != undefined) {
      dst[rootname] = rootval.VALUE
    }
    for (const key in rootval) {
      if(typeof rootval[key] === "object") {
        Setting.assignVALUES(rootval[key], dst, key, isrender)        
      }
    }
    return dst
  }

  static showProps(rootkey, rootval) {
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

class GeneralSetting {
  //#region members
  #cfg
  //#endregion members
  constructor(cfg) {
    this.#cfg = cfg
  }
}

class TranslateSetting {
  //#region members
  #cfg
  //#endregion members
  constructor(cfg) {
    this.#cfg = cfg
  }

  translate(kenner) {
    let translation = ""
    return translation
  }
}

class DialogSetting {
  //#region members
  #cfg
  //#endregion members
  constructor(cfg) {
    this.#cfg = cfg
  }
}

class NotesSetting {
  //#region members
  #cfg
  #types = {}
  #type
  #typecfg
  //#endregion members
  constructor(cfg) {
    this.#cfg = cfg
    for (const key in this.#cfg) {
      if (this.#cfg[key].ISNOTETYPE === true) {
        Setting.deepCopy(this.#cfg.DEFAULTS, this.#cfg[key])
        this.#types[key] = this.#cfg[key]
        this.#cfg[key] = undefined
      }
    }
    this.#cfg.DEFAULTS = undefined    
  }
  setType(type) {
    this.#type = type
    this.#typecfg = this.#types[this.#type]
  }
  getFrontmatterYAML() {
    let frontmatterYAML = {}
    Setting.assignVALUES(this.#typecfg, frontmatterYAML, this.#type, false)
    Setting.assignVALUES(this.#cfg, frontmatterYAML, "__NOTES", false)
    Setting.showProps(this.#type, frontmatterYAML)

    return frontmatterYAML
  }
  getRenderYAML() {
    let renderYAML = {}
    Setting.assignVALUES(this.#typecfg, renderYAML, this.#type, true)
    Setting.assignVALUES(this.#cfg, renderYAML, "__NOTES", true)
    Setting.showProps(this.#type, renderYAML)

    return renderYAML
  }
}

class Templater {
  #tp
  #setting
  #translatesetting
  #generalsetting
  #isNew
  #type
  #name

  constructor(setting,tp) {
    this.#setting = setting
    this.#tp = tp
    this.#generalsetting = setting.general
    this.#translatesetting = setting.translate
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
    this.#tp.file.title
    this.#translatesetting.translate("type_prompt")
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
    setting.notes.setType(templ.getType())

    frontmatterYAML = setting.notes.getFrontmatterYAML()
    Object.assign(renderYAML, setting.notes.getRenderYAML())
  } catch (e) {
    console.log("RETHROWING")
    throw e
  }

  return Object.assign({}, frontmatterYAML, renderYAML)
}

