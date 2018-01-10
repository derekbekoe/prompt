/* eslint-disable no-undef */
function sendInterestEmail(email, msg, cb) {
    var payload = {
        email: email,
        msg: msg
    };
    
    var data = JSON.stringify( payload )
    return fetch(`/api/register-interest`, {
      accept: "application/json",
      headers: {"Content-Type": "application/json"},
      method: 'POST',
      body: data
    })
      .then(checkStatus)
      .then(parseJSON)
      .then(cb);
  }
  
  function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
      return response;
    }
    const error = new Error(`HTTP Error ${response.statusText}`);
    error.status = response.statusText;
    error.response = response;
    console.log(error); // eslint-disable-line no-console
    throw error;
  }
  
  function parseJSON(response) {
    return response.json();
  }
  
  const ApiClient = { sendInterestEmail };
  export default ApiClient;