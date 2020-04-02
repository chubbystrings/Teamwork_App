const pool = require('../db/database');
const Sanitize = require('../middleware/validation/sanitizeData');


exports.viewfeeds = async (request, response) => {
  try {
    const { rows } = await pool.query('SELECT post_id, post_type, post_author_id, post_created_on, post_updated_on, article_id, article_author, article_post_id, article_title, content, article_created_on, gif_id, author, gif_post_id, title, image_url, public_id, gifs.created_on as gif_created_on, team_id, first_name, last_name, role_id FROM posts LEFT JOIN articles ON posts.post_id = articles.article_post_id LEFT JOIN gifs ON posts.post_id = gifs.gif_post_id LEFT JOIN users ON posts.post_author_id = users.team_id ORDER BY post_created_on DESC');
    if (!rows) {
      return response.status(400).send({
        status: 'error',
        error: 'invalid request',
      });
    }
    const likesData = await pool.query('SELECT like_user_id as user_id, like_post_id as post_id, like_created_on as created_on FROM likes');
    const commentData = await pool.query('SELECT post, COUNT(post) FROM comments GROUP BY post');

    const likeFunc = (post) => {
      const likes = likesData.rows.filter((row) => row.post_id === post);
      return likes;
    };

    const userLikedFunc = (post) => {
      // eslint-disable-next-line max-len
      const likes = likesData.rows.filter((row) => row.post_id === post && row.user_id === request.user.ID);
      if (likes.length > 0) {
        return true;
      }
      return false;
    };

    // convert array to objects using reduce
    // eslint-disable-next-line max-len
    const commentsObj = commentData.rows.reduce((acc, cur) => ({ ...acc, [cur.post]: cur.count }), {});

    const newData = [];
    rows.forEach((row) => {
      if (Object.prototype.hasOwnProperty.call(row, 'image_url') && row.image_url) {
        newData.push({
          postId: row.post_id,
          postType: 'gif',
          id: row.gif_id,
          likes: likeFunc(row.post_id, request.user.ID),
          currentUserLiked: userLikedFunc(row.post_id),
          commentsNumber: Number(commentsObj[row.post_id]) ? Number(commentsObj[row.post_id]) : 0,
          createdOn: row.gif_created_on,
          title: Sanitize.decode(row.title),
          'article/url': row.image_url,
          authorId: row.author,
          firstName: row.first_name,
          lastName: row.last_name,
          roleId: row.role_id,

        });
      }
      if (Object.prototype.hasOwnProperty.call(row, 'content') && row.content) {
        newData.push({
          postId: row.post_id,
          postType: 'article',
          id: row.article_id,
          likes: likeFunc(row.post_id, request.user.ID),
          currentUserLiked: userLikedFunc(row.post_id),
          commentsNumber: Number(commentsObj[row.post_id]) ? Number(commentsObj[row.post_id]) : '0',
          createdOn: row.article_created_on,
          title: Sanitize.decode(row.article_title),
          'article/url': Sanitize.decode(row.content),
          authorId: row.article_author,
          firstName: row.first_name,
          lastName: row.last_name,
          roleId: row.role_id,

        });
      }
    });

    // eslint-disable-next-line no-console
    return response.status(200).send({
      status: 'success',
      data: newData,
    });
  } catch (error) {
    return response.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.likePost = async (request, response) => {
  const postId = request.params.postid;
  if (!postId) {
    return response.status(400).send({
      status: 'error',
      error: 'bad request, no postId',
    });
  }


  try {
    const { rows, rowCount } = await pool.query('INSERT INTO likes (like_user_id, like_post_id, like_created_on) VALUES($1, $2, now()) returning *', [request.user.ID, postId]);
    if (!rows || rowCount === 0) {
      return response.status(501).send({
        status: 'error',
        error: 'server error could not resolve',
      });
    }

    return response.status(200).send({
      status: 'Successful',
      data: {
        message: 'liked successfully',
      },
    });
  } catch (error) {
    return response.status(500).send({
      status: 'error',
      error,
    });
  }
};

exports.unlikePost = async (request, response) => {
  const postId = request.params.postid;
  if (!postId) {
    return response.status(400).send({
      status: 'error',
      error: 'bad request, no postId',
    });
  }


  try {
    const { rows, rowCount } = await pool.query('DELETE FROM likes WHERE like_post_id = $1 AND like_user_id = $2 returning *', [postId, request.user.ID]);
    if (!rows || rowCount === 0) {
      return response.status(501).send({
        status: 'error',
        error: 'server error could not resolve',
      });
    }

    return response.status(200).send({
      status: 'Successful',
      data: {
        message: 'Unlike successfully',
      },
    });
  } catch (error) {
    return response.status(500).send({
      status: 'error',
      error,
    });
  }
};
