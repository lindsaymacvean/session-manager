// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// show the icon when on an invotra test page
// When the extension is installed or upgraded ...
	chrome.runtime.onInstalled.addListener(function() {
	  // Replace all rules ...
	  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
	    // With a new rule ...
	    chrome.declarativeContent.onPageChanged.addRules([
	      {
	        // That fires when on test website and has class user-menu
	        conditions: [
	          new chrome.declarativeContent.PageStateMatcher({
	            pageUrl: { hostContains: '.io1test.com', schemes: ['https', 'http'] },
				css: [".user-menu"]
	          })
	        ],
	        // And shows the extension's page action.
	        actions: [ new chrome.declarativeContent.ShowPageAction() ]
	      }
	    ]);
	  });
	});