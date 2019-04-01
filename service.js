const { workerData, parentPort } = require('worker_threads')
const bcrypt = require('bcryptjs');

// parentPort.postMessage({ hello: workerData })
bcrypt.hash(workerData, 15, (err, hash) => {
  parentPort.postMessage(hash)
})

