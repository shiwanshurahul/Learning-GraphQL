const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
// const { startStandaloneServer } = require('@apollo/server/standalone')
const bodyParser = require('body-parser');
const cors =require('cors');
const { default: axios } = require('axios');

async function startServer() {
    const app = express();
      app.use(cors());
    // Schema/typeDefs and Resolver must match – 
    // If the schema says getTodos: [Todo], your resolver must return an object that matches the Todo type.
    const server = new ApolloServer({
        typeDefs : `
            type User {
              id: ID!
              name: String!
              username: String!
              email: String!
              phone: String!
              website: String!
            }

            type Todo {
                id: ID!
                title: String!
                completed: Boolean
                user: User
            }

              type Query {
                getTodos: [Todo]
                getAllUsers: [User]
                getUser(id: ID!): User

             }
            `,
        resolvers : {
            Todo: {  //if Todo ka user fetch krna koi aaye
                user: async (todo) => {
                  try {  
                    const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${todo.id}`);
                    return response.data;
                } catch(error) {
                    return null;
                }
            }
            },
            Query: { 
                //getTodos resolver function
                // getTodos: () => [ {id: 1, title: 'something', completed: false}]
                getTodos: async () => (await axios.get('https://jsonplaceholder.typicode.com/todos')).data,

                //getAllUsers resolver func
                getAllUsers: async() => (await axios.get('https://jsonplaceholder.typicode.com/users')).data,
                getUser: async(parent, {id}) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data,
            }
        }
    });
//     /query {
//   getTodos {

//     title
//     completed
//     user {
//       name, email
//     }
//   }
//}
    app.use(bodyParser.json());
  

    await server.start();

    // /graphql enpoint pe req aayi toh server handle krega 
    app.use('/graphql', expressMiddleware(server));

    app.get('/', (req, res) => {
        res.send('Welcome to the Apollo + Express server')
    });

    app.listen(8000, ()=> {
        console.log('server running at PORT 8000')
    });  //localhost:8000/graphql krke dekho
}

startServer();


//Query language
// Rest api vs graphql

// ->
// GET/ Todos API from server chla rhe using REST
// And you get data (all keys) and tmhe bas 1 -2  key ka use hai
//  = network bandwith and data  ka waste
// e.g const { user_id, title } = req.body;  //baki data v toh aa rha = data waste

// ->
// Ab tmhe title ke correponding user ka name chahiye.
// toh fir ek get API call kroge ‘/users/user_name’ jaisa  jisme sare keys (e.g. name, address, phone, gender) aaenge of that user.
//  = again faltu ka data and network bandwith waste and kitni api banaoge.

// Solution: Graphql
// - Client specify krta server ko ki ye fields chahiye
// - server unhi fields ka data return krta
// - nested query bana skte ek hi bar = ek hi bar server se fetch and no alag se API banana

// e.g. query q {
//         getTodos {      //resolver func getTodos
//            title        // me se title lo 
//          }
//        getAllUsers {   //resolver func getAllUsers
//           name        // me se name
//       }
//   }

// res from server ->  utna hi aega jitna bola hai


