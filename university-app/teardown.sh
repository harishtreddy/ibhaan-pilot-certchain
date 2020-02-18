# Exit on first error, print all commands.
set -e

# Stop and remove all running containers
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)

# Clean any chaincode containers
docker rmi $(docker images | grep dev-peer0.org1.example.com-university-app-1.0 | tr -s ' ' | cut -d ' ' -f 3)

# remove the local state
rm -f ~/.hfc-key-store/*