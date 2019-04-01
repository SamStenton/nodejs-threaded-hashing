
// run with node --experimental-worker index.js on Node.js 10.x
const { Worker } = require('worker_threads')
const threadCount = (require('os')).cpus().length;
const bcrypt = require('bcryptjs');

/**
 * Some boilerplate for running threads
 * @param {Any} workerData 
 */
function runService(workerData) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./service.js', { workerData });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Worker stopped with exit code ${code}`));
    })
  })
}


/**
 * Run the hashing with threads
 */
async function runWithThreads() {
  const jobs = [];

  for (var i = 0; i < threadCount; i++) {
    jobs.push(runService('supersecurepassword' + i));
  }
  return Promise.all(jobs);
}

/**
 * Run the hashing without thread
 */
async function runWithoutThreads() {
  const jobs = [];

  for (var i = 0; i < threadCount; i++) {
    jobs.push(bcrypt.hash('supersecurepassword' + i, 15));
  }
  return Promise.all(jobs);
}

const threadedStart = new Date();
runWithThreads()
.then(async res => {
  console.log(await res);
  console.log("Threaded Execution time: ", new Date() - threadedStart);
})
.catch(err => console.error(err))

let nonThreadedStart = new Date();
runWithoutThreads()
.then(async res => {
  console.log(await res);
  console.log("Non-Threaded Execution time: ", new Date() - nonThreadedStart);
})
.catch(err => console.error(err))