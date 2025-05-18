---
<%_*
// line "## -footnotes" is for css:
// [data-heading="-footnotes"] {
//     display: none;
// }
    let notelastline="\
## Automatische Auflistungen\n\
### Tasks (automatisch)\n\
```dataview\n\
TASK WHERE file.name = this.file.name\n\
     AND !fullyCompleted\n\
```\n\
### Tags (automatisch)\n\
```dataview\n\
LIST WITHOUT ID file.tags \n\
WHERE file.name = this.file.name \n\
SORT file.tags DESC\n\
```\n\
## -footnotes\
"
    let didarylastline="## -footnotes"


    let rendermode = false;
    let type       = "";
    let pict       = "";
    let pict_width = 0;
    let firstline  = "";
    let prevlink   = "";
    let nextlink   = "";
    let lastline   = notelastline;
    let fugger     = false;
    let results    = await tp.user.foty(tp, app); 
    if(results.CANCELLED == true) {
        return
    }

    let knownKeys = ["aliases", "cssclass", "date_created", "private", "publish", "tags"];
    const yamlentries = new Map()
    let ll = false; 

    for (const [key, value] of Object.entries(results)) {
        if(value == undefined) continue;
        if(key == "____") rendermode = true;
        if(rendermode) {
            if(value == "") continue;
            switch(key) {
                case "type":      type       = value; break;
                case "pict":      pict       = value; break;
                case "pict_width":pict_width = value; break;
                case "firstline": firstline   = value; break;
                case "prevlink":  prevlink    = value; break;
                case "nextlink":  nextlink    = value; 
                                  if(nextlink != "") lastline  = didarylastline; 
                                  break;
                case "lastline":  lastline     = value; ll=true; break;
                case "fugger":    fugger       = value; break;
                default: break;
            }
        }
        if(!rendermode) {
            yamlentries.set(key,value);
        }
    } 
    if(fugger && !ll) {
        lastline="am ende "+type+"!"
    }

    knownKeys.forEach(key => {%>
<% key %>: <% yamlentries.get(key) %>
<%_*    yamlentries.delete(key);
    })
    yamlentries.forEach((val, key, m) => {%>
<% key %>: <% val %>
<%_*    yamlentries.delete(key);
    })
%>
---


<%_* if(pict!="") { 
         if(pict_width!=0) { %>
![|<% pict_width %>](<% pict %>)
<%_*     } else { %>
![](<% pict %>)
<%_*     } %>
<%_* } %>



<%_* if(firstline!="") { %>
# <% firstline %>
<%_* } -%>

<% tp.file.cursor(1) %>



<%_* if(nextlink!="") { %>
<%*      if(prevlink!="") { %>
&#9668;<% prevlink %>
<%_*     } _%>
- <% nextlink %>&#9658;
<%_* } %>



<%_* if(lastline!="") { %>
<% lastline %>
<%_* } %>
