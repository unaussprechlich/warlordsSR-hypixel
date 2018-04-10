import * as mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
    name : String,
    password : String
});

export const UserModel = mongoose.model<IUser>('User', UserSchema);

export interface IUser extends mongoose.Document{
    name : String,
    password : String
}




