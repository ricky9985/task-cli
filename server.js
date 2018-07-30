"use strict";

const EventEmitter = require("events");

class Server extends EventEmitter {
  constructor(client) {
    super();
    this.tasks = {};
    this.taskId = 1;
    //next tick executes the callback immediately after the current operation in event loop
    process.nextTick(() => {
      this.emit("response", 'Type a command (help to list commands)');
    });
    client.on("command", (command, args) => {
      switch (command) {
        case "add":
        case "help":
        case "ls":
        case "del":
          this[command](args);
          break;
        default:
          console.log("Unknown command");
      }
    })
  }

  getTaskString() {
    if (this.taskId === 1) {
      return "No tasks added."
    } else {
      return Object.keys(this.tasks).map(task => {
        return `${task}: ${this.tasks[task]}`
      }).join('\n');
    }

  }

  add(args) {
    let res = [];
    if (args[0].toString() !== "-m") {
      this.tasks[this.taskId] = args.join(' ');
      res.push(`Added task :
    ${this.tasks[this.taskId]}`);
      this.taskId += 1;
    } else {
      args.shift();
      let taskString = [];
      let stringArg = "";
      args.forEach(arg => {
        stringArg = arg.toString();
        if (stringArg.startsWith('"') && stringArg.endsWith('"')) {
          // taskString.push(arg);
          this.tasks[this.taskId] = arg;
          res.push(`Added task :
            ${this.tasks[this.taskId]}`);
          this.taskId += 1;
        } else if (stringArg.startsWith('"')) {
          taskString.push(arg);
        } else if (stringArg.endsWith('"')) {
          taskString.push(arg);
          this.tasks[this.taskId] = taskString.join(' ');
          res.push(`Added task :
            ${this.tasks[this.taskId]}`);
          this.taskId += 1;
          taskString = [];
        } else {
          taskString.push(arg);
        }
      });
    }

    this.emit('response', res.join('\n'));
  }

  help() {
    this.emit('response', `Available commands:
    ls
    add (use -m to give multiple tasks in quotes)
    del`)
  }

  ls() {
    this.emit('response', this.getTaskString());
  }

  reNumberTasks() {
    let counter = 1;
    let reNumbered = {};
    Object.keys(this.tasks).forEach(task => {
      reNumbered[counter] = this.tasks[task];
      counter += 1;
    });
    this.taskId = counter;
    this.tasks = reNumbered;
  }

  del(args) {
    let deletedTasks = [];
    args.forEach(id => {
      deletedTasks.push(`${id} : ${this.tasks[id]}`);
      delete this.tasks[id];
    });
    this.reNumberTasks();
    this.emit('response', deletedTasks.join('\n'));
  }
}

module.exports = (client) => new Server(client);