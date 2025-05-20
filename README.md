# foty
Erzeugen Sie eine neue Notiz in [Obsidian](https://obsidian.md/) und ein Template wird eingefügt, das vom Namen des Ordners abhängt.

## Einrichtung
- Kopiere [foty.js](https://github.com/MonikaLobinger/foty/blob/main/_scripts/foty.js) nach `SCRIPTFOLDER`
- Kopiere [foty_Vorlage.md](https://github.com/MonikaLobinger/foty/blob/main/_vorlagen/atest_Vorlage.md) nach `TEMPLATEFOLDER`
- Installiere Plugin [Templater](https://github.com/SilentVoid13/Templater) 
- Konfiguriere Templater 
  - `Template folder location` auf `TEMPLATEFOLDER` setzen
  - `Trigger Templater on new file creation` einschalten
  - `Enable file regex templates` einschalten
  - direkt darunter `file regex` für alle Dateien erzeugen: 
    - `.*` `TEMPLATEFOLDER/foty_Vorlage.md` 
  - `Script file folder location` auf `SCRIPTFOLDER` setzen

## Benutzung
Bei der Erzeugung neuer Notizen wird das Template `foty_Vorlage.md` nun immer eingefügt, und dies ruft das Script `foty.js` auf. 

Auch kann man über das Plugin `Templater` die Vorlage direkt in existiernede Dateien einfügen.

## Anpassung
Ganz oben in der Datei `SCRIPTFOLDER/foty.js` im Abschnitt SECTION_NOTETYPES (des Objekts `user_configuration`) verwalten Sie Typen für Notizen.

SECTION_NOTETYPES enthält einen Eintrag `__SPEC` und einen Eintrag `defaults` - diese beiden sind keine Notiztypen. Alles andere sind Notiztypen die abhängig vom Verzeichnis der neuen Notiz erzeugt werden.

Sie können sie alle bis auf einen löschen. Sie können sie umbenennen. Sie können sie verändern.

Um die Verzeichnisse festzulegen, in denen Notizen vom einem bestimmten Typ stehen dürfen, tragen Sie die Verzeichnisse unter dem Schlüssel `folders` ein. 

Wenn Notizen eines Types mit besimmten Zeichen beginnen sollen, tragen Sie diese Zeichenfolge unter dem Schlüssel `marker` ein.

Unter dem Schlüssel `frontmatter` stehen alle Einträge, die in als YAML in den Header der Notiz geschrieben werden.

Unter dem Schlüssel `page` stehen alle Einträge, die `foty_Vorlage` zur Weiterverarbeitung übermittelt bekommt.

Die Namen `frontmatter` und `page` sind nicht wesentlich, wichtig für diese Funktionalität ist ein Eintrag `RENDER` in einer `__SPEC` Sektion. Für `frontmatter` muss `RENDER` auf `false` gesetzt sein, for `page` auf true, für alle anderen Werte sollte `RENDER` fehlen. 

Haben Sie einen Notiztyp `buch`, mit einem `folders` Wert von `["buch"]` werden im Verzeichnis `/buch` aber auch im Verzeichnis `/buch/test` erzeugte Notizen den Typ `buch` erhalten. Ausser Sie haben noch einen Notiztyp `test`, mit einem `folders` Wert von `["test"], denn es wird die spezialisierteste Typedefinition gewählt, das tiefste Verzeichnis.

## Beispiel
In `SCRIPTFOLDER/foty.js` stehen zwei (sehr) einfache Beispielkonfigurationen. Die können sie aktivieren, indem Sie den Kommentar von der Zeile `//user_configuration = example_configurationN` entfernen - die Zeile sähe dann so aus: `user_configuration = example_configurationN`. (Das große `N` am Ende steht für die Nummer des Beispieles )

Über den Beispielen sind auf Englisch die Werte der Einträge genauer erklärt als dies ein einfacher Name kann.

## Some old English Words

Folder Types for [Obsidian](https://obsidian.md/), Plugin [Templater](https://github.com/SilentVoid13/Templater) has to be installed

|| [History of foty.js](https://github.com/MonikaLobinger/foty/commits/main/_scripts/foty.js) || [All main commits](https://github.com/MonikaLobinger/foty/commits/main) ||

This script [foty.js](https://github.com/MonikaLobinger/foty/blob/main/_scripts/foty.js) is called from template [atest_Vorlage.md](https://github.com/MonikaLobinger/foty/blob/main/_vorlagen/atest_Vorlage.md)

### Previous

The precursor of this script [onne.js](https://github.com/MonikaLobinger/foty/blob/main/_scripts/onne.js) is called from template [One_Vorlage.md](https://github.com/MonikaLobinger/foty/blob/main/_vorlagen/One_Vorlage.md)

But this is much to complicated and unstructured for my taste and it is not generic - changing my needs or being used for other users needs will result in code changes (not only data changes)

### Current

So I am working on a generic version.

Every line of code you do not write is good 

### JSDoc

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

