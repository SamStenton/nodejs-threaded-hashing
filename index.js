
// run with node --experimental-worker index.js on Node.js 10.x
const { Worker } = require('worker_threads')
const bcrypt = require('bcryptjs');

// Get the system threadcount. This is used
// to define the amount of hashes to perform
const threadCount = (require('os')).cpus().length;

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

const threaded = () => runService('supersecurepassword');
const nonThreaded = () => bcrypt.hash('supersecurepassword', 15);

/**
 * Run the job
 */
async function run(arg) {
  const jobs = [];

  for (var i = 0; i < threadCount; i++) {
    jobs.push(arg());
  }
  return Promise.all(jobs);
}

// THREADED
const threadedStart = new Date();
run(threaded)
.then(async res => {
  console.log(await res);
  console.log("Threaded Execution time: ", new Date() - threadedStart);
})
.catch(err => console.error(err))

// NON-THREADED
const nonThreadedStart = new Date();
run(nonThreaded)
.then(async res => {
  console.log(await res);
  console.log("Non-Threaded Execution time: ", new Date() - nonThreadedStart);
})
.catch(err => console.error(err))