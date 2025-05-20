<%*
    let rendermode = false;
    let type       = "";
    let pict       = "";
    let pict_width = 0;
    let firstline  = "";
    let prevlink   = "";
    let nextlink   = "";
    let lastline   = "";
    let fugger     = false; // used by example configurations
    
    
    let knownYAML  = ["aliases", "cssclass", "date_created", "private", "publish", 
                      "tags", "revised"];
    const inYAML   = new Map()
    let results    = await tp.user.foty(tp, app); 

    if(results.CANCELLED == true) { return }

    for (const [key, value] of Object.entries(results)) {
        if(value == undefined) continue;
        if(key == "____") rendermode = true;
        if(rendermode) {
            if(value == "") continue;
            switch(key) {
                case "type":      type       = value; break;
                case "pict":      pict       = value; break;
                case "pict_width":pict_width = value; break;
                case "firstline": firstline  = value; break;
                case "prevlink":  prevlink   = value; break;
                case "nextlink":  nextlink   = value; break;
                case "lastline":  lastline   = value; break;
                case "fugger":    fugger     = value; break;
                default: break;
            }
        } else { 
         inYAML.set(key,value); 
        }
    } 
    if(fugger && lastline != "") lastline="am ende "+type+"!";%>


<%_*// ***** WRITING Frontmatter ***** 
%>---<%*
    knownYAML.forEach(key => {%>
<% key %>: <% inYAML.get(key) %>
<%_*    inYAML.delete(key);
    })
    inYAML.forEach((val, key, m) => {%>
<% key %>: <% val %>
<%_*    inYAML.delete(key);
    })
%>
---


<%_*// ***** WRITING Picture ***** 
    if(pict!="") { 
        if(pict_width!=0) { %>
![|<% pict_width %>](<% pict %>)
<%_*} else { %>
![](<% pict %>)
<%_*    } %>
<%_*} %>



<%_* // ***** WRITING Firstline and setting Cursor***** 
    if(firstline!="") { %>
# <% firstline %>
<%_*} -%>

<% tp.file.cursor(1) %>


<%_* // ***** WRITING links to prev/next ***** 
if(nextlink!="") { %>
<%*      if(prevlink!="") { %>
&#9668;<% prevlink %>
<%_*     } _%>
- <% nextlink %>&#9658;
<%_* } %>



<%_* // ***** WRITING Lastline ***** 
    if(lastline!="") { %>
<% lastline %>
<%_* } %>
