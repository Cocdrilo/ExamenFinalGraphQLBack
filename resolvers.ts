import {GraphQLError} from "graphql";
import {Restaurant_Model} from "./types.ts";
import {Collection, ObjectId} from "mongodb";

type Context = {
    Restaurant_Collection : Collection<Restaurant_Model>
}

type Lat_Lon = {
    latitude : number,
    longitude : number
}

type Phone_Return = {
    is_valid : boolean,
    timezone : string,
    country : string
}

export const resolvers = {


    Restaurant : {
        id: (parent:Restaurant_Model,__:unknown,context:Context) : string =>{
            return parent._id!.toString()
        },

        datetime : async (parent:Restaurant_Model,__:unknown,context:Context) : Promise<string> =>{

            const hour = await fetch_Hour_From_NinjaApi(parent.timezone)

            return hour

        },

        temperature: async (parent:Restaurant_Model,__:unknown,context:Context) : Promise<number> =>{

            const temperature = await fetch_temperature_From_NinjaApi(parent.city)

            return temperature

        },
        address : (parent:Restaurant_Model,__:unknown,context:Context) : string =>{

            const address = parent.address + ", " + parent.city + ", " + parent.country
            return address
        }
    },

    Mutation : {
        addRestaurant : async(_:unknown,args:{name:string,address:string,city:string,telephone_number:string},context:Context):Promise<Restaurant_Model> =>{
            const validphone_Timezone = await check_telephone_number(args.telephone_number)

            if(!validphone_Timezone.is_valid){
                throw new GraphQLError ("Error, teléfono no válido,")
            }

            const phone_unique = await context.Restaurant_Collection.findOne({telephone_number:args.telephone_number})

            if(phone_unique){
                throw new GraphQLError ("Error, teléfono no es único y ya existe en la BDD")
            }

            const newRestaurant:Restaurant_Model = {
                name: args.name,
                address: args.address,
                city : args.city,
                telephone_number : args.telephone_number,
                timezone : validphone_Timezone.timezone,
                country : validphone_Timezone.country
            }

            const insertPhone = await context.Restaurant_Collection.insertOne(newRestaurant)

            console.log(insertPhone.insertedId + " Insertado con exito")

            return newRestaurant

        },
        deleteRestaurant : async(_:unknown,args:{id:string},context:Context):Promise<boolean> =>{

            const delete_Restaurant = await context.Restaurant_Collection.deleteOne({_id:new ObjectId(args.id)})

            return delete_Restaurant.deletedCount != 0;
        }
    },

    Query: {
        getRestaurant: async (_:unknown,args:{id:string},context:Context):Promise<Restaurant_Model> =>{

            const foundCity = await context.Restaurant_Collection.findOne({_id: new ObjectId(args.id)})

            if(foundCity){
                return foundCity
            }else{
                throw new GraphQLError ("Ciudad con esa Id no encontrada en la BDD")
            }
        },
        getRestaurants: async (_:unknown,args:{city:String},context:Context):Promise<Restaurant_Model[]> =>{

            const foundRestaurants = await context.Restaurant_Collection.find({city:args.city}).toArray()

            return foundRestaurants

        }

    },

}

const check_telephone_number = async(telephone_number:string):Promise<Phone_Return> =>{
    try {
        const url = "https://api.api-ninjas.com/v1/validatephone?number=" + telephone_number

        const response = await fetch(url, {
            headers: {
                'X-Api-Key': Deno.env.get("apiNinjaKey")
            },
        })
        const jsonResponse = await response.json()

        const returnValues : Phone_Return ={
            is_valid : jsonResponse.is_valid,
            timezone : jsonResponse.timezones[0], //Usamos esto porque hay veces donde tiene 2 zonas horarias
            country : jsonResponse.country
        }

        return returnValues

    } catch (fetchError) {
        throw new GraphQLError("Error en la api de la verificacion telefónica")
    }
}


const fetch_Hour_From_NinjaApi = async (timezone:string,):Promise<string> => {

    try {
        const url = "https://api.api-ninjas.com/v1/worldtime?timezone=" + timezone

        const response = await fetch(url, {
            headers: {
                'X-Api-Key': Deno.env.get("apiNinjaKey")
            },
        })
        const jsonResponse = await response.json()

        const actual_hour = jsonResponse.hour + ":" + jsonResponse.minute

        return actual_hour
    } catch (fetchError) {
        throw new GraphQLError("Error en la api de la hora")
    }
}

const fetch_temperature_From_NinjaApi = async(city:string):Promise<number> =>{
    try {
        const url = "https://api.api-ninjas.com/v1/city?name="+ city

        const response = await fetch(url, {
            headers: {
                'X-Api-Key': Deno.env.get("apiNinjaKey")
            },
        })
        const jsonResponse = await response.json()

        console.log(jsonResponse)

        const lat_lon:Lat_Lon = { //La respuesta es un array
            latitude : jsonResponse[0].latitude,
            longitude : jsonResponse[0].longitude
        }
        console.log(lat_lon)

        try {
            const url = "https://api.api-ninjas.com/v1/weather?lat=" + lat_lon.latitude + "&lon=" + lat_lon.longitude

            const response = await fetch(url, {
                headers: {
                    'X-Api-Key': Deno.env.get("apiNinjaKey")
                },
            })
            const jsonResponse = await response.json()


            return jsonResponse.temp

        }catch (errorApiClima){
            throw new GraphQLError("Error al intentar fetchear el clima con la latitud y longitud")
        }

    } catch (fetchError) {
        throw new GraphQLError("Error en la api al intentar sacar la latitud y longitud")
    }
}
