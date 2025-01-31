export const schema = `#graphql

    type Restaurant {
        id:ID!
        name:String!
        address : String!
        telephone_number : String!
        datetime : String!
        temperature : Int!
        
    }
    
    type Query {
        getRestaurant(id:ID!) : Restaurant!
        getRestaurants(city : String!) : [Restaurant]!
    }

    type Mutation {
        addRestaurant(name:String!,address :String!, city:String!, telephone_number : String!) : Restaurant!
        deleteRestaurant(id:ID!) : Boolean!
    }

`;