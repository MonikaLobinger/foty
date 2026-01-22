# foty
Erzeugen Sie eine neue Notiz in [Obsidian](https://obsidian.md/) und ein Template wird eingefügt, das vom Namen des Ordners abhängt.
  
## English
### Installation
- Copy [foty.js](https://github.com/MonikaLobinger/foty/blob/main/_scripts/foty.js) to `SCRIPTFOLDER`
- Copy [foty_Vorlage.md](https://github.com/MonikaLobinger/foty/blob/main/_vorlagen/foty_Vorlage.md) to `TEMPLATEFOLDER`
- Install Plugin [Templater](https://github.com/SilentVoid13/Templater) 
- Configure Templater 
  - Set `Template folder location` to `TEMPLATEFOLDER` 
  - Switch `Trigger Templater on new file creation` on
  - Switch `Enable file regex templates` on
  - Next line create a `file regex` for all files: 
    - `.*` `TEMPLATEFOLDER/foty_Vorlage.md` 
  - Set `Script file folder location` to `SCRIPTFOLDER`

### Benutzung
On Creating new notes template `foty_Vorlage.md` now will alway be inserted, this calls script `foty.js`. 

With Plugin `Templater` the template can be inserted directly in existing files.

### Anpassung
On top of file `SCRIPTFOLDER/foty.js` in section SECTION_NOTETYPES (of object `user_configuration`) note types are stored.

SECTION_NOTETYPES has an entry `__SPEC` and an entry `defaults` - those are not a note type. All the other entires are note types, which will be created depending on the folder of the new note.

All of the notetypes besides one can be deleted. They can be renamed. They can be changed.

To link a folder to a note type, add folders to the key `folders`. 

If notes of a type should have a marker at the beginning of the name, add this string to the key `marker`.

The key `frontmatter` contains all entires which will be written as YAML to the notes header.

The key `page` contains all entries, which `foty_Vorlage` will retrieve for further work.

The names `frontmatter` and `page` are not important, that it works the entry `RENDER` has to exist in a `__SPEC` section. For `frontmatter` `RENDER` has to be `false`, for `page` true, in any other case `RENDER` should not be there. 

Is there a note type `buch` defined, having a  `folders` value `["buch"]` notes which will be created in folder `/buch` but even in subfolder `/buch/test` will get note type `buch`. But not if you additionally have defined a note type  `test`, with `folders` value `["test"], because the most deepest folder will be choosen.

### Example
In `SCRIPTFOLDER/foty.js` are two (very) simple example configurations. Activate them by removing the comment form the line `//user_configuration = example_configurationN`. Line then will look so: `user_configuration = example_configurationN`. (`N` means number of exmaple )

Über den Beispielen sind auf Englisch die Werte der Einträge genauer erklärt als dies ein einfacher Name kann.

## Deutsch
### Einrichtung
- Kopiere [foty.js](https://github.com/MonikaLobinger/foty/blob/main/_scripts/foty.js) nach `SCRIPTFOLDER`
- Kopiere [foty_Vorlage.md](https://github.com/MonikaLobinger/foty/blob/main/_vorlagen/foty_Vorlage.md) nach `TEMPLATEFOLDER`
- Installiere Plugin [Templater](https://github.com/SilentVoid13/Templater) 
- Konfiguriere Templater 
  - `Template folder location` auf `TEMPLATEFOLDER` setzen
  - `Trigger Templater on new file creation` einschalten
  - `Enable file regex templates` einschalten
  - direkt darunter `file regex` für alle Dateien erzeugen: 
    - `.*` `TEMPLATEFOLDER/foty_Vorlage.md` 
  - `Script file folder location` auf `SCRIPTFOLDER` setzen

### Benutzung
Bei der Erzeugung neuer Notizen wird das Template `foty_Vorlage.md` nun immer eingefügt, und dies ruft das Script `foty.js` auf. 

Auch kann man über das Plugin `Templater` die Vorlage direkt in existiernede Dateien einfügen.

### Anpassung
Ganz oben in der Datei `SCRIPTFOLDER/foty.js` im Abschnitt SECTION_NOTETYPES (des Objekts `user_configuration`) verwalten Sie Typen für Notizen.

SECTION_NOTETYPES enthält einen Eintrag `__SPEC` und einen Eintrag `defaults` - diese beiden sind keine Notiztypen. Alles andere sind Notiztypen die abhängig vom Verzeichnis der neuen Notiz erzeugt werden.

Sie können sie alle bis auf einen löschen. Sie können sie umbenennen. Sie können sie verändern.

Um die Verzeichnisse festzulegen, in denen Notizen vom einem bestimmten Typ stehen dürfen, tragen Sie die Verzeichnisse unter dem Schlüssel `folders` ein. 

Wenn Notizen eines Types mit besimmten Zeichen beginnen sollen, tragen Sie diese Zeichenfolge unter dem Schlüssel `marker` ein.

Unter dem Schlüssel `frontmatter` stehen alle Einträge, die in als YAML in den Header der Notiz geschrieben werden.

Unter dem Schlüssel `page` stehen alle Einträge, die `foty_Vorlage` zur Weiterverarbeitung übermittelt bekommt.

Die Namen `frontmatter` und `page` sind nicht wesentlich, wichtig für diese Funktionalität ist ein Eintrag `RENDER` in einer `__SPEC` Sektion. Für `frontmatter` muss `RENDER` auf `false` gesetzt sein, for `page` auf true, für alle anderen Werte sollte `RENDER` fehlen. 

Haben Sie einen Notiztyp `buch`, mit einem `folders` Wert von `["buch"]` werden im Verzeichnis `/buch` aber auch im Verzeichnis `/buch/test` erzeugte Notizen den Typ `buch` erhalten. Ausser Sie haben noch einen Notiztyp `test`, mit einem `folders` Wert von `["test"], denn es wird die spezialisierteste Typedefinition gewählt, das tiefste Verzeichnis.

### Beispiel
In `SCRIPTFOLDER/foty.js` stehen zwei (sehr) einfache Beispielkonfigurationen. Die können sie aktivieren, indem Sie den Kommentar von der Zeile `//user_configuration = example_configurationN` entfernen - die Zeile sähe dann so aus: `user_configuration = example_configurationN`. (Das große `N` am Ende steht für die Nummer des Beispieles )

Über den Beispielen sind auf Englisch die Werte der Einträge genauer erklärt als dies ein einfacher Name kann.


## JSDoc

- `cd NotebookDirectory/_`
- `mkdir _static`
- `npm install -D jsdoc`
- `npm install -D docdash`
- `npm install -D jsdoc-mermaid`
- Edit: `./node_modules/jsdoc-mermaid/index.js` replace `7.1.0` with `11.6.0`
  - OR: Download https://app.unpkg.com/mermaid@11.6.0/files/dist/mermaid.min.js
  - to `./_static/` (newly created subdirectory in current directory which is `NotebookDirectory/_`)
  - Edit: `./node_modules/jsdoc-mermaid/index.js` replace `https://unpkg.com/mermaid@7.1.0/dist` with `.`
  - So source would be `src="./mermaid.min.js">`
- `cp jsdoc.css node_modules/docdash/static/styles`
- `./node_modules/.bin/jsdoc -c jsdocconf.js -r _scripts/foty.md _scripts/foty.js`
- open `./out/index.html` in Browser

### Funktionierende Template Alternativen
#### [better-docs](https://github.com/SoftwareBrothers/better-docs)
SEHR SEHR gut, dreispaltig, Dezente Farben
- `npm install -D better-docs`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "node_modules/better-docs",`
#### [Docolatte](https://github.com/amekusa/docolatte)
ZIEMLICH COOL, nur die Seitenleiste enthält alles, Tag/Nacht Schalter
- `npm install -D docolatte` // Bunch of vulnerabilities
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "node_modules/docolatte",`
####  [@etercast/jsdoc-template](https://github.com/etercast/jsdoc-template)
COOl, anstrengend
- `npm install -D @etercast/jsdoc-template`
- install missing dependencies, e.g.
    - `npm install -D taffydb` // high severty vulnerability
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "node_modules/@etercast/jsdoc-template",`
#### [jsdoc-wmf-theme](https://github.com/wikimedia/jsdoc-wmf-theme)
NETT, Wikipedia eben
- `npm install -D jsdoc-wmf-theme`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "./node_modules/jsdoc-wmf-theme",`
    - add Plugin to array in line containing `plugins:`
        - `'node_modules/jsdoc-wmf-theme/plugins/default'`
    - on Error `Unexpected global detected`
        - add Global to line containing `allowedGlobals:`
#### [toast](https://github.com/antoinebigard/toast)
HÄSSLICH
- `npm install -D toast-jsdoc`
- install missing dependencies, e.g.
    - `npm install -D taffydb` // high severty vulnerability
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
       - `template: "node_modules/toast-jsdoc",`
#### [DocStrap](https://github.com/TonyGermaneri/docstrap)
OK
- `npm install -D ink-docstrap` // Schmeisst vulnerabilities rein
- install missing dependencies, e.g.
    - `npm install -D taffydb` // high severty vulnerability
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
       - `template: "./node_modules/ink-docstrap/template",`
#### [vue(x)docs](https://github.com/Delni/vue-x-docs)
HÜBSCH
- `npm install -D vue-x-docs`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "node_modules/vue-x-docs",`
    - add Plugin to array in line containing `plugins:`
        - `"node_modules/vue-x-docs",`
#### [Minami](https://github.com/Nijikokun/minami)
NICHT so mein Fall
- `npm install -D minami`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
       - `template: "node_modules/minami",`
#### [SmoothJSDoc (based on Minami)](https://github.com/prstn/SimpleJSDoc)
COOL
- `npm install -D simple-jsdoc
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
       - `template: "node_modules/simple-jsdoc",`
#### [classy-template](https://github.com/sleelin/classy-template)
KLASSEN SIND VERSCHWUNDEN, Dreispaltig, Keine Suche
- `npm install -D classy-template`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "node_modules/classy-template/",`
    - add Plugin to array in line containing `plugins:`
        - `'node_modules/classy-template/plugin.js'`


%% Läßt sich nicht installieren, gibt es in npm nicht mehr
#### [connect-jsdoc-theme](https://github.com/cloudblue/connect-jsdoc-theme)
- `npm install -D connect-jsdoc-theme`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
       - `template: "node_modules/connect-jsdoc-theme",`
%%
%% Kann nicht mit async
#### [jsdoc-rtd](https://github.com/athombv/jsdoc-rtd)
- `npm install -D jsdoc-rtd`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
       - `template: "./node_modules/jsdoc-rtd",`
%%
%% Kann nicht mit Mermaid
#### [clean-jsdoc-theme](https://github.com/ankitskvmdam/clean-jsdoc-theme)
- `npm install -D clean-jsdoc-theme`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "node_modules/clean-jsdoc-theme/",`
%%
%% Geht nicht, hat Probleme mit underscore module
#### [tidy-jsdoc](https://github.com/o2shine/tidy-jsdoc)
- `npm install -D tidy-jsdoc
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "./node_modules/tidy-jsdoc",`
%%
%% Geht nicht, hat Probleme mit underscore module
#### [Chameleon](https://github.com/gabidobo/jsdoc-chameleon-template)
- `npm install -D jsdoc-chameleon-template`
- install missing dependencies, e.g.
    - `npm install -D taffydb` // high severty vulnerability
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
       - `template: "node_modules/jsdoc-chameleon-template",`
%%
%% RIESENSAUEREI erstetzt nodemodules/.bin/jsdoc durch eine andere Version
#### [daybrush-jsdoc-template](https://github.com/daybrush/daybrush-jsdoc-template)
- `npm install daybrush-jsdoc-template`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "node_modules/daybrush-jsdoc-template",`
%%
%% Geht nicht, zeigt nur nav an, keinen Inhalt
#### [BCMC Docs Template](https://github.com/boxcrittersmods/jsdoc-template)
- `npm i github:boxcrittersmods/jsdoc-template`
- edit `.jsdocconf.js`
    - replace the line with `template`: with following line
        - `template: "./node_modules/bcmc-jsdoc-template/template",`
%%

