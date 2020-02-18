/* eslint-disable no-console */
/* eslint-disable no-undef */
const request = require('supertest');
const chai = require('chai');
const app = require('../src/app');
const pool = require('../src/db/database');

const { expect } = chai;


// HELPER FUNCTION DECLARATIONS

const deleteArticleMany = async () => {
  const data = await pool.query('DELETE from articles');
  if (!data.rows) {
    return false;
  }
  return true;
};

const deleteCommentsMany = async () => {
  await pool.query('DELETE FROM comments');
  await pool.query('DELETE FROM comments_gif');
  await pool.query('DELETE FROM comments_article');
  return true;
};

const deletePosts = async () => {
  await pool.query('DELETE FROM posts');
  return true;
};


const deleteMany = async () => {
  const roleId = 2;
  const data = await pool.query('DELETE FROM users WHERE role_id = $1 returning *', [roleId]);
  if (data.rows || data.rowCount > 0) {
    return true;
  }

  return false;
};

const deleteGifPost = async () => {
  await pool.query('DELETE FROM gifs');
  return true;
};


// TEST.................................

let token;
let idArticle;
let userGif;
before(async () => {
  console.log('testing...1');
  const res = await request(app)
    .post('/api/v1/auth/signin')
    .send({
      email: 'emekaokwor@gmail.com',
      password: 'westcrew10',
    })
    .expect(200);
  token = res.body.data.token;

  console.log('testing...2');
  await request(app)
    .post('/api/v1/auth/create-user')
    .set('authorization', `Bearer ${token}`)
    .send({
      roleId: '2',
      firstName: 'maria',
      lastName: 'okwor',
      email: 'mariaokwor@gmail.com',
      password: 'westcrew10',
      gender: 'female',
      jobRole: 'cutsomer Service',
      department: 'Administrative',
      address: '3rd avenue festac lagos',
    })
    .expect(201);

  console.log('testing...3');
  const title = 'my first article';
  const content = 'this is a test for article posting';
  const articleRes = await request(app)
    .post('/api/v1/articles')
    .set('authorization', `Bearer ${token}`)
    .send({
      title,
      content,
    })
    .expect(201);
  idArticle = articleRes.body.data.articleId;
  console.log('testing...4');
});


after(async () => {
  await deleteMany();
  await deleteArticleMany();
  await deleteCommentsMany();
  await deletePosts();
  await deleteGifPost();
  return true;
});


// TESTS FOR USERS AUTHENTICATION
describe('Users test', () => {
  it('should  create a user if  admin', async () => {
    await request(app)
      .post('/api/v1/auth/create-user')
      .set('authorization', `Bearer ${token}`)
      .send({
        roleId: '2',
        firstName: 'izu',
        lastName: 'nnaji',
        email: 'izunnaji@gmail.com',
        password: 'westcrew10',
        gender: 'female',
        jobRole: 'cutsomer Service',
        department: 'Administrative',
        address: '3rd avenue festac lagos',
      })
      .expect(201);
  });


  it('it should not create a user if not admin', async () => {
    const userRes = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'mariaokwor@gmail.com',
        password: 'westcrew10',
      });
    expect(200);
    const userToken = userRes.body.data.token;

    await request(app)
      .post('/api/v1/auth/create-user')
      .set('authorization', `Bearer ${userToken}`)
      .send({
        roleId: '2',
        firstName: 'martins',
        lastName: 'nnaji',
        email: 'martinsnnaji@gmail.com',
        password: 'westcrew10',
        gender: 'male',
        jobRole: 'cutsomer Service',
        department: 'Administrative',
        address: '3rd avenue festac lagos',
      })
      .expect(401);
  });

  it('should login user', async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'mariaokwor@gmail.com',
        password: 'westcrew10',
      })
      .expect(200);
    expect(loginRes.body.data).to.have.property('token');
  });

  it('should not login user with wrong details', async () => {
    await request(app)
      .post('/api/v1/auth/signin')
      .send({
        email: 'maria@gmail.com',
        password: 'westcrew',
      })
      .expect(401);
  });

  it('should not create user if admin user is not authenticated', async () => {
    await request(app)
      .post('/api/v1/auth/create-user')
      .send({
        roleId: '2',
        firstName: 'martins',
        lastName: 'eke',
        email: 'martinseke@gmail.com',
        password: 'westcrew10',
        gender: 'male',
        jobRole: 'cutsomer Service',
        department: 'Administrative',
        address: '3rd avenue festac lagos',
      })
      .expect(401);
  });
});


/** *********************** ARTICLE TESTS***************** */

describe('Articles', () => {
  it('should post articles if user is authenticated', async () => {
    const title = 'my first article';
    const content = 'this is a test for article posting';
    const articleRes = await request(app)
      .post('/api/v1/articles')
      .set('authorization', `Bearer ${token}`)
      .send({
        title,
        content,
      })
      .expect(201);
    expect(articleRes.body.data).to.have.property('articleId');
    expect(articleRes.body.data.title).to.equal(title.toUpperCase());
  });

  it('should not post articles if user is not authenticated', async () => {
    const title = 'my first article';
    const content = 'this is a test for article posting';
    // eslint-disable-next-line no-unused-vars
    const articleRes = await request(app)
      .post('/api/v1/articles')
      .send({
        title,
        content,
      })
      .expect(401);
  });

  it('should edit article created by authenticated user', async () => {
    const title = 'edited title';
    const content = 'content edited by user';
    const editRes = await request(app)
      .patch(`/api/v1/articles/${idArticle}`)
      .set('authorization', `Bearer ${token}`)
      .send({
        title,
        content,
      })
      .expect(200);
    expect(editRes.body.data.title).to.equal(title.toUpperCase());
    expect(editRes.body.data.article).to.equal(content);
  });

  it('should not edit article created if not authenticated', async () => {
    const title = 'edited title';
    const content = 'content edited by user';
    // eslint-disable-next-line no-unused-vars
    const editRes = await request(app)
      .patch(`/api/v1/articles/${idArticle}`)
      .send({
        title,
        content,
      })
      .expect(401);
  });

  it('should comment on any article post if user is authenticated', async () => {
    const content = 'My first comment for testing';
    const commentRes = await request(app)
      .post(`/api/v1/articles/${idArticle}/comment`)
      .set('authorization', `Bearer ${token}`)
      .send({
        content,
      })
      .expect(200);
    expect(commentRes.body.data.comment).to.equal(content);
    expect(commentRes.body.data).to.have.property('article');
    expect(commentRes.body.data).to.have.property('articleTitle');
  });

  it('should view article post by Id of the article', async () => {
    const viewRes = await request(app)
      .get(`/api/v1/articles/${idArticle}/comment`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
    expect(viewRes.body.data).to.have.property('title');
    expect(viewRes.body.data).to.have.property('article');
    expect(viewRes.body.data).to.have.property('comments');
    expect(viewRes.body.data.comments).to.be.a('array');
  });

  it('should not delete article posted if not authenticated', async () => {
    await request(app)
      .delete(`/api/v1/articles/${idArticle}`)
      .expect(401);
  });

  it('should delete article posted by authenticated user', async () => {
    await request(app)
      .delete(`/api/v1/articles/${idArticle}`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });
});

describe('GIFs', () => {
  before(async () => {
    const gifRes = await request(app)
      .post('/api/v1/gifs')
      .set('authorization', `Bearer ${token}`)
      .field('title', 'My first gif post')
      .attach('image', './test/fixtures/my_pass_photo.jpg')
      .expect(201);
    userGif = gifRes.body;
  });

  it('should create gif post and upload gif to cloudinary', async () => {
    expect(userGif.status).to.equal('success');
    expect(userGif.data.message).to.equal('gif post successfully posted');
    expect(userGif.data).to.have.property('imageUrl');
    expect(userGif.data).to.have.property('gifId');
  });

  it('should comment on gif post', async () => {
    const content = 'testing my gif post comments';
    const viewRes = await request(app)
      .post(`/api/v1/gifs/${userGif.data.gifId}/comment`)
      .set('authorization', `Bearer ${token}`)
      .send({
        content,
      })
      .expect(200);
    expect(viewRes.body.data.message).to.equal('comment successfully created');
    expect(viewRes.body.data).to.have.property('gifTitle');
    expect(viewRes.body.data).to.have.property('comment');
    expect(viewRes.body.data.comment).to.equal(content);
  });

  it('should view gif posts by id of the gif post', async () => {
    const viewRes = await request(app)
      .get(`/api/v1/gifs/${userGif.data.gifId}/comment`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
    expect(viewRes.body.data).to.have.property('id');
    expect(viewRes.body.data).to.have.property('imageUrl');
    expect(viewRes.body.data.comments).to.be.a('array');
  });

  it('should view feed of posts', async () => {
    const viewRes = await request(app)
      .get('/api/v1/feed')
      .set('authorization', `Bearer ${token}`)
      .expect(200);
    expect(viewRes.body.status).to.equal('success');
    expect(viewRes.body.data).to.be.a('array');
  });

  it('should delete gif post by authenticated user', async () => {
    await request(app)
      .delete(`/api/v1/gifs/${userGif.data.gifId}`)
      .set('authorization', `Bearer ${token}`)
      .expect(200);
  });
});
