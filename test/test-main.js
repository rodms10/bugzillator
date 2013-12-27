var main = require("./main");
var data = require("sdk/self").data;

exports["test_open_tab"] = function(assert, done) {
    const tabs = require("sdk/tabs");

    tabs.on('pageshow', function(tab) {
        let worker = tab.attach({
            contentScript: "document.getElementById('done').addEventListener('click', function() {" +
                "  self.port.emit('done', 'true');" +
                "}, false);"
        });

        main.onBugzillatorClick();

        worker.port.on("done", function () {
            assert.pass("Done testing!");
            done();
        });
    });

    tabs.open(data.url("bugzillatortest.html"));
};

require("sdk/test").run(exports);
