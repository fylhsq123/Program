function sendRequest (url, config, callback) {
    $.ajax(url, config).done(function (res) {
        callback(null, res);
    }).fail(function (err) {
        callback(err);
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
    $('#manage_zoonyms').click(function () {
        alert('clicked');
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
}

function init () {
    setValidators();
    setEventListeners();
    getFilesList();
}

$(function () {
    init();
});