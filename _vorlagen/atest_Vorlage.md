---
<%_*
  let rendermode = false;
  let foto       = "";
  let firstline  = "";
  let prevdate   = "";
  let nextdate   = "";
  let prevname   = "";
  let nextname   = "";
  let results    = await tp.user.foty(tp, app); 
  for (const [key, value] of Object.entries(results)) {
    if(value == undefined) continue;
    if(key == "____") rendermode = true;
    if(rendermode) {
      switch(key) {
      case "foto":      foto      = value; break;
      case "firstline": firstline = value; break;
      case "prevdate":  prevdate  = value; break;
      case "nextdate":  nextdate  = value; break;
      case "prevname":  prevname  = value; break;
      case "nextname":  nextname  = value; break;
      default: break;
      }
    }
    if(!rendermode) {%>
<% key %>: <% value %>
<%_* } %>
<%_*} %>
---
<%_* if(foto.length > 0) { %>
![foto](<% foto %>)
<%_* } %>
<%_* if(firstline.length > 0) { %>
<% firstline %>
<%_* } %>


<%_* if(prevdate.length > 0 && 
nextdate.length > 0 &&
prevname.length > 0 &&
nextname.length > 0 
) { %>
&#9668;[[<% prevname %>|<% prevdate %>]] - [[<% nextname %>|<% nextdate %>]]&#9658;
<%_* } %>
