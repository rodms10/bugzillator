// bugzillator.js - Bugzillator's content script

(function() {
    let regText = "\\b(?:bug|issue|ticket)\\s*#?(\\d+)\\b",
        bugLink = "https://bugzilla.mozilla.org/show_bug.cgi?id=",
        bugInfo = {},
        visitedProp = "bugzillator-visited",
        bugPaneFuncs = {},
        paneDiv;
        
    function replaceBugs(aOptions, aElement) {
        aElement = aElement || document.body;
        let children = aElement.childNodes;
        
        for (let node of children) {
            if (node.nodeType == Node.TEXT_NODE) {
                let text = node.textContent,
                    regTest = new RegExp(regText, "gi");

                if (regTest.test(text)) {
                    let pieces = text.split(new RegExp(regText, "gi")),
                        regMatch = new RegExp(regText, "gi"),
                        matches;
                    
                    while(matches = regMatch.exec(text)) {
                        let bugDesc = matches.shift(),
                            bugNumber = matches.shift();
    
                        nextPiece = pieces.shift();
                        aElement.insertBefore(document.createTextNode(nextPiece), node);
                        // For every match we have a bug# match to shift.
                        
                        let link = document.createElement("a");
                        link.setAttribute("href", bugLink + bugNumber);
                        link.appendChild(document.createTextNode(bugDesc));
                        link.addEventListener("mouseover", displayBugPaneFunc(bugNumber));
                        link.addEventListener("mouseout", hideBugPane);
                        link.setAttribute(visitedProp, "true");
                        
                        aElement.insertBefore(link, node);
                        
                        // Disposes bug text match.
                        pieces.shift();
                    }
                    // In case there's anything after the bug.
                    if (pieces.length)
                        aElement.insertBefore(document.createTextNode(pieces.shift()), node);
                    
                    aElement.removeChild(node);
                }
            } else if (node.nodeName == "IFRAME") {
                if (node.contentDocument) {
                    replaceBugs(aOptions, node.contentDocument.body);
                }
            } else if (node.nodeName == "A") {
                // Skip visited anchor tags to avoid infinite loop.
                if (node.hasAttribute(visitedProp))
                    continue;

                // Aldready existing anchor tag let's just add the pane if it matches.
                node.setAttribute(visitedProp, "true");
                
                let text = node.textContent, 
                    matches = new RegExp(regText, "gi").exec(text);
                    
                // Just handle the first match.
                if (matches) {
                    node.addEventListener("mouseover", displayBugPaneFunc(matches[1]));
                    node.addEventListener("mouseout", hideBugPane);
                }                
            } else {
                replaceBugs(aOptions, node);
            }
        }
    }
    
    let paneId = "bugzillator-pane",
        pane = {};
    
    function createPane() {
        let getById = document.getElementById.bind(document); 
        paneDiv = document.createElement("div");
        paneDiv.id = paneId;
        
        paneDiv.innerHTML = '<span id="' + paneId + '-summary"></span></div>' +
            '<div>Status: <span id="' + paneId + '-status"></span>, ' +
            'Assigned to <span id="' + paneId + '-assignedTo"></span></div>';
        
        document.body.appendChild(paneDiv);

        pane["summary"] = getById(paneId + "-summary");
        pane["status"] = getById(paneId + "-status");
        pane["assigned_to"] = getById(paneId + "-assignedTo");
    }
    
    function setUpPane(bug, pos) {
        for (let prop in pane) {
            if (pane[prop] && typeof bug[prop] != "object")
                pane[prop].textContent = bug[prop];
            
            pane.assigned_to.textContent = bug.assigned_to.name;
        }
        
        paneDiv.style.opacity = "1";
        paneDiv.style.left = pos.x + "px";
        paneDiv.style.top = pos.y + "px";
    }
    
    function getPos(elem) {
        if (!elem)
            return {x:0, y:0}
            
        var parentPos = getPos(elem.offsetParent);
        
        return {
            x: parentPos.x + elem.offsetLeft,
            y: parentPos.y + elem.offsetTop,
        }
    }
    
    function displayBugPaneFunc(bugNumber) {
        // Make sure we have info for bug.
        getBugInfo(bugNumber);
        
        return bugPaneFuncs[bugNumber] || (bugPaneFuncs[bugNumber] = function(event) {
            let bug = bugInfo[bugNumber];
            
            if (!bug || bug == "pending")
                return;
            
            let pos = getPos(event.target);
            
            setUpPane(bug, pos);
        });
    }
    
    function hideBugPane() {
        paneDiv.style.opacity = "0";
    }
    
    function getBugInfo(bugNumber) {
        if (!bugInfo[bugNumber]) {
            bugInfo[bugNumber] = "pending";
            self.port.emit("getBug", bugNumber);
        }
    }
    
    self.port.on("onBug", function(bug) {
        bugInfo[bug.id] = bug;
    });
    
    self.port.on("onCss", function(style) {
        let headStyle = document.createElement("style");
        headStyle.innerHTML = style;
        
        document.head.appendChild(headStyle);
    });
    
    createPane();
    replaceBugs();
})();
