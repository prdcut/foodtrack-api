# foodTrack API

## Initialize project local

Required to have node v14.17.5.

1. Go to index.js file and uncomment where indicated.
2. Comment out where indicated
3. run database local with mongoCLI (to build database local contact daniel@danielmayorga.de for futher info)
4. Go to project folder in terminal and run `node index.js`
5. Use post http://localhost:8080/users endpoint to register a new user
6. Use post http://localhost:8080/login endpoint to login with previously registered user
7. Use bearer token fo authentication in order to access all other endpoints

## Overview

The main purpose of this project is to build the server-side component of a food tracker mobile application. This RESTful API was developed using node.js to access a food database. It provides its users with information about nutritional values and its macronutrients per weight and/or quantity. It also supports the required endpoints for user and account management.

## API Documentation

| Business Logic                                      | URL                             | HTTP Method | Request Body           | Response Body           |
| --------------------------------------------------- | ------------------------------- | ----------- | ---------------------- | ----------------------- |
| Returns a list of all foods                         | /food-list                      | GET         | None                   | JSON[] foodSchema       |
| Returns data about single food by name              | /food-list/:name                | GET         | None                   | JSON foodSchema         |
| Adds new food to list of foods                      | /food-list                      | POST        | JSON foodSchema        | JSON new foodSchema     |
| Deletes food from list of foods                     | /food-list/:name                | DELETE      | None                   | Food deletion message   |
| Updates food data of a food by name                 | /food-list/:name/:macro/:value' | PUT         | JSON foodSchema        | JSON updated foodSchema |
| Returns user profile                                | /users/:username                | GET         | None                   | JSON userSchema         |
| Allows new user to register                         | /users                          | POST        | JSON userSchema        | JSON userSchema         |
| Allows existing user to update their info           | /users/:username                | PUT         | JSON update userSchema | JSON update userSchema  |
| Allows user to add food to their list of meals      | /users/:username/meals/:foodId  | POST        | JSON foodToMealSchema  | JSON userSchema         |
| Allows user to remove food from their list of meals | /users/:username/meals/:foodId  | DELETE      | JSON foodToMealSchema  | JSON userSchema         |
| Allows user to deregister                           | /users/:username                | DELETE      | JSON username          | User deletion message   |

## Request/Respons Bodies

- foodSchema:

{
name: String,
weight: Number || null,
quantity: Number || null,
macros: {
protein: Number,
carbs: Number,
fat: Number,
calories: Number,
},
}

- userSchema

{
username: String,
password: String,
email: String,
meals: [ foodId ],
}

- update userSchema

{
username: String,
password: String,
email: String,
}

- post foodToMealSchema

{
username: String,
meals: [ foodId ],
}

## Core Backend Technologies and packages

- MongoDB
- Express.js
- Node.js
- Mongoose
- Heroku
