/*
*       Complete the API routing below
*/

'use strict';

require('dotenv').config();
var expect = require('chai').expect;
var { MongoClient } = require('mongodb');
var ObjectId = require('mongodb').ObjectId;

class Book {
  constructor(title){
    this.title = title;
    this.comments = [];
    this.commentcount = 0;
  }
}

async function connection (callback){
  var URI = process.env.MONGO_URI;
  var client = new MongoClient(URI, { useNewUrlParser: true, useUnifiedTopology: true });

  try{
    await client.connect();
    await callback(client)
  } catch (err) {
    console.error(err);
  } finally {
    await client.close();
  }
}

module.exports = function (app) {

  app.route('/api/books')

    //GET all books
    .get(function (req, res){
      connection(async function(client){
        let bookQuery = await client.db('book-db').collection('books')
          .find({})
          .sort({"title": 1})
          .toArray()

        let bookList = bookQuery.map(book => {return {
          "title": book.title,
          "_id": book._id,
          "commentcount": book.commentcount
        }});

        res.send(bookList);
        console.log(bookList.length + " book(s) found.");

      });
    })
    
    //POST a new book
    .post(function (req, res){
      var title = req.body.title;

      if (!title) {
        res.send({"error": 'No book title was provided. Entry not created.'});
        console.log('POST request received without a book title.')
      }

      else{
      connection(async function (client) {
        let result = await client.db('book-db').collection('books')
          .findOne({"title": title})

        console.log(result);
        
        if (result === null){
          let newBook = new Book(title);
          let dbResult = await client.db('book-db').collection('books').insertOne(newBook);

          res.send({"title": title, "_id": dbResult.insertedId});
          console.log(`${title} was inserted with ID of ${dbResult.insertedId}`);
        }

        else {
          res.send({"error": title + " already in library."});
          console.log(`A POST request for ${title} was made, but it is already in the library!`);
        }

      });
      }
    })
    
    //DELETE all books
    .delete(function(req, res){
      connection(async function(client) {
        let result = await client.db('book-db').collection('books').deleteMany({});

        let checkQuery = await client.db('book-db').collection('books').find({}).toArray();

        if (checkQuery.length === 0) {
          res.send({"status": "complete delete successful"});
          console.log(result.deletedCount + ' entries deleted.');
        }
        else {
          res.send({"error": "deletion not performed"});
          console.log('Something happened; deletion did not complete.');
        }
      });
    });



  app.route('/api/books/:id')
    //GET a specific book
    .get(function (req, res){
      var bookid = req.params.id;

      connection(async function (client) {
        let result = await client.db('book-db').collection('books').findOne({"_id": new ObjectId(bookid)});

        if (result === null) {
          res.send({"error": 'Book id not found.'})
          console.log('No book found with the requested ID.')
        }
        else {
          res.send({
            "title": result.title,
            "_id": result._id,
            "comments": result.comments
          });
          console.log('Book matched to ID ' + bookid);
        }
      });
    })
    
    //POST a new comment
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;

      connection(async function(client) {
        let searchResult = await client.db('book-db').collection('books').findOne({"_id": new ObjectId(bookid)});

        if (searchResult === null) {
          res.send({"error": 'Book id not found.'})
          console.log('No book found with the requested ID.')
        }
        else {
          searchResult.comments.push(comment);
          searchResult.commentcount++;
          let updResult = await client.db('book-db').collection('books').updateOne({"_id": new ObjectId(bookid)}, {$set: searchResult});

          if ( updResult.modifiedCount === 1 ){
            res.send({
              "title": searchResult.title,
              "_id": searchResult._id,
              "comments": searchResult.comments
            });
            console.log('Book matched to ID ' + bookid + ' and updated comment.');
          }
          else {
            res.send({"error": "comment not added"})
            console.log('Something happened; update operation could not be performed.')
          }
        }
      });
    })
    
    //DELETE a specific book
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'

      connection(async function(client) {
        let result = await client.db('book-db').collection('books').deleteOne({"_id": new ObjectId(bookid)});

        if (result.deletedCount === 1) {
          res.send({"status": "delete successful"});
          console.log(`Book with ID ${bookid} deleted successfully.`);
        }

        else {
          res.send({"error": "delete was not performed."});
          console.log('Something happened; delete not performed.')
        }

      });
    });
  
};
