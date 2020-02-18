
./teardown.sh
sleep 2s

npm install

./startFabric.sh
sleep 2s

node registerAdmin.js
node registerUser.js
node server.js

echo ****** Done !!! ******






