/* eslint-disable no-var */
/* eslint-disable import/no-unresolved */
const pkgInfo = require('./package.json');
const Service = require('webos-service');
const WebSocket = require('ws');
const service = new Service(pkgInfo.name);

var ws = null;

var keepAlive;
service.activityManager.create('keepAlive', function (activity) {
  keepAlive = activity;
});

service.register('connectToServer', () => {
  ws = new WebSocket('ws://192.168.1.214:8000/remote');
});

service.register('inputEvent', (message) => {
  try {
    if (ws.readyState !== WebSocket.OPEN) {
      message.respond({
        returnValue: false,
        message: 'Connection not ready yet'
      });
      return;
    }

    ws.send(
      JSON.stringify({
        event: message.payload.event,
        payload: message.payload.payload
      })
    );

    message.respond({
      returnValue: true
    });
  } catch (e) {
    message.respond({
      returnValue: false,
      message: e.message
    });
  }
});
