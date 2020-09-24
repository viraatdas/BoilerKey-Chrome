class BoilerKey {

  static requestPassword() {
    const secret = localStorage.getItem("key-hotp");

    if(!secret) {
      console.log("Error: No HOTP");
      return;
    }

    let count = localStorage.getItem("key-counter");

    if(count) {
      count = parseInt(count) + 1;
    } else {
      count = 1;
    }

    localStorage.setItem("key-counter", count);

    let hotp = new jsOTP.hotp();
    let otp = hotp.getOtp(secret, count);

    let codeElement = document.getElementById("code");
    codeElement.innerHTML = otp;

    document.oncopy = function(event) {
      event.clipboardData.setData("text/plain", otp);
      event.preventDefault();
    };
    document.execCommand("copy", false, null);

    let notyf = new Notyf({delay:3000});
    notyf.confirm("Copied to clipboard!");
    
    return otp;
  }

  static sendRequest(url) {
    let code = url.split("/activate/")[1];

    let headers = {
      "User-Agent": "okhttp/3.11.0"
    }

    let params = {
        "app_id": "com.duosecurity.duomobile.app.DMApplication",
        "app_version": "2.3.3",
        "app_build_number": "323206",
        "full_disk_encryption": "False",
        "manufacturer": "Google",
        "model": "Pixel",
        "platform": "Android",
        "jailbroken": "False",
        "version": "6.0",
        "language": "EN",
        "customer_protocol": 1
    }

    const urlParams = new URLSearchParams(Object.entries(params));
    let uri = "https://api-1b9bef70.duosecurity.com/push/v2/activation/" + code + "?" + urlParams;
    
    fetch(uri, {
      method: "POST",
      headers: headers
    })
    .then(res => res.json())
    .then(res => {
      const hotpSecret = res["response"]["hotp_secret"];
      localStorage.setItem("key-hotp", hotpSecret);
      localStorage.setItem("key-counter", 1);

      alert("Key successfully added!");
    })
    .catch(error => {
      alert("There was an error. Please try again later.")
      console.log(error);
    })
  }

  static setPUID(puid) {
    localStorage.setItem("key-puid", puid);
  }

  static setPasscode(passcode) {
    localStorage.setItem("key-passcode", passcode);
  }

  static getPUID() {
    return localStorage.getItem("key-puid");
  }

  static getPasscode(passcode) {
    return localStorage.getItem("key-passcode");
  }

  static addUrl() {

    // checks if passcode is valid
    function checkValidPasscode(passcode) {
      return !isNaN(passcode) && parseInt(passcode) > 0 && parseInt(passcode) <= 9999
    }

    let puid = document.getElementById("duo-puid").value;
    let passcode = document.getElementById("duo-passcode").value;
    let url = document.getElementById("duo-url").value;
    

    if(puid && checkValidPasscode(passcode) && url.includes("m-1b9bef70.duosecurity.com") ) {
      BoilerKey.setPUID(puid);
      BoilerKey.setPasscode(passcode);
      BoilerKey.sendRequest(url);
    
    } else {
      alert("PUID, passcode, or url not set properly!");
    }
  }

  static clearData() {
    localStorage.removeItem("key-hotp");
    localStorage.removeItem("key-counter");
    localStorage.removeItem("key-passcode");
    localStorage.removeItem("key-puid");
  }

  static incrementCounter() {
    let count = localStorage.getItem("key-counter");

    if(count) {
      localStorage.setItem("key-counter", count + 1);
      return count + 1;
    } else {
      return null;
    }
  }
}


let submit = document.getElementById("submit");
let request = document.getElementById("request-button");
let clear = document.getElementById("clear-data");


let setupDiv = document.getElementById("setup");
let requestDiv = document.getElementById("request");

let hotpSecret = localStorage.getItem("key-hotp");

submit.addEventListener("click", (e) => {
  e.preventDefault();
  BoilerKey.addUrl();
  e.preventDefault();
})

request.addEventListener("click", (e) => {
  BoilerKey.requestPassword();
})

clear.addEventListener("click", (e) => {
  let confirmed = confirm("Are you sure you want to go through the entire setup process again?")

  if(confirmed) {
    BoilerKey.clearData();
    hotpSecret = localStorage.getItem("key-hotp");

    requestDiv.style.display = "none";
    setupDiv.style.display = "block";
  }
})

if(!hotpSecret) {
  requestDiv.style.display = "none";
  console.log("doesnt hotp");
} else {
  setupDiv.style.display = "none";
  console.log("has");

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab.id);
   });

  // chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  //   chrome.tabs.sendMessage(sender.tab.id, {greeting: "hello"}, function(response) {
  //     console.log(response.farewell);
  //   });
  //  });

}
