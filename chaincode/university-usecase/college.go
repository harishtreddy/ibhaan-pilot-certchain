// SPDX-License-Identifier: Apache-2.0

/*
  Sample Chaincode based on Demonstrated Scenario

 This code is based on code written by the Hyperledger Fabric community.
  Original code can be found here: https://github.com/hyperledger/fabric-samples/blob/release/chaincode/fabcar/fabcar.go
*/

package main

/* Imports
* 4 utility libraries for handling bytes, reading and writing JSON,
formatting, and string manipulation
* 2 specific Hyperledger Fabric specific libraries for Smart Contracts
*/
import (
	"bytes"
	"encoding/json"
	"fmt"
	"math/rand"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// Define the Smart Contract structure
type SmartContract struct {
}

/* Define College structure, with 4 properties.
Structure tags are used by encoding/json library
*/
type College struct {
	Name       string   `json:"name"`
	Programs   []string `json:"programs"`
	IsApproved int      `json:"is_approved"`
	CollegeID  string   `json:"college_id"`
}

type Student struct {
	Name          string `json:"student_name"`
	DateOfBirth   string `json:"student_dob"`
	CollegeName   string `json:"college_name"`
	ProgramName   string `json:"program_name"`
	CertificateID string `json:"certificate_id"`
	StudentID     string `json:"student_id"`
}

/*
 * The Init method *
 called when the Smart Contract "tuna-chaincode" is instantiated by the network
 * Best practice is to have any Ledger initialization in separate function
 -- see initLedger()
*/
func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func random(min, max int) int {
	rand.Seed(time.Now().Unix())
	return rand.Intn(max-min) + min
}

/*
 * The Invoke method *
 called when an application requests to run the Smart Contract "tuna-chaincode"
 The app also specifies the specific smart contract function to call with args
*/
func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	// Route to the appropriate handler function to interact with the ledger
	if function == "requestAffiliation" {
		return s.requestAffiliation(APIstub, args)
	} else if function == "getCollegeList" {
		return s.getCollegeList(APIstub)
	} else if function == "approveAffiliation" {
		return s.approveAffiliation(APIstub, args)
	} else if function == "enrollProgram" {
		return s.enrollProgram(APIstub, args)
	} else if function == "takeAdmission" {
		return s.takeAdmission(APIstub, args)
	} else if function == "getStudentList" {
		return s.getStudentList(APIstub)
	} else if function == "issueCertificate" {
		return s.issueCertificate(APIstub, args)
	}

	return shim.Error("Invalid Smart Contract function name.")
}

/*
 * The recordTuna method *
Fisherman like Sarah would use to record each of her tuna catches.
This method takes in five arguments (attributes to be saved in the ledger).
*/
func (s *SmartContract) requestAffiliation(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting one parameter 'College Name' ")
	}

	//
	// Demonstrate the use of Attribute-Based Access Control (ABAC) by checking
	// to see if the caller has the "abac.init" attribute with a value of true;
	// if not, return an error.
	//
	// var attribute_name =  "abac.init";

	// val, ok, err2 := cid.GetAttributeValue(APIstub, attribute_name)
	// if err != nil {
	// 	return shim.Error("Error retriving attribute " + attribute_name + ", error: " + err.Error())
	// }
	// if !ok {
	// 	return shim.Error("User does not have attribute " + attribute_name)
	// }

	// return shim.Success([]byte(val));

	var id = "College-" + strconv.FormatInt(time.Now().Unix(), 10)
	//var id = strconv.Itoa(random(0, 100))
	var college = College{CollegeID: id, Name: args[0], IsApproved: 0, Programs: make([]string, 0)}

	collegeAsBytes, _ := json.Marshal(college)
	err := APIstub.PutState(id, collegeAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record College catch: %s", args[0]))
	}

	return shim.Success(nil)
}

/*
 * The recordTuna method *
Fisherman like Sarah would use to record each of her tuna catches.
This method takes in five arguments (attributes to be saved in the ledger).
*/
func (s *SmartContract) approveAffiliation(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	fmt.Printf("- approveAffiliation:\n%s\n", args[0])
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	collegeAsBytes, _ := APIstub.GetState(args[0])
	college := College{}

	json.Unmarshal(collegeAsBytes, &college)
	college.IsApproved = 1

	collegeAsBytes, _ = json.Marshal(college)
	APIstub.PutState(args[0], collegeAsBytes)

	return shim.Success(nil)
}

/*
 * The recordTuna method *
Fisherman like Sarah would use to record each of her tuna catches.
This method takes in five arguments (attributes to be saved in the ledger).
*/
func (s *SmartContract) enrollProgram(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	fmt.Printf("- enrollProgram:\n%s\n", args[0])
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	collegeAsBytes, _ := APIstub.GetState(args[0])
	college := College{}

	json.Unmarshal(collegeAsBytes, &college)
	college.Programs = append(college.Programs, args[1])

	collegeAsBytes, _ = json.Marshal(college)
	APIstub.PutState(args[0], collegeAsBytes)

	return shim.Success(nil)
}

/*
 * The recordTuna method *
Fisherman like Sarah would use to record each of her tuna catches.
This method takes in five arguments (attributes to be saved in the ledger).
*/
func (s *SmartContract) takeAdmission(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting four parameter 'Student Name', 'Student DoB', 'College Name', 'Program Name' ")
	}

	var id = "Student-" + strconv.FormatInt(time.Now().Unix(), 10)
	var student = Student{StudentID: id, Name: args[0], DateOfBirth: args[1], CollegeName: args[2], ProgramName: args[3]}

	studentAsBytes, _ := json.Marshal(student)
	err := APIstub.PutState(id, studentAsBytes)
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to record Student: %s", args[0]))
	}

	return shim.Success(nil)
}

/*
 * The recordTuna method *
Fisherman like Sarah would use to record each of her tuna catches.
This method takes in five arguments (attributes to be saved in the ledger).
*/
func (s *SmartContract) issueCertificate(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	fmt.Printf("- issueCertificate:\n%s\n", args[0])
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 'Student ID'")
	}

	studentAsBytes, _ := APIstub.GetState(args[0])
	student := Student{}

	json.Unmarshal(studentAsBytes, &student)
	var id = "Certificate-" + strconv.FormatInt(time.Now().Unix(), 10)
	student.CertificateID = id

	studentAsBytes, _ = json.Marshal(student)
	APIstub.PutState(args[0], studentAsBytes)

	return shim.Success(nil)
}

/*
 *  The queryAllTuna method *
	allows for assessing all the records added to the ledger(all tuna catches)
	This method does not take any arguments. Returns JSON string containing results.
*/
func (s *SmartContract) getCollegeList(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "College-0"
	endKey := "College-9999999999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getCollegeList:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*
 *  The queryAllTuna method *
	allows for assessing all the records added to the ledger(all tuna catches)
	This method does not take any arguments. Returns JSON string containing results.
*/
func (s *SmartContract) getStudentList(APIstub shim.ChaincodeStubInterface) sc.Response {

	startKey := "Student-0"
	endKey := "Student-9999999999"

	resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getStudentList:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

/*
 * main function *
calls the Start function
The main function starts the chaincode in the container during instantiation.
*/
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
