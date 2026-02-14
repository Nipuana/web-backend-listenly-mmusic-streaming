import mongoose from 'mongoose';

//utility for common operations
export class Utils {
  //convert String Id to Mongodb default id
    static toObjectId(id: string): mongoose.Types.ObjectId {
        return new mongoose.Types.ObjectId(id);
    }

   // Check User Role
    static hasRole(user: any, requiredRole: string): boolean {
        return user?.role === requiredRole;
    }

//generate files for upload
    static generateFileUrl(folder: string, filename: string): string {
        return `/uploads/${folder}/${filename}`;
    }

  //verify uploaded file still exists
    static validateFilePresence(file: any, fieldName: string): void {
        if (!file) {
            throw new Error(`${fieldName} is required`);
        }
    }
}