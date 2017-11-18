var $manageZoonymsDialog = $('#manage_zoonyms_dialog');
var editRemoveBtnGroup = '<div class="btn-group pull-right edit-remove"><button type="button" class="btn btn-primary btn-xs edit-button" aria-label="Edit"><span class="glyphicon glyphicon-edit" aria-hidden="true"></span></button><button type="button" class="btn btn-danger btn-xs remove-button" aria-label="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div>',
    okCancelBtnGroup = '<div class="btn-group"><button type="button" class="btn btn-success btn-xs ok-button" aria-label="OK"><span class="glyphicon glyphicon-ok" aria-hidden="true"></span></button><button type="button" class="btn btn-danger btn-xs cancel-button" aria-label="Cancel"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></button></div>';

function sendRequest (url, config, callback) {
    $('#loading').show();
    $.ajax(url, config).done(function (res) {
        callback(null, res);
    }).fail(function (err) {
        callback(err);
    }).always(function () {
        $('#loading').hide();
    });
}

function processError (err) {
    console.error(err);
}

function getZoonyms () {
    sendRequest('/zoonyms', {
        method: 'GET',
        dataType: 'JSON'
    }, (err, response) => {
        if (err) {
            processError(err);
        } else {
            var $zoonym = $('#zoonym').empty();
            for (var i = 0; i < response.length; i++) {
                $zoonym.append($('<option>' + response[i].zoonym + '</option>').attr('value', response[i].zoonym));
            }
        }
    });
}

function getFilesList () {
    sendRequest('/files', {
        method: 'GET',
        dataType: 'JSON'
    }, (err, response) => {
        var $filesList = $('#filesList').empty();
        if (err) {
            processError(err);
        } else {
            for (var i = 0; i < response.length; i++) {
                $filesList.append($('<option>' + response[i] + '</option>').attr('value', response[i]));
            }
            getZoonyms();
        }
    });
}

function isValidNumber (number) {
    return number.length !== 0 ? !/\D/.test(number) : false;
}

function validateNumbers () {
    var _this = $(this);
    if (isValidNumber(_this.val())) {
        _this.parent().removeClass('has-error');
    } else {
        _this.parent().addClass('has-error');
    }
}

function setValidators () {
    $('#numWords_left').keyup(validateNumbers);
    $('#numWords_right').keyup(validateNumbers);
}

function setEventListeners () {
    $('#manage_zoonyms_dialog').on('show.bs.modal', function () {
        sendRequest('/zoonyms', {
            method: 'GET',
            dataType: 'JSON'
        }, (err, response) => {
            var $template = $('<ul class="list-group"></ul>').empty(),
                editButton, removeButton, buttonGroup, li;
            if (err) {
                processError(err);
            } else {
                if (response.length) {
                    var list = [];
                    for (var i = 0; i < response.length; i++) {
                        li = $('<li class="list-group-item">' + response[i].zoonym + '</li>').append(editRemoveBtnGroup).attr('zoonymId', response[i]._id);
                        list.push(li);
                    }
                    $template.append(list);
                } else {
                }
                $manageZoonymsDialog.find('.modal-body').html($template);
            }
        });
    });
    $('#find').click(function () {
        if (isValidNumber($('#numWords_left').val() && $('#numWords_right').val())) {
            sendRequest('/findSimile/' + $('#connectingWord').val(), {
                method: 'GET',
                data: {
                    file: $('#filesList').val(),
                    numLeft: $('#numWords_left').val(),
                    numRight: $('#numWords_right').val(),
                    zoonym: $('#zoonym').val()
                }
            }, function (err, res) {
                if (err) {
                    processError(err);
                } else {
                    var $results = $('#results tbody').empty();
                    for (var i = 0; i < res.length; i++) {
                        var element = res[i];
                        $results.append('<tr><td>' + element + '</td></tr>');
                    }
                }
            });
        }
    });
    $manageZoonymsDialog.on('click', '#add_new_zoonym', function () {
        var inputVal = $(this).parent().find('input').val();
        if (inputVal) {
            sendRequest('/zoonyms', {
                method: 'POST',
                dataType: 'JSON',
                data: {zoonym: inputVal}
            }, (err, response) => {
                if (err) {
                    processError(err);
                } else {
                    var li = $('<li class="list-group-item">' + response.ops[0].zoonym + '</li>').append(editRemoveBtnGroup).attr('zoonymId', response.ops[0]._id);
                    $manageZoonymsDialog.find('.modal-body ul').append(li);
                    getZoonyms();
                }
            });
        } else {
            console.error('Enter zoonym');
        }
    });
    $manageZoonymsDialog.on('click', '.edit-button', function () {
        var li = $(this).parent().parent();
        var zoonym = li.text();
        li.attr('oldValue', zoonym).html($('<input type="text">').val(zoonym)).append(okCancelBtnGroup);
    });
    $manageZoonymsDialog.on('click', '.remove-button', function () {
        var currLI = $(this).parent().parent();
        sendRequest('/zoonyms/' + currLI.attr('zoonymId'), {
            method: 'DELETE',
            dataType: 'JSON'
        }, (err, response) => {
            if (err) {
                processError(err);
            } else {
                currLI.remove();
                getZoonyms();
            }
        });
    });
    $manageZoonymsDialog.on('click', '.ok-button', function () {
        var currLI = $(this).parent().parent();
        var zoonym = currLI.find('input').val();
        if (zoonym) {
            sendRequest('/zoonyms/' + currLI.attr('zoonymId'), {
                method: 'PUT',
                dataType: 'JSON',
                data: {zoonym: zoonym}
            }, (err, response) => {
                if (err) {
                    processError(err);
                } else {
                    currLI.html(zoonym).append(editRemoveBtnGroup);
                    getZoonyms();
                }
            });
        } else {
            console.error('Enter zoonym');
        }
    });
    $manageZoonymsDialog.on('click', '.cancel-button', function () {
        var currLI = $(this).parent().parent();
        currLI.html(currLI.attr('oldValue')).append(editRemoveBtnGroup);
    });
    $('#selectors_zoonym').on('click', '.select-all', function () {
        $('#zoonym option').prop('selected', true);
    }).on('click', '.unselect-all', function () {
        $('#zoonym').val('');
    });
}

function init () {
    setValidators();
    setEventListeners();
    getFilesList();
}

$(function () {
    init();
});