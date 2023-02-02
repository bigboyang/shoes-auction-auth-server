import { createClient } from "redis";

const redisClient = createClient();

async function run(){
  await redisClient.connect().catch( err => console.log( err ) );
}

run();

export default redisClient;
