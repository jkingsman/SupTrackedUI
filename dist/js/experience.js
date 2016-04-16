"use strict";function setUpFriendsLoc(){$("#locations").empty(),makeAuthRequest("/consumption/locations","GET",null,"json",function(e,t,n){t.forEach(function(e){$("#locations").append('<option value="'+e.location+'"></option>')})}),$("#friends").empty(),makeAuthRequest("/consumption/friends","GET",null,"json",function(e,t,n){t.forEach(function(e){$("#friends").append('<option value="'+e.name+'"></option>')})})}function setUpMeta(){makeAuthRequest("/experience/"+experienceID,"GET",null,"json",function(e,t,n){var i=$("#metaDate").pickadate({format:"yyyy-mm-dd"}),o=t,a=i.pickadate("picker");a.set("select",new Date(1e3*t.date).toISOString().slice(0,10)),$("#metaTitle").val(t.title),$("#addTitleLabel").addClass("active"),$("#metaPanic").text(t.panicmsg),$("#metaPanicLabel").addClass("active"),t.rating_id&&$("#metaRating").val(t.rating_id),$("#metaTTime").empty(),$("#metaTTime").append('<option value="0">No T-Time</option>'),t.consumptions.forEach(function(e){$("#metaTTime").append('<option value="'+e.id+'">'+new Date(1e3*e.date).toISOString().slice(10,16).replace(/T/," ")+" -- "+e.count+" "+e.drug.unit+" "+e.drug.name+"</option>")}),t.ttime&&$("#metaTTime").val(t.ttime),makeAuthRequest("/drug/all","GET",null,"json",function(e,t,n){t.sort(function(e,t){return e=e.name.toLowerCase(),t=t.name.toLowerCase(),t>e?-1:e>t?1:0});var i;i=o.interactions?JSON.parse(o.interactions):[],i.length>0&&$("#interactionWarning").show(),t.forEach(function(e){var t=i.indexOf(e.id)>-1?'checked="true"':"";$("#drugCollection").append('<input id="interactionDrug'+e.id+'" '+t+' name="interactionDrug" type="checkbox"><label for="interactionDrug'+e.id+'">'+e.name+" ("+e.unit+")</label><br />"),$("#metaGroupDrug").append('<option value="'+e.id+'">'+e.name+" ("+e.unit+")</option>")}),$("#interactionList").html(i.map(function(e){return drugs[e].name}).join(", ")),$("#metaGroupDrug").val(0),null!==masterExp.groupDrug&&($("#metaGroupCount").val(masterExp.groupCount),$("#metaGroupDrug").val(masterExp.groupDrug)),setupMetaListeners()})})}function deleteExperience(){makeAuthRequest("/experience","DELETE",JSON.stringify({id:experienceID}),"json",function(e,t,n){return 200!==n?void Materialize.toast(e,6e3,"warning-toast"):void(window.location="/experiences.html")})}function populateRecents(){if(consumptions.length>0){$(".method-input").each(function(e){$(this).prepend('<option id="emptyMethodDelimiter" value="0" disabled>──────────────</option>')});var e=[],t=consumptions.slice();t.reverse(),t.forEach(function(t){e.indexOf(t.method.id)<0&&($(".method-input").each(function(e){$(this).prepend('<option value="'+t.method.id+'">'+t.method.name+"</option>")}),e.push(t.method.id))}),$(".method-input").each(function(e){$(this).val($("#"+$(this)[0].id+" option:first").val())}),$(".drug-input").each(function(e){$(this).prepend('<option id="emptyDrugDelimiter" value="0" disabled>──────────────</option>')});var n=[];t.forEach(function(e){n.indexOf(e.drug.id)<0&&($(".drug-input").each(function(t){$(this).prepend('<option value="'+e.drug.id+'">'+e.drug.name+" ("+e.drug.unit+")</option>")}),n.push(e.drug.id))}),$(".drug-input").each(function(e){$(this).val($("#"+$(this)[0].id+" option:first").val())})}}function drawConsumptions(){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(e,t,n){if(404===n)$("#consumptionsCollection").empty(),$("#consumptionsCollection").append('<li id="noConsumptions" class="collection-item"><div>No consumptions</div></li>');else{$("#consumptionsCollection").empty(),t.sort(function(e,t){return e.date-t.date}),consumptions=t,recentsPopulated||(populateRecents(),recentsPopulated=!0);var i=0;t.forEach(function(e){var t=[];t=e.friends.map(function(e){return e.name});var n="No friends";t.length>0&&(n=t.join(", "));var o="";masterExp.groupDrug===e.drug.id&&(o="grouped-"+Math.floor(i/masterExp.groupCount),i+=e.count),$("#consumptionsCollection").prepend('<li class="collection-item '+o+'" id="con-'+e.id+'"><span id="conDate">'+new Date(1e3*e.date).toISOString().slice(5,16).replace(/T/," ").replace("-","/")+'</span><span class="consumption-location hide-on-small-and-down pad-left-40">'+e.location+'</span><span class="consumption-friends hide-on-med-and-down pad-left-40">'+n+'</span><a href="#" title="Bulk Edit" onClick="bulkEdit()" class="secondary-content consumption-icon bulk-edit-button" style="display: none;"><i class="material-icons">library_books</i></a><a href="#" title="Edit" onClick="editConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">list</i></a><a href="#" title="Set to Now" onClick="setNow('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">alarm_on</i></a><a href="#" title="Duplicate" onClick="duplicateConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">call_split</i></a><a href="#" title="Delete" onClick="deleteConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">delete</i></a><a href="#" title="Clone Friend and Location Data" onClick="cloneData('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">input</i></a><br><span class="consumption-data">'+e.count+" "+e.drug.unit+' <a target="_BLANK" href="/analytics.html?'+e.drug.id+'">'+e.drug.name+"</a>, "+e.method.name+"</span></li>")})}})}function deleteConsumption(e){makeAuthRequest("/consumption","DELETE",JSON.stringify({id:e}),"json",function(t,n,i){return 200!==i?void Materialize.toast(t,6e3,"warning-toast"):(Materialize.toast("Consumption deleted",1e3,"success-toast"),makeAuthRequest("/experience/"+experienceID,"GET",null,"json",function(t,n,i){e===n.ttime&&makeAuthRequest("/experience","PUT",JSON.stringify({id:experienceID,ttime:0}),"json",function(e,t,n){return 200!==n?void Materialize.toast("Metadata save error: "+e,6e3,"warning-toast"):(Materialize.toast("Associated T-Time reset",1e3,"success-toast"),void setUpMeta())})}),void drawConsumptions())})}function setNow(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,n,i){n.forEach(function(t){if(t.id===e){var n={id:e,date:Math.floor(((new Date).getTime()-6e4*(new Date).getTimezoneOffset())/1e3)};makeAuthRequest("/consumption","PUT",JSON.stringify(n),"json",function(e,t,n){return 200!==n?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),void Materialize.toast("Consumption set to now",1e3,"success-toast"))})}})})}function cloneData(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,n,i){n.sort(function(e,t){return e.date>t.date?-1:e.date<t.date?1:0}),makeAuthRequest("/consumption","PUT",JSON.stringify({id:e,location:n[n.length-1].location}),"json",function(t,i,o){return 200!==o?void Materialize.toast(t.charAt(0).toUpperCase()+t.slice(1),6e3,"warning-toast"):(Materialize.toast("Location data cloned",1e3,"success-toast"),void(n[n.length-1].friends.length>0?n[n.length-1].friends.forEach(function(t,i){makeAuthRequest("/consumption/friend","POST",JSON.stringify({consumption_id:e,name:t.name}),"json",function(e,t,o){return 201!==o?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):void(i===n[n.length-1].friends.length-1&&(Materialize.toast("Friend data cloned",1e3,"success-toast"),drawConsumptions()))})}):Materialize.toast("No friends to clone",1e3)))})})}function duplicateConsumption(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,n,i){n.forEach(function(t){if(t.id===e){var n={date:Math.floor(((new Date).getTime()-6e4*(new Date).getTimezoneOffset())/1e3),count:t.count,experience_id:experienceID,drug_id:t.drug.id,method_id:t.method.id,location:t.location};makeAuthRequest("/consumption","POST",JSON.stringify(n),"json",function(e,n,i){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):0===t.friends.length?(Materialize.toast("Consumption duplicated",6e3,"success-toast"),void drawConsumptions()):void t.friends.forEach(function(e,i){makeAuthRequest("/consumption/friend","POST",JSON.stringify({consumption_id:n.id,name:e.name}),"json",function(e,n,o){i===t.friends.length-1&&(drawConsumptions(),Materialize.toast("Consumption duplicated",6e3,"success-toast"))})})})}})})}function editConsumption(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,n,i){n.forEach(function(t){if(t.id===e){$("#editID").val(t.id),$("#editCount").val(t.count);var n=$("#editDate").pickadate({format:"yyyy-mm-dd"}),i=n.pickadate("picker"),o=new Date(1e3*t.date);i.set("select",o.toISOString().slice(0,10),{format:"yyyy-mm-dd"}),$("#editTime").val(o.toISOString().slice(11,16).replace(/:/,"")),$("#edittimeLabel").addClass("active"),$("#editLocation").val(t.location),$("#editLocationLabel").addClass("active"),$("#editDrug").val(t.drug.id),$("#editMethod").val(t.method.id),$("#editFriendBox").empty(),0===t.friends.length?$("#editFriendBox").text("No friends!"):t.friends.forEach(function(e){$("#editFriendBox").append('<div class="chip" id="friend'+e.id+'" onClick="removeFriend('+e.id+')">'+e.name+"</div>")}),$("#editConsumptionModal").openModal(),$("#editDate_root").attr("tabindex","-1"),$("#editCount").focus()}})})}function addBeFriend(){var e=$("#beAddFriend").val().replace(/ /g,"-")+"-add";$("#beAddFriendBox").append('<div class="chip" id="'+e+'" onClick="$(\'#'+$("#beAddFriend").val().replace(/ /g,"-")+"-add').remove();\">"+$("#beAddFriend").val()+"</div>"),$("#beAddFriend").val("")}function delBeFriend(){var e=$("#beDelFriend").val().replace(/ /g,"-")+"-del";$("#beDelFriendBox").append('<div class="chip" id="'+e+'" onClick="$(\'#'+$("#beDelFriend").val().replace(/ /g,"-")+"-del').remove();\">"+$("#beDelFriend").val()+"</div>"),$("#beDelFriend").val("")}function removeFriend(e){makeAuthRequest("/consumption/friend","DELETE",JSON.stringify({id:e}),"json",function(t,n,i){return 200!==i?void Materialize.toast(t.charAt(0).toUpperCase()+t.slice(1),6e3,"warning-toast"):($("#friend"+e).remove(),void drawConsumptions())})}function setUpConsumptions(){var e=$("#addDate").pickadate({format:"yyyy-mm-dd"}),t=e.pickadate("picker");t.set("select",new Date);var n=new Date;$("#addTime").val(("0"+n.getHours()).slice(-2)+("0"+n.getMinutes()).slice(-2)),$("#addtimeLabel").addClass("active"),setUpFriendsLoc(),makeAuthRequest("/drug/all","GET",null,"json",function(e,t,n){return t.sort(function(e,t){return e=e.name.toLowerCase(),t=t.name.toLowerCase(),t>e?-1:e>t?1:0}),t.length<1?void $(".drug-input").each(function(e){$(this).append('<option value="" disabled selected>None</option>')}):void t.forEach(function(e){$(".drug-input").each(function(t){$(this).append('<option value="'+e.id+'">'+e.name+" ("+e.unit+")</option>")})})}),makeAuthRequest("/method/all","GET",null,"json",function(e,t,n){return t.sort(function(e,t){return e=e.name.toLowerCase(),t=t.name.toLowerCase(),t>e?-1:e>t?1:0}),t.length<1?void $(".method-input").each(function(e){$(this).append('<option value="" disabled selected>None</option>')}):void t.forEach(function(e){$(".method-input").each(function(t){$(this).append('<option value="'+e.id+'">'+e.name+"</option>")})})})}function drawMedia(){makeAuthRequest("/media/search","POST",JSON.stringify({association_type:"experience",association:experienceID}),"json",function(e,t,n){null!==t&&t.forEach(function(e,t){t%4===0&&$("#media").append('<div id="row'+Math.floor(t/4)+'" class="row"></div>');getCookie("server")+"/media/file/"+e.id;$("#row"+Math.floor(t/4)).append('<div class="col s12 m3"><div class="card"><div class="card-image"><a id="imagelink'+e.id+'"><img id="image'+e.id+'"/><span class="card-title" style="background-color: rgba(0, 0, 0, 0.5);">'+e.title+'</span><a/></div><div class="card-content"><p>'+new Date(1e3*e.date).toISOString().slice(5,16).replace(/T/," ").replace("-","/")+"</p></div></div></div>"),makeAuthBlobRequest("/media/file/"+e.id,function(t){var n=window.URL||window.webkitURL;$("#image"+e.id).attr("src",n.createObjectURL(t)),$("#imagelink"+e.id).attr("href",n.createObjectURL(t))})})})}function openNewModal(){if(consumptions){var e,t=consumptions.map(function(e){return e.location}),n={},i=0;t.forEach(function(t){n[t]=(n[t]||0)+1,n[t]>i&&(e=t)}),$("#addLocation").val(e),$("#locationLabel").addClass("active")}$("#addConsumptionModal").openModal(),$("#addDate_root").attr("tabindex","-1"),$("#addCount").focus()}function bulkEdit(){if(0===$(".bulk-edit-selected").length)return void Materialize.toast("No consumptions selected",1e3,"warning-toast");var e=[],t=[];$(".bulk-edit-selected").each(function(t){e.push(Number($(this)[0].id.slice(4)))}),consumptions.forEach(function(n){e.indexOf(n.id)>-1&&t.push(n)}),$("#beConList").empty(),$("#beEntrieCount").html(e.length),t.forEach(function(e){var t="None";e.friends.length>0&&(t=e.friends.map(function(e){return e.name}).join(", "));var n="<td>"+new Date(1e3*e.date).toISOString().slice(5,16).replace(/T/," ").replace("-","/")+"</td><td>"+e.count+"</td><td>"+e.drug.unit+" "+e.drug.name+"</td><td>"+e.method.name+"</td><td>"+t+"</td>";$("#beConList").append("<tr>"+n+"</tr>")}),$("#beConsumptionModal").openModal()}function setupMetaListeners(){$("#metaTitle, #metaDate, #metaPanic, #metaRating, #metaTTime, #metaGroupDrug, #metaGroupCount, input[name='interactionDrug']").on("change keyup paste",function(){if(initialMetaMsgFired){clearTimeout(metaSaveNotificationTimeout);var e=null,t=null;"0"!==$("#metaGroupDrug").val()&&(e=$("#metaGroupDrug").val(),t=$("#metaGroupCount").val().length<1?1:$("#metaGroupCount").val()),metaSaveNotificationTimeout=setTimeout(function(){var n={id:experienceID,title:$("#metaTitle").val(),date:Math.floor(new Date($("#metaDate").val()+"T00:00:00").getTime()/1e3),panicmsg:$("#metaPanic").val(),groupCount:t,groupDrug:e,rating_id:$("#metaRating").val(),ttime:$("#metaTTime").val()};makeAuthRequest("/experience","PUT",JSON.stringify(n),"json",function(e,t,n){return 200!==n?void Materialize.toast("Metadata save error: "+e,6e3,"warning-toast"):($("#title").text($("#metaTitle").val()),void Materialize.toast("Metadata saved.",1e3))})},1e3)}else initialMetaMsgFired=1}),$("input[name='interactionDrug']").on("change",function(){var e=[];$("input[name='interactionDrug']:checked").each(function(t){e.push(this.id.split("interactionDrug")[1])});var t="["+e.join(", ")+"]",n={id:experienceID,interactions:t};makeAuthRequest("/experience","PUT",JSON.stringify(n),"json",function(t,n,i){return 200!==i?void Materialize.toast("Interactions save error: "+t,6e3,"warning-toast"):(Materialize.toast("Interactions saved.",1e3),void $("#interactionList").html(e.map(function(e){return drugs[e].name}).join(", ")))})})}var experienceID=location.search.slice(1),noteSaveNotificationTimeout,metaSaveNotificationTimeout,masterExp,consumptions,drugs=[],recentsPopulated=!1,initialMetaMsgFired=0;$("#addFriendForm").submit(function(e){e.preventDefault();var t=$("#addFriend").val();makeAuthRequest("/consumption/friend","POST",JSON.stringify({consumption_id:$("#editID").val(),name:t}),"json",function(e,t,n){return 201!==n?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):($("#editFriendBox").html($("#editFriendBox").html().replace("No friends!","")),$("#editFriendBox").append('<div class="chip" id="friend'+t[0].id+'" onClick="removeFriend('+t[0].id+')">'+t[0].name+"</div>"),$("#addFriend").val(""),void drawConsumptions())})}),$("#addConsumption").submit(function(e){e.preventDefault();var t=Math.floor(Date.parse($("#addDate").val())/1e3),n=Math.floor($("#addTime").val()/100),i=$("#addTime").val()%100,o=3600*n+60*i,a=t+o,s={date:a,count:$("#addCount").val(),experience_id:experienceID,drug_id:$("#addDrug").val(),method_id:$("#addMethod").val(),location:$("#addLocation").val()};makeAuthRequest("/consumption","POST",JSON.stringify(s),"json",function(e,t,n){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),setUpMeta(),Materialize.toast("Consumption created",6e3,"success-toast"),void $("#addConsumptionModal").closeModal())})}),$("#beConsumption").submit(function(e){e.preventDefault();var t=[];$(".bulk-edit-selected").each(function(e){t.push(Number($(this)[0].id.slice(4)))});var n={},i=0;$("#beChangeCount").is(":checked")&&(n.count=Number($("#beCount").val())),$("#beChangeDate").is(":checked")&&(i=Number($("#beDate").val())),$("#beChangeLocation").is(":checked")&&(n.location=$("#beLocation").val()),$("#beChangeDrug").is(":checked")&&(n.drug_id=Number($("#beDrug").val())),$("#beChangeMethod").is(":checked")&&(n.method_id=Number($("#beMethod").val()));var o=[];consumptions.forEach(function(e){if(t.indexOf(e.id)>-1){var a=JSON.parse(JSON.stringify(n));a.id=e.id,a.date=e.date+60*i*60,o.push({path:"/consumption",method:"PUT",payload:JSON.stringify(a),format:"json"}),$("#beAddFriendBox").children().each(function(t){var n=$(this).html();o.push({path:"/consumption/friend",method:"POST",payload:JSON.stringify({consumption_id:e.id,name:n}),format:"json"})});var s=[];$("#beDelFriendBox").children().each(function(t){var n=$(this).html();e.friends.forEach(function(e){e.name===n&&s.push(e.id)}),s.forEach(function(e){o.push({path:"/consumption/friend",method:"DELETE",payload:JSON.stringify({id:e}),format:"json"})})})}}),o.forEach(function(e,t){makeAuthRequest(e.path,e.method,e.payload,e.formay,function(e,n,i){200!==i&&201!==i&&Materialize.toast(e+i,6e3,"warning-toast"),t===o.length-1&&(drawConsumptions(),setUpMeta(),Materialize.toast("Consumptions bulk edited",6e3,"success-toast"),$("#beConsumptionModal").closeModal())})})}),$("#editConsumption").submit(function(e){e.preventDefault();var t=Math.floor(Date.parse($("#editDate").val())/1e3),n=Math.floor($("#editTime").val()/100),i=$("#editTime").val()%100,o=3600*n+60*i,a=t+o,s={id:$("#editID").val(),date:a,count:$("#editCount").val(),experience_id:experienceID,drug_id:$("#editDrug").val(),method_id:$("#editMethod").val(),location:$("#editLocation").val()};makeAuthRequest("/consumption","PUT",JSON.stringify(s),"json",function(e,t,n){return 200!==n?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),setUpMeta(),Materialize.toast("Consumption edited",6e3,"success-toast"),void $("#editConsumptionModal").closeModal())})}),$(document).ready(function(){if("recent"===experienceID){var e=JSON.stringify({limit:1});return void makeAuthRequest("/experience/search","POST",e,"json",function(e,t,n){return 200!==n?void(window.location="/experiences.html"):void(window.location="/experience.html?"+t[0].id)})}makeAuthRequest("/experience/"+experienceID,"GET",null,"json",function(e,t,n){if(404===n||400===n)return $("#loading").hide(),void $("#noExperience").show();masterExp=t,$("#title").text(t.title),document.title=t.title+" | SupTracked";var i=new Date(1e3*t.date);$("#date").text(i.toISOString().slice(0,10)),makeAuthRequest("/drug/all","GET",null,"json",function(e,t,n){t.forEach(function(e){drugs[e.id]=e}),drawConsumptions(),drawMedia(),setUpConsumptions(),setUpMeta()}),$("#notesArea").text(t.notes),$("#notesArea").trigger("autoresize"),$("#notesMarkdown").html(cleanMarkdown(micromarkdown.parse($("#notesArea").val()))),$("#loading").hide(),$("#main").show(),$("ul.tabs").tabs("select_tab","consumptions")})}),$("#notesArea").on("change keyup paste",function(){clearTimeout(noteSaveNotificationTimeout),noteSaveNotificationTimeout=setTimeout(function(){makeAuthRequest("/experience","PUT",JSON.stringify({id:experienceID,notes:$("#notesArea").val()}),"json",function(e,t,n){return 200!==n?void Materialize.toast("Notes save error: "+e,6e3,"warning-toast"):void Materialize.toast("Notes saved",1e3,"success-toast")})},1e3)}),$("#beAddFriend").on("keydown",function(e){13===e.which&&(event.preventDefault(),addBeFriend())}),$("#beDelFriend").on("keydown",function(e){13===e.which&&(event.preventDefault(),delBeFriend())}),$("#notesMarkdown").on("click",function(){$("#notesMarkdown").hide(),$("#notesArea").show()}),$(window).keydown(function(e){if(18===e.keyCode){$("#quickConList").empty();var t=collateConsumptions(consumptions);for(var n in t)$("#quickConList").append("<li>"+t[n].count+" "+t[n].unit+" "+n+"</li>");$("#quickConList").show()}}),$(document).click(function(e){$(e.target)[0].id.startsWith("con-")&&($(e.target).toggleClass("bulk-edit-selected"),$(".bulk-edit-selected").length>0?$(".bulk-edit-button").show():$(".bulk-edit-button").hide())});