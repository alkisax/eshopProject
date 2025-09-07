import mongoose from 'mongoose';
declare const _default: mongoose.Model<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    roles: string[];
    hashedPassword: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
}, {}, {}, {}, mongoose.Document<unknown, {}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    roles: string[];
    hashedPassword: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
}, {}, {
    collection: string;
    timestamps: true;
}> & {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    roles: string[];
    hashedPassword: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
} & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, mongoose.Schema<any, mongoose.Model<any, any, any, any, any, any>, {}, {}, {}, {}, {
    collection: string;
    timestamps: true;
}, {
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    roles: string[];
    hashedPassword: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
}, mongoose.Document<unknown, {}, mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    roles: string[];
    hashedPassword: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
}>, {}, mongoose.ResolveSchemaOptions<{
    collection: string;
    timestamps: true;
}>> & mongoose.FlatRecord<{
    createdAt: NativeDate;
    updatedAt: NativeDate;
} & {
    username: string;
    roles: string[];
    hashedPassword: string;
    name?: string | null | undefined;
    email?: string | null | undefined;
}> & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}>>;
export default _default;
