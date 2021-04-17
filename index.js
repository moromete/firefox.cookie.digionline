document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('btn_send');

  getCookies("https://digionline.ro", "DOSESSV3PRI", (response) => {
    document.getElementById('DOSESSV3PRI').value = response;
  });

  getCookies("https://www.digionline.ro", "deviceId", (response) => {
    document.getElementById('deviceId').value = response;
  });
  
  browser.storage.sync.get('host', function(data) {
    document.getElementById('host').value = data.host ? data.host : '127.0.0.1' ;
  });

  checkPageButton.addEventListener('click', function() {
    let host =  document.getElementById('host').value;
    
    browser.storage.sync.set({ host: host }); //save setting

    host = `ws://${host}:9090/jsonrpc`;

    if(!document.getElementById('DOSESSV3PRI').value || !document.getElementById('DOSESSV3PRI').value) {
      alert('Please first login to digionline with your account!');
      return;
    }

    let data = { "jsonrpc": "2.0", 
                  "method": "Addons.ExecuteAddon", 
                  "params": { "wait": false, 
                              "addonid": "plugin.video.digionline", 
                              "params": { "DOSESSV3PRI": document.getElementById('DOSESSV3PRI').value, 
                                          "deviceId": document.getElementById('deviceId').value, 
                                        } 
                            }, 
                  "id": 1 };

    const socket = new WebSocket(host);
    
    // Listen for possible errors
    socket.addEventListener('error', wsError);

    // Connection opened
    socket.addEventListener('open', function (event) {
      socket.send(JSON.stringify(data));
    });

    // Listen for messages
    socket.addEventListener('message', function (event) {
      let response  = JSON.parse(event.data);
      if(response.result == 'OK') {
        alert('Addon setup successfully!');
        socket.removeEventListener('error', wsError);
        socket.close();
      }
    });
  }, false);
}, false);

function wsError(event) {
  console.debug(event);
  alert('Error connectimg to ' + event.target.url);
}

window.addEventListener("beforeunload", function(event) {
  if(typeof socket != 'undefined') {
    socket.close();
  }
});

function getCookies(domain, name, callback) {
  browser.cookies.get({"url": domain, "name": name}, (cookie) => {
    if(callback && cookie) {
      callback(cookie.value);
    }
  });
}