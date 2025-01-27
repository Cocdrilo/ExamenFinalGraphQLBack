//Alejandro Lana
import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone";
//import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import {Collection, MongoClient, ObjectId} from "mongodb"
import { schema } from "./schema.ts";

const mongoUrl = "mongodb+srv://cocdrilo:cocdrilo@nebrijatest.n7ral.mongodb.net/?retryWrites=true&w=majority&appName=NebrijaTest";

const client = new MongoClient (mongoUrl)
await client.connect()
const dataBase = client.db('DBName')

//export const xCollection = dataBase.collection<>('nameOfCollection')

if(!mongoUrl){
  console.error('no url in env')
  console.error('Error en la URL')
}

const server = new ApolloServer({
  typeDefs : schema,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  context:async () => ({}),
  listen: { port: 8080 },
});


console.log(`Server running on: ${url}`);