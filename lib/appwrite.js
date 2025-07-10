import { Platform } from "react-native";
import { Account, Client, Databases } from "react-native-appwrite";

const config= {
  db: "expoAppNew", // Your collection ID
  col:{
    tasks: "tasks", // Collection ID for tasks
  }
};

const client = new Client()
.setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT)
.setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID)
switch (Platform.OS) {
  case "ios":
    client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_BUNDLE_ID);
    break;
  case "android":
      client.setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PACKAGE_NAME);
    break;
}

const account = new Account(client);
const database = new Databases(client);
export { account, client, config, database };

