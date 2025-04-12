import { Collection } from "@/components/shared/Collection"
import { navLinks } from "@/constants"
import { getUserImages } from "@/lib/actions/image.actions"
import Image from "next/image"
import Link from "next/link"
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SearchPageProps } from "@/types";


const Home = async ({ searchParams }: SearchPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  const resolvedSearchParams = await searchParams || {};

  const page = Number(resolvedSearchParams?.page) || 1;
  const searchQuery = (resolvedSearchParams?.query as string) || '';

  const images = await getUserImages({ 
    page, 
    userId,
    searchQuery
  });

  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with <Link href='/' className="bg-gradient-to-r from-slate-700 to-slate-900 to-indigo-400 inline-block text-transparent bg-clip-text">Graphi<h1 className="bg-linear-65 from-purple-500 to-pink-500 inline-block text-transparent bg-clip-text">X</h1>o</Link>
        </h1>
        <ul className="flex justify-center items-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex justify-center items-center flex-col gap-2"
            >
              <li className="flex justify-center items-center w-fit rounded-full bg-white p-4">
                <Image src={link.icon} alt="image" width={24} height={24} className="brightness-50"/>
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