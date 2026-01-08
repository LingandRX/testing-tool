import Dexie from "dexie";

export const db = new Dexie("testImagesDb");

db.version(1).stores({
  images: '++id, created, source'
});