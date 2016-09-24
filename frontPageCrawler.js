var cheerio = require('cheerio');
var request = require('request');
var fs = require('fs');
var whitelist = require('./whitelist.json');


module.exports = {
	getNewBlogPosts: (urlList, callback) => {
		var result = [];
		var added = {};
		var filters = ['header', 'footer', 'aside', 'nav', '.nav', '.navbar'];
		var startTime = new Date().getTime();
		var resultCount = 0;
		var regex = /http\w*\:\/\/(www\.)?/i;

		var addPosts = (count) => {
			var frontPageUrl = urlList[count];
			request(frontPageUrl, (err, res, html) => {
				if (err) {
					console.log(err);
				} else {
					var regUrl = frontPageUrl.slice(regex.exec(frontPageUrl)[0].length);
					var $ = cheerio.load(html);
					console.log('Before: ', Object.keys($('a')).length);
					filters.forEach((filter) => {
						$(filter).empty();
					});
					console.log('After: ', Object.keys($('a')).length);
					var anchors = $('a');
					for (var key in anchors) {
						if (anchors[key].attribs) {
							var blogPostUrl = anchors[key].attribs.href;
							if (blogPostUrl && !added[blogPostUrl]) {
								var regBlogUrl = regex.exec(blogPostUrl) ? blogPostUrl.slice(regex.exec(blogPostUrl)[0].length) : blogPostUrl;
								console.log('BLOG: ', regBlogUrl);
								console.log('FRONT: ', regUrl);
								//console.log(regBlogUrl.slice(0, regUrl.length) + ' ' + regUrl);
								if (regBlogUrl.slice(0, regUrl.length) === regUrl) {
									added[blogPostUrl] = true;
									result.push(blogPostUrl);
								}
							}
						}
					}
				}
				// console.log('New Links: ', result.length - resultCount);
				// console.log('Total Links: ', result.length);
				// console.log('Time: ', new Date().getTime() - startTime);
				// console.log('URL: ', frontPageUrl);
				resultCount = result.length;
				if (urlList[count + 1]) {
					addPosts(count + 1);
				} else {
					callback(result);
				}
			});
		};
		addPosts(0);
	}
};

var whiteListKeys = Object.keys(whitelist);
module.exports.getNewBlogPosts(whiteListKeys, (result) => {
	console.log(result.length);
	var toWrite = {};
	for (var i = 0; i < 500; i++) {
		toWrite[result[i]] = true;
	}
	fs.writeFile('output.json', JSON.stringify(toWrite), (err) => {
		if (err) {
			console.log(err);
		}
	});
});
//'https://infrequently.org/'
//['http://android-developers.blogspot.com/']
//other elements/classes to filter out: li? footer