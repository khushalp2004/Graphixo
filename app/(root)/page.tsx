import { Collection } from "@/components/shared/Collection"
import { navLinks } from "@/constants"
import { getAllImages, getUserImages } from "@/lib/actions/image.actions"
import Image from "next/image"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SearchParamProps } from "@/types"

interface SearchParamsProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

const Home = async ({ searchParams }: SearchParamsProps) => {
  const { userId } = await auth();
  
  // If no user is logged in, redirect to sign-in page
  if (!userId) {
    redirect('/sign-in');
  }
  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || '';

  const images = await getUserImages({ 
    page, 
    userId,
    searchQuery
  });

  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with <Link href='/' className='bg-gradient-to-r from-gray-500 to-gray-900 inline-block text-transparent bg-clip-text'>GraphiXo</Link>
        </h1>
        <ul className="flex justify-center items-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex justify-center items-center flex-col gap-2"
            >
              <li className="flex-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} />
              </li>
              <p className="font-medium text-[14px] leading-[120%] text-center text-white">{link.label}</p>
            </Link>
          ))}
        </ul>
      </section>

      <section className="sm:mt-12">
        <Collection 
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  )
}

export default Home