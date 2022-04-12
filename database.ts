import { pluralize, model, connect, Schema, Document } from 'mongoose';
import { error } from './index';
import config from './config';

pluralize(s => s);

connect(config.secrets.MONGOURL)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    error(`Error connecting to MongoDB: ${err}`);
    process.exit(1);
  })

// --------------------------------------------------
// User Types
// --------------------------------------------------

interface Socials {
  github?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  pinterest?: string;
  reddit?: string;
  quora?: string;
  stackoverflow?: string;
}

export interface IUser extends Document {
  userID: string;
  email: string;
  username: string;
  password: string;
  socials: Socials;
  createdAt: Date;
  admin: boolean;
  verified: boolean;
  bio: string;
  profilePicture: string;
}

const UserSchema = new Schema({
  userID: String,
  email: String,
  username: String,
  password: String,
  socials: Object,
  createdAt: Date,
  admin: Boolean,
  verified: Boolean,
  bio: String,
  profilePicture: String,
});

export const Users = model<IUser>('Users', UserSchema);