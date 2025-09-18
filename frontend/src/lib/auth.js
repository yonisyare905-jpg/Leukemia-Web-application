import supabase from "./Supabase";

export async function signUp(email, password, username = "", role = "patient") {
  // Check if email already exists
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    throw new Error("Email already exists");
  }

  // Insert user into your users table
  const { data, error } = await supabase
    .from("users")
    .insert({
      username,
      email,
      password, // you should hash this in production!
      role,
      avatar_url: null,
    })
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    id: data.id, // ensure id is returned
    role: data.role || role, // default to 'patient' if not set
  }; // return the user info for header
}

export async function signIn(email, password) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .eq("password", password) // again, use hashed passwords in production
    .single();

  if (error || !data) {
    throw new Error("Invalid email or password");
  }

  return data;
}


export async function getUserProfile(userId) {

  const {data: sessionData}= await supabase.auth.getSession()

  const {data, error}= await supabase
    .from("users")
    .select("username, avatar_url, role")
    .eq('id',userId)
    .single()

    if(error && error.code=== "PGRST116"){
      console.log("No profile found, attempting to create one for user.", userId);

    
    
    const {data: userData}=await supabase.auth.getUser();
    const email=userData?.user.email;

    const defaultUsername=email ? email.split("@")[0] : `user_${Date.now()}`;

     // creating profile
     const {data: newProfile, error: profileError}= await supabase
     .from('users')
     .insert({
       id:userId,
       username:defaultUsername,
       avatar_url:null,
       role:'patient'
     })
     .select()
     .single()

     if(profileError){
       console.error('profile creation error ', profileError)
       throw profileError
     }else{
       console.log('profile created successfuly ',newProfile);
     }

     return newProfile;
    }

    if(error){
      console.log("error fetching profile: ",error);
      throw error
    }

    console.log("existing profile");

    return data;
     

  
}

export function onAuthChange(callback){

  const {data}=supabase.auth.onAuthStateChange((event, session)=>{
    callback(session?.user || null,event)

  })

  return ()=> data.subscription.unsubscribe();
}

export const uploadToSupabase = async (file) => {
  
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('blood-images')
    .upload(fileName, file);

  if (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload image');
    return null;
  }

  const { data: publicUrlData } = supabase
    .storage
    .from('blood-images')
    .getPublicUrl(fileName);

  return publicUrlData?.publicUrl;
};


// signout the current user

export async function signOut() {
  await supabase.auth.signOut();
}