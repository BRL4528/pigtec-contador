import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

export async function openDatabase() {
  const dbFileName = 'myDatabase.db';
  const dbAsset = await require('../../assets/myDatabase.db');
  const dbUri =  Asset.fromModule(require(dbAsset)).uri;
  const dbFilePath = `${FileSystem.documentDirectory}SQLite/${dbFileName}`

  const fileInfo = await FileSystem.getInfoAsync(dbFilePath);
  if(!fileInfo.exists) {
    await FileSystem.makeDirectoryAsync(
      `${FileSystem.documentDirectory}SQLite`,
      { intermediates: true }
    );
    await FileSystem.downloadAsync(dbUri, dbFilePath)
  }
}
