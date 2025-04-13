import { Document, model, models, Schema } from "mongoose"
import { StaticImport } from "next/dist/shared/lib/get-img-props";

export interface IImage extends Document{
    icon: string | StaticImport;
    _id: string;
    title: string;
    transformationType: string;
    publicId: string;
    secureUrl?: string;
    width?: number;
    height?: number;
    config?: object;
    transformationUrl?: string;
    aspectRatio?: string;
    color?: string;
    prompt?: string;
    author: {
        _id: string,
        firstName: string,
        lastName: string,
    };
    createdAt: Date;
    updatedAt: Date;
}

const ImageSchema=new Schema({
    title:{type: String,required: true},
    transformationType:{type: String,required: true},
    publicId: {type: String, required: true},
    secureUrl: {type: String, required: true},
    width: {type: Number},
    height: {type: Number},
    config: {type: Object},
    transformationUrl: {type: String},
    aspectRatio: {type: String},
    color: {type: String},
    prompt: {type: String},
    author: {type: Schema.Types.ObjectId,ref: 'User'},
    createdAt: {type: Date, default: Date.now},
    updatedAt: {type: Date,default: Date.now}
})

const Image=models?.Image || model('Image',ImageSchema);

export default Image;