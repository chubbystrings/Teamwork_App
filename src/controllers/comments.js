const pool = require('../db/database');
const Sanitize = require('../middleware/validation/sanitizeData');
const commentsData = require('../models/commentModel');

/* DO PAGINATION FOR VIEWING COMMENTS */


/** *******function to post comment on article post **************** */
exports.postArticleComments = async (request, response) => {
  // put validation here......
  const articleId = request.params.articleid;
  if (!articleId) {
    return response.status(401).send({ status: 'error', error: 'invalid request' });
  }
  const { content } = request.body;
  if (!content) {
    return response.status(401).send({ status: 'error', error: 'body cannot be empty' });
  }
  const cleanContent = Sanitize.encode(content);
  const now = new Date();

  try {
    const articleData = await pool.query('SELECT * FROM articles WHERE article_id = $1', [articleId]);
    if (!articleData.rows || articleData.rowCount === 0) {
      return response.status(404).send({
        status: 'error',
        error: 'No articles found',
      });
    }

    const data = await pool.query('INSERT INTO comments (author, comment_body, created_on) VALUES ($1, $2, $3) returning *', [request.user.ID, cleanContent, now]);

    if (!data.rows || data.rowCount === 0) {
      return response.status(401).send({ status: 'error', error: 'cannot post comments' });
    }

    const otherData = await pool.query('INSERT INTO comments_article (comment_id, article_id) VALUES ($1, $2) returning *', [data.rows[0].comment_id, articleId]);
    if (!otherData.rows || otherData.rowCount === 0) {
      return response.status(401).send({ status: 'error', error: 'cannot post comments ' });
    }

    return response.status(200).send({
      status: 'success',
      data: {
        message: 'comment successfully created',
        createdOn: data.rows[0].created_on,
        articleTitle: Sanitize.decode(articleData.rows[0].article_title),
        article: Sanitize.decode(articleData.rows[0].content),
        comment: Sanitize.decode(data.rows[0].comment_body),

      },
    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};


/** ********function to get all comments for an article ********* */
exports.getArticleComments = async (request, response) => {
  const articleId = request.params.articleid;
  if (!articleId) {
    return response.status(401).send({ error: 'invalid request' });
  }
  try {
    const { rows, rowCount } = await pool.query('SELECT comments.comment_id, comments.comment_body, comments.created_on, comments_article.article_id, users.first_name, users.last_name FROM comments INNER JOIN comments_article ON comments.comment_id = comments_article.comment_id INNER JOIN users ON comments.author = users.team_id WHERE comments_article.article_id = $1 ORDER BY comments.created_on ASC', [articleId]);

    if (!rows || rowCount === 0) {
      return response.status(400).send({ message: 'No comments to fetch' });
    }

    const data = commentsData(rows);

    return response.status(200).send({ rowCount, data });
  } catch (error) {
    return response.status(500).send({ error });
  }
};


/** ************function to Post comments on gif post************** */
exports.postGifComments = async (request, response) => {
  // put validation here......
  const gifId = request.params.gifid;
  if (!gifId) {
    return response.status(400).send({
      status: 'error',
      error: 'Invalid request',
    });
  }

  const { content } = request.body;
  if (!content) {
    return response.status(400).send({
      status: 'error',
      error: 'Field cannot be empty',
    });
  }
  const now = new Date();
  const cleanContent = Sanitize.encode(content);
  try {
    const gifData = await pool.query('SELECT * FROM gifs WHERE gif_id = $1', [gifId]);
    if (!gifData.rows || gifData.rowCount === 0) {
      return response.status(404).send({
        status: 'error',
        error: 'No gif post found',
      });
    }

    const data = await pool.query('INSERT INTO comments (author, comment_body, created_on) VALUES ($1, $2, $3) returning *', [request.user.ID, cleanContent, now]);

    if (!data.rows || data.rowCount === 0) {
      return response.status(401).send({ status: 'error', error: 'invalid request' });
    }

    const otherData = await pool.query('INSERT INTO comments_gif (comment_id, gif_id) VALUES ($1, $2) returning *', [data.rows[0].comment_id, gifId]);
    if (!otherData.rows || otherData.rowCount === 0) {
      return response.status(401).send({ status: 'error', error: 'commentt cannot be posted please try again' });
    }

    return response.status(200).send({
      status: 'success',
      data: {
        message: 'comment successfully created',
        createdOn: data.rows[0].created_on,
        gifTitle: Sanitize.decode(gifData.rows[0].title),
        comment: Sanitize.decode(data.rows[0].comment_body),
      },
    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};
