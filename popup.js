/* controller script for the popup html ui element 
- passes messages to the content script that interacts with the page

If you need to write a message to the activeTab console use the
message(activeTab, 'message'); helper function

The logical order of operations is:
1. scrape the usertype from the ActiveTab (using the content script)
2. Add the usertype to the set of cookies from the activeTab
3. Store the usertype and cookies using sync
4. When a usertype is clicked then replace the cookies and refresh the page
*/

document.addEventListener('DOMContentLoaded', function() {
	
	// Get currently active tab id - IMPORTANT! stays at the top
	function getActiveTabId(e) {
		var query = { active: true, currentWindow: true };
		function callback(tabs) {
			var tab = tabs[0];
			e(tab);
			return tabs[0];
		}
		chrome.tabs.query(query, callback);
	};
	var activeTabId, activeTabUrl;
	getActiveTabId(function (tab) { activeTabId = tab.id; });
	getActiveTabId(function (tab) { activeTabUrl = tab.url; });

// -- Popup.html DOM event listeners -- //
	// Script for toggling the form
	var toggleState = function (elem, one, two) {
	  var elem = document.getElementById(elem);
	  elem.setAttribute('data-state', elem.getAttribute('data-state') === one ? two : one);
	};
	
	// listen for 'add user type' button click
	var nav = document.getElementById('button');
	nav.addEventListener('click', function (e) {
	  e.preventDefault();
	  var elem = document.getElementById('addNew');
	  scrape_user(activeTabId);
	});
	
	// Listen for a click on one of the User Types
	var userButton = document.getElementById('userList');
	userButton.addEventListener('click', function (e) {
			e.preventDefault();
			// remove current cookies
			clearCookies(activeTabUrl, function () {} );
			// get the cookies for userType
			var userType = e.target.innerHTML;
			getUser(userType, activeTabUrl);
			
	});
	
// -- Messaging -- //
	// send a message to the content.js to scrape the user category
	function scrape_user(activeTabId) {
		chrome.tabs.sendMessage(activeTabId, {message: "scrape_user"});
		// see below for the message listener
	}
	 
// -- Edit cookies -- //

	// This was in the Google Extension example code - not sure what it does
	//if (!chrome.cookies)
	 // chrome.cookies = chrome.experimental.cookies;
	//chrome.cookies.getAll({}, function (e) { console.log(e); } );
		
	// scrape/get all the cookies
	function scrape_cookie(activeTabId, userType, activeTabUrl) {
		chrome.cookies.getAll({}, function (cookies) {
			var object = {}
			object[userType] = cookies;
			setUser(object, function () {
				getUsers();
				clearCookies(activeTabUrl, function () {chrome.tabs.reload();} );
			});
		});
		// We could make this more efficient by REGEX for 'SESS9' cookie name
		// But I think its easier to just store the whole lot every time.
	}
	
	// Clear all the cookies
	function clearCookies (activeTabUrl, callback) {
		chrome.cookies.getAll({}, function(oldCookies) {
			for (var i=0; i<oldCookies.length; i++) {
				var query = {url: activeTabUrl + oldCookies[i].path, name: oldCookies[i].name};
				chrome.cookies.remove(query);
				if(i===oldCookies.length-1) {
					// If we wanted to do something just after clearing the cookies
					callback();
				}
				
			}
			
		});	
	}
	
	// set cookies
	function setCookies(activeTabUrl, cookies) {
		for (var i=0; i<cookies.length; i++) {
			var query = {
				url: activeTabUrl,
				name: cookies[i].name,
				value: cookies[i].value,
				path: cookies[i].path,
				secure: cookies[i].secure,
				httpOnly: cookies[i].httpOnly,
				expirationDate: cookies[i].expirationDate
			};
			chrome.cookies.set(query, function () {} );
		}
		chrome.tabs.reload();
	}

	// If the cookie changes in the sync storage then update locally

	// This is if We want to instantly change the user type 
	// across multiple browsers sessions/computers
	/*
	 chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		  var storageChange = changes[key];
		  
		  console.log('Storage key "%s" in namespace "%s" changed. ' +
					  'Old value was "%s", new value is "%s".',
					  key,
					  namespace,
					  storageChange.oldValue,
					  storageChange.newValue);
		}
	  });
	//*/
	
// -- Storage IO -- //
	// Get all the users currently stored in the sync storage
	function getUsers() {
		chrome.storage.sync.get(function (e){
			if (isEmpty(e))
				document.getElementById('userList')
					.innerHTML = '<li id="noUser">No stored Users</li>';
			else 
				document.getElementById('userList')
					.innerHTML = '';
			// Loop through currently stored usersTypes and list them
			var keys = Object.keys(e);
			for (var i = 0; i<keys.length; i++) {
				// make and append <li> for each user
				var node = document.createElement("A");
				node.innerHTML = '<li name="'+keys[i]+'">'+keys[i]+'</li>';
				document.getElementById('userList').appendChild(node);
			}
		});
	}
	getUsers();
	
	// Get an individual User by UserType key
	function getUser(userType, activeTabUrl) {
		chrome.storage.sync.get(userType, function (cookies) { 
			setCookies(activeTabUrl, cookies[userType]);
		});
	}
	
	// set user
	function setUser(object, callback) {
		chrome.storage.sync.set(object, callback);
	}
	
	// Delete a user
	function deleteUser() {
		
	}
	  
// -- HELPER FUNCTIONS -- //
	// send a generic message to write it to the activeTab console
	function message(activeTabId, payload) {
		chrome.tabs.sendMessage(activeTabId, {message: payload} );
	}
	
	// Listen for message from the content.js script
	chrome.runtime.onMessage.addListener(
	  function(request, sender, sendResponse) {
		  
		// This is the listener function that is waiting for the 
		// scrape_user call to return from above
	    if (request.userType) {
			// If the content responds with userType then get the cookie
			scrape_cookie(activeTabId, request.userType, activeTabUrl);
		}
		
		
		if (request.greeting == "hello")
		  sendResponse({farewell: "goodbye"});
		// Must remain at the bottom of function to allow listeners to access object.properties
		var request = JSON.stringify(request, null, 4);
		console.log('message from content script: '+request);
	  });
	
	// helper function to test if an object is empty
	function isEmpty(obj) {
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
				return false;
		}

		return true;
	}
	
	// Im hacking this because it is only ever going to effect this one popup.html page
	Object.size = function(obj) {
		var size = 0, key;
		for (key in obj) {
			if (obj.hasOwnProperty(key)) size++;
		}
		return size;	
	};
	
});




