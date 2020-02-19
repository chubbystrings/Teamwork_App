## TEAMWORK_APP

Teamwork is an internal social network for employees of an organization. The goal of this
application is to facilitate more interaction between colleagues and promote team bonding. *DevC project*


## API ENDPOINTS

    CREATE USER ACCOUNT

- Request Type : POST
- Endpoint :  /api/v1/auth/create-user

# Request Body

```
{
    “firstName” : String ,
    “lastName” : String ,
    “email” : String ,
    “password” : String ,
    “gender” : String ,
    “jobRole” : String ,
    “department” : String ,
    “address” : String ,
    ...
}
```
# Response 

```
{
    “status” : “success” ,
    “data” : {
    “message” : “User account successfully created” ,
    “token” : String ,
    “userId” : Integer ,
    ...
    }
}
```
    * LOGIN A USER

- Request Type : POST
- Endpoint :  /api/v1/auth/signin


# Request Body

```
{
    “email” : String ,
    “password” : String ,
    ...
}
```
# Response 

```
{
    “status” : “success” ,
    “data” : {
    “token” : String ,
    “userId” : Integer ,
    ...
    }
}
```
    * CREATE A GIF POST :

- Request Type : POST
- Endpoint :  /api/v1/gifs


# Request Header

{
    “token” : String ,
    ...
}

# Request Body

```
{
    “image” : image/gif ,
    “title” : String ,
    ...
}
```
# Response 

```
{
    “status” : “success” ,
    “data” : {
    “gifId” : Integer ,
    “message” : “GIF image successfully posted” ,
    “createdOn” : DateTime ,
    “title” : String ,
    “imageUrl” : String ,
    ...
    }
}
```
    * CREATE AN ARTICLE POST

- Request Type : POST
- Endpoint :  /api/v1/articles


# Request Header

{
    “token” : String ,
    ...
}

# Request Body

```
{
    “title” : String ,
    “article” : String ,
    ...
}
```
# Response 

```
{
    “status” : “success” ,
    “data” : {
    “message” : “Article successfully posted” ,
    “articleId” : Integer ,
    “createdOn” : DateTime ,
    “title” : String ,
    ...
    }
}
```
    * EDIT AN ARTICLE POST

- Request Type : PATCH
- Endpoint :  /api/v1/articles/<:articleid>

# Request Header

{
    “token” : String ,
    ...
}

# Request Body

```
{
    “title” : String ,
    “article” : String ,
    ...
}
```
# Response 

```
{
    “status” : “success” ,
    “data” : {
    “message” : “Article successfully updated” ,
    “title” : String ,
    “article” : String ,
    ...
    }
}
```
    * DELETE AN ARTICLE POST 

- Request Type : DELETE
- Endpoint :  /api/v1/articles/<:articleid>

# Request Header

{
    “token” : String ,
    ...
}

# Response 

```
{
    “status” : “success” ,
    “data” : {
    “message” : “Article successfully deleted” ,
    ...
    }
}
```
    * DELETE GIF POST

- Request Type : DELETE
- Endpoint :  /api/v1/gifs/<:gifid>


# Request Header

{
    “token” : String ,
    ...
}

# Response 

```
{
    “status” : “success” ,
    “data” : {
    “message” : “gif post successfully deleted” ,
    ...
    }
}
```
    * COMMENT ON AN ARTICLE POST
- Request Type : POST
- Endpoint :  /api/v1/articles/<:articleid>/comment

# Request Header

{
    “token” : String ,
    ...
}

# Request Body

```
{
    “comment” : String ,
    ...
}
```
# Response 

```
{
    “status” : “success” ,
    “data” : {
    “message” : “Comment successfully created” ,
    “createdOn” : DateTime ,
    “articleTitle” : String ,
    “article” : String ,
    “comment” : String ,
    ...
    }
}
```
    * COMMENT ON A GIF POST

- Request Type : POST
- Endpoint :  /api/v1/gifs/<:gifid>/comment


# Request Header

{
    “token” : String ,
    ...
}

# Request Body

```
{
    “comment” : String ,
    ...
}
```
# Response 

```
{
    “status” : “success” ,
    “data” : {
    “message” : “comment successfully created” ,
    “createdOn” : DateTime ,
    “gifTitle” : String ,
    “comment” : String ,
    ...
    }
}
```
    * GET ALL POSTS SHOWING MOST RECENT

- Request Type : GET
- Endpoint :  /api/v1/feed


# Request Header

{
    “token” : String ,
    ...
}

# Response 

```
{
    “status” : “success” ,
    “data” : [
    {
    “id” : Integer ,
    “createdOn” : DateTime ,
    “title” : String ,
    “article/url” : String , //use url for gif post and article for articles
    “authorId” : Integer ,
    ...
    }, {
    “id” : Integer ,
    “createdOn” : DateTime ,
    “title” : String ,
    “article/url” : String , //use url for gif post and article for articles
    “authorId” : Integer ,
    ...
    }, {
    “id” : Integer ,
    “createdOn” : DateTime ,
    “title” : String ,
    “article/url” : String , //use url for gif post and article for articles
    “authorId” : Integer ,
    ...
    },
 ]
}
    
```
    * GET ARTICLE POST BY ID 

- Request Type : GET
- Endpoint :  /api/v1/articles/<:articleid>


# Request Header

{
    “token” : String ,
    ...
}

# Response 

```
{
    “status” : “success” ,
    “data” : {
    “id” : Integer ,
    “createdOn” : DateTime ,
    “title” : String ,
    “article” : String ,
    “comments” : [
    {
    “commentId” : Integer ,
    “comment” : String ,
    “authorId” : Integer ,
    } ,
    {
    “commentId” : Integer ,
    “comment” : String ,
    “authorId” : Integer ,
    } ,
  ]
 }
}
    
```
    * GET GIF POST BY ID

- Request Type : GET
- Endpoint :  /api/v1/gifs/<:gifid>


# Request Header

{
    “token” : String ,
    ...
}

# Response 

```
{
    “status” : “success” ,
    “data” : {
    “id” : Integer ,
    “createdOn” : DateTime ,
    “title” : String ,
    “url” : String ,
    “comments” : [
    {
    “commentId” : Integer ,
    “authorId” : Integer ,
    “comment” : String ,
    },
    {
    “commentId” : Integer ,
    “useauthorIdrId” : Integer ,
    “comment” : String ,
    }
  ]
 }
}
    
```


*Created with love by chubbyCode Happy coding*