"use strict";$(document).on("click",":submit",function(t){t.preventDefault();var e=$(this).val();"login"===e?makeAuthRequest(1,2,"Verifying user",4):makeAuthRequest(1,2,"Attempting registration",4)});