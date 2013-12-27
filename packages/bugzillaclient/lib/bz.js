var BugzillaClient = function(options) {
  options = options || {};
  this.username = options.username;
  this.password = options.password;
  this.apiUrl = options.url || 
    (options.test ? "https://api-dev.bugzilla.mozilla.org/test/0.9/"
                  : "https://api-dev.bugzilla.mozilla.org/0.9/");
}

BugzillaClient.prototype = {
  getBug : function(id, params, callback) {
    if (!callback) {
       callback = params;
       params = {};
    }
    this.APIRequest('/bug/' + id, 'GET', callback, null, null, params);  
  },
  
  searchBugs : function(params, callback) {
    this.APIRequest('/bug', 'GET', callback, 'bugs', null, params);
  },

  countBugs : function(params, callback) {
    this.APIRequest('/count', 'GET', callback, 'data', null, params);
  },

  updateBug : function(id, bug, callback) {
    this.APIRequest('/bug/' + id, 'PUT', callback, 'ok', bug);
  },

  createBug : function(bug, callback) {
    this.APIRequest('/bug', 'POST', callback, 'ref', bug);
  },
  
  bugComments : function(id, callback) {
    this.APIRequest('/bug/' + id + '/comment', 'GET', callback, 'comments');
  },
  
  addComment : function(id, comment, callback) {
    this.APIRequest('/bug/' + id + '/comment', 'POST', callback, 'ref', comment);
  },
  
  bugHistory : function(id, callback) {
    this.APIRequest('/bug/' + id + '/history', 'GET', callback, 'history');
  },

  bugFlags : function(id, callback) {
    this.APIRequest('/bug/' + id + '/flag', 'GET', callback, 'flags');
  },

  bugAttachments : function(id, callback) {
    this.APIRequest('/bug/' + id + '/attachment', 'GET', callback, 'attachments');
  },

  createAttachment : function(id, attachment, callback) {
    this.APIRequest('/bug/' + id + '/attachment', 'POST', callback, 'ref', attachment);
  },
  
  getAttachment : function(id, callback) {
    this.APIRequest('/attachment/' + id, 'GET', callback);
  },
  
  updateAttachment : function(id, attachment, callback) {
    this.APIRequest('/attachment/' + id, 'PUT', callback, 'ok', attachment);        
  },

  searchUsers : function(match, callback) {
    this.APIRequest('/user', 'GET', callback, 'users', null, {match: match});
  },

  getUser : function(id, callback) {
    this.APIRequest('/user/' + id, 'GET', callback);
  },
  
  getConfiguration : function(params, callback) {
    if (!callback) {
       callback = params;
       params = {};
    }
    this.APIRequest('/configuration', 'GET', callback, null, null, params);
  },

  APIRequest : function(path, method, callback, field, body, params) {
    var url = this.apiUrl + path;
    if(this.username && this.password) {
      params = params || {};
      params.username = this.username;
      params.password = this.password;
    }
    if(params)
      url += "?" + this.urlEncode(params);
      
    body = JSON.stringify(body);
     
    const Request = require("addon-kit/request").Request;
    
    let r = Request({
        url: url,
        content: body,
        contentType: "application/json",
        headers: {"Accept": "application/json"},
        onComplete: callback
        
    });
    
    if (method === "GET") {
        r.get();
    }
    else {
        r.post();
    }
  },
  
  urlEncode : function(params) {
    var url = [];
    for(var param in params) {
      var values = params[param];
      if(!values.forEach)
        values = [values];
      // expand any arrays
      values.forEach(function(value) {
         url.push(encodeURIComponent(param) + "=" +
           encodeURIComponent(value));
      });
    }
    return url.join("&");
  }
}

exports.createClient = function(options) {
  return new BugzillaClient(options);
}