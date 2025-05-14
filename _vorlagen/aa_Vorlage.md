---
<%_*
  let rendermode = false;
  let pict       = "";
  let firstline  = "";
  let prevdate   = "";
  let nextdate   = "";
  let prevname   = "";
  let nextname   = "";
  let lastline   = "";
  let results    = await tp.user.aa(tp, app); 
  for (const [key, value] of Object.entries(results)) {
    if(value == undefined) continue;
    if(key == "____") rendermode = true;
    if(rendermode) {
      switch(key) {
      case "pict":      pict      = value; break;
      case "firstline": firstline = value; break;
      case "prevdate":  prevdate  = value; break;
      case "nextdate":  nextdate  = value; break;
      case "prevname":  prevname  = value; break;
      case "nextname":  nextname  = value; break;
      case "lastline":  lastline  = value; break;
      default: break;
      }
    }
    if(!rendermode) {%>
<% key %>: <% value %>
<%_* } %>
<%_*} %>
---
# AAVORLAGE
<%_* if(pict!="") { %>
![picture](<% pict %>)
<%_* } %>
<%_* if(firstline!="") { %>
<% firstline %>
<%_* } %>


<%_* if(prevdate!=""&& nextdate!=""&&prevname!=""&&nextname!=""
) { %>
&#9668;[[<% prevname %>|<% prevdate %>]] - [[<% nextname %>|<% nextdate %>]]&#9658;
<%_* } %>
