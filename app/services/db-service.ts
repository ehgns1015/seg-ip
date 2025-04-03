import { Collection, Document, Sort } from "mongodb";
import { db } from "@/app/lib/mongo";

export class CollectionService<T extends Document> {
  protected collection: Collection<T>;
  
  constructor(collectionName: string) {
    this.collection = db.collection<T>(collectionName);
  }
  
  async findAll(query = {}, sort: Sort = {}): Promise<T[]> {
    const results = await this.collection.find(query).sort(sort).toArray();
    return results as unknown as T[];
  }
  
  async findOne(query: object): Promise<T | null> {
    const result = await this.collection.findOne(query);
    return result as unknown as T | null;
  }
  
  async upsert(filter: object, data: Partial<T>) {
    const now = new Date();
    const updateData = {
      ...data,
      updatedAt: now,
    };
    
    return this.collection.updateOne(
      filter,
      { $set: updateData },
      { upsert: true }
    );
  }
  
  async delete(filter: object) {
    return this.collection.deleteOne(filter);
  }
}