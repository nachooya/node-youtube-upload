var fs   = require('fs');
var http = require('http');

YoutubeUpload = function (filePath, title, description, category, keywords, googleAccessToken, youtubeDeveloperKey, private, list, callback) {

  var fileReader   = fs.createReadStream(filePath, {encoding: 'binary'});
  var fileContents = '';
  
  fileReader.on ('data', function(data) {
    fileContents += data;
  });
  
  fileReader.on('end', function() {
  
    var xml =
      '<?xml version="1.0"?>' +
      '<entry xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/" xmlns:yt="http://gdata.youtube.com/schemas/2007">' +
      '   <media:group>' + 
      '       <media:title type="plain">' + title + '</media:title>' +
      '       <media:description type="plain">' + description + '</media:description>' +
      '       <media:category scheme="http://gdata.youtube.com/schemas/2007/categories.cat">' + category + '</media:category>' +
      '       <media:keywords>' + keywords + '</media:keywords>' + 
      '   </media:group>' + 
      (list   ? '<yt:accessControl action="list" permission="denied" />':'') +
      (private? '<yt:private/>':'') +     
      '</entry>';

    var boundary = Math.random();
    var postData = [];
    var part = '';

    part = "--" + boundary + "\r\nContent-Type: application/atom+xml; charset=UTF-8\r\n\r\n" + xml + "\r\n";
    postData.push (new Buffer(part, "utf8"));

    part = "--" + boundary + "\r\nContent-Type: video/mp4\r\nContent-Transfer-Encoding: binary\r\n\r\n";
    postData.push (new Buffer (part, 'ascii'));
    postData.push (new Buffer (fileContents, 'binary'));
    postData.push (new Buffer ("\r\n--" + boundary + "--"), 'ascii');

    var postLength = 0;
    for (var i = 0; i < postData.length; i++) {
        postLength += postData[i].length;
    }

    var options = {
      host: 'uploads.gdata.youtube.com',
      port: 80,
      path: '/feeds/api/users/default/uploads?alt=json',
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + googleAccessToken,
        'GData-Version': '2',
        'X-GData-Key': 'key=' + youtubeDeveloperKey,
        'Slug': 'video.mp4',
        'Content-Type': 'multipart/related; boundary="' + boundary + '"',
        'Content-Length': postLength,
        'Connection': 'close'
      }
    }

    var req = http.request(options, function(res) {
    
        res.setEncoding('utf8');

        var response = '';
        res.on('data', function(chunk) {
            response += chunk;
        });
        
        res.on('end', function() {            
          response = JSON.parse(response);
          callback (null, response['entry']['media$group']['yt$videoid']['$t']);
        });
    });

    for (var i = 0; i < postData.length; i++) {
      req.write (postData[i]);
    }

    req.on ('error', function(e) {
      callback (e);
    });

    req.end();
  });
}

module.exports = YoutubeUpload;
