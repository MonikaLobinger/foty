module.exports = main; // templater call: await tp.user.onne(tp, app)
/**
 * type correspond to the deepest folder name of a note converted to 
 * lower case. 
 * So "project/chimney/note.md" and "project/costs/Chimney/Bill.md" will 
 * both have type "chimney".
 * 
 * values for key "marker" in TYPES have to be empty string or unique
 * 
 * For users, who are no programmers:
 * =================================
 * Everything between /* * / is comment, no code
 * Everything after // is comment, no code
 * Comments are written for users, some only for those who are programmers
 * //#region xyz and //#endregion are comments too; but they are not written
 * for users, they control folding in Visual Studio Code; 
 */
const dbg = false;

//#region SETTINGS ONNE_FRONTMATTER_ENTRIES TYPES FOLDER2TYPES
//#region callbacks
  function creat(tp, notename, type){ return tp.date.now(); }
  function autag(tp, notename, type){ return "0/"+type; }
  function alias(tp, notename, type){ 
    let alias = notename;
    if(type != "ort" && type != "person") {
      alias = notename.replace(/,/g,` `).replace(/  /g,` `);
    } else { // ort, person
      alias = notename.replace(/, /g,`,`);
      let strArr = alias.split(",");
      alias = strArr[0];
      strArr.shift();
      if(type == "ort") {
        alias += "(" + strArr.join(' ') + ")";
      } else if(type == "person") {
        alias = strArr.join(' ') + " " + alias;
      }
    }
    return alias;
  }
  function cscls(tp, notename, type){ return type; }
//#endregion callbacks
/** key: variablename 
 *  value: {isList, default, ignore} */
const ONNE_FRONTMATTER_ENTRIES = {
  aliases:      {isList: true, defaut: alias,}, 
  date_created: {isList: false,defaut: creat,}, 
  tags:         {isList: true, defaut: autag,}, 
  publish:      {isList: false,defaut: false,},
  cssclass:     {isList: true, defaut: cscls,},
  private:      {isList: false,defaut: false,},
  position:     {ignore: true, }
};
//#region TYPES
/** key: typename 
 *  value: {marker, isDiary, foto, firstline, name_prompt, dateformat, before_date, frontmatter} */
const TYPES = {
  audio:          {marker: "{a}", isDiary: false, foto: "pexels-foteros-352505_200.jpg", name_prompt: "?Podcast/Reihe - Autornachname - Audiotitel", },
  buch:           {marker: "{b}", isDiary: false, foto: "pexels-gül-işık-2203051_200.jpg", name_prompt: "Autornachname - Buchtitel", },
  ort:            {marker: "",    isDiary: false, foto: "pexels-dzenina-lukac-1563005_200.jpg", name_prompt: "Ortsname, Land", },
  person:         {marker: "",    isDiary: false, foto: "pexels-lucas-andrade-14097235_200.jpg", name_prompt: "Personnachname, Personvorname ?Geburtsdatum", },
  video:          {marker: "{v}", isDiary: false, foto: "pexels-vlad-vasnetsov-2363675_200.jpg", name_prompt: "?Reihe - ?Autornachname - Videotitel", },
  web:            {marker: "{w}", isDiary: false, foto: "pexels-sururi-ballıdağ-_200.jpeg", name_prompt: "?Autor - Webseitentitel - ?Datum", },
  zitat:          {marker: "°",   isDiary: false, name_prompt: "Titel Autornachname", },
  zitate:         {marker: "°°",  isDiary: false, name_prompt: "Titel Autornachname", },
  exzerpt:        {marker: "$",   isDiary: false, name_prompt: "Autornachname - Buchtitel", },
  garten:         {marker: "",    isDiary: false, name_prompt: "Gartenthema", },
  gartentagebuch: {marker: "",    isDiary: true,  dateformat: "YY-MM-DD", before_date: "Garten ", },
  lesetagebuch:   {marker: "",    isDiary: true,  firstline: "## ArticleTitle\n[ntvzdf]link\n\n", dateformat: "YY-MM-DD", before_date: "Lesetagebucheintrag ", },
  pflanze:        {marker: "",    isDiary: false, name_prompt: "Pflanzenname", },
  unbedacht:      {marker: "",    isDiary: true,  dateformat: "YY-MM-DD", before_date: "Unbedacht ", },
  verwaltung:     {marker: "",    isDiary: false, name_prompt: "Verwaltungsthema", },
  diary:          {marker: "",    isDiary: true,  dateformat: "YYYY-MM-DD", },
  note:           {marker: "",    isDiary: false, name_prompt: "Notizthema", },
};
/** Overwriting defaut of ONNE_FRONTMATTER_ENTRIES in TYPES */
TYPES["diary"].frontmatter = {private: true, };
TYPES["verwaltung"].frontmatter = {private: true, };
TYPES["gartentagebuch"].frontmatter = {cssclass: "garten, tagebuch", };
TYPES["pflanze"].frontmatter = {cssclass: "garten", 
  Name: "",
  Sorte: "",
  Firma: "",
  vorhanden:"", 
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
  };
TYPES["lesetagebuch"].frontmatter = {cssclass: "tagebuch", };
TYPES["unbedacht"].frontmatter = {cssclass: "tagebuch", };
//#endregion
/** key: foldername 
 *  value: ["type1", "type2", "type3"] */
const FOLDER2TYPES = {
  exzerpte:       ["exzerpt"],
  garten:         ["garten"],
  gartentagebuch: ["gartentagebuch"],
  lesetagebuch:   ["lesetagebuch"],
  pflanzen:       ["pflanze"],
  unbedacht:      ["unbedacht"],
  verwaltung:     ["verwaltung"],
  zwischenreich:  ["audio", "buch", "ort", "person", "video", "web", 
                   "zitat", "zitate"],
  diary:          ["diary"],
  vaultroot:      ["note"],
  temp:           ["diary", "garten"],
};
const DEFAULTTYPE         = "note";
const ROOTKEY             = "vaultroot";
const RESOURCE_FOLDER     = "_resources/";
const RESOURCE_TYPES      = ["jpg", "jpeg", "png", "mp3", "midi"]
const NEWTITLES_ARRAY     = ["Unbenannt","Untitled"];
const DEFAULT_NAME_PROMPT = "Name der Notiz (ohne Kenner/Marker)";
const TYPE_PROMPT         = "Typ wählen";
const TYPE_MAX_ENTRIES    = 10; // Max entries in "type" drop down list
//#endregion SETTINGS

/** Returns whether "str" starts with a string in "prefix_array" 
 * @param {String} str - The title of the book.
 * @param {Array} prefix_array - string array to compare with
 * @returns {boolean}
*/
function startsWithOneOf(str, prefix_array) {
  let answer = false;
  prefix_array.every(prefix => { 
    if(str.startsWith(prefix)) {
      answer = true; 
      return false; // simulates break
    }
  });
  return answer;
}
/** Returns whether "value" is a resource
 * @param {any} value 
 * @param {Array} resourceTypes - array of strings, file extensions without
 *                                point
 * @returns {Boolean}
 */
function isResource(value, resourceTypes) {
  let answer = false;
  if(typeof value == "string") {
    let strArr = value.split(".");
    let ext = strArr[strArr.length-1];
    if(resourceTypes.contains(ext)) answer = true;
  }

  return answer;
}
/** Returns the plain folder name of the last folder of "noteWithPath" 
 * returns empty string for root entries
 * @param {String} noteWithPath
 * @param {boolean} tolowercase - convert result to lower case?
 * @returns {String}
*/
function deepestFolder(noteWithPath, tolowercase = false) {
  let lastFolderPart = "";
  let folderParts = noteWithPath.split('/');
  if(folderParts.length > 1) {
    lastFolderPart = folderParts[folderParts.length-2];
  }
  if(tolowercase) {
    lastFolderPart = lastFolderPart.toLowerCase();
  }
  return lastFolderPart;
}
/** Returns array of typenames corresponding to folder of "noteWithPath"
 * @param {String} noteWithPath 
 * @param {Object} folder2types - object with foldernames as keys
 *                                arrays of typenames as values
 * @returns {Array} - array of typenames, may be empty
 */
function typesFromFolder(noteWithPath, folder2types) {
  let types = [];
  let foldername_lc = deepestFolder(noteWithPath, true);
  if(foldername_lc.length == 0) foldername_lc = ROOTKEY;
  types = folder2types[foldername_lc];
  if(types == undefined) types = [];
  return types;
}
/** Returns array of typenames corresponding to marker in "noteTitle" 
 * and contained in "typesInQuestion".
 * @param {String} noteTitle - note name without extension
 * @param {Array} typesInQuestion - array of typenames to consider
 * @param {Object} typeDefs - object with types as keys
 *                            objects with type settings as values
 * @returns {Array} - array of typenames, should not be empty 
 */
function typesFromMarker(noteTitle, typesInQuestion, typeDefs) {
  let types = [];
  let type = undefined;
  let noMarker  = [];
  let marker = undefined;
  let markerlen = 0;
  let typelen = 0;
  for (const [key, value] of Object.entries(typeDefs)) { 
    if(typesInQuestion.length > 0 && !typesInQuestion.includes(key)) 
      continue;
    marker = value["marker"];
    markerlen = marker.length;
    if(markerlen == 0) {
      noMarker.push(key);
    } else if(noteTitle.startsWith(marker)) {
      if(markerlen > typelen) {
        typelen = markerlen;
        type = key;
      }
    }
  }
  if(type != undefined) types.push(type);
  else types = noMarker;
  return types;
}
/** Returns type of "noteWithPath" as String 
 * @param {Object} tp - Templater interface object
 * @param {String} noteWithPath 
 * @param {boolean} isNew 
 * @param {Object} typeDefs - object with types as keys
 *                            objects with type settings as values
 * @param {String} defaulttype 
 * @param {Object} folder2types - object with foldernames as keys
 *                                arrays of typenames as values
 * @returns {String} - type, will not be empty
 */
async function findType(tp, noteWithPath, isNew, typeDefs, defaulttype, 
                        folder2types) { 
  let type = defaulttype;
  let types_m = [];
  let types_f = typesFromFolder(noteWithPath, folder2types);
  if(!isNew) types_m = typesFromMarker(tp.file.title, types_f, typeDefs);
  if(types_m.length > 1) {
    // existing note, no marker,all types poss. in this folder for no marker
    type = await tp.system.suggester(types_m, types_m, 
      false, TYPE_PROMPT, TYPE_MAX_ENTRIES);
  } else if(types_f.length > 1) {
    // new note, all types which are possible in this folder
    type = await tp.system.suggester(types_f, types_f,
      false, TYPE_PROMPT, TYPE_MAX_ENTRIES);
  } else { 
    // exactly one type based on marker or on folder or none type found
    type = types_m.length > 0 ? types_m[0] : 
           types_f.length > 0 ? types_f[0] :
           defaulttype;
  }
  return type;
}
/** Returns the note name without marker and without file extension
 * @param {Object} tp - Templater interface object
 * @param {String} noteTitle - note name without extension
 * @param {boolean} isNew 
 * @param {Object} typeSettings - objects with attribute names as keys
 *                                and type settings as values
 * @param {String} default_name_prompt
 * @returns {String}
 */
async function findName(tp, noteTitle, isNew, typeSettings, 
                        default_name_prompt) {
  let name = "";
  if(!isNew) {
    let marker = typeSettings["marker"];
    if(marker == undefined) marker = "";
    name = noteTitle.substring(marker.length);
  } else {
    let isDiary = typeSettings["isDiary"];
    if(isDiary) {
      let before_date = typeSettings["before_date"];
      if(before_date == undefined) before_date = "";
      let dateformat = typeSettings["dateformat"];
      if(dateformat == undefined) dateformat = "YYYY-MM-DD";
      name = before_date + tp.date.now(dateformat);
    } else {
      let prompt = typeSettings["name_prompt"];
      if(prompt == undefined) prompt = default_name_prompt;
      name = await tp.system.prompt(prompt);
    }
  } 
  return name;
}
/**
 * @param {Object} tp - Templater interface object
 * @param {boolean} isNew 
 * @param {String} name - note name without marker and without extension
 * @param {Object} typeSettings - objects with attribute names as keys
 *                                and type settings as values
 */
async function rename(tp, isNew, name, typeSettings) {
  if(isNew) {
    let marker = typeSettings["marker"];
    if(marker == undefined) marker = "";
    await tp.file.rename(marker + name);
  }
}
/** returns object with key/undefined pairs created from keys in "entries".
 * Attributes in "entries" which contain an "ignore" key set to true, are 
 * not put into return object, if "skipIgnored" is true. If "skipIgnored"
 * is false, the "ignore" attribute is ignored.
 * @param {Object} entries - object with attributes, 
 *                           keys are frontmatter keys 
 *                           values are settings for the keys
 *                           One of those settings can be "ignored". 
 *                           But it has not to exist.
 * @param {boolean} skipIgnored 
 * @returns {Object} - Object with not ignored keys of "entries" as keys; 
 *                     all values are undefined
 */
function entries2pairs(entries, skipIgnored = true) {
  let pairs = {};
  for (const [key, val] of Object.entries(entries)) {  
    if(val.ignore == undefined  || val.ignore == false || !skipIgnored) {
      pairs[key] = undefined; 
    }
  }
  return pairs;
}
/** Returns object with not excluded key/value pairs from frontmatter.
 * Frontmatter attributes, with a key contained in "excludedEntries" as key
 * are excluded.
 * @param {Object} tp - Templater interface object
 * @param {Object} excludedEntries 
 * @returns {Object} - object with key/value pairs, values from frontmatter
 */
function getOtherPairs(tp, excludedEntries) {
  let otherPairs = {};
  for(const[key,val] of Object.entries(tp.frontmatter)) {
    if(!Object.keys(excludedEntries).includes(key))
      otherPairs[key] = val;
  }
  return otherPairs;
}
/** Returns changed "to", where for its keys values from "from" are set.
 * @param {Object} to -
 * @param {Object} from - 
 * @returns {Object} - changed "to"
 */
function copyValuesToExistingKeys(to, from) {
  for (const key in to) { 
    to[key] = from[key];
  }
  return to;
}
/** Sets Onne moduls default and overwritten values to "pairs"; 
 * replacing atomic values, preserving existing values in lists
 * @param {Object} tp - Templater interface object
 * @param {Object} pairs - object with key/value pairs
 * @param {String} name -note name without marker and without extension
 * @param {String} type 
 * @param {Object} entries - object with attributes, 
 *                           keys are frontmatter keys 
 *                           values are settings for the keys
 *                 this is where the default values come from
 * @param {Object} overwrites - object with attribute names as keys
 *                              and type specific values as values
 *                              can be undefined
 *                 this is where the overwritten values come from                          
 */
function setOnneValues(tp, pairs, name, type, entries, overwrites) {
  let overwrite = false;
  if(overwrites != undefined) overwrite = true;
  for (const key in pairs) { 
    let val = undefined;
    let templSettings = entries[key];
    if(templSettings == undefined)
      continue;
    let ignore = templSettings["ignore"];
    if(ignore != undefined && ignore == true)
      continue;
    let isList = templSettings["isList"];
    if(isList == undefined) isList = false;

    let existingValue = pairs[key];
    let valueExists = existingValue != undefined;
    let defaultValue = templSettings["defaut"];
    if(typeof defaultValue == "function" ) 
      defaultValue = defaultValue(tp, name, type);
    let overwriteValue = overwrite ? overwrites[key] : undefined;
    if(typeof overwriteValue == "function" ) 
      overwriteValue = overwriteValue(tp, name, type);
    val = overwriteValue != undefined ? overwriteValue : defaultValue;
    if(isList && valueExists && !existingValue.contains(val)) {
      pairs[key]= val + ", " + existingValue;
    } else {
      pairs[key]= val;
    }
  }
  // Additional attributes
  if(overwrite)
  for (const [key, val] of Object.entries(overwrites)) {  
    if(pairs[key] == undefined) {
        pairs[key] = val;
      }

    }
}
/**
 * @param {Object} tp - Templater interface object
 * @param {Object} app - Obsidian interface object
 * @param {Object} pairs - object with key/value Attributes
 * @param {Object} typeSettings - objects with attribute names as keys
 *                                and type settings as values
 * @param {String} resourceFolder
 * @param {Array} resourceTypes - array of strings, file extensions without
 *                                point
 */
function setRenderValues(tp, app, pairs, typeSettings, resourceFolder, 
  resourceTypes) {
  for (const key in pairs) { 
    if(typeSettings[key] != undefined) {
      if(isResource(typeSettings[key], resourceTypes)) {
        pairs[key]= resourceFolder + typeSettings[key];
      } else {
        pairs[key]= typeSettings[key];
      }
    }
  }
  if(typeSettings.isDiary) {
    let dateformat = typeSettings["dateformat"];
    if(dateformat == undefined) {
      dateformat = "YYYY-MM-DD";
    }
    let before_date = typeSettings["before_date"];
    if(before_date == undefined) {
      before_date = "";
    }
    pairs["prevdate"] = tp.user.diary_previous_file(tp, app, dateformat);
    pairs["nextdate"] = tp.user.diary_next_file(tp, app, dateformat);
    pairs["prevname"] = before_date + pairs["prevdate"];
    pairs["nextname"] = before_date + pairs["nextdate"];
  }
}

/* run_mode
   2: rechtsklich auf Ordner, neue Notiz
   2: Ctrl-N
   2: Clicken auf einen Leerlink
   1: Alt-E
   1: Templater: Open insert template modale

   leerlinks *)
   [[nodetitle]] - erzeugt Datei in aktuellem Ordner
   [[./nodetitle]] - Error: Folder already exists (before script starts)
   [[../test2 in root]] - Error: Folder already exists (before script starts)
   [[temp/thema2]] - erzeugt Datei in Ordner temp
   [[/test/°thema2]] - erzeugt Datei in Ordner test
   [[/test2 in root]] - erzeugt Datei in vault root

   *) Einstellungen:
      - Links immer aktualisieren: an
      - Standardordner für neue Notizen: aktueller Ordner
      - Link-Format: Relativer Pfad (von der aktuellen Datei)
      - [[Wiki-Links benutzen]]: an
*/
const isNewNote = startsWithOneOf;
async function main(tp, app) {
  if(dbg) console.log("main: START");
  let activeFile = tp.config.active_file.path;
  let runMode = tp.config.run_mode;
  let notePath = tp.file.path(true/*relative*/);
  let noteTitle = tp.file.title;
  let onneFmPairs = copyValuesToExistingKeys(
                    entries2pairs(ONNE_FRONTMATTER_ENTRIES), 
                    tp.frontmatter);
  if(dbg) console.log("main: AFTER copyValuesToExistingKeys");
  let isNew = isNewNote(noteTitle, NEWTITLES_ARRAY);
  if(dbg) console.log("main: AFTER isNewNote");
  let type = 
    await findType(tp, notePath, isNew, TYPES, DEFAULTTYPE, FOLDER2TYPES);
  if(dbg) console.log("main: AFTER findType");
  let name = 
    await findName(tp, noteTitle, isNew, TYPES[type], DEFAULT_NAME_PROMPT);
  if(dbg) console.log("main: AFTER findName");
  await rename(tp, isNew, name, TYPES[type]);
  if(dbg) console.log("main: AFTER rename");
  setOnneValues(tp, onneFmPairs, name, type, ONNE_FRONTMATTER_ENTRIES, 
               TYPES[type]["frontmatter"]);
  if(dbg) console.log("main: AFTER setOnneValues");
  let renderPairs = { 
    "____"      : "",
    "foto"      : "",
    "firstline" : "",
    "prevdate"  : "",
    "prevname"  : "",
    "nextdate"  : "",
    "nextname"  : "",
  };
  setRenderValues(tp, app, renderPairs, TYPES[type], RESOURCE_FOLDER, 
                  RESOURCE_TYPES);
                                  let testPairs = { __notePath: notePath, 
                                                    __noteTitle: noteTitle,
                                                    __activeFile: activeFile,
                                                    __runMode: runMode,
                                                    __targetFile: tp.config.target_file.path,
                                                    __templateFile: tp.config.template_file.path,
                                                    __name: name,
                                                    __type: type,
                                                    __isNew: isNew,                                                   
                                                  };
                                  if(!dbg) testPairs = undefined;

  if(dbg) console.log("main: AFTER setRenderValues");
  return Object.assign({}, onneFmPairs, 
                           getOtherPairs(tp, ONNE_FRONTMATTER_ENTRIES), 
                           testPairs, 
                           renderPairs);
}


