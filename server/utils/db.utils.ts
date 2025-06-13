import { existsSync, readdirSync } from 'fs';
import mongoose from 'mongoose';
import path from 'path';
import { pathToFileURL } from 'url';
import Trace from '../controllers/trace.controller';

export default class DBUtils {
  private static seedRootFolder = path.join(__dirname, '..', 'database', 'seeding');

  public static InitSeeding(dbConnection: mongoose.Connection | null, seedDataFolder: string) {
    if (!dbConnection || dbConnection?.readyState !== mongoose.ConnectionStates.connected) return;

    const seedDataPath = path.join(this.seedRootFolder, seedDataFolder);
    if (!seedDataPath || !existsSync(seedDataPath)) return;
    const dataFiles = readdirSync(seedDataPath);
    if (!dataFiles || !dataFiles.length) return;
    Object.values(dbConnection.models).forEach(async (model) => {
      const file = dataFiles.find((filename) => filename.startsWith(model.modelName));
      if (file && file.endsWith('.js')) {
        // only process js files (PROD mode) .ts file will throw exception
        const fileURL = pathToFileURL(path.resolve(seedDataPath, file)).href;
        const { default: collectionData } = await import(fileURL);
        DBUtils.ResetCollection(model, collectionData.default);
      }
    });
  }

  public static async ResetCollection<T extends mongoose.Document>(Model: mongoose.Model<T>, data: T[]): Promise<void> {
    Trace.Info(`Dropping collection: ${Model.collection.collectionName}`);
    await Model.collection.drop().catch((err) => {
      if (err.code === 26) {
        Trace.Warn(`Collection ${Model.collection.collectionName} does not exist, skipping drop.`);
      } else {
        throw err;
      }
    });

    await Model.insertMany(data);
    Trace.Info(`Inserted ${data.length} records into ${Model.collection.collectionName}`);
  }
}
