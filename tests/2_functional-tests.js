/*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

var bookId = '5f7f61ff103b830182ffa572';
var invalidId = '5f7f61ff103b830182ffa571';

suite('Functional Tests', function() {

  /*----[EXAMPLE TEST]----

  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  
  ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({"title": "Long Lost Test Book"})
          .end(function(err, res){
            assert.equal(res.status, 200)
            assert.property(res.body, 'title', 'Book should contain the title');
            assert.property(res.body, '_id', 'Books should contain the _id');
            done();
          });

      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({})
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {"error": 'No book title was provided. Entry not created.'}, 'No title should return an error.');
            done();
          });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'Response should be an array.');
            assert.property(res.body[0], 'title', 'Books should have a title.');
            assert.property(res.body[0], '_id', 'Books should have a unique _id.');
            assert.property(res.body[0], 'commentcount', 'Books in the general GET should return with a comment count.');
            done();
          });
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/' + invalidId)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.deepEqual(res.body, {"error": 'Book id not found.'}, 'Invalid book ID should return an error.');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        let testId = bookId;

        chai.request(server)
          .get('/api/books/' + testId)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'Returned book should have a title.');
            assert.property(res.body, '_id', 'Returned book should have a unique ID.');
            assert.isArray(res.body.comments, 'Returned book should have an array of 0 or more comments.')
            done();
          });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        let testId = bookId;
        
        chai.request(server)
          .post('/api/books/' + testId)
          .send({"comment": 'A comment.'})
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'title', 'Commented book should have a title.');
            assert.property(res.body, '_id', 'Commented book should have a unique ID.');
            assert.isArray(res.body.comments, 'Commented book should have an array of comments.')
            assert.equal(res.body.comments.includes('A comment.'), true, 'Commented book should have the recently added comment.')
            done();
          });

      });
      
    });

  });

});
