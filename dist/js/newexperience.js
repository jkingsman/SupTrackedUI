"use strict";var $input=$(".datepicker").pickadate(),picker=$input.pickadate("picker");picker.set("select",new Date);var date=new Date;$(document).on("click",":submit",function(e){e.preventDefault();var t=Math.floor(Date.parse($("#date").val()+" 00:00:00 GMT")/1e3);makeAuthRequest("/experience","POST",JSON.stringify({title:$("#title").val(),date:t}),"json",function(e,t,a){return e?void Materialize.toast(e.charAt(0).toUpperCase()+e.slice(1),6e3,"warning-toast"):(window.location="experience.html?"+t.id,void Materialize.toast("Experience created",6e3,"success-toast"))})});