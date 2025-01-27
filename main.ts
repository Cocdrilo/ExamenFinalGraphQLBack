//Alejandro Lana
import {ApolloServer} from "@apollo/server"
import {startStandaloneServer} from "@apollo/server/standalone";
//import { schema } from "./schema.ts";
import { resolvers } from "./resolvers.ts";
import {Collection, MongoClient, ObjectId} from "mongodb"
import { schema } from "./schema.ts";

/*const mongoURL = Deno.env.get("mongoURL");

if (!mongoURL) {
  throw new Error("La variable de entorno 'mongoURL' no está configurada");
}

const ninjaApiKey = Deno.env.get("apiNinjaKey");

if (!ninjaApiKey) {
  throw new Error("La variable de entorno 'apiNinjaKey' no está configurada");
}


const client = new MongoClient (mongoURL)
await client.connect()
const dataBase = client.db('DBName')

//export const xCollection = dataBase.collection<>('nameOfCollection')

 */

const server = new ApolloServer({
  typeDefs : schema,
  resolvers
});

const { url } = await startStandaloneServer(server, {
  context:async () => ({}),
  listen: { port: 8080 },
});


console.log(`Server running on: ${url}`);