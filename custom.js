chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      console.log(sender.tab ?
                  "from a content script:" + sender.tab.url :
                  "from the extension");
    document.getElementById('username').value = "hi";
      if (request.greeting == "hello")
        sendResponse({farewell: "goodbye"});
    });

// let otp = BoilerKey.requestPassword();ffrom 
// console.log(otp);
// document.getElementById('username').value = BoilerKey.getPUID();
// document.getElementById('password').value = BoilerKey.getPasscode() + "," + otp;

