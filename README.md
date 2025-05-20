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
- `npm install -D jsdoc`
- `npm install -D docdash`
- `npm install -D jsdoc-mermaid`
- Edit: `./node_modules/jsdoc-mermaid/index.js` replace `7.1.0` with `11.6.0`
  - OR: Download https://app.unpkg.com/mermaid@11.6.0/files/dist/mermaid.min.js
  - to `.` (current directory which is `NotebookDirectory/_`)    
  - Edit: `./node_modules/jsdoc-mermaid/index.js` replace `https://unpkg.com/mermaid@7.1.0/dist` with `..`
  - So source would be `src="../mermaid.min.js">`
- `cp jsdoc.css node_modules/docdash/static/styles`
- `./node_modules/.bin/jsdoc -c jsdocconf.js -r _scripts/foty.md _scripts/foty.js`
- open `./out/index.html` in Browser

