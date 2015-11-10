"use strict";function updateExperienceObject(e){makeAuthRequest("/experience/search","POST",JSON.stringify({limit:1}),"json",function(t,n,o){return 404===o?void(window.location="/experiences.html"):(experience=n[0],void e())})}function drawConsumptions(){$("#consumptionsCollection").empty(),0===experience.consumptions.length?$("#consumptionsCollection").append('<li class="collection-item"><div>No consumptions</div></li>'):experience.consumptions.forEach(function(e){$("#consumptionsCollection").append('<li class="collection-item">'+new Date(1e3*e.date).toISOString().slice(5,16).replace(/T/," ").replace("-","/")+'<a href="#" title="Duplicate" onClick="duplicateConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">open_in_new</i></a><a href="#" title="Delete" onClick="deleteConsumption('+e.id+')" class="secondary-content consumption-icon"><i class="material-icons">delete</i></a><br><span class="consumption-data">'+e.count+" "+e.drug.unit+" "+e.drug.name+", "+e.method.name+"</span></li>")})}function deleteConsumption(e){makeAuthRequest("/consumption","DELETE",JSON.stringify({id:e}),"json",function(e,t,n){return 200!==n?void Materialize.toast(e,6e3,"warning-toast"):(Materialize.toast("Consumption deleted",1e3,"success-toast"),void updateExperienceObject(function(){drawConsumptions()}))})}function duplicateConsumption(e){experience.consumptions.forEach(function(t){if(t.id===e){var n={date:Math.floor(((new Date).getTime()-6e4*(new Date).getTimezoneOffset())/1e3),count:t.count,experience_id:experience.id,drug_id:t.drug.id,method_id:t.method.id,location:t.location};makeAuthRequest("/consumption","POST",JSON.stringify(n),"json",function(e,t,n){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(updateExperienceObject(function(){drawConsumptions()}),void Materialize.toast("Consumption duplicated",1e3,"success-toast"))})}})}var experience;updateExperienceObject(function(){makeAuthRequest("/drug/all","GET",null,"json",function(e,t,n){return t.sort(function(e,t){return e=e.name.toLowerCase(),t=t.name.toLowerCase(),t>e?-1:e>t?1:0}),t.length<1?void $("#addDrug").append('<option value="" disabled selected>None</option>'):void t.forEach(function(e){$("#addDrug").append('<option value="'+e.id+'">'+e.name+" ("+e.unit+")</option>")})}),makeAuthRequest("/method/all","GET",null,"json",function(e,t,n){return t.sort(function(e,t){return e=e.name.toLowerCase(),t=t.name.toLowerCase(),t>e?-1:e>t?1:0}),t.length<1?void $("#addMethod").append('<option value="" disabled selected>None</option>'):void t.forEach(function(e){$("#addMethod").append('<option value="'+e.id+'">'+e.name+"</option>")})}),makeAuthRequest("/consumption/locations","GET",null,"json",function(e,t,n){t.forEach(function(e){$("#addLocationAutofill").append('<option value="'+e.location+'"></option>')})}),$("#title").html(experience.title),drawConsumptions()}),$("#addConsumption").submit(function(e){e.preventDefault();var t={date:Math.floor(((new Date).getTime()-6e4*(new Date).getTimezoneOffset())/1e3),count:$("#count").val(),experience_id:experience.id,drug_id:$("#addDrug").val(),method_id:$("#addMethod").val(),location:$("#addLocation").val()};makeAuthRequest("/consumption","POST",JSON.stringify(t),"json",function(e,t,n){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(updateExperienceObject(function(){drawConsumptions()}),$("ul.tabs").tabs("select_tab","consumptions"),void Materialize.toast("Consumption created",1e3,"success-toast"))})}),$("#addQuicknote").submit(function(e){e.preventDefault(),updateExperienceObject(function(){var e;experience.ttime?experience.consumptions.forEach(function(t){if(t.id===experience.ttime){var n=Math.floor(new Date(1e3*t.date).getTime()/1e3),o=Math.floor((new Date).getTime()/1e3)-60*(new Date).getTimezoneOffset(),i="+";n>o&&(i="-");var a=Math.abs(o-n),c=Math.floor(a/60/60);a-=60*c*60;var s=Math.floor(a/60);e=experience.notes+"\nT"+i+("0"+c).slice(-2)+":"+("0"+s).slice(-2)+" -- "+$("#note").val(),console.log("\nT"+i+c+":"+s)}}):e=experience.notes+"\n"+("0"+(new Date).getHours()).slice(-2)+("0"+(new Date).getMinutes()).slice(-2)+" -- "+$("#note").val(),makeAuthRequest("/experience","PUT",JSON.stringify({id:experience.id,notes:e}),"json",function(e,t,n){return 200!==n?void Materialize.toast("Quicknote error: "+e,6e3,"warning-toast"):void Materialize.toast("Quicknote Added",1e3,"success-toast")}),updateExperienceObject(function(){}),$("#note").val("")})}),$("#media").change(function(){console.log("uploading media"),$("#media").val("")}),$(document).ready(function(){$("ul.tabs").tabs()});