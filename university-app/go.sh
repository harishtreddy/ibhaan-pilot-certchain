#docker stop dev-peer0.org1.example.com-university-app-1.0
#docker rm dev-peer0.org1.example.com-university-app-1.0
#docker rmi $(docker images | grep dev-peer0.org1.example.com-university-app-1.0 | tr -s ' ' | cut -d ' ' -f 3)

docker exec peer0.org1.example.com rm -r /var/hyperledger/production/chaincodes/university-app.1.0
sleep 1
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode install -n university-app -v 1.0 -p github.com/university-usecase
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode instantiate -o orderer.example.com:7050 -C mychannel -n university-app -v 1.0 -c '{"Args":[""]}' -P "OR ('Org1MSP.member','Org2MSP.member')"
sleep 2
docker exec -e "CORE_PEER_LOCALMSPID=Org1MSP" -e "CORE_PEER_MSPCONFIGPATH=/opt/gopath/src/github.com/hyperledger/fabric/peer/crypto/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp" cli peer chaincode invoke -o orderer.example.com:7050 -C mychannel -n university-app -c '{"function":"requestAffiliation","Args":["YCCE"]}'


