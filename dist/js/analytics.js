"use strict";function startAnalytics(){vitals()}var drug,allDrugs,allConsumptions=[],analyticsCount=0,analyticsFinished=0,vitals,experienceList;location.hash.length>1&&($("#selection").hide(),$("#loading").show()),makeAuthRequest("/drug/all","GET",null,"json",function(t,a,n){return allDrugs=a,a.sort(function(t,a){return t=t.name.toLowerCase(),a=a.name.toLowerCase(),a>t?-1:t>a?1:0}),a.length<1?void $("#drug").append('<option value="" disabled selected>None</option>'):(a.forEach(function(t){$("#drug").append('<option value="'+t.id+'">'+t.name+" ("+t.unit+")</option>")}),$("#loadingOpt").remove(),void(location.hash.length>1&&($("#drug").val(location.hash.substr(1)),$("#drugSelect").submit())))}),$("#drugSelect").submit(function(t){switch(t.preventDefault(),$("#selection").hide(),$("#loading").show(),allDrugs.forEach(function(t){return t.id===parseInt($("#drug").val())?(location.hash=t.id,void(drug=t)):void 0}),document.title=drug.name.substr(0,1).toUpperCase()+drug.name.substr(1)+" | SupTracked",$(".drugName").text(drug.name),$("#unit").html(drug.unit),$("#classification").html(drug.classification),$("#family").html(drug.family),parseInt(drug.rarity)){case 0:$("#rarity").html('<span class="blue white-text" style="padding: 3px; border-radius: 24px;">Very Common</span>');break;case 1:$("#rarity").html('<span class="green white-text" style="padding: 3px; border-radius: 24px;">Common</span>');break;case 2:$("#rarity").html('<span class="purple white-text" style="padding: 3px; border-radius: 24px;">Uncommon</span>');break;case 3:$("#rarity").html('<span class="red white-text" style="padding: 3px; border-radius: 24px;">Rare</span>');break;default:$("#rarity").html('<span class="grey white-text" style="padding: 3px; border-radius: 24px;">???</span>')}$("#notes").html(cleanMarkdown(micromarkdown.parse(drug.notes))),makeAuthRequest("/consumption/search","POST",JSON.stringify({drug_id:drug.id}),"json",function(t,a,n){a?(a.forEach(function(t){t.consumptions.forEach(function(a){a.drug.id===drug.id&&(a.title=t.title,a.exp_id=t.id,allConsumptions.push(a))})}),allConsumptions.sort(function(t,a){return t.date<a.date?-1:t.date>a.date?1:0}),startAnalytics()):analyticsFinished=analyticsCount})});var updateInterval=setInterval(function(){$("#analyticsComplete").text(Math.round(analyticsFinished/analyticsCount*100)),$("#analyticsProgress").css("width",Math.round(analyticsFinished/analyticsCount*100)+"%"),analyticsFinished===analyticsCount&&(clearInterval(updateInterval),setTimeout(function(){$("#loading").hide(),$("#analytics").show()},500))},100);