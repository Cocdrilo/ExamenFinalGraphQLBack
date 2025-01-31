//Alejandro Lana
import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone";
import { resolvers } from "./resolvers.ts";
import {Collection, MongoClient, ObjectId} from "mongodb"
import { schema } from "./schema.ts";
import {Restaurant_Model} from "./types.ts";

const mongoURL = Deno.env.get("mongoURL");

if (!mongoURL) {
  throw new Error("La variable de entorno 'mongoURL' no está configurada");
}

const ninjaApiKey = Deno.env.get("apiNinjaKey");

if (!ninjaApiKey) {
  throw new Error("La variable de entorno 'apiNinjaKey' no está configurada");
}


const client = new MongoClient (mongoURL)
await client.connect()
const dataBase = client.db('Restaurant_List')

const Restaurant_Collection = dataBase.collection<Restaurant_Model>('Restaurants')


const server = new ApolloServer({
  typeDefs : schema,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  context:async () => ({Restaurant_Collection}),
  listen: { port: 8080 },
});


console.log(`Server running on: ${url}`);