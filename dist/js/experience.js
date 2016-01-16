"use strict";function setUpMeta(){makeAuthRequest("/experience/"+experienceID,"GET",null,"json",function(e,t,i){var n=$("#metaDate").pickadate({format:"yyyy-mm-dd"}),o=n.pickadate("picker");o.set("select",new Date(1e3*t.date).toISOString().slice(0,10)),$("#metaTitle").val(t.title),$("#addTitleLabel").addClass("active"),$("#metaPanic").text(t.panicmsg),$("#metaPanicLabel").addClass("active"),t.rating_id&&$("#metaRating").val(t.rating_id),$("#metaTTime").empty(),$("#metaTTime").append('<option value="0">No T-Time</option>'),t.consumptions.forEach(function(e){$("#metaTTime").append('<option value="'+e.id+'">'+new Date(1e3*e.date).toISOString().slice(10,16).replace(/T/," ")+" -- "+e.count+" "+e.drug.unit+" "+e.drug.name+"</option>")}),t.ttime&&$("#metaTTime").val(t.ttime),makeAuthRequest("/consumption/locations","GET",null,"json",function(e,t,i){t.forEach(function(e){$("#locations").append('<option value="'+e.location+'"></option>')})})})}function deleteExperience(){makeAuthRequest("/experience","DELETE",JSON.stringify({id:experienceID}),"json",function(e,t,i){return 200!==i?void Materialize.toast(e,6e3,"warning-toast"):void(window.location="/experiences.html")})}function populateRecents(){if(consumptions.length>0){$("#addMethod").prepend('<option id="emptyAddMethodDelimiter" disabled>──────────────</option>'),$("#editMethod").prepend('<option id="emptyEditMethodDelimiter" disabled>──────────────</option>');var e=[];consumptions.forEach(function(t){e.indexOf(t.method.id)<0&&($("#emptyAddMethodDelimiter").before('<option value="'+t.method.id+'">'+t.method.name+"</option>"),$("#emptyEditMethodDelimiter").before('<option value="'+t.method.id+'">'+t.method.name+"</option>"),e.push(t.method.id))}),$("#addMethod").val($("#addDrug option:first").val()),$("#editMethod").val($("#editDrug option:first").val()),$("#addDrug").prepend('<option id="emptyAddDrugDelimiter" disabled>──────────────</option>'),$("#editDrug").prepend('<option id="emptyEditDrugDelimiter" disabled>──────────────</option>');var t=[];consumptions.forEach(function(e){t.indexOf(e.drug.id)<0&&($("#emptyAddDrugDelimiter").before('<option value="'+e.drug.id+'">'+e.drug.name+" ("+e.drug.unit+")</option>"),$("#emptyEditDrugDelimiter").before('<option value="'+e.drug.id+'">'+e.drug.name+" ("+e.drug.unit+")</option>"),t.push(e.drug.id))}),$("#addDrug").val($("#addDrug option:first").val()),$("#editDrug").val($("#editDrug option:first").val())}}function drawConsumptions(){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(e,t,i){404===i?($("#consumptionsCollection").empty(),$("#consumptionsCollection").append('<li id="noConsumptions" class="collection-item"><div>No consumptions</div></li>')):($("#consumptionsCollection").empty(),t.sort(function(e,t){return e.date>t.date?-1:e.date<t.date?1:0}),consumptions=t,recentsPopulated||(populateRecents(),recentsPopulated=!0),t.forEach(function(e){var t=[];t=e.friends.map(function(e){return e.name});var i="No friends";t.length>0&&(i=t.join(", ")),$("#consumptionsCollection").append('<li class="collection-item">'+new Date(1e3*e.date).toISOString().slice(5,16).replace(/T/," ").replace("-","/")+'<span class="consumption-location hide-on-small-and-down pad-left-40">'+e.location+'</span><span class="consumption-friends hide-on-med-and-down pad-left-40">'+i+'</span><a href="#" title="Edit" onClick="editConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">list</i></a><a href="#" title="Set to Now" onClick="setNow('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">alarm_on</i></a><a href="#" title="Duplicate" onClick="duplicateConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">call_split</i></a><a href="#" title="Delete" onClick="deleteConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">delete</i></a><a href="#" title="Clone Friend and Location Data" onClick="cloneData('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">input</i></a><br><span class="consumption-data">'+e.count+" "+e.drug.unit+" "+e.drug.name+", "+e.method.name+"</span></li>")}))})}function deleteConsumption(e){makeAuthRequest("/consumption","DELETE",JSON.stringify({id:e}),"json",function(t,i,n){return 200!==n?void Materialize.toast(t,6e3,"warning-toast"):(Materialize.toast("Consumption deleted",1e3,"success-toast"),makeAuthRequest("/experience/"+experienceID,"GET",null,"json",function(t,i,n){e===i.ttime&&makeAuthRequest("/experience","PUT",JSON.stringify({id:experienceID,ttime:0}),"json",function(e,t,i){return 200!==i?void Materialize.toast("Metadata save error: "+e,6e3,"warning-toast"):(Materialize.toast("Associated T-Time reset",1e3,"success-toast"),void setUpMeta())})}),void drawConsumptions())})}function setNow(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,i,n){i.forEach(function(t){if(t.id===e){var i={id:e,date:Math.floor(((new Date).getTime()-6e4*(new Date).getTimezoneOffset())/1e3)};makeAuthRequest("/consumption","PUT",JSON.stringify(i),"json",function(e,t,i){return 200!==i?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),void Materialize.toast("Consumption set to now",1e3,"success-toast"))})}})})}function cloneData(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,i,n){i.sort(function(e,t){return e.date>t.date?-1:e.date<t.date?1:0}),makeAuthRequest("/consumption","PUT",JSON.stringify({id:e,location:i[i.length-1].location}),"json",function(t,n,o){return 200!==o?void Materialize.toast(t.charAt(0).toUpperCase()+t.slice(1),6e3,"warning-toast"):(Materialize.toast("Location data cloned",1e3,"success-toast"),void(i[i.length-1].friends.length>0?i[i.length-1].friends.forEach(function(t,n){makeAuthRequest("/consumption/friend","POST",JSON.stringify({consumption_id:e,name:t.name}),"json",function(e,t,o){return 201!==o?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):void(n===i[i.length-1].friends.length-1&&(Materialize.toast("Friend data cloned",1e3,"success-toast"),drawConsumptions()))})}):Materialize.toast("No friends to clone",1e3)))})})}function duplicateConsumption(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,i,n){i.forEach(function(t){if(t.id===e){var i={date:Math.floor(((new Date).getTime()-6e4*(new Date).getTimezoneOffset())/1e3),count:t.count,experience_id:experienceID,drug_id:t.drug.id,method_id:t.method.id,location:t.location};makeAuthRequest("/consumption","POST",JSON.stringify(i),"json",function(e,t,i){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),void Materialize.toast("Consumption duplicated",6e3,"success-toast"))})}})})}function editConsumption(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,i,n){i.forEach(function(t){if(t.id===e){$("#editID").val(t.id),$("#editCount").val(t.count);var i=$("#editDate").pickadate({format:"yyyy-mm-dd"}),n=i.pickadate("picker"),o=new Date(1e3*t.date);n.set("select",o.toISOString().slice(0,10),{format:"yyyy-mm-dd"}),$("#editTime").val(o.toISOString().slice(11,16).replace(/:/,"")),$("#edittimeLabel").addClass("active"),$("#editLocation").val(t.location),$("#editLocationLabel").addClass("active"),$("#editDrug").val(t.drug.id),$("#editMethod").val(t.method.id),$("#editFriendBox").empty(),0===t.friends.length?$("#editFriendBox").text("No friends!"):t.friends.forEach(function(e){$("#editFriendBox").append('<div class="chip" id="friend'+e.id+'" onClick="removeFriend('+e.id+')">'+e.name+"</div>")}),makeAuthRequest("/consumption/friends","GET",null,"json",function(e,t,i){t.forEach(function(e){$("#friends").append('<option value="'+e.name+'"></option>')}),$("#editConsumptionModal").openModal()})}})})}function removeFriend(e){makeAuthRequest("/consumption/friend","DELETE",JSON.stringify({id:e}),"json",function(t,i,n){return 200!==n?void Materialize.toast(t.charAt(0).toUpperCase()+t.slice(1),6e3,"warning-toast"):($("#friend"+e).remove(),void drawConsumptions())})}function setUpConsumptions(){var e=$("#addDate").pickadate({format:"yyyy-mm-dd"}),t=e.pickadate("picker");t.set("select",new Date);var i=new Date;$("#addTime").val(("0"+i.getHours()).slice(-2)+("0"+i.getMinutes()).slice(-2)),$("#addtimeLabel").addClass("active"),makeAuthRequest("/drug/all","GET",null,"json",function(e,t,i){return t.sort(function(e,t){return e=e.name.toLowerCase(),t=t.name.toLowerCase(),t>e?-1:e>t?1:0}),t.length<1?($("#addDrug").append('<option value="" disabled selected>None</option>'),void $("#editDrug").append('<option value="" disabled selected>None</option>')):void t.forEach(function(e){$("#addDrug").append('<option value="'+e.id+'">'+e.name+" ("+e.unit+")</option>"),$("#editDrug").append('<option value="'+e.id+'">'+e.name+" ("+e.unit+")</option>")})}),makeAuthRequest("/method/all","GET",null,"json",function(e,t,i){return t.sort(function(e,t){return e=e.name.toLowerCase(),t=t.name.toLowerCase(),t>e?-1:e>t?1:0}),t.length<1?($("#addMethod").append('<option value="" disabled selected>None</option>'),void $("#editMethod").append('<option value="" disabled selected>None</option>')):void t.forEach(function(e){$("#addMethod").append('<option value="'+e.id+'">'+e.name+"</option>"),$("#editMethod").append('<option value="'+e.id+'">'+e.name+"</option>")})})}function drawMedia(){makeAuthRequest("/media/search","POST",JSON.stringify({association_type:"experience",association:experienceID}),"json",function(e,t,i){null!==t&&t.forEach(function(e,t){t%4===0&&$("#media").append('<div id="row'+Math.floor(t/4)+'" class="row"></div>');getCookie("server")+"/media/file/"+e.id;$("#row"+Math.floor(t/4)).append('<div class="col s12 m3"><div class="card"><div class="card-image"><a id="imagelink'+e.id+'"><img id="image'+e.id+'"/><span class="card-title" style="background-color: rgba(0, 0, 0, 0.5);">'+e.title+'</span><a/></div><div class="card-content"><p>'+new Date(1e3*e.date).toISOString().slice(5,16).replace(/T/," ").replace("-","/")+"</p></div></div></div>"),makeAuthBlobRequest("/media/file/"+e.id,function(t){var i=window.URL||window.webkitURL;$("#image"+e.id).attr("src",i.createObjectURL(t)),$("#imagelink"+e.id).attr("href",i.createObjectURL(t))})})})}function openNewModal(){if(consumptions){var e,t=consumptions.map(function(e){return e.location}),i={},n=0;t.forEach(function(t){i[t]=(i[t]||0)+1,i[t]>n&&(e=t)}),$("#addLocation").val(e),$("#locationLabel").addClass("active")}$("#addConsumptionModal").openModal()}var experienceID=location.search.slice(1),noteSaveNotificationTimeout,metaSaveNotificationTimeout,consumptions,recentsPopulated=!1,initialMetaMsgFired=0;$("#addFriendForm").submit(function(e){e.preventDefault();var t=$("#addFriend").val();makeAuthRequest("/consumption/friend","POST",JSON.stringify({consumption_id:$("#editID").val(),name:t}),"json",function(e,t,i){return 201!==i?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):($("#editFriendBox").html($("#editFriendBox").html().replace("No friends!","")),$("#editFriendBox").append('<div class="chip" id="friend'+t[0].id+'" onClick="removeFriend('+t[0].id+')">'+t[0].name+"</div>"),$("#addFriend").val(""),void drawConsumptions())})}),$("#addConsumption").submit(function(e){e.preventDefault();var t=Math.floor(Date.parse($("#addDate").val())/1e3),i=Math.floor($("#addTime").val()/100),n=$("#addTime").val()%100,o=3600*i+60*n,a=t+o,d={date:a,count:$("#addCount").val(),experience_id:experienceID,drug_id:$("#addDrug").val(),method_id:$("#addMethod").val(),location:$("#addLocation").val()};makeAuthRequest("/consumption","POST",JSON.stringify(d),"json",function(e,t,i){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),setUpMeta(),Materialize.toast("Consumption created",6e3,"success-toast"),void $("#addConsumptionModal").closeModal())})}),$("#editConsumption").submit(function(e){e.preventDefault();var t=Math.floor(Date.parse($("#editDate").val())/1e3),i=Math.floor($("#editTime").val()/100),n=$("#editTime").val()%100,o=3600*i+60*n,a=t+o,d={id:$("#editID").val(),date:a,count:$("#editCount").val(),experience_id:experienceID,drug_id:$("#editDrug").val(),method_id:$("#editMethod").val(),location:$("#editLocation").val()};makeAuthRequest("/consumption","PUT",JSON.stringify(d),"json",function(e,t,i){return 200!==i?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),setUpMeta(),Materialize.toast("Consumption edited",6e3,"success-toast"),void $("#editConsumptionModal").closeModal())})}),$(document).ready(function(){if("recent"===experienceID){var e=JSON.stringify({limit:1});return void makeAuthRequest("/experience/search","POST",e,"json",function(e,t,i){return 200!==i?void(window.location="/experiences.html"):void(window.location="/experience.html?"+t[0].id)})}makeAuthRequest("/experience/"+experienceID,"GET",null,"json",function(e,t,i){if(404===i)return $("#loading").hide(),void $("#noExperience").show();$("#title").text(t.title),document.title=t.title+" | SupTracked";var n=new Date(1e3*t.date);$("#date").text(n.toISOString().slice(0,10)),drawConsumptions(),drawMedia(),setUpConsumptions(),setUpMeta(),$("#notesArea").text(t.notes),$("#notesArea").trigger("autoresize"),$("#notesMarkdown").html(cleanMarkdown(micromarkdown.parse($("#notesArea").val()))),$("#loading").hide(),$("#main").show(),$("ul.tabs").tabs("select_tab","consumptions")})}),$("#notesArea").on("change keyup paste",function(){clearTimeout(noteSaveNotificationTimeout),noteSaveNotificationTimeout=setTimeout(function(){makeAuthRequest("/experience","PUT",JSON.stringify({id:experienceID,notes:$("#notesArea").val()}),"json",function(e,t,i){return 200!==i?void Materialize.toast("Notes save error: "+e,6e3,"warning-toast"):void Materialize.toast("Notes saved",1e3,"success-toast")})},1e3)}),$("#metaTitle, #metaDate, #metaPanic, #metaRating, #metaTTime").on("change keyup paste",function(){initialMetaMsgFired?(clearTimeout(metaSaveNotificationTimeout),metaSaveNotificationTimeout=setTimeout(function(){var e={id:experienceID,title:$("#metaTitle").val(),date:Math.floor(new Date($("#metaDate").val()+"T00:00:00").getTime()/1e3),panicmsg:$("#metaPanic").val(),rating_id:$("#metaRating").val(),ttime:$("#metaTTime").val()};makeAuthRequest("/experience","PUT",JSON.stringify(e),"json",function(e,t,i){return 200!==i?void Materialize.toast("Metadata save error: "+e,6e3,"warning-toast"):($("#title").text($("#metaTitle").val()),void Materialize.toast("Metadata saved.",1e3))})},1e3)):initialMetaMsgFired=1}),$("#notesMarkdown").on("click",function(){$("#notesMarkdown").hide(),$("#notesArea").show()});