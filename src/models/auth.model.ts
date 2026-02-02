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

// Calculate age
UserSchema.virtual('additionalInfo.calculatedAge').get(function(this: IUser) {
    if (this.additionalInfo?.dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(this.additionalInfo.dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        
        return age;
    }
    return undefined;
})
export interface IUser extends UserType, Document {
    _id: mongoose.Types.ObjectId; // mongo related attribute
    additionalInfo?: UserInfoType;
    createdAt: Date;
    updatedAt: Date; 
}

export const UserModel= mongoose.model<IUser>("User", UserSchema);
// collection name "users" ("plural of User")
// UserModel -> db.users