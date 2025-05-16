# Foldertypes

## Deutsch
`foty` ist ein Skript für Obsidian, mit dem es möglich ist, Notizen verschiedener
Art abhängig vom Verzeichnis zu erzeugen. Das Plugin `templater` muss in Obsidian
installiert sein. 

### Einführung
Obsidian erzeugt eine neue Notiz als eine leere Notiz oder fügt den Inhalt eines
Templates ein, das die Auswertung einiger weniger Variablen unterstützt. Für
jeden Typ von Notiz den man verwendet schreibt man ein Template und wählt bei
der Erstellung einer neuen Notiz das zu verwendende Template aus.

`templater` vereinfacht diesen Prozess - man kann verschiedene Templates festlegen
die nach dem Verzeichnis oder dem Namen der Notiz automatisch ausgewählt werden.
Ausserdem ist es mit `templater` möglich, Regeln zum Auswerten von weiteren
Variablen festzulegen. Diese schreibt man als JavaScript Funktionen.

### Problembeschreibung
Für jeden Typ von Notiz ist ein anderes Template nötig. Wenn sich die Anforderungen
ändern muss das Template geändert werden. Wenn sich allgemeine Anforderungen
ändern, müssen alle Templates geändert werden. Grössere Templates sind schwierig
zu bearbeiten. Nicht alle Nutzer können JavaScript Funktionen schreiben.

### Ziel von Foldertypes
Die Vorgaben für verschiedene Typen von Notizen sollen als Werte in einer
Konfiguration geschrieben werden. Aus dieser Konfiguration sollen Notizgerüste
verschiedener Typen erzeugt werden. Wenn sich die Anforderungen ändern, sollen
nur Werte der Konfiguration geändert werden müssen.

### Begrenzung von Foldertypes
Vorhandene Notizen werden nicht an geänderte Konfigurationswerte angepasst.

### Vorannahmen
Das Grundgerüst einer neuen Notiz wird einen Frontmatter Bereich am Dateikopf enthalten,  
gefolgt von einem darstellbaren Teil. Dieser kann einfaches Markdown enthalten oder
auch Text der von der Auswertung von Variablen abhängt, z.B. ein Datum oder Links
zu Resourcen.

Mit Erzeugung einer neuen Notiz wird ein semantischer Name abgefragt. Je nach
Typ der Notizen kann automatisch ein Kenner zum Namen hinzugefügt werden. Dieser
ist nicht Teil des semantischen Namen.

Typen von Notizen können an Verzeichnisse gebunden werden.

### Realisierung
`Foldertypes` besteht aus einer JavaScript Datei `foty.js` und einer Templatedatei
`foty_Vorlage.md`, die das Skript aufruft. Die Verwendung der Templatedatei
wird über die Konfiguration von `templater` veranlasst.

Das Script wird eine Liste von Schlüssel/Wert Paaren zurückgeben. Einer dieser
Schlüssel ist `'____'`. Vor diesem Schlüssel sind alle Paare für Frontmatter
bestimmt. Sie werden so wie sie sind in den Dateikopf geschrieben. Die Paare nach
`'____'` sind für den darstellbaren Teil. Die Schlüssel werden in der Templatedatei
verwendet um die Werte an geeigneter Stelle auf gewünschte Art darzustellen.

### Verwendung
#### Einrichtung
- Kopiere `foty_Vorlage.md` ins Vorlagenverzeichnis von Obsidian. Das 
Vorlagenverzeichnis ist in den Einstellungen `Strg-,` der `Obsidian-Erweitung` 
`Vorlagen` gesetzt.
- Kopiere `foty.js` in das Skriptverzeichnis des Notizbuchs.
- Installiere `templater`
- In der  Konfiguration von `templater` 
  - aktiviere `Trigger Templater on new file creation`
  - aktiviere `Enable File regex templates`
  - Setze `foty_Vorlage.md` als Vorlage für alle Dateien (`.*`)
  - Setze `Script files folder location` auf das Vorlagenverzeichnis.
  - Aktiviere `Enable user system command functions` 
#### Einstellungen


## English
Script for obsidian, templater extension needed
Creates new notes with frontmatter and text skeleton based on note types
 <p>
Basics<br>
======<br>
Obsidian creates a new note as empty note.
Notes of given kinds have some text in it in common. This text can be
inserted automatically with a template. One has to write the templates
for the kinds of notes one uses, choose the correct one on new note
creation and the skeleton will be inserted.
Code can also be written in javascript in case templater extension is
installed. This can be done within the template in specific code sections.
With templater parts of javascript code can be written in javascript files
which each export a function. This function can be called from within the
code section.
 <p>
Problem description<br>
====================<br>
For each kind of note another template is needed. If needs change, the
template has to be changed. If general needs change, all templates have
to be changed. Elaborated Templates are difficult to maintain. Not all
users of obsidian can write javascript.
 <p>
Intention of foty<br>
==================<br>
Let user needs be configurable and write a full note skeleton from given
configuration.
For changing needs only configuration should have to be changed.
 <p>
Presumptions<br>
=============<br>
Note skeleton will contain a frontmatter header and a rendered part.
Frontmatter header has frontmatter entries. Rendered part has plain text
and text based on variable output, e.g. date or links to resources.
 <p>
On new unnamed note creation note name will be created. Some kinds of
notes have a marker in its names, which do not belong to the semantic
title.
 <p>
This all has to be configurable based on kind of note. Different kinds
of notes in foty are called 'types'. The configuration of a type should
lead to expected output, after foty has identified the type and the
(semantic) title.
 <p>
Note types can be bound to folders.
 <p>
Realization<br>
===========<br>
foty consists of two parts: This javascript file and the template file,
which calls this script.
 <p>
The script will return a list of key/value entries. One of the keys
is '____'. Before this key all entries are frontmatter entries, entries
after this keys are variables to be used in render part.
 <p>
The template will write out all frontmatter entries in notes frontmatter
header section. Then it will write the render section depending on
variables.
 <p>
Connection between script and template is tight, the template has to know
the names of the variables.
 <p>
One could have realized it the way, that all the output is created from
script file, but than changes in rendering only would require javascript
editing.
### Usage
#### Initialize
- copy `foty_Vorlage.md` in template directory od Obsidian. The template 
directory is set in the settings `Ctrl-,` of the `core plugin` `Templates`.
- Copy `foty.js` in the script directory of the notebook.
- Install `templater`
- In  `templater` configuration 
  - activate `Trigger Templater on new file creation`
  - activate `Enable File regex templates`
  - Set `foty_Vorlage.md` as template for all files (`.*`)
  - Set `Script files folder location` to script directory.
  - activate `Enable user system command functions` 


## Internal
### Klassenfunktionen
Keines meiner Objekte hat (enumerable) Properties

Alle meine Objekte haben alle meine Tokens (hidden Properties)
außer RENDER, was als dreiwertig betrachtet wird

Meine Objekte sind alle AEssence oder abgeleitet

Objekte die keine Atome (Blätter) sind, sind alle Settings oder abgeleitet

Alle Worker sind Settings

Setting.at liefert eines von: Setting AEssence undefined
    Der Pfad "a.b.c" darf schon von a an undefiniert sein, a kann Worker sein

Setting.getValue liefert einen Wert oder undefined
    Der Pfad "a.b.c" darf schon von a an undefiniert sein, a kann Worker sein

Setting.getFrontmatterYAML .getRenderYAML
    Rekursiv alle Werte mit RENDER gesetzt auf (FALSE/TRUE), aber nicht Worker


Die möglichen Funktionen
GenePool      .addGene .hasGene .length .isA .toString
Essence       .SPEC_KEY .skipped .parse 
              .ROOT
              .FLAT
              ...
              .REPEAT
AEssence      
BreadCrumbs   .literal .parent .name .root .toString .toBreadcrumbs .throwIfUndefined .throwIfNotOfType
Setting       .workertsTypeForChildren
              .children
              .tp
              .iterator
              .has
              .at
              .getValue
              .getFrontmatterYAML
              .getRenderYAML
GeneralWorker      .getValue
LocalizationWorker .getValue
DialogWorker
TypesWorker   .getValue


### Tokens
| Name     |Vererbt|Benutzt|Bemerkung|
|----------|-------|-------|---------|
| ROOT     |   -   |intern | |
| FLAT     |   -   |intern | |
| PARSE    |   x   |intern | |
| REPEAT   |   -   |  ja   | nur TypesWorker, in Hauptobjekt, nur einer|
| DEFAULT  |   -   |  ja   | nur TypesWorker |
| VALUE    |   -   |  ja   | nur TypesWorker |
| IGNORE   |   x   |  ja   | nur TypesWorker |
| RENDER   |   x   |  ja   | nur TypesWorker |
| TYPE     |   x   |  ja   | nur TypesWorker |
| ONCE     |   -   | nein  | |
| LOCAL    |   x   | nein  | |
| INTERNAL |   x   | nein*)| |

Manche Tokens kann man im Literal (dem Konfigurationsobjekt) setzen. Sie müssen in einem Objekt mit dem Schlüssel __SPEC stehen. 
#### ROOT
Wird einmal für die Wurzel des Konfigurationsobjektes gesetzt. Wird intern für Dinge verwendet, die im ganzen Konfigurationsobjekt nur einmal vorkommen müssen, z.B. die Verbindung zum Templater.
#### FLAT
Wird automatisch für Atome (Blätter) gesetzt. Diese sind Objekte der  AEssence Klasse. Für Nodes ist der FLAT Wert false.  Nodes sind Objekte der Setting Klasse.
#### PARSE
Falls gesetzt, werden keine Token erzeugt und __SPEC nicht gelöscht
#### REPEAT
Falls gesetzt wird dieser Node rekursiv in alle Geschwister kopiert.
Der Node muß ein direkter Eintrag im __NOTE_TYPES Konfigurationsobjekt sein. Es wird nur nach einem REPEAT Eintrag gesucht. Weitere würden ignoriert werden.
#### DEFAULT
Die Worker können damit fehlende VALUE erzeugen. 
#### VALUE
todo
#### IGNORE
Falls gesetzt, wird dieser Node rekursiv ignoriert
#### RENDER
Dreiwertig: true, false, undefined. Falls false werden die Schlüssel/Werte Paare als Frontmatter Einträge an das Template übergeben; falls true werden die Schlüssel/Werte Paare an das Template übergeben, doch dieses muß den Namen des Schlüssels kennen; falls undefined erzeugt der Eintrag keine Ausgabe.
#### TYPE
todo
#### INTERNAL
*)Wird nicht benutzt, außer daß die Ausgabe einer Exception gefärbt wäre
#### LOCAL
unbenutzt
#### ONCE
unbenutzt

### __SPEC
In __SPEC stehen die Tokens drin, __SPEC selbst verschwindet
Wenn __SPEC fehlt wird es für ein Objekt {} und für ein Schlüssel/Wert Paar true
Wenn __SPEC ein Boolean ist, ist sein Eltern FLAT
Node: FLAT ist false
      __SPEC ist ein Objekt, definiert TYPE (evlt als Default)
Atom: FLAT ist true
      __SPEC false: TYPE bekommt Default Wert
      __SPEC true: TYPE bekommt globalen TYPE (alles ist erlaubt)
      In beiden Fällen: Nur wenn nicht explizit gesetzt
      Alle reinen Schlüssel/Wert Paare (ohne __SPEC) werden Atome
      

### Workers
Workers sind von Setting abgeleitet. Sie überschreiben vlt die Funktion getValue. Vielleicht bieten sie noch zusätzliche Funktionen an. getValue von Setting gibt den Wert zurück, falls da, undefined sonst.
Sie können auch im Konstruktor schon Sachen machen
#### GeneralWorker
Bearbeitet das Konfigurationsobjekt mit dem Schlüssel __GENERAL_SETTINGS.
getValue akzeptiert einen Fallback Value.
#### LocalizationWorker
Bearbeitet das Konfigurationsobjekt mit dem Schlüssel __TRANSLATE.
getValue arbeitet als translate Funktion, auch akzeptiert  es einen Fallback Value
#### DialogWorker
Bearbeitet das Konfigurationsobjekt mit dem Schlüssel __DIALOG_SETTINGS.
Überschreibt nichts, hat keine zusätzlichen Funktionen
#### TypesWorker
Bearbeitet das Konfigurationsobjekt mit dem Schlüssel __NOTE_TYPES.
getValue akzeptiert einen Fallback Value. Der Clou dieses Worker ist, daß er im Konstruktor die REPEAT Knoten im Literal vervielfältigt.
