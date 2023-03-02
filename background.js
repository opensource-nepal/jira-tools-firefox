browser.tabs.onCreated.addListener(handleNewTab);

function handleNewTab(tab) {
	if (browser.browserAction.isOpenPopup()) {
		browser.browserAction.closePopup();
	}
}
