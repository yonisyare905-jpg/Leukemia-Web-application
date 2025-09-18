import React, { useState } from 'react'
import { data, Link, useNavigate } from 'react-router'
import { signUp } from '../lib/auth'
import { useAuth } from '../context/AuthContext'

const SignUpPage = () => {
  const [username, setUsername]=useState('')
  const [email, setEmail]=useState('')
  const [password, setPassword]=useState('')
  const [confirmPassword, setConfirmPassword]=useState('')
  const [isLoading, setIsLoading]=useState(false)
  const [error, setError]=useState(false)
  const [success, setSuccess]=useState(false)
  const {login}= useAuth()
  const navigate=useNavigate()

  const handleSubmit=async (e)=>{
    e.preventDefault();

    setIsLoading(true)
    setError(null)

    if(password !== confirmPassword){
      setError('password does not match')
      setIsLoading(false)
      return
    }

    try {
      const userData=await signUp(email,password,username)
      login(userData)
      console.log("User data after signup:", userData)
      navigate('/')

      setSuccess(true)

      // setTimeout(() => {
      //   navigate('/signin')
        
      // },3000);
      
    } catch (eror) {
      console.log(eror);
      setError(eror.message || "failed to created an account. Please try again")
    }finally{
      setIsLoading(false)
    }
  }
  if(success){
    return(
      <div className='max-h-screen my-10 flex items-center justify-center bg-gray-50 px-4'>
        <div className='max-w-md w-full text-center'>
          <div className='bg-white rounded-lg shadow-md p-8'>
            <div className='bg-green-500 text-5xl mb-4'>✔️</div>
            <h2 className='text-2xl font-bold mb-2'>Account Created!</h2>
            <p className='text-gray-600 mb-4'>
              Your Account has been created successfully, please check your email for verification.
            </p>
            <p className='text-gray-500 text-sm'>
              Redirecting to sign in page in few seconds...
            </p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className='max-h-screen mt-30 flex items-center justify-center bg-gray-50 px-4'>
      <div className='max-w-md w-full'>
        <div className='text-center mb-4'>
          <h1 className='text-3xl font-bold'>Create an Account</h1>
          <p className='text-gray-600 mt-2'>Joint our community and start sharing your ideas</p>
        </div>
        <div className='bg-white rounded-lg shadow-md px-10 py-6'>
          {
            error && (
              <div className='mb-4 p-3 text-center bg-red-100 text-red-700 rounded-md text-sm'>
                {error}
              </div>
            )
          }
          <form onSubmit={handleSubmit}>
            <div className='mb-3'>
              <label className='block text-gray-700 
              text-sm font-semibold mb-2' htmlFor="email"
              >Username</label>
              <input 
                type="text"
                id='username'
                className='w-full px-4 py-2 border rounded-md focus:outline-none 
                focus:ring-2 focus:ring-fuchsia-500'
                placeholder='jamalabdi'
                value={username}
                onChange={(e)=>setUsername(e.target.value)}
                required
              />
            </div>
            <div className='mb-3'>
              <label className='block text-gray-700 text-sm font-semibold mb-2' htmlFor="email">Email Address</label>
              <input 
                type="email"
                id='email'
                className='w-full px-4 py-2 border rounded-md focus:outline-none 
                focus:ring-2 focus:ring-fuchsia-500'
                placeholder='jamal.com'
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>
            <div className='mb-3'>
              <label className='block text-gray-700 text-sm 
              font-semibold mb-2' htmlFor="password">Password</label>
              <input 
                type="password"
                id='password'
                className='w-full px-4 py-2 border rounded-md focus:outline-none 
                focus:ring-2 focus:ring-fuchsia-500'
                placeholder='************'
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className='text-xs text-gray-500 mt-1'>Must be atleast 6 characters</p>
            </div>
            <div className='mb-3'>
              <label className='block text-gray-700 text-sm 
              font-semibold mb-2' htmlFor="confirmpassword">confirm Password</label>
              <input 
                type="password"
                id='confirmPassword'
                className='w-full px-4 py-2 border rounded-md focus:outline-none 
                focus:ring-2 focus:ring-fuchsia-500'
                placeholder='************'
                value={confirmPassword}
                onChange={(e)=>setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className='text-xs text-gray-500 mt-1'>Must be atleast 6 characters</p>
            </div>
            <button
            type='submit'
            className='w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white 
            font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-fuchsia-500 focus:ring-opacity-50 transition duration-200
            disabled:cursor-not-allowed disabled:bg-fuchsia-500'
            disabled={isLoading}
            >
              {isLoading ? 'Creating Account...': 'Create Account'}
            </button>
          </form>
          <div className='mt-6 flex items-center justify-center gap-2'>
            <p className='text-gray-600 text-sm'>Already have an Account? {''}</p>
            <Link to={'/signin'} className='text-fuchsia-600 hover:text-fuchsia-800 font-semibold'>Sign In</Link>
          </div>

        </div>
      </div>

    </div>
  )
}

export default SignUpPage