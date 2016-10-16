/**
 * Created by alexandermagee on 9/28/16.
 */
var https = require('https');
var fs = require('fs');

var Flickr = require("flickrapi"),
  flickrOptions = {
    api_key: process.env.FLICKR_API_KEY,
    secret: process.env.FLICKR_SECRET
  };
var flickr;

Flickr.tokenOnly(flickrOptions, function(error, flick) {
  flickr = flick;
  console.log("about to search");
  search(1).then(function(result) {
      for (var i = 0; i < result.photos.photo.length; i++) {
        console.log('id: ' + result.photos.photo[i].id);
        flickr.photos.getSizes({
          photo_id: result.photos.photo[i].id,
          format: 'json'
        },
        function(err, result){
          if (err) {
            console.log('error: ' + err);
          } else {
            var originalArray = result.sizes.size.filter(getOriginal);
            if (originalArray.length) {
              var photoSource = originalArray[0].source;
              console.log('photosource is '+ photoSource);
              var fileName = photoSource.split('/').pop();
              download(photoSource, fileName, function() {
                console.log(fileName + ' has been downloaded');
              });
            }
          }
        });
      }
    // process.exit();
  },
  function(err){
    console.log('error: ' + err);
  });
});

function getOriginal(obj) {
  return obj.label == 'Original';
}

var download = function(url, dest, cb) {
  var file = fs.createWriteStream(dest);
  var request = https.get(url, function(response) {
    response.pipe(file);
    file.on('finish', function() {
      file.close(cb);
    });
  });
};

var search = function(page) {
  return new Promise(function(resolve, reject){
    flickr.photos.search({
        user_id: '99664436@N00',
        page: page,
        per_page: 2,
        format: 'json'
      },
      function(err, result) {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
  });
};