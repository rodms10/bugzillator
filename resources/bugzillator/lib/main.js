var toolbarbutton = require("toolbarbutton");
var tabs = require("sdk/tabs");
var data = require("self").data;
var bzClient = require("bz").createClient({url: "https://api-dev.bugzilla.mozilla.org/latest/"});

function createButton(options) {
    function onClick() {
        let worker = tabs.activeTab.attach({
          contentScriptFile: data.url("bugzillator.js")
        });
        worker.port.on("getBug", function (bugNumber) {
            bzClient.getBug(bugNumber, function(response) {
                if (response.status == 200) {
                    let bug = response.json;
                    worker.port.emit("onBug", bug);
                }
            });
        });
        worker.port.emit("onCss", data.load("bugzillator.css"));
    }

    return toolbarbutton.ToolbarButton({
        id: "Bugzillator",
        label: "Bugzillator",
        image: data.url("favicon.ico"),
        onCommand: onClick
    });
}


exports.main = function(options) {
    var button = createButton(options);
    
    // On install moves button into the toolbar
    if (options.loadReason == "install") {
        button.moveTo({
            toolbarID: "nav-bar",
            insertbefore: "home-button",
            forceMove: true
        });
    }
};
