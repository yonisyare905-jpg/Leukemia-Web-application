import {v4 as uuidv4} from 'uuid'
import supabase from './Supabase';

export const uploadImage=async(file,userId,bucket='article-cover')=>{

    try {
        // file extention
        const fileExt=file.name.split('.').pop().toLowerCase();

        // creating unique file path
        const filename=`${uuidv4()}.${fileExt}`;
        const filePath=`${userId}/${filename}`;

        // uploading the file to the supabase

        const {data, error}=await supabase.storage
          .from(bucket)
          .upload(filePath,file, {
            contentType:file.type,
            cacheControl:'3600',
            upsert:true
          })
        
        if(error) throw error;

        // getting the public URL for the uploaded file
        const {data:urlData}= supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        
        return{
            path:filePath,
            url:urlData.publicUrl
        }


    } catch (error) {
        console.error("error uploading image: ",error)
        throw error;
        
    }

}