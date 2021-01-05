/**
 * A custom concurrent connection limiter for xmtoolbox
 */
function Limiter(options = {}) {
  this.taskQueue = [];
  const maxConcurrent = options.maxConcurrent;
  this.taskCount = 0;

  this.queueProcessor = function () {
    //if something in queue and processing available.
    if (this.taskQueue[0] && this.taskCount < maxConcurrent) {
      //up counter
      this.taskCount += 1;

      //get task and remove it from TaskQueue
      const task = this.taskQueue.shift();
      this.taskProcessor(task);
    }

    if (this.taskQueue.length > 0) {
      setImmediate(this.queueProcessor.bind(this));
    }
  };

  /**
   * Schedule a promise based task to be completed according the limiter configuration.
   * @param {*} fn
   * @param  {...any} args
   */
  this.schedule = async function (fn, ...args) {
    let scheduledTask;
    const task = new Promise(
      (resolve, reject) =>
        (scheduledTask = {
          resolve,
          reject,
          fn,
          args,
        })
    );
    this.taskQueue.push(scheduledTask);
    setImmediate(this.queueProcessor.bind(this));
    return task;
  };

  this.taskProcessor = async function taskProcessor(task) {
    try {
      const result = await task.fn.apply(null, task.args);
      task.resolve(result);
    } catch (error) {
      task.reject(error);
    }

    //down counter
    this.taskCount -= 1;
  };
}

module.exports = Limiter;
