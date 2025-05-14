module.exports = aa

let user_configuration = {
  __GENERAL:
  { 
    language: "de",
    relative_path: true,
    directory_seperator: "/" 
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
    DEFAULTNOTE: "note",
    note: {
      ISNOTETYPE: true,
      krummel: {VALUE: 2025, RENDER: true}
    },
    diary: {
      ISNOTETYPE: true,
      RENDER: true,
      VALUE: "WERT",
      showdate: true, 
      dateformat: "YYYY-MM-DD",
      date: {VALUE: 2025, RENDER: true},
      folder: "diary"
    },
    soso: {VALUE: "naja", RENDER: false,},
    c:    {pict2: "Russian-Matroshka2.jpg", RENDER: true, },
    pict: {VALUE: "Russian-Matroshka2.jpg", RENDER: true, },
    }    
}

class Setting {
  
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
  
  constructor(cfg, tp) {
    this.#tp = tp
    this.#cfg = cfg
    this.#general = new GeneralSetting(this.#cfg.__GENERAL)
    this.#translate = new TranslateSetting(this.#cfg.__TRANSLATE, this.#general)
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
    
    
    let result = "";
    for (const key in rootval) {
      
      
      if (Object.hasOwn(rootval, key)) {
        result += `${rootkey}.${key} = ${rootval[key]}\n`;
      }
    }
    console.log(result);
  }
  static get(key, cfg, fallback) {
    let answer = cfg[key]
    return answer === undefined ? fallback : answer
  }
}

class GeneralSetting {
  
  #cfg
  
  constructor(cfg) {
    this.#cfg = cfg
  }
  get(key,fallback) {
    return Setting.get(key,this.#cfg,fallback)
  }
}

class TranslateSetting {
  
  #cfg
  #generalCfg
  #lang
  
  constructor(cfg, generalCfg) {
    this.#cfg = cfg
    this.#generalCfg = generalCfg
    this.#lang = this.#generalCfg.get("language","en")
  }

  doTranslate(kenner, language, fallback) {
    let translation
    let entry = this.#cfg[kenner]
    if(typeof entry === "string") {
      translation = entry
    } else if(typeof entry === "object" && Array.isArray(entry)) {
      for (const langPair of entry) {
        if (Array.isArray(langPair) && langPair.length > 1) {
          if (langPair[0] == language) {
            translation = langPair[1]
            break
          }
          if (fallback == undefined) {
            fallback = langPair[1]
          }
        } else break
      }
    } 
    if (translation === undefined) {
      translation = fallback === undefined ? kenner : fallback
    }
    return translation
  }

  translate(kenner, fallback) {
    return this.doTranslate(kenner, this.#lang, fallback)
  }
  get(key,fallback) {
    return Setting.get(key,this.#cfg,fallback)
  }
}

class DialogSetting {
  
  #cfg
  
  constructor(cfg) {
    this.#cfg = cfg
  }
  get(key, fallback) {
    return Setting.get(key,this.#cfg,fallback)
  }
}

class NotesSetting {
  
  #cfg
  #types = {}
  #type
  #typecfg
  
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
  get(key,fallback) {
    return Setting.get(key,this.#cfg,fallback)
  }
  getMarker(fallback) {
    let answer = this.#typecfg["marker"]
    return answer === undefined ? fallback : answer
  }
  getFilename(fallback) {
    return fallback
  }
  getTypes() {
    return this.#types
  }
}
class doTheWork {
  #gen
  #loc
  #dlg
  #typ
  #defaults
  #filename
  #path_relative
  #path_absolute
  constructor(setting, tp) {
    this.#gen = setting.at(GENERAL_WORKER_KEY)
    this.#loc = setting.at(LOCALIZATION_WORKER_KEY)
    this.#dlg = setting.at(DIALOG_WORKER_KEY)
    this.#typ = setting.at(TYPES_WORKER_KEY)
    this.#defaults = this.#typ.at("DEFAULTS")
    this.#filename = tp.file.title
    this.#path_relative = tp.file.path(true)
    this.#path_absolute = tp.file.path(false)
  }
  isNewNote() {
    let answer = false
    let lang_array = [FALLBACK_LANGUAGE]
    let new_titles_array = []
    let lang = this.#gen.getValue("LANGUAGE", FALLBACK_LANGUAGE)
    if(0 != lang.localeCompare(FALLBACK_LANGUAGE)) {
      lang_array.push(lang)
    }
    lang_array.forEach((lang) => {
      new_titles_array.push(this.#loc.getValue("TITLE_NEW_FILE",lang))
    })
    new_titles_array.some(prefix => {
      answer = this.#filename.startsWith(prefix) ? true : false
      return answer
    });
    return answer
  }
  async findType(isNew) {
    let type = this.defaultType()
    let types_m = []
    let types_f = this.typesFromFolder()
  }
  defaultType() {
    let def = this.#typ.DEFAULT
    if(0 == def.length) {
      for (const [key, val] of this.#typ) {
        if(0 != key.localeCompare("DEFAULTS")) {
          def = key
          break
        }
      }
    }
    return def
  }
  typesFromFolder() {
    let types = [];
    let relative = this.#gen.getValue("RELATIVE_PATHS")
    let noteWithPath = relative ? this.#path_relative : this.#path_absolute
    let folderParts = noteWithPath.split(GLOBAL_ROOT_KEY);
    folderParts.unshift(GLOBAL_ROOT_KEY)
    folderParts.pop()
    folderParts.forEach((part)=> {
    })
    for (const [key, val] of this.#typ) {
      if(0 == key.localeCompare("DEFAULTS")) {
        continue
      }
      let folders = val.getValue("folders")
      if(folders === undefined) {
        folders = this.#defaults.at("folders").DEFAULT
      }
    }
    return types;
  }
}
async function findName(){
  return ""
}
async function rename(){
  return ""
}

class Templater {
  #tp
  #setting
  #translatesetting
  #generalsetting
  #dialogsetting
  #notessetting
  #isNew
  #notizname
  #filename
  #relative
  #path_relative
  #path_absolute
  #dirsep
  #notetype
  #types_f = []
  #types_m = []
  #marker = ""

  constructor(setting,tp) {
    this.#setting = setting
    this.#tp = tp
    this.#generalsetting = setting.general
    this.#translatesetting = setting.translate
    this.#notessetting = setting.notes
    this.#dialogsetting = setting.dialog

    this.#filename = tp.file.title
    this.#path_relative = tp.file.path(true)
    this.#path_absolute = tp.file.path(false)
    this.#relative = this.#generalsetting.get("relative_path", true)

    this.#dirsep = this.#generalsetting.get("directory_seperator", "/")
 }
  
  async doTheWork() {
    this.#checkIsNewNote()
    await this.#findType()
    await this.#findName()
    await this.#rename()
  }


  #checkIsNewNote() {   
    let titles = []
    titles[0] = this.#translatesetting.doTranslate("title_new_file","en","")
    let title = this.#translatesetting.translate("title_new_file","")
    if(title != "" && title != titles[0]) titles[1]=title
    titles.some(prefix => { 
      this.#isNew = this.#filename.startsWith(prefix) ? true : false
      return this.#isNew
    })
  }

  async #findType() {   
    let defaulttype = this.#notessetting.get("DEFAULTNOTE", "note")
    this.typesFromFolder()
    if(!this.#isNew) {
      this.typesFromMarker()
    }
    let type_prompt = this.#translatesetting.translate("type_prompt", "Choose Type")
    let type_max_entries = this.#dialogsetting.get("type_max_entries", 10)
    if(this.#types_m.length > 1) {
      this.#notetype = await this.#tp.system.suggester(this.#types_m, 
        this.#types_m, false, type_prompt, type_max_entries);
    } else if(this.#types_f.length > 1) {
      this.#notetype = await this.#tp.system.suggester(this.#types_f, 
        this.#types_f, false, type_prompt, type_max_entries);
    } else { 
      this.#notetype = this.#types_m.length > 0 ? this.#types_m[0] : 
        this.#types_f.length > 0 ? this.#types_f[0] :
        defaulttype;
    }
    this.#notessetting.setType(this.#notetype)
    this.#marker = this.#notessetting.getMarker("")

  }
  typesFromFolder() {
    let noteWithPath = this.#relative ? this.#path_relative : this.#path_absolute
    let folderParts = noteWithPath.split(this.#dirsep);
    folderParts.pop()
    let noteTypes = this.#notessetting.getTypes()
    for (const key in noteTypes) {
      let folder = noteTypes[key].folder
      if(folder == undefined) continue
      folderParts.forEach(part => {
        if(folder.localeCompare(part) == 0) {
          this.#types_f.push(key)
        } 
      })
    }
  }
  typesFromMarker() {
    
    this.#types_m

  }

  async #findName() {
    this.#notizname = "";
    if(!this.#isNew) {
      this.#notizname = this.#filename.substring(this.#marker.length)
    } else {
        this.#notizname = this.#notessetting.getFilename("")
    }
    if(this.#notizname == "") {
      let prompt = this.#translatesetting.translate("name_prompt", "Pure Name of Note")
      this.#notizname = await this.#tp.system.prompt(prompt)
    }     
  }

  async #rename() {
    await(this.#tp.file.rename(this.#marker + this.#notizname))
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

    frontmatterYAML = setting.notes.getFrontmatterYAML()
    Object.assign(renderYAML, setting.notes.getRenderYAML())
  } catch (e) {
    console.log("RETHROWING")
    throw e
  }

  return Object.assign({}, frontmatterYAML, renderYAML)
}