const serviceName = `luna://com.nikossiak.controlmymac.service/`;

var webOSTVMajorVersion = null;

window.addEventListener('load', () => {
  webOS.service.request(serviceName, { method: 'connectToServer' });

  _getWebOSTVVersion();
  _registerTVSize();
});

window.addEventListener('keydown', (e) => {
  webOS.service.request(serviceName, {
    method: 'inputEvent',
    parameters: {
      event: 'keydown',
      payload: { keyCode: e.keyCode }
    },
    onFailure: (err) => {
      console.log(err);
    }
  });
});

document.addEventListener('webOSMouse', (e) => {
  const method =
    webOSTVMajorVersion === '24'
      ? 'sensor2/getSensorEventData'
      : 'sensor/getSensorData';
  const options = { subscribe: true };

  if (webOSTVMajorVersion === '24') {
    options.sensorType = 'coordinate';
  } else if (webOSTVMajorVersion === '1') {
    options.callbackInterval = 1;
    options.sleep = true;
    options.autoAlign = false;
  } else {
    options.callbackInterval = 1;
  }

  webOS.service.request('luna://com.webos.service.mrcu', {
    method,
    parameters: options,
    onSuccess: function (inResponse) {
      if (typeof inResponse.subscribed !== 'undefined') {
        if (!inResponse.subscribed) {
          console.log('Failed to subscribe');
          return;
        }
      }

      webOS.service.request(serviceName, {
        method: 'inputEvent',
        parameters: {
          event: 'mouseMove',
          payload: inResponse.coordinate
        },
        onFailure: (err) => {
          console.log(err);
        }
      });
    },
    onFailure: (error) => {
      console.log(error.errorText);
    }
  });
});

const _getWebOSTVVersion = () => {
  webOS.service.request('luna://com.webos.service.tv.systemproperty', {
    method: 'getSystemInfo',
    parameters: { keys: ['sdkVersion'] },
    onSuccess: function (inResponse) {
      webOSTVMajorVersion = inResponse.sdkVersion.split('.')[0];

      console.log(`webOSTVMajorVersion = ${webOSTVMajorVersion}`);
    },
    onFailure: function (inError) {
      console.log('Failed to get webOS TV Version: ' + inError.errorText);
    }
  });
};

const _registerTVSize = () => {
  webOS.service.request(serviceName, {
    method: 'register_tv_size',
    parameters: {
      payload: {
        x: window.innerWidth,
        y: window.innerHeight
      }
    },
    onFailure: (err) => {
      console.log(err);
    }
  });
};
