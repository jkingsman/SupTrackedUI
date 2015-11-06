"use strict";function drawConsumptions(){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(e,t,i){404===i?($("#consumptionsCollection").empty(),$("#consumptionsCollection").append('<li id="noConsumptions" class="collection-item"><div>No consumptions</div></li>')):($("#consumptionsCollection").empty(),t.forEach(function(e){var t=[];t=e.friends.map(function(e){return e.name});var i="No friends";t.length>0&&(i=t.join(", ")),$("#consumptionsCollection").append('<li class="collection-item">'+new Date(1e3*e.date).toISOString().slice(0,16).replace(/T/," ")+'<span class="consumption-data">'+e.count+" "+e.drug.unit+" "+e.drug.name+", "+e.method.name+'</span><span class="consumption-location">'+e.location+'</span><span class="consumption-friends">'+i+'</span><a href="#" title="Edit" onClick="editConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">list</i></a><a href="#" title="Duplicate" onClick="duplicateConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">open_in_new</i></a><a href="#" title="Delete" onClick="deleteConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">delete</i></a></div></li>')}))})}function deleteConsumption(e){makeAuthRequest("/consumption","DELETE",JSON.stringify({id:e}),"json",function(e,t,i){return 200!==i?void Materialize.toast(e,6e3,"warning-toast"):(Materialize.toast("Consumption deleted",1e3,"success-toast"),void drawConsumptions())})}function duplicateConsumption(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,i,n){i.forEach(function(t){if(t.id===e){var i={date:Math.floor(((new Date).getTime()-6e4*(new Date).getTimezoneOffset())/1e3),count:t.count,experience_id:experienceID,drug_id:t.drug.id,method_id:t.method.id,location:t.location};makeAuthRequest("/consumption","POST",JSON.stringify(i),"json",function(e,t,i){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),void Materialize.toast("Consumption duplicated",6e3,"success-toast"))})}})})}function editConsumption(e){makeAuthRequest("/consumption/experience/"+experienceID,"GET",null,"json",function(t,i,n){i.forEach(function(t){if(t.id===e){$("#editID").val(t.id),$("#editCount").text(t.count);var i=$("#editDate").pickadate({format:"yyyy-mm-dd"}),n=i.pickadate("picker"),a=new Date(1e3*t.date);n.set("select",a),$("#editTime").val(a.toISOString().slice(11,16).replace(/:/,"")),$("#edittimeLabel").addClass("active"),$("#editLocation").val(t.location),$("#editLocationLabel").addClass("active"),$("#editDrug").val(t.drug.id),$("#editMethod").val(t.method.id),$("#editFriendBox").empty(),0===t.friends.length?$("#editFriendBox").text("No friends!"):t.friends.forEach(function(e){$("#editFriendBox").append('<div class="chip" id="friend'+e.id+'" onClick="removeFriend('+e.id+')">'+e.name+"</div>")}),$("#editConsumptionModal").openModal()}})})}function addFriend(){var e=$("#addFriend").val();makeAuthRequest("/consumption/friend","POST",JSON.stringify({consumption_id:$("#editID").val(),name:e}),"json",function(e,t,i){return 201!==i?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):($("#editFriendBox").html($("#editFriendBox").html().replace("No friends!","")),$("#editFriendBox").append('<div class="chip" id="friend'+t[0].id+'" onClick="removeFriend('+t[0].id+')">'+t[0].name+"</div>"),$("#addFriend").val(""),void drawConsumptions())})}function removeFriend(e){makeAuthRequest("/consumption/friend","DELETE",JSON.stringify({id:e}),"json",function(t,i,n){return 200!==n?void Materialize.toast(t.charAt(0).toUpperCase()+t.slice(1),6e3,"warning-toast"):($("#friend"+e).remove(),void drawConsumptions())})}function setUpMeta(){makeAuthRequest("/experience/"+experienceID,"GET",null,"json",function(e,t,i){var n=$("#metaDate").pickadate({format:"yyyy-mm-dd"}),a=n.pickadate("picker");a.set("select",new Date(1e3*t.date).toISOString().slice(0,10)),$("#metaTitle").val(t.title),$("#addTitleLabel").addClass("active"),$("#metaPanic").text(t.panicmsg),$("#metaPanicLabel").addClass("active"),t.rating_id&&$("#metaRating").val(t.rating_id)})}function setUpConsumptions(){var e=$("#addDate").pickadate({format:"yyyy-mm-dd"}),t=e.pickadate("picker");t.set("select",new Date);var i=new Date;$("#addTime").val(("0"+i.getHours()).slice(-2)+("0"+i.getMinutes()).slice(-2)),$("#addtimeLabel").addClass("active"),makeAuthRequest("/drug/all","GET",null,"json",function(e,t,i){return t.length<1?($("#addDrug").append('<option value="" disabled selected>None</option>'),void $("#editDrug").append('<option value="" disabled selected>None</option>')):void t.forEach(function(e){$("#addDrug").append('<option value="'+e.id+'">'+e.name+" ("+e.unit+")</option>"),$("#editDrug").append('<option value="'+e.id+'">'+e.name+" ("+e.unit+")</option>")})}),makeAuthRequest("/method/all","GET",null,"json",function(e,t,i){return t.length<1?($("#addMethod").append('<option value="" disabled selected>None</option>'),void $("#editMethod").append('<option value="" disabled selected>None</option>')):void t.forEach(function(e){$("#addMethod").append('<option value="'+e.id+'">'+e.name+"</option>"),$("#editMethod").append('<option value="'+e.id+'">'+e.name+"</option>")})})}var experienceID=location.search.slice(1),noteSaveNotificationTimeout,metaSaveNotificationTimeout,initialMetaMsgFired=0;$("#addConsumption").submit(function(e){e.preventDefault();var t=Math.floor(Date.parse($("#addDate").val())/1e3),i=Math.floor($("#addTime").val()/100),n=$("#addTime").val()%100,a=3600*i+60*n,o=t+a,d={date:o,count:$("#addCount").val(),experience_id:experienceID,drug_id:$("#addDrug").val(),method_id:$("#addMethod").val(),location:$("#addLocation").val()};makeAuthRequest("/consumption","POST",JSON.stringify(d),"json",function(e,t,i){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),Materialize.toast("Consumption created",6e3,"success-toast"),void $("#addConsumptionModal").closeModal())})}),$("#editConsumption").submit(function(e){e.preventDefault();var t=Math.floor(Date.parse($("#editDate").val())/1e3),i=Math.floor($("#editTime").val()/100),n=$("#editTime").val()%100,a=3600*i+60*n,o=t+a,d={id:$("#editID").val(),date:o,count:$("#editCount").val(),experience_id:experienceID,drug_id:$("#editDrug").val(),method_id:$("#editMethod").val(),location:$("#editLocation").val()};makeAuthRequest("/consumption","PUT",JSON.stringify(d),"json",function(e,t,i){return 200!==i?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(drawConsumptions(),Materialize.toast("Consumption edited",6e3,"success-toast"),void $("#editConsumptionModal").closeModal())})}),$(document).ready(function(){makeAuthRequest("/experience/"+experienceID,"GET",null,"json",function(e,t,i){if(404===i)return $("#loading").hide(),void $("#noExperience").show();$("#title").text(t.title),document.title=t.title+" | SupTracked";var n=new Date(1e3*t.date);$("#date").text(n.toISOString().slice(0,10)),drawConsumptions(),setUpConsumptions(),setUpMeta(),$("#notesArea").text(t.notes),$("#notesArea").trigger("autoresize"),$("#loading").hide(),$("#main").show(),$("ul.tabs").tabs("select_tab","consumptions")})}),$("#notesArea").on("change keyup paste",function(){clearTimeout(noteSaveNotificationTimeout),noteSaveNotificationTimeout=setTimeout(function(){makeAuthRequest("/experience","PUT",JSON.stringify({id:experienceID,notes:$("#notesArea").val()}),"json",function(e,t,i){return 200!==i?void Materialize.toast("Notes save error: "+e,6e3,"warning-toast"):void Materialize.toast("Notes saved.",1e3)})},1e3)}),$("#metaTitle, #metaDate, #metaPanic, #metaRating").on("change keyup paste",function(){initialMetaMsgFired?(clearTimeout(metaSaveNotificationTimeout),metaSaveNotificationTimeout=setTimeout(function(){var e={id:experienceID,title:$("#metaTitle").val(),date:Math.floor(new Date($("#metaDate").val()+"T00:00:00").getTime()/1e3),panicmsg:$("#metaPanic").val(),rating_id:$("#metaRating").val()};makeAuthRequest("/experience","PUT",JSON.stringify(e),"json",function(e,t,i){return 200!==i?void Materialize.toast("Metadata save error: "+e,6e3,"warning-toast"):($("#title").text($("#metaTitle").val()),void Materialize.toast("Metadata saved.",1e3))})},1e3)):initialMetaMsgFired=1});