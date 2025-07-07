import { Platform } from "react-native";
import { Client, Databases } from "react-native-appwrite";

const config= {
  endpoint: "https://fra.cloud.appwrite.io/v1", // Your project ID
  projectId: "686b1f5f0031e12b789a", // Your database ID
  db: "prod", // Your collection ID
  col:{
    tasks: "tasks", // Collection ID for tasks
  }
};

const client = new Client()
.setEndpoint(config.endpoint)
.setProject(config.projectId)
switch (Platform.OS) {
  case "ios":
    client.setPlatform("com.isa.quiz")
break;
}
const database = new Databases(client);
export { client, config, database };
