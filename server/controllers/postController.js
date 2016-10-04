var db = require('../../db/database.js');
var Post = db.Post;
var Edges = db.Edges;
var Authors = db.Authors;
var Tags = db.Tags;
var Promise = require('bluebird');

//Finds one all posts matching a tag, sorting them by inLinks
exports.findTags = function(req, res) {

  // Old query
  // orQuery = req.query.tags.map(tag => {
  //   return { 
  //     oldTags: {
  //       $contains: [tag]
  //     }
  //   };
  // });
  
  // Post.findAll({
  //   where: { 
  //     $or: orQuery
  //   }
  // }).then(function(results) {
  //   results.sort((a, b) => b.inLinks.length - a.inLinks.length);
  //   res.json(results);
  // }).catch(function(err) {
  //   console.log('Error in find tags: ', err);
  //   res.status(500).send(err);
  // });

  var finalResults = [];

  Tags.findAll({
    where: {
      name: {
        in: req.query.tags
      }
    },
    include: [{
      model: Post
    }]
  }).then(function(results) {
    
    results.forEach(tag => {
      tag.posts.forEach(post => {
        if (finalResults.map(one => one.postId).indexOf(post.postId) < 0) {
          finalResults.push(post);
        }
      });
    });
    
    finalResults.sort((a, b) => b.inLinks.length - a.inLinks.length);
    res.json(finalResults);

  }).catch(function(err) {
    console.log(err);
    res.status(500).send(err);
  });


};


//Finds one post, then finds all info for links to it.
exports.findOne = function(req, res) {

  Post.findOne({
    where: {
      postId: req.params.number
    }
  }).then(function(result) {

    //Get all of these infos
    var linkedPosts = result.inLinks;

    return Promise.all(linkedPosts.map(function(linkId) {
      return Post.findOne({
        where: {
          postId: linkId
        }
      });
    }));

  }).then(function(inLinks) {
    inLinks.sort((a, b) => b.inLinks.length - a.inLinks.length);
    res.send(inLinks);

  }).catch(function(err) {

    console.log('Error in findOne: ', err);
    res.status(500).send(err);    

  });

};

