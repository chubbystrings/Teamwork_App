
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const pool = require('../db/database');
const Sanitize = require('../middleware/validation/sanitizeData');
const gifModel = require('../models/gifModel');

/* DO PAGINATION FOR VIEWING GIF */


/** ****************************  FUNCTION TO CREATE GIF ******************** */
exports.uploadGif = async (request, response) => {
  console.log("testing cloudinary")
  console.log(process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET )
  cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

  });


  const newName = request.user.ID;
  const uniqueFilename = `${newName}-${new Date().toISOString()}`;
  const now = new Date();

  try {
    const { title } = request.body;
    const { path } = request.file;
    const postType = 'gif';


    if (!title || !path) {
      return response.status(401).send({
        status: 'error',
        error: 'fields cannot be empty',
      });
    }
    if (!request.method === 'POST') {
      return response.status(405).send({
        status: 'error',
        error: `${request.method} method not allowed`,
      });
    }

    // upload file to cloudinary
    const resultData = await cloudinary.uploader.upload(path,
      { public_id: `teamwork/${uniqueFilename}` },
      (error, result) => {
        if (error) {
          return response.status(500).send({
            status: 'error',
            error,
          });
        }

        console.log('uploaded')
        return result;
      });

    // post cloudinary successful upload details to database
    const postData = await pool.query('INSERT INTO posts (post_type, post_created_on) VALUES ($1, $2) returning *', [postType, now]);
    if (!postData.rows || postData.rowCount === 0) {
      return response.status(500).send({ status: 'error', error: ' invalid request' });
    }


    const gifData = await pool.query('INSERT INTO gifs (author, post_id, title, image_url, created_on, public_id) VALUES ($1, $2, $3, $4, $5, $6) returning *', [request.user.ID, postData.rows[0].post_id, title.toUpperCase(), resultData.url, postData.rows[0].post_created_on, resultData.public_id]);
    if (!gifData.rows || gifData.rowCount === 0) {
      return response.status(500).send({ status: 'error', error: ' invalid request' });
    }
    return response.status(201).send({
      status: 'success',
      data: {
        gifId: gifData.rows[0].gif_id,
        message: 'gif post successfully posted',
        createdOn: gifData.rows[0].created_on,
        title: gifData.rows[0].title,
        imageUrl: gifData.rows[0].image_url,

      },
    });
  } catch (error) {
    return response.status(500).send({
      status: 'error',
      error,
    });
  }
};


/** **************middleware to view gifs by Id and its associated comments ******************* */
exports.viewGifById = async (request, response) => {
  try {
    const gifId = request.params.gifid;
    if (!gifId) {
      return response.status(401).send({
        status: 'error',
        error: 'Invalid request',
      });
    }

    // get gif data from database
    const { rows, rowCount } = await pool.query('SELECT * FROM gifs WHERE gif_id = $1', [gifId]);

    if (!rows || rowCount === 0) {
      return response.status(400).send({
        status: 'error',
        error: 'No articles found',
      });
    }

    // get associated comments form database
    const commentsData = await pool.query('SELECT * FROM comments INNER JOIN comments_gif ON comments.comment_id = comments_gif.comment_id WHERE comments_gif.gif_id = $1', [gifId]);
    const comments = [];
    if (!commentsData.rows || commentsData.rowCount === 0) {
      return response.status(200).send({
        status: 'success',
        data: {
          id: rows[0].gif_id,
          title: rows[0].gif_title,
          imageUrl: rows[0].image_url,
          comments,

        },
      });
    }


    // format comments response data
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
        id: rows[0].gif_id,
        title: rows[0].title,
        imageUrl: rows[0].image_url,
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


/** *************** DELETE GIF FUNNCTION..............******************** */
exports.deleteGif = async (request, response) => {
  const gifId = request.params.gifid;
  if (!gifId) {
    return response.status(401).send({ status: 'error', error: 'invalid request' });
  }

  // configure cloudinary
  cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

  });


  try {
    const data = await pool.query('DELETE FROM gifs WHERE gifs.gif_id = $1 AND gifs.author = $2 returning *', [gifId, request.user.ID]);
    const { rowCount, rows } = data;
    if (rowCount === 0 || !rows) {
      return response.status(401).send({ status: 'error', error: 'invalid request or not Authorized' });
    }


    console.log('removed from database');
    return cloudinary.uploader.destroy(rows[0].public_id, (error, result) => {
      if (error || !result) {
        return response.status(500).send({ status: 'error', error });
      }
      console.log('removed from cloud');
      return response.status(200).send({
        status: 'success',
        data: {
          message: 'gif post successfully deleted',
        },
      });
    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};


/*
----------------------------------------------------------
Other possible gif routes controller
----------------------------------------------------------
*/

/** ************** FUNCTION TO VIEW ALL GIF ********************* */
exports.viewAllGif = async (request, response) => {
  const limit = request.query.row;
  const { offset } = request.query;

  try {
    if (request.query.author) {
      const searchByAuthor = `%${request.query.author.toUpperCase()}%`;
      const { rows, rowCount } = await pool.query('SELECT gifs.gif_id as Id, gifs.title as title, gifs.image_url as url, gifs.created_on, users.first_name as author_firstname, users.last_name as author_lastname FROM gifs LEFT JOIN users ON gifs.author = users.team_id WHERE (users.last_name || users.first_name) LIKE $1', [searchByAuthor]);
      if (!rows || rowCount === 0) {
        return response.status(400).send({
          status: 'Not found',
          data: {
            message: 'No gif found',
          },
        });
      }
      const data = gifModel(rows);

      return response.status(200).send({
        status: 'success',
        data,

      });
    }

    if (request.query.orderBy) {
      const part = request.query.orderBy.split(':');
      const columnOrder = `${part[0]} ${part[1].toUpperCase()}`;
      const { rows, rowCount } = await pool.query(`SELECT gifs.gif_id as Id, gifs.title as title, gifs.image_url as url, gifs.created_on, users.first_name as author_firstname, users.last_name as author_lastname FROM gifs LEFT JOIN users ON gifs.author = users.team_id ORDER BY ${columnOrder} LIMIT ${limit} OFFSET ${offset}`);

      if (!rows || rowCount === 0) {
        return response.status(400).send({
          status: 'Not found',
          data:
          { message: 'No gif found' },
        });
      }

      const data = gifModel(rows);
      return response.status(200).send({
        status: 'success',
        data,
      });
    }

    const { rows, rowCount } = await pool.query(`SELECT gifs.gif_id as Id, gifs.title as title, gifs.image_url as url, gifs.created_on, users.first_name as author_firstname, users.last_name as author_lastname FROM gifs LEFT JOIN users ON gifs.author = users.team_id LIMIT ${limit} OFFSET ${offset}`);
    if (!rows || rowCount === 0) {
      return response.status(400).send({
        status: 'Not found',
        data: {
          message: 'No gif post found',
        },
      });
    }

    const data = gifModel(rows);
    return response.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};


/** **********  FUNCTION TO VIEW ONLY GIF CREATED BY THE USER ****************** */
exports.viewGif = async (request, response) => {
  const limit = request.query.row;
  const { offset } = request.query;
  try {
    // Sort data by order on request
    if (request.query.orderBy) {
      const part = request.query.orderBy.split(':');
      const columnOrder = `${part[0]} ${part[1].toUpperCase()}`;
      const { rows, rowCount } = await pool.query(`SELECT gifs.gif_id as Id, gifs.title as title, gifs.image_url as url, gifs.created_on, users.first_name as author_firstname, users.last_name as author_lastname FROM gifs LEFT JOIN users ON gifs.author = users.team_id WHERE gifs.author = $1 ORDER BY ${columnOrder} LIMIT ${limit} OFFSET ${offset}`, [request.user.ID]);

      if (!rows || rowCount === 0) {
        return response.status(404).send({
          status: 'Not found',
          error: 'No gif found',
        });
      }
      const data = gifModel(rows);
      return response.status(200).send({
        status: 'success',
        data,
      });
    }

    // display request data as default
    const { rows, rowCount } = await pool.query(`SELECT gifs.gif_id as Id, gifs.title as title, gifs.image_url as url, gifs.created_on, users.first_name as author_firstname, users.last_name as author_lastname FROM gifs LEFT JOIN users ON gifs.author = users.team_id WHERE gifs.author = $1 LIMIT ${limit} OFFSET ${offset}`, [request.user.ID]);
    if (!rows || rowCount === 0) {
      return response.status(404).send({
        status: 'Not found',
        error: 'No gif found',
      });
    }

    const data = gifModel(rows);
    return response.status(200).send({
      status: 'success',
      data,
    });
  } catch (error) {
    return response.status(500).send({ status: 'error', error });
  }
};
