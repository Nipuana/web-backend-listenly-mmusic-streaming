import mongoose, { Document, Schema  } from "mongoose"
import { UserType } from "../types/auth.type"
import { UserInfoType } from "../types/userInfo.type"

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['user','artist',"pUser",'admin'], default: 'user' },
        profilePicture: { type: String, required: false },
        additionalInfo: {
            phoneNumber: { type: String, required: false },
            address: { type: String, required: false },
            city: { type: String, required: false },
            country: { type: String, required: false },
            postalCode: { type: String, required: false },
            gender: { 
                type: String, 
                enum: ['male', 'female', 'other', 'prefer-not-to-say'],
                required: false 
            },
            dateOfBirth: { type: Date, required: false },
            age: { type: Number, min: 0, max: 150, required: false },
            bio: { type: String, maxlength: 500, required: false },
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
)

export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId; // mongo related attribute
    additionalInfo?: UserInfoType;
    createdAt: Date;
    updatedAt: Date; 
}

export const UserModel= mongoose.model<IUser>("User", UserSchema);
// collection name "users" ("plural of User")
// UserModel -> db.users