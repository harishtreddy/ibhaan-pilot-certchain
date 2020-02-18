//SPDX-License-Identifier: Apache-2.0

let express = require('express');
let router = express.Router();
let dapp = require('./controller.js');
let format = require('date-format');

module.exports = router;

router.use(function(req, res, next) {

  console.log(format.asString('hh:mm:ss.SSS', new Date())+'::............ '+req.url+' .............');
  next(); // make sure we go to the next routes and don't stop here

  function afterResponse() {
      res.removeListener('finish', afterResponse);          
  }    
  res.on('finish', afterResponse);

});

router.post('/requestAffiliation*', dapp.request_affiliation);
router.post('/approveAffiliation*', dapp.approve_affiliation);
router.post('/enrollProgram*', dapp.enroll_program);
router.post('/takeAdmission*', dapp.take_admission);
router.post('/issueCertificate*', dapp.issue_certificate);

router.get('/getCollegeList', dapp.get_college_list);
router.get('/getStudentList', dapp.get_student_list);
