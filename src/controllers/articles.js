
const pool = require('../db/database');
const Sanitize = require('../middleware/validation/sanitizeData');
const articleModel = require('../models/articleModel');

/*
-----------------------------------------------------------------------
controllers for specified article routes for main project
-----------------------------------------------------------------------
*/

// controller to create an article
exports.createArticle = async (request, response) => {
  // PUT VALIDATION HERE..............................
  const { title, content } = request.body;
  const postType = 'article';

  if (!title) {
    return response.status(400).send({
      status: 'error',
      error: 'Title field cannot be empty',
    });
  }

  if (!content) {
    return response.status(400).send({ status: 'error', error: 'Content field cannot be empty' });
  }

  try {
    const upperTitle = title.toUpperCase();
    const cleanTitle = Sanitize.encode(upperTitle);
    const cleanContent = Sanitize.encode(content);
    const now = new Date();
    const postData = await pool.query('INSERT INTO posts (post_type, post_created_on) VALUES($1, $2) returning *', [postType, now]);
    if (!postData.rows || postData.rowCount === 0) {
      return response.status(400).send({
        status: 'error',
        error: 'invalid request',
      });
    }
    const articleData = await pool.query('INSERT INTO articles (article_author, article_post_id, article_title, content, article_created_on) VALUES ($1, $2, $3, $4, $5) returning *', [request.user.ID, postData.rows[0].post_id, cleanTitle, cleanContent, postData.rows[0].post_created_on]);
    if (!articleData.rows || articleData.rowCount === 0) {
      response.status(400).send({
        status: 'error',
        error: 'invalid request',
      });
    }
    return response.status(201).send({
      status: 'success',
      data: {

        message: 'Article successfully posted',
        articleId: articleData.rows[0].article_id,
        createdOn: articleData.rows[0].article_created_on,
        title: Sanitize.decode(articleData.rows[0].article_title),

      },
    });
  } catch (error) {
    return response.status(501).send({
      status: 'error',
      error,
    });
  }
};


// controller to edit/update a particular article
exports.editArticle = async (request, response) => {
  // PUT VALIDATION HERE..............................
  const { title, content } = request.body;
  if (!title) {
    return response.status(400).send({
      status: 'error',
      error: 'Title field cannot be empty',
    });
  }

  if (!content) {
    return response.status(400).send({
      status: 'error',
      error: 'Content field cannot be empty',
    });
  }
  try {
    const articleId = request.params.articleid;
    const upperTitle = title.toUpperCase();
    const cleanTitle = Sanitize.encode(upperTitle);
    const cleanContent = Sanitize.encode(content);
    const now = new Date();
    const data = await pool.query('UPDATE articles SET article_title = $1, content = $2, article_updated_on = $3 WHERE article_author = $4 AND article_id = $5 returning *', [cleanTitle, cleanContent, now, request.user.ID, articleId]);
    if (data.rowCount === 0) {
      return response.status(404).send({ status: 'error', error: 'Unauthorized access or No article found for this user' });
    }
    const { rows } = data;
    return response.status(200).send({
      status: 'success',
      data: {
        message: 'Article successfully updated',
        title: Sanitize.decode(rows[0].article_title),
        article: Sanitize.decode(rows[0].content),
      },
    });
  } catch (error) {
    return response.status(501).send({ status: 'error', error });
  }
};


exports.deleteArticle = async (request, response) => {
  try {
    const articleId = request.params.articleid;
    const data = await pool.query('DELETE FROM articles WHERE articles.article_id = $1 AND article_author = $2 returning *', [articleId, request.user.ID]);
    if (data.rowCount === 0) {
      return response.status(404).send({ status: 'error', error: 'article not found or unauthorized' });
    }

    return response.status(200).send({
      status: 'success',
      data: {
        message: 'Article successfully deleted',
      },
    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};


// view article with comments by article id
exports.viewArticleById = async (request, response) => {
  try {
    const articleId = request.params.articleid;

    const { rows, rowCount } = await pool.query('SELECT * FROM articles WHERE article_id = $1', [articleId]);

    if (!rows || rowCount === 0) {
      return response.status(400).send({
        status: 'error',
        error: 'No articles found',
      });
    }


    const commentsData = await pool.query('SELECT * FROM comments INNER JOIN comments_article ON comments.comment_id = comments_article.comment_id WHERE comments_article.article_id = $1', [articleId]);
    const comments = [];
    if (!commentsData.rows || commentsData.rowCount === 0) {
      return response.status(200).send({
        status: 'success',
        data: {
          id: rows[0].article_id,
          title: Sanitize.decode(rows[0].article_title),
          article: Sanitize.decode(rows[0].content),
          comments,
        },
      });
    }


    commentsData.rows.forEach((row) => {
      comments.push({
        commentId: row.comment_id,
        comment: Sanitize.decode(row.comment_body),
        authorId: row.author,
      });
    });
    return response.status(200).send({
      status: 'success',
      data: {
        id: rows[0].article_id,
        title: Sanitize.decode(rows[0].article_title),
        article: Sanitize.decode(rows[0].content),
        comments,

      },
    });
  } catch (error) {
    return response.status(500).send({
      status: 'error',
      error,
    });
  }
};


/**
 * ----------------------------------------------------------------------------
 * controllers for other possible routes
 * ----------------------------------------------------------------------------
 */

// function to decode sanitized article stored in database

// controller to view articles created by current users only
exports.viewCurrentUserArticles = async (request, response) => {
  try {
    const { rows, rowCount } = await pool.query('SELECT users.first_name as author_firstname, users.last_name as author_lastname, articles.article_id, articles.article_title as title, articles.content as content, articles.article_created_on FROM articles LEFT JOIN users ON articles.article_author = users.team_id WHERE articles.article_author = $1', [request.user.ID]);

    if (!rows || rowCount === 0) {
      return response.status(404).send({ status: 'error', error: 'No articles found' });
    }
    let data = {};

    if (rows && rowCount === 1) {
      data.id = rows[0].article_id;
      data.title = Sanitize.decode(rows[0].title);
      data.article = Sanitize.decode(rows[0].content);
      data.createdOn = rows[0].article_created_on;

      return response.status(200).send({
        status: 'success',
        data,
      });
    }

    data = articleModel(rows);
    return response.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    return response.status(500).send({ status: "error", error });
  }
};


// controller to view all articles and searched article
exports.viewArticles = async (request, response) => {
  try {
    // query search for title if provided
    if (request.query.title) {
      const searchByTitle = `%${request.query.title.toUpperCase()}%`;
      const { rows, rowCount } = await pool.query('SELECT users.first_name as author_firstname, users.last_name as author_lastname, articles.article_id, articles.article_title as title, articles.content as content, articles.article_created_on FROM articles LEFT JOIN users ON articles.article_author = users.team_id WHERE articles.article_title LIKE $1', [searchByTitle]);
      if (!rows || rowCount === 0) {
        return response.status(404).send({ error: 'No articles found' });
      }
      const data = articleModel(rows);
      return response.status(200).send({
        status: 'success',
        data,
      });
    }

    // query search for author if provided
    if (request.query.author) {
      const searchByAuthor = `%${request.query.author.toUpperCase()}%`;
      const { rows, rowCount } = await pool.query('SELECT users.first_name as author_firstname, users.last_name as author_lastname, articles.article_id, articles.article_title as title, articles.content as content, articles.article_created_on FROM articles LEFT JOIN users ON articles.article_author = users.team_id WHERE (users.last_name || users.first_name) LIKE $1', [searchByAuthor]);
      if (!rows || rowCount === 0) {
        return response.status(404).send({
          status: 'Not found',
          data: { message: 'No articles found' },
        });
      }
      const data = articleModel(rows);
      return response.status(200).send({
        status: 'success',
        data,
      });
    }

    if (request.query.orderBy) {
      const part = request.query.orderBy.split(':');
      const columnOrder = `${part[0]} ${part[1].toUpperCase()}`;
      const { rows, rowCount } = await pool.query(`SELECT users.first_name as author_firstname, users.last_name as author_lastname, articles.article_id, articles.article_title as title, articles.content as content, articles.article_created_on FROM articles LEFT JOIN users ON articles.article_author = users.team_id ORDER BY ${columnOrder}`);
      if (!rows || rowCount === 0) {
        return response.status(404).send({

          status: 'Not found',
          data:
          { message: 'No articles found' },
        });
      }

      const data = articleModel(rows);
      return response.status(200).send({
        status: 'success',
        data,
      });
    }

    // query search for all articles
    const { rows, rowCount } = await pool.query('SELECT users.first_name as author_firstname, users.last_name as author_lastname, articles.article_title as title, articles.article_id, articles.content as content, articles.article_created_on FROM articles LEFT JOIN users ON articles.article_author = users.team_id');
    if (!rows || rowCount === 0) {
      return response.status(404).send({
        status: 'Not found',
        data:
          { message: 'No articles found' },
      });
    }
    const data = articleModel(rows);
    return response.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};
