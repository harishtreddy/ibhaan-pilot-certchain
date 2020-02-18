'use strict';

function showProgress() {
    $('.display-loader').addClass('show');
}

function hideProgress() {
    $('.display-loader').removeClass('show');
}

function requestAffiliation() {

    // Show Progress untill the task is complete
    showProgress();

    // Get the attributes from the UI i.e College Name
    let college_name = document.getElementById('college_name').value;

    // Set the Payload for the Post restapi call
    let options = { 'college_name': college_name };
    {
        // Use Async ajax call to post a request to the Client App
        $.when($.post('/requestAffiliation/', options)).done(function (_res) {

            // End progress display
            hideProgress();

            // Update the UI with college list
            displayCollegeList();

            // Close the Modal Dialog
            $('#requestAff').modal("hide");
        });
    }
}

/**
 * Display Colleges
 */
function displayCollegeList() {

    // Use Async ajax call to get a list of colleges from the Client App
    $.when($.get('/getCollegeList')).done(function (_res) {

        // Successful response received, lets check it on browser console
        console.log(_res.college_list);

        let _str = '';
        let _nstr = '';

        // We will now build the Table to be displayed in UI
        _str += ' \
        <div class="table-responsive"> \
        <table class="table table-bordered"> \
          <tbody> \
            <tr> \
              <th>Name</th> \
              <th>isApproved</th> \
              <th>Programs</th> \
            </tr>        \
        ';

        _res.college_list.forEach(function (_row) {
            // Check is college is approved or NOT aaproved by university
            let td = (_row.is_approved != 0) ? '<td class="green"><i class="fa fa-check-circle"></i> APPROVED</td>' 
                    : '<td class="red"><i class="fa fa-times-circle"></i> NOT APPROVED</td>';

            let enrollProgram = (_row.is_approved != 0) ? '<div class="transaction"><a href="#" data-toggle="modal" data-id="'+ _row.college_id +'" data-target=".enrollCourseModal">enrollProgram()</a></div>' 
            : '';

            let programs = '';
            //console.log(_row.programs);
            _row.programs.forEach(function (program_name) {
                programs += '<li><i class="fa fa-angle-double-right blue"></i> '+ program_name +'</li>';
            })

            _str += ' \
            <tr> \
            <td>\
                <label>' + _row.name + '</label> ' + enrollProgram + ' \
            </td>'
            + td + 
            '<td> \
              <ul class="programs_list"> \
                 '+ programs +'\
              </ul> \
            </td> \
          </tr> \
            ';

            if (_row.is_approved == 0) {
                _nstr += ' \
                <div class="checkbox">\
                    <label> \
                    <input type="checkbox" name="collegeIds" value="'+ _row.college_id + '">' + _row.name + ' \
                    </label> \
                </div> \
                ';                
            }
        })
        _str += '\
                </tbody> \
                </table> \
            </div> \
        ';

        // Display College List
        document.getElementById('college_list').innerHTML = _str;
        document.getElementById('approve_list').innerHTML = _nstr;
    });
}



function submitApproveAffiliation() {
    let options = {};
    let arr = '';
    showProgress();
    $("input:checkbox[name=collegeIds]:checked").each(function () {
        let options = {};
        options.college_id = $(this).val();
        console.log('here...');
        console.log(options);
        {
            $.when($.post('/approveAffiliation/', options)).done(function (_res) {
                hideProgress();
                let val = _res.result;
                displayCollegeList();

                // Close the Modal Dialog
                $('#approveAff').modal("hide");
            });
        }
    });
}


$('#enrollCourseModal').on('show.bs.modal', function (event) {
    collegeId = $(event.relatedTarget).data('id');
})

function submitEnrollProgram() {
    showProgress();
    let options = {};
    options.program_name = document.getElementById('program_name').value;
    options.college_id = collegeId;
    {
        $.when($.post('/enrollProgram/', options)).done(function (_res) {
            hideProgress();
            let val = _res.result;
            displayCollegeList();

            // Close the Modal Dialog
            $('#enrollCourseModal').modal("hide");
        });
    }
}

function submitGenerateCertificate() {
    let options = {};
    let arr = '';
    showProgress();
    $("input:checkbox[name=gen_cer_student]:checked").each(function () {
        let options = {};
        options.student_id = $(this).val();
        {
            $.when($.post('/issueCertificate/', options)).done(function (_res) {
                hideProgress();
                let val = _res.result;
                displayStudentList();

                // Close the Modal Dialog
                $('#issueCert').modal("hide");
            });
        }
    });
}


function submitTakeAdmission() {
    var selected_program = $("input[name=program]:checked").val();
    if (selected_program == null) {
        alert('No Program Selected');
        return;
    }

    let student_name = document.getElementById('student_name').value;
    let studentDob = document.getElementById('student_dob').value;

    //let studentDob = new Date(student_dob);
    if (studentDob == null) {
        alert('Incorrect Date Format');
        return;
    }

    let val = selected_program.split('##');
    let arr = '';
    showProgress();
    let options = {};
    options.student_name = student_name;
    options.student_dob = studentDob;
    options.college_name = val[0];
    options.program_name = val[1];
    {
        $.when($.post('/takeAdmission/', options)).done(function (_res) {
            hideProgress();
            let val = _res.result;
            displayStudentList();

            // Close the Modal Dialog
            $('#takeAdm').modal("hide");
            
        });
    }
}

/**
 * get History
 */
function getHistorian() {
    $.when($.get('fabric/getHistory')).done(function (_res) {
        let _str = '';
        if (_res.result === 'success') {

            _str = ' \
            <div class="col-md-12"> \
            <div class="pull-right no-blocks"> \
              Total Blocks: ' + _res.history.length + ' \
            </div>\
            <div class="historian-status"> \
              HyperLedger Transaction Blocks: ' + _res.result + ' \
            </div> \
            <div class="table-responsive"> \
              <table id="tt" class="table table-bordered" align="center"> \
                <tbody> \
                <tr> \
                <th>Transaction Hash</th> \
                <th>Transaction Type</th> \
                <th>TimeStamp</th> \
              </tr> \
            ';
            _res.history.sort(function (a, b) { return (b.transactionTimestamp > a.transactionTimestamp) ? -1 : 1; });
            for (let each in _res.history) {
                (function (_idx, _arr) {
                    let _row = _arr[_idx];
                    _str += ' \
                    <tr> \
                        <td>' + _row.transactionId + '</td> \
                        <td>' + _row.transactionType + '</td> \
                        <td>' + _row.transactionTimestamp + '</td> \
                    </tr> \
                    ';
                })(each, _res.history);
            }
            _str += ' \
                </tbody> \
                </table> \
            </div> \
            </div> \
            ';
        }
        else { _str += formatMessage(_res.message); }
        document.getElementById('history').innerHTML = _str;
    });
}

/**
 * Display Students
 */
function displayStudentList() {
    $.when($.get('/getStudentList')).done(function (_res) {
        console.log(_res.student_list);
        let _str = '';
        let _nstr = '';
        _str += ' \
        <table class="table table-bordered"> \
        <tbody> \
          <tr> \
            <th>Name</th> \
            <th>Certificate ID</th> \
          </tr> \
        ';
        _res.student_list.forEach(function (_row) {
            let cid = (_row.certificate_id == null) ? '...' : _row.certificate_id;
            _str += '\
            <tr> \
                <td>' + _row.student_name + '</td> \
                <td>' + cid + '</td> \
            </tr> \
      ';
        })
        _str += '</table>';
        document.getElementById('student_list').innerHTML = _str;
    });
}

let collegeId = null;
function enrollProgram(id) {
    collegeId = id;
    var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
    $("body").append(appendthis);
    $(".modal-overlay").fadeTo(500, 0.7);
    var modalBox = $(this).attr('data-modal-id');
    $('#' + 'enrollProgram').fadeIn($(this).data());
}

function approveAffiliation() {
    var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
    $("body").append(appendthis);
    $(".modal-overlay").fadeTo(500, 0.7);
    var modalBox = $(this).attr('data-modal-id');
    $('#' + 'approveAffiliation').fadeIn($(this).data());
}

$('#takeAdm').on('show.bs.modal', function (event) {
    takeAdmission();
})

function takeAdmission() {
    console.log('takeAdmission......');
    $.when($.get('/getCollegeList')).done(function (_res) {
        let _str = '';
        _str += '\
        <div class="table-responsive"> \
        <table class="table table-bordered"> \
          <tbody> \
            <tr> \
              <th>College</th> \
              <th>Programs</th> \
            </tr>  \
        ';
        _res.college_list.forEach(function (_row) {
            if (_row.is_approved == 1) {
                let _pro_str = '<table><tbody>';
                _row.programs.forEach(function (_pro) {

                _pro_str += '\
                    <tr>\
                    <td>\
                      <div class="radio">\
                        <label>\
                          <input type="radio" name="program" value="' + _row.name + '##' + _pro + '">'+ _pro +' \
                        </label> \
                      </div> \
                    </td> \
                  </tr> \
                ';
                })
                _str += '<tr class="mark"><td>' + _row.name + '</td><td>' + _pro_str + '</tbody></table></td>' + '</tr>';
            }
        })
        _str += '\
            </tbody> \
            </table> \
        </div>\
        ';
        document.getElementById('admission_list').innerHTML = _str;
    });
}

$('#issueCert').on('show.bs.modal', function (event) {
    generateCertificate();
})

function generateCertificate() {
    console.log('generateCertificate......');
    $.when($.get('/getStudentList')).done(function (_res) {
        let _str = '';
        _str += '\
            <div class="table-responsive">\
            <br>\
            <table class="table table-bordered">\
            <tbody>\
                <tr>\
                <th>Select</th>\
                <th>Student ID</th>\
                <th>Student Name</th>\
                </tr>\
        ';
        _res.student_list.forEach(function (_row) {
            if (_row.certificateId == null) {
                _str += ' \
                <tr> \
                    <td><input type="checkbox" name="gen_cer_student" value="' + _row.student_id + '"></td>\
                    <td>' + _row.student_id + '</td> \
                    <td>' + _row.student_name + '</td> \
                </tr> \
                ';
            }
        })
        _str += '</table>';
        document.getElementById('student_cer_list').innerHTML = _str;
    });

    var appendthis = ("<div class='modal-overlay js-modal-close'></div>");
    $("body").append(appendthis);
    $(".modal-overlay").fadeTo(500, 0.7);
    var modalBox = $(this).attr('data-modal-id');
    $('#' + 'generateCertificate').fadeIn($(this).data());
}

function verifyCertificate() {
    let public_id = document.getElementById('verify_cer_id').value;
    if (public_id == '') {
        alert('Please Enter valid Public ID');
        return;
    }

   showProgress();
   $.when($.get('/getStudentList')).done(function (_res) {
        let list = _res.student_list;
        var result = null;
        list.forEach(function (v) {
            console.log(v);
            if (v.certificate_id == public_id) {
                result = v;
            }
        });
        console.log(result);

        if (result == null) {
            hideProgress();
            alert('Certificate Validation Failed - No such certificate found!');

            // Close the Modal Dialog
            $('#certModal').modal("hide");
            return;
        }

        document.getElementById('_student_name_').innerHTML = result.student_name;
        document.getElementById('_program_name_').innerHTML = '\"' + result.program_name + '\"';
        document.getElementById('_date_of_issue').innerHTML = Date().toString().split('2019')[0] + '2019';
        document.getElementById('__cer_id__').innerHTML = public_id;

        hideProgress();
    
        displayCertificate();
    });
}

function displayCertificate() {
    $('#certModal').modal('show');
}
