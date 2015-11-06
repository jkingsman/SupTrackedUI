/* globals makeAuthRequest,Materialize */
"use strict";

var experienceID = location.search.slice(1);
var noteSaveNotificationTimeout;
var metaSaveNotificationTimeout;

// we futz with the meta values after the listener is added; padd it out so the first update doesn't fire the message
var initialMetaMsgFired = 0;


// draw consumptions into the collection
function drawConsumptions(){
  makeAuthRequest('/consumption/experience/' + experienceID, 'GET', null, 'json', function(err, data, code){
    // load Consumptions
    if(code === 404){
      $('#consumptionsCollection').empty();
      $('#consumptionsCollection').append('<li id="noConsumptions" class="collection-item"><div>No consumptions</div></li>');
    } else {
      $('#consumptionsCollection').empty();

      data.forEach(function(consumption){
        // build friends list
        var friendList = [];
        friendList = consumption.friends.map(function(friend){
          return friend.name;
        });

        var friendString = 'No friends';

        if(friendList.length > 0){
          friendString = friendList.join(', ');
        }

        $('#consumptionsCollection').append('<li class="collection-item">' + new Date(consumption.date * 1000).toISOString().slice(0, 16).replace(/T/, ' ') +
        '<span class="consumption-data">' + consumption.count + ' ' + consumption.drug.unit + ' ' + consumption.drug.name + ', ' + consumption.method.name + '</span>' +
        '<span class="consumption-location">' + consumption.location + '</span>' +
        '<span class="consumption-friends">' + friendString + '</span>' +
        '<a href="#" title="Edit" onClick="editConsumption(' + consumption.id + ')" class="secondary-content consumption-icon"><i class="material-icons">list</i></a>' +
        '<a href="#" title="Duplicate" onClick="duplicateConsumption(' + consumption.id + ')" class="secondary-content consumption-icon"><i class="material-icons">open_in_new</i></a>' +
        '<a href="#" title="Delete" onClick="deleteConsumption(' + consumption.id + ')" class="secondary-content consumption-icon"><i class="material-icons">delete</i></a>' +
        '</div></li>');
      });
    }
  });
}

function deleteConsumption(id){
  makeAuthRequest('/consumption', 'DELETE', JSON.stringify({id: id}), 'json', function(err, data, code){
    if(code !== 200){
      Materialize.toast(err, 6000, 'warning-toast');
      return;
    }

    Materialize.toast('Consumption deleted', 1000, 'success-toast');
    drawConsumptions();
  });
}

function duplicateConsumption(id){
  makeAuthRequest('/consumption/experience/' + experienceID, 'GET', null, 'json', function(err, data, code){
    data.forEach(function(consumption){
      if(consumption.id === id){
        var payload = {date: Math.floor((new Date().getTime() - (new Date().getTimezoneOffset()) * 60000) / 1000), count: consumption.count, experience_id: experienceID, drug_id: consumption.drug.id, method_id: consumption.method.id, location: consumption.location};

        makeAuthRequest('/consumption', 'POST', JSON.stringify(payload), 'json', function(err, data, code){
          if(err){
            Materialize.toast(err.charAt(0).toUpperCase() + err.slice(1), 6000, 'warning-toast');
            return;
          }

          // draw consumptions, which will include our new one
          drawConsumptions();
          Materialize.toast('Consumption duplicated', 6000, 'success-toast');
        });
      }
    });
  });
}

function editConsumption(id){
  makeAuthRequest('/consumption/experience/' + experienceID, 'GET', null, 'json', function(err, data, code){
    data.forEach(function(consumption){
      if(consumption.id === id){
        // load the ID
        $('#editID').val(consumption.id);

        // set count
        $('#editCount').text(consumption.count);

        // set date and time
        var $input = $('#editDate').pickadate({
          format: 'yyyy-mm-dd'
        });
        var picker = $input.pickadate('picker');

        var date = new Date(consumption.date * 1000);
        picker.set('select', date);

        $('#editTime').val(date.toISOString().slice(11, 16).replace(/:/, ''));
        $('#edittimeLabel').addClass('active');

        // set location
        $('#editLocation').val(consumption.location);
        $('#editLocationLabel').addClass('active');

        // set drug and method
        $('#editDrug').val(consumption.drug.id);
        $('#editMethod').val(consumption.method.id);

        // set up Friends
        $('#editFriendBox').empty();
        if(consumption.friends.length === 0){
          $('#editFriendBox').text('No friends!');
        } else{
          consumption.friends.forEach(function(friend){
            $('#editFriendBox').append('<div class="chip" id="friend' + friend.id + '" onClick="removeFriend(' + friend.id + ')">' + friend.name + '</div>');
          });
        }

        $('#editConsumptionModal').openModal();
      }
    });
  });
}

function addFriend(){
  var friendName = $('#addFriend').val();
  makeAuthRequest('/consumption/friend', 'POST', JSON.stringify({consumption_id: $('#editID').val(), name: friendName}), 'json', function(err, data, code){
    if(code !== 201){
      Materialize.toast(err.charAt(0).toUpperCase() + err.slice(1), 6000, 'warning-toast');
      return;
    }

    // make the friend visible
    // clear the no friend text if we have it
    $('#editFriendBox').html($('#editFriendBox').html().replace('No friends!', ''));

    $('#editFriendBox').append('<div class="chip" id="friend' + data[0].id + '" onClick="removeFriend(' + data[0].id + ')">' + data[0].name + '</div>');
    $('#addFriend').val('');
    drawConsumptions();
  });
}

function removeFriend(id){
  makeAuthRequest('/consumption/friend', 'DELETE', JSON.stringify({id: id}), 'json', function(err, data, code){
    if(code !== 200){
      Materialize.toast(err.charAt(0).toUpperCase() + err.slice(1), 6000, 'warning-toast');
      return;
    }

    $('#friend' + id).remove();
    drawConsumptions();
  });
}

// fill in title/rating, etc.
function setUpMeta(){
  makeAuthRequest('/experience/' + experienceID, 'GET', null, 'json', function(err, data, code){
    var $input = $('#metaDate').pickadate({
      format: 'yyyy-mm-dd'
    });
    var picker = $input.pickadate('picker');
    picker.set('select', new Date(data.date * 1000).toISOString().slice(0, 10));

    // load title
    $('#metaTitle').val(data.title);
    $('#addTitleLabel').addClass('active');

    // panic msg
    $('#metaPanic').text(data.panicmsg);
    $('#metaPanicLabel').addClass('active');

    // rating
    if(data.rating_id){
      $('#metaRating').val(data.rating_id);
    }
  });
}

// fill in drug/method selectors, dates, etc. for creation and editing etc.
function setUpConsumptions(){
  // init new consumption date picker
  var $input = $('#addDate').pickadate({
    format: 'yyyy-mm-dd'
  });
  var picker = $input.pickadate('picker');
  picker.set('select', new Date());

  var date = new Date();
  $('#addTime').val(('0' + date.getHours()).slice(-2) + ('0' + date.getMinutes()).slice(-2));
  $('#addtimeLabel').addClass('active');

  makeAuthRequest('/drug/all', 'GET', null, 'json', function(err, data, code){
    if(data.length < 1){
      $('#addDrug').append('<option value="" disabled selected>None</option>');
      $('#editDrug').append('<option value="" disabled selected>None</option>');
      return;
    }

    data.forEach(function(drug){
      $('#addDrug').append('<option value="' + drug.id + '">' + drug.name + ' (' + drug.unit + ')</option>');
      $('#editDrug').append('<option value="' + drug.id + '">' + drug.name + ' (' + drug.unit + ')</option>');
    });
  });

  makeAuthRequest('/method/all', 'GET', null, 'json', function(err, data, code){
    if(data.length < 1){
      $('#addMethod').append('<option value="" disabled selected>None</option>');
      $('#editMethod').append('<option value="" disabled selected>None</option>');
      return;
    }

    data.forEach(function(method){
      $('#addMethod').append('<option value="' + method.id + '">' + method.name + '</option>');
      $('#editMethod').append('<option value="' + method.id + '">' + method.name + '</option>');
    });
  });
}

// create Add Experience submit listener
$('#addConsumption').submit(function( event ) {
  event.preventDefault();
  var datetime = Math.floor(Date.parse($('#addDate').val()) / 1000);

  // add the time box
  var hours = Math.floor($('#addTime').val() / 100);
  var minutes = $('#addTime').val() % 100;
  var timeSeconds = (hours * 3600) + (minutes * 60);
  var timeStamp = (datetime + timeSeconds);

  var payload = {date: timeStamp, count: $('#addCount').val(), experience_id: experienceID, drug_id: $('#addDrug').val(), method_id: $('#addMethod').val(), location: $('#addLocation').val()};

  makeAuthRequest('/consumption', 'POST', JSON.stringify(payload), 'json', function(err, data, code){
    if(err){
      Materialize.toast(err.charAt(0).toUpperCase() + err.slice(1), 6000, 'warning-toast');
      return;
    }

    // draw consumptions, which will include our new one
    drawConsumptions();
    Materialize.toast('Consumption created', 6000, 'success-toast');
    $('#addConsumptionModal').closeModal();
  });
});


// consumption edit listener
$('#editConsumption').submit(function( event ) {
  event.preventDefault();
  var datetime = Math.floor(Date.parse($('#editDate').val()) / 1000);

  // add the time box
  var hours = Math.floor($('#editTime').val() / 100);
  var minutes = $('#editTime').val() % 100;
  var timeSeconds = (hours * 3600) + (minutes * 60);
  var timeStamp = (datetime + timeSeconds);

  var payload = {id: $('#editID').val(), date: timeStamp, count: $('#editCount').val(), experience_id: experienceID, drug_id: $('#editDrug').val(), method_id: $('#editMethod').val(), location: $('#editLocation').val()};

  makeAuthRequest('/consumption', 'PUT', JSON.stringify(payload), 'json', function(err, data, code){
    if(code !== 200){
      Materialize.toast(err.charAt(0).toUpperCase() + err.slice(1), 6000, 'warning-toast');
      return;
    }

    // draw consumptions, which will include our new one
    drawConsumptions();
    Materialize.toast('Consumption edited', 6000, 'success-toast');
    $('#editConsumptionModal').closeModal();
  });
});

$(document).ready(function(){
  makeAuthRequest('/experience/' + experienceID, 'GET', null, 'json', function(err, data, code){
    if(code === 404){
      // no Experiences
      $('#loading').hide();
      $('#noExperience').show();
      return;
    }

    // load title and date
    $('#title').text(data.title);
    document.title = data.title + ' | SupTracked';

    var date = new Date(data.date * 1000);
    $('#date').text(date.toISOString().slice(0, 10));

    drawConsumptions();
    setUpConsumptions();
    setUpMeta();

    // load notes
    $('#notesArea').text(data.notes);
    $('#notesArea').trigger('autoresize');

    // lift the curtain
    $('#loading').hide();
    $('#main').show();
    $('ul.tabs').tabs('select_tab', 'consumptions');
  });
});

// listen to save text area
$("#notesArea").on('change keyup paste', function() {
  clearTimeout(noteSaveNotificationTimeout);
  noteSaveNotificationTimeout = setTimeout(function() {
    makeAuthRequest('/experience', 'PUT', JSON.stringify({id: experienceID, notes: $("#notesArea").val()}), 'json', function(err, data, code){
      if(code !== 200){
        Materialize.toast('Notes save error: ' + err, 6000, 'warning-toast');
        return;
      }

      Materialize.toast('Notes saved.', 1000);
    });
  }, 1000);
});

// listen on meta change
$("#metaTitle, #metaDate, #metaPanic, #metaRating").on('change keyup paste', function() {
  if(initialMetaMsgFired){
    // only fire if this isn't generated by our loading/futzing
    clearTimeout(metaSaveNotificationTimeout);
    metaSaveNotificationTimeout = setTimeout(function() {
      var updateObj = {id: experienceID, title: $('#metaTitle').val(), date: Math.floor(new Date($('#metaDate').val() + 'T00:00:00').getTime() / 1000), panicmsg: $('#metaPanic').val(), rating_id: $('#metaRating').val()};
      makeAuthRequest('/experience', 'PUT', JSON.stringify(updateObj), 'json', function(err, data, code){
        if(code !== 200){
          Materialize.toast('Metadata save error: ' + err, 6000, 'warning-toast');
          return;
        }

        // load the new title
        $('#title').text($('#metaTitle').val());
        Materialize.toast('Metadata saved.', 1000);
      });
    }, 1000);
  } else{
    initialMetaMsgFired = 1;
  }
});