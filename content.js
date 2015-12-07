	/* This is the content script that interacts directly with the DOM of the page
	and then passes messages to the background.js or popup.js 
	
	NOTE: the cookie cannot be captured from here in the content script so that is captured
	by the popup or background.js
	
	*/
	
	// scrape the user category
	function scrape_user() {
		// The pageAction icon will not display if the .user-menu is not available
		// See the background.js for more information
		var category = jQuery('.user-menu a')[0].text;
		chrome.runtime.sendMessage({userType:category});
	}	
	
	// Event Listener for messages from the popup.js
	chrome.runtime.onMessage.addListener( 
		function(request, sender, sendResponse) {
			requestString = JSON.stringify(request, null, 4);
			console.log('message from background/ui: '+requestString);
			if (request.greeting === "hello")
			  sendResponse({farewell: "goodbye"});
			switch (request.message) {
				case "scrape_all":
					break;
				case "scrape_user":
					scrape_user();
					break;
				case "scrape_cookie":
					scrape_cookie();
					break;
				default:
					console.log('recieved a message for which we don\' have an API method');
					break;
			}
		});