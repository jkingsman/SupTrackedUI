"use strict";function loadMore(){atEnd||makeAuthRequest("/experience/search","POST",JSON.stringify({limit:batchSize,offset:currentBatch*batchSize}),"json",function(e,t,n){404!==n&&t.length===batchSize?currentBatch+=1:atEnd=!0,t.forEach(function(e){e.title.length<1&&(e.title="[none]"),$("#experiences-collection").append('<li class="collection-item">'+new Date(1e3*e.date).toISOString().slice(0,10)+'<h5><a href="/experience.html?'+e.id+'">'+e.title+"</a></h5></li>")}),$("#loading").hide(),$("#experiences").show()})}var currentBatch=0,batchSize=30,atEnd=!1;makeAuthRequest("/experience/search","POST",null,"json",function(e,t,n){404===n&&($("#loading").hide(),$("#emptyExperiences").show())}),loadMore();