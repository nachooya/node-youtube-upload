var YoutubeUpload = require ('../lib/YoutubeUpload');

var filePath            = '/var/tmp/video.mp4';
var title               = 'title';
var description         = 'description';
var category            = 'Music';
var keywords            = 'music';
var googleAccessToken   = '';
var youtubeDeveloperKey = '';

YoutubeUpload (filePath, title, description, category, keywords, googleAccessToken, youtubeDeveloperKey, false, false, function (err, youtube_id) {

  if (err) console.log ("Got error: "+err);
  else     console.log ("Got id: "+youtube_id);

});
