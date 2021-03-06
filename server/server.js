const express = require('express');
const { createServer } = require('http');
const io = require('socket.io');
const idgen = require('./idgen');

const app = express();
const server = createServer(app);
const userIds = {};
const noop = () => {};

const PORT = 5000;

/**
 * Random ID until the ID is not in use
 */
function randomID(callback) {
  const id = idgen();
  if (id in userIds) setTimeout(() => idgen(callback), 5);
  else callback(id);
}

/**
 * Send data to friend
 */
function sendTo(to, done, fail) {
  const receiver = userIds[to];
  if (receiver) {
    const next = typeof done === 'function' ? done : noop;
    next(receiver);
  } else {
    const next = typeof fail === 'function' ? fail : noop;
    next();
  }
}

/**
 * Initialize when a connection is made
 * @param {SocketIO.Socket} socket
 */
function initSocket(socket) {
  let id;
  socket
    .on('init', () => {
      randomID((_id) => {
        id = _id;
        userIds[id] = socket;
        socket.emit('init', { id });
      });
    })
    .on('request', (data) => {
      sendTo(data.to, to => to.emit('request', { from: id }));
    })
    .on('call', (data) => {
      sendTo(
        data.to,
        to => to.emit('call', { ...data, from: id }),
        () => socket.emit('failed')
      );
    })
    .on('end', (data) => {
      sendTo(data.to, to => to.emit('end'));
    })
    .on('disconnect', () => {
      delete userIds[id];
      console.log(id, 'disconnected');
    });

  return socket;
}

  server.listen(PORT);
  console.log(`Server is listening at :${PORT}`);
  io.listen(server, { log: true })
    .on('connection', initSocket);

