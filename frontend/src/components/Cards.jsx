import React from 'react'
import { FiClock, FiHeart, FiMessageSquare } from 'react-icons/fi';
import { Link } from 'react-router';

const Cards = ({article}) => {

    const {id,title,content,author,tags,created_at,featured_image}=article

    const formatDate=(dateString)=>{
        if(!dateString) return "No date available";
    
        try {
          const options={ year:'numeric',month:'short',day:'numeric'};
          const date=new Date(dateString);
    
          // chaeck if the date is vaid
          if(isNaN(date.getTime())){
            return 'invalid date';
          }
    
          return date.toLocaleDateString(undefined,options);
          
        } catch (error) {
          console.error('error formatting date: ',error)
          return 'Date format error'
        }
      }

      const formattedDate=formatDate(created_at);

    //   function to create safe html
    const createSafeHtml=(htmlContent)=>{
        if(!htmlContent) return ''

        // excerpt text only from HTML for excerpt
        const textContent=htmlContent.replace(/<[^>]*>?/gm,'');

        return textContent.substring(0,150) + (textContent.length > 150 ? '...' : '');
    }
  return (
    <div className='bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl
    transition-all duration-300 transform hover:-translate-y-1'>
        {/* featured image */}
        {
            featured_image && (
                <div className='relative h-48 w-full overflow-hidden'>
                    <img 
                      src={featured_image} 
                      alt={title}
                      className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
                    />
                </div>
            )
        }

        <div className='p-6'>
            <div className='flex flex-wrap gap-2 mb-4'>
                {/* tags */}
                {
                    tags && tags.map(tag => (
                        <Link
                          key={tag}
                          to={`/tags/${tag}`}
                          className='inline-block bg-orange-50 text-orange-500 text-xs px-3 py-1
                          rounded-full hover:bg-orange-100 transition-colors duration-200'
                        >{tag}</Link>
                    ))
                }
            </div>
            {/* title */}
            <Link
            to={`/article/${id}`}
            className='text-xl font-bold text-gray-900 mb-3 hover:text-orange-600 transition-colors
            duration-200 line-clamp-2'
            >{title}</Link>

            {/* excerpt */}
            <p className='text-gray-600 text-sm mb-4 line-clamp-2'>{createSafeHtml(content)}</p>

            {/* author and meta info */}
            <div className='flex items-center justify-between mt-3 pt-4 border-t border-gray-100'>
                <div className='flex items-center space-x-3'>
                    <img 
                      src={author.avatar_url || 'https://placehold.co/150'} 
                      alt={author.username}
                      className='h-8 w-8 rounded-full object-cover'
                    />
                    <div>
                        <Link
                          to={`/profile/${author.username}`}
                          className='text-sm font-medium text-gray-900 hover:text-orange-600'
                        >{author.username}</Link>

                        <div className='flex items-center space-x-1 text-xs text-gray-500'>
                            <FiClock className='inline w-3 h-3'/>
                            <span>{formattedDate}</span>
                        </div>
                    </div>
                </div>

                {/* engagement stats */}
                <div className='flex items-center space-x-4 text-gray-500'>
                    <div className='flex items-center space-x-1 text-sm'>
                        <FiHeart className='w-4 h-4'/>
                        <span>{0}</span>
                    </div>
                    <div className='flex items-center space-x-1 text-sm'>
                        <FiMessageSquare className='w-4 h-4'/>
                        <span>{0}</span>
                    </div>
                </div>
            </div>
        </div>

    </div>
  )
}

export default Cards