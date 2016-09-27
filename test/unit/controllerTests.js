var expect = require('chai').expect;
var http = require('request');
var postController = require('../../server/controllers/postController.js');

describe('Controllers', function() {

  beforeEach(function() {
    //create dummy data

  });

  describe('Post Controller', function() {

    it('should have a bunch of different methods', function() {
      var modules = [
        'findTags',
        'findOne'
      ];
      modules.forEach(function(module) {
        expect(postController[module]).to.be.a.function;    
      });
    });

    it('should be able to query for tags', function(done) {
      var tags = [
        'google'
      ];
      //console.log(JSON.stringify(tags));
      http.get('http://localhost:3000/api/posts?tags=' + JSON.stringify(tags), function(err, resp, body) {
        response = JSON.parse(resp.body);
        expect(response).to.have.length(2);
        expect(response.map(post => post.title)).to.deep.equal(['Working with Google Analytics', 'Google Analytics - sehr schon']);
        response.forEach(post => {
          expect(post.keys).to.contain(tags[0]);
        });
        done();
      });
    });
  

    it('should query for just one post and get its incoming links', function(done) {

      http.get('http://localhost:3000/api/posts/1', function(err, resp, body) {
        //console.log(err, resp, body);
        done();
      });
    });
  });


  afterEach(function() {
    //db.Post.drop().then(done);
  });
});