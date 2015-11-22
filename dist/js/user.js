"use strict";var saveNotificationTimeout;$(document).ready(function(){makeAuthRequest("/user","GET",null,"json",function(e,t,a){$("#username").val(t.username),$("#emergcontact").val(t.emergcontact),$("#phone").val(t.phone),$("#usernameLabel, #emergcontactLabel, #phoneLabel").addClass("active")});var e=parseInt(location.search.slice(1));isNaN(e)&&(e=250),makeAuthRequest("/user/audit","POST",JSON.stringify({limit:e}),"json",function(e,t,a){t.forEach(function(e){$("#auditLog").append('<li class="collection-item">'+new Date(1e3*e.date-6e4*(new Date).getTimezoneOffset()).toISOString().slice(0,16).replace("T"," ")+'<span class="margin-left-40">'+e.ip+'</span><span class="margin-left-40"><strong>'+e.action+'</strong></span><span style="border-bottom: 1px dashed #ADADAD;" class="margin-left-40 tooltipped" data-position="top" data-delay="50" data-tooltip="'+e.useragent+'">User Agent</span></li>')}),$(".tooltipped").tooltip({delay:50})})}),$("#emergcontact, #phone").on("change keyup paste",function(){clearTimeout(saveNotificationTimeout),saveNotificationTimeout=setTimeout(function(){var e={emergcontact:$("#emergcontact").val(),phone:$("#phone").val()};makeAuthRequest("/user","PUT",JSON.stringify(e),"json",function(e,t,a){return 200!==a?void Materialize.toast("User save error: "+e,6e3,"warning-toast"):void Materialize.toast("User saved",1e3)})},1e3)}),$("#updatePass").submit(function(e){return e.preventDefault(),document.activeElement.blur(),$("#password").val()!==$("#passwordConfirm").val()?void Materialize.toast("Passwords must match",6e3,"warning-toast"):void makeAuthRequest("/user/password","PUT",JSON.stringify({password:$("#passwordConfirm").val()}),"json",function(e,t,a){return 200!==a?void Materialize.toast("Password error: "+e,6e3,"warning-toast"):(Materialize.toast("Password updated",1e3),void $("#password, #passwordConfirm").val(""))})});