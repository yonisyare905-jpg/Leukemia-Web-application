import React from 'react'
import { Link } from 'react-router'
import { FaTwitter } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaGithub } from "react-icons/fa";

const Footer = () => {
  return (
    <div className='bg-fuchsia-900 bottom-0'>
      {/* navs */}
      <div className='max-w-7xl m-auto px-4 py-12 overflow-hidden sm:px-6 lg:px-8'>
        <nav className='-mx-5 -my-2 flex flex-wrap justify-center'>
          <div className='px-5 py-2'>
            <Link to={'/'} className='text-base text-white hover:text-gray-500'>Home</Link>
          </div>
          <div className='px-5 py-2'>
            <Link to={'/appointment'} className='text-base text-white hover:text-gray-500'>Appointments</Link>
          </div>
          <div className='px-5 py-2'>
            <Link to={'/about-us'} className='text-base text-white hover:text-gray-500'>About Us</Link>
          </div>

        </nav>
      </div>

      {/* social media */}
      <div className='flex justify-center space-x-6'>
        <a href="" className='text-gray-200 hover:text-gray-500'>
          <span className='sr-only'>Twitter</span>
          <FaTwitter  className='h-6 w-6'/>
        </a>
        <a href="" className='text-gray-200 hover:text-gray-500'>
          <span className='sr-only'>Instagram</span>
          <FaInstagram className='h-6 w-6'/>
        </a>
        <a href="" className='text-gray-200 hover:text-gray-500'>
          <span className='sr-only'>GitHub</span>
          <FaGithub className='h-6 w-6'/>
        </a>
      </div>

      {/* copyright */}
      <p className='mt-8 text-center text-base text-gray-200'>
        &copy;{new Date().getFullYear()} Sagal Diagnostic. All Rights Reserved.</p>

    </div>
  )
}

export default Footer