import React from 'react'
import MagicButton from './ui/MagicButton'
import { FaLocationArrow } from 'react-icons/fa6'
import { socialMedia } from "@/data"

const Footer = () => {
  return (
    <footer className='w-full pt-20 pb-10 mb-[50px] md:mb-5' id='contact'>

      <div className='flex flex-col items-center'>
        <h1 className='heading lg:max-w-[45vw]'>
          Do you need a <span className='text-purple'>passionate learner</span> to compliment your organization?
        </h1>
        <p className='text-white-200 md:mt-10 my-5 text-center'>Please consider me for any entry-level developer position where my skillset would help you achieve your goals.
        </p>
        <a href='mailto:feedback@fivefiftyfive.io'>
          <MagicButton
            title="Let's connect"
            icon={<FaLocationArrow />}
            position="right"
          />
        </a>
      </div>

      <div className='flex mt-16 md:flex-row flex-col justify-between items-center'>
        <p className='md:text-base text-sm md:font-normal font-light'>Copyright &copy; 2024 five<span className='text-purple'>fifty</span>five</p>

        <div className='flex items-center md:gap-3 gap-6'>
          {socialMedia.map((profile) => (
            <div key={profile.id} className='w-10 h-10 flex justify-center items-center backdrop-filter backdrop-blur-lg saturate-180 bg-opacity-75 bg-black-200 rounded-lg border border-black-300'>
              <img src={profile.img} alt="icon" width={20} height={20} />
            </div>
          ))}
        </div>
      </div>
    </footer>
  )
}

export default Footer
