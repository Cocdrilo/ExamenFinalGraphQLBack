import { ObjectId, OptionalId } from "mongodb";

export type Restaurant_Model = OptionalId<{
    name : string,
    address : string,
    city : string,
    country : string, //Guardamos country para no tener que hacer consultas innecesarias para saber el country cada vez
    telephone_number : string
    timezone : string
}>

