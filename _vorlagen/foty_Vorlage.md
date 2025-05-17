---
<%_*
// line "## -footnotes" is for css:
// [data-heading="-footnotes"] {
//     display: none;
// }
let mylastline="\
## Automatische Auflistungen\n\
### Tasks (automatisch)\n\
```dataview\n\
TASK WHERE file.name = this.file.name\n\
     AND !fullyCompleted\n\
     AND !contains(text, \"Zu tun\")\n\
     AND !contains(text, \"Bin dabei\")\n\
     AND !contains(text, \"später\")\n\
     AND !contains(text, \"mach ich doch nicht\")\n\
     AND !contains(text, \"WICHTIG\")\n\
     AND !contains(text, \"Soll ich das tun\")\n\
```\n\
### Tags (automatisch)\n\
```dataview\n\
LIST WITHOUT ID file.tags \n\
WHERE file.name = this.file.name \n\
SORT file.tags DESC\n\
```\n\
## -footnotes\
"
  let rendermode = false;
  let pict       = "";
  let firstline  = "";
  let prevlink   = "";
  let nextlink   = "";
  let lastline   = mylastline;
  let results    = await tp.user.foty(tp, app); 
  if(results.CANCELLED == true) {
    return
  }
  for (const [key, value] of Object.entries(results)) {
    if(value == undefined) continue;
    if(key == "____") rendermode = true;
    if(rendermode) {
      if(value == "") continue;
      switch(key) {
      case "pict":      pict      = value; break;
      case "firstline": firstline = value; break;
      case "prevlink":  prevlink  = value; break;
      case "nextlink":  nextlink  = value; break;
      case "lastline":  lastline  = value; break;
      default: break;
      }
    }
    if(!rendermode) {%>
<% key %>: <% value %>
<%_* } %>
<%_*} %>
---
<%_* if(pict!="") { %>
![picture](<% pict %>)
<%_* } %>
<%_* if(firstline!="") { %>
# <% firstline %>
<%_* } %>
<% tp.file.cursor(1) %>
<%_* if(nextlink!="") { %>
  <%_* if(prevlink!="") { %>
 &#9668;<% prevlink %>
  <%_* } else { _%>
 
  <%_* } _%>
 - <% nextlink %>&#9658;
<%_* } %>
<%_* if(lastline!="") { %>
<% lastline %>
<%_* } %>
