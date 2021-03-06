/* globals makeAuthRequest,Materialize,micromarkdown,cleanMarkdown */

"use strict";

var drugs, saveNotificationTimeout;

function alphabetizeSort(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();

  return (a < b) ? -1 : (a > b) ? 1 : 0;
}

function populateDropdown(selected) {
  // default the selector to zero if there's no specific drug to select
  selected = selected || 0;

  // empty and load boilerplate
  $('#drugList').empty();
  $('#deleteDrug').hide();
  $('#drugList').append('<option value="0">New Drug</option>');

  makeAuthRequest('/drug/all', 'GET', null, 'json', function(err, data, code) {
    // alphabetize the list
    data.sort(function(a, b) {
      return alphabetizeSort(a.name, b.name);
    });

    // store it for use
    drugs = data;

    // populate the dropdown
    data.forEach(function(drug) {
      // if this is the one we want selected, mark it
      var selectedString = '';
      if (selected === drug.id) {
        selectedString = 'selected ';
      }

      $('#drugList').append('<option ' + selectedString + 'value="' + drug.id + '">' + drug.name + ' (' + drug.unit + ')</option>');
    });

    // all done; trigger change event
    $('#drugList').trigger("change");
  });
}

$(document).ready(function() {
  if(location.search.slice(1) > 0){
    populateDropdown(Number(location.search.slice(1)));
  } else {
    populateDropdown();
  }
});

$("#drugList").on('change', function() {
  if (parseInt($('#drugList').val()) === 0) {
    // creating a new drug; clear everything
    $('#name').val('');
    $('#unit').val('');
    $('#classification').val('');
    $('#family').val('');
    $('#rarity').val(1);
    $('#notes').val('');
    $('#slang').val('');

    // reveal the save button, hide delete
    $('#saveNew').show();
    $('#deleteDrug').hide();
    return;
  }

  // hide the save, show delete
  $('#saveNew').hide();
  $('#deleteDrug').show();

  // it's not a new one; go ID hunting
  drugs.forEach(function(drug) {
    if (drug.id === parseInt($('#drugList').val())) {
      // found our drug. Load it.
      $('#name').val(drug.name);
      $('#unit').val(drug.unit);
      $('#classification').val(drug.classification);
      $('#family').val(drug.family);
      $('#rarity').val(drug.rarity);
      $('#notes').val(drug.notes);
      $('#slang').val(drug.slang);

      // trigger formatting and autoresizing
      $('#nameLabel, #slangLabel, #unitLabel, #classificationLabel, #familyLabel, #notesLabel').addClass('active');
      $('#notes').trigger('autoresize');

      $('#notesMarkdown').html(cleanMarkdown(micromarkdown.parse($('#notes').val())));
      $('#notes').hide();
      $('#notesMarkdown').show();
    }
  });
});

// listen for changes
$("#name, #unit, #slang, #classification, #family, #rarity, #notes").on('change keyup paste', function() {
  if (parseInt($('#drugList').val()) !== 0) {
    // only fire if we're not creating a new one
    clearTimeout(saveNotificationTimeout);
    saveNotificationTimeout = setTimeout(function() {
      var updateObj = {
        id: parseInt($('#drugList').val()),
        name: $('#name').val(),
        slang: $('#slang').val(),
        unit: $('#unit').val(),
        notes: $('#notes').val(),
        classification: $('#classification').val(),
        family: $('#family').val(),
        rarity: $('#rarity').val()
      };

      makeAuthRequest('/drug', 'PUT', JSON.stringify(updateObj), 'json', function(err, data, code) {
        if (code !== 200) {
          Materialize.toast('Drug save error: ' + err, 6000, 'warning-toast');
          return;
        }

        Materialize.toast('Drug saved', 1000);
      });
    }, 1000);
  }
});

// saving function
function saveNew() {
  var newDrug = {
    name: $('#name').val(),
    unit: $('#unit').val(),
    slang: $('#slang').val(),
    notes: $('#notes').val(),
    classification: $('#classification').val(),
    family: $('#family').val(),
    rarity: $('#rarity').val()
  };

  makeAuthRequest('/drug', 'POST', JSON.stringify(newDrug), 'json', function(err, data, code) {
    if (code !== 201) {
      Materialize.toast('Drug save error: ' + err, 6000, 'warning-toast');
      return;
    }

    // redraw the dropdown and reselect the Drug
    populateDropdown(data.id);

    Materialize.toast('Drug created', 1000);
  });
}

function deleteDrug() {
  makeAuthRequest('/drug', 'DELETE', JSON.stringify({
    id: parseInt($('#drugList').val())
  }), 'json', function(err, data, code) {
    if (code !== 200) {
      Materialize.toast('Drug delete error: ' + err, 6000, 'warning-toast');
      return;
    }

    // redraw the dropdown and reselect the Drug
    populateDropdown(0);

    Materialize.toast('Drug deleted', 1000);
  });
}

// add click listener to reveal text box
$("#notesMarkdown").on("click", function() {
  $("#notesMarkdown").hide();
  $("#notes").show();
  $("#notesLabel").show();
});
