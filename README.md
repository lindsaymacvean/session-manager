/*
This plugin allows you to capture the session cookie for different user categories,
it is then simple to click between the different users and spoof the session cookie for each one.
Cookies in Drupal seem to have an expiration date of about a month.

Most of the logic for this extension is currently held in the popup.js file with the content.js
acting as an anaemic API for interacting with the DOM and logging messages to the activeTab console.

WARNING: because this extension uses chrome.storage.sync 
which is the google chrome sync, un-encrypted cloud storage option,
this extension SHOULD NOT BE USED IN A LIVE ENVIRONMENT. It was only built for
testing single instances where you need to log in and out constantly. 
You have been warned!

Instructions:
1. Enable developer mode
2. Install unpacked extension
3. enable in incognito mode
4. open an incognito tab and log in as a user type
5. click the in page action icon in the url bar and click 'add user type'
6. close the incognito WITHOUT logging out. 
7. Repeat for every user you want easy access to.
8. You can now log in as admin but click between the different users at will. 
9. If a user is logged out you will need to repeat the process again.

Simple video showing you the steps:
[video pending]

Future improvements:
automatically add every user by logging in and out with predefined username passwords
automatically cycle through every page type to see bugs from different perspectives


Copyleft, no rights reserved.
*/