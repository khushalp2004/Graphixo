import React from 'react'


const Header = ({title,subTitle}:{title: string,subTitle?: string}) => {
  return (
      <>
        <h2 className="text-[30px] font-bold md:text-[36px] leading-[110%] text-gray-700">
            {title}
        </h2>
        {subTitle && <p className="font-semibold text-[16px] leading-[140%] mt-4">{subTitle}</p>}
      </>
  )
}

export default Header;