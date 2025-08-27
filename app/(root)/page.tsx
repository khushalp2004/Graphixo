import { Collection } from "@/components/shared/Collection";
import { navLinks } from "@/constants";
import { getUserImages } from "@/lib/actions/image.actions";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SearchPageProps } from "@/types";
import DynamicSlider from '@/components/client/DynamicSlider';

const Home = async ({ searchParams }: SearchPageProps) => {
  const { userId } = await auth();
  const imageSlides = [
    '/assets/images/restoreImage.webp',
    '/assets/images/generativeFill.webp',
    '/assets/images/objectRemove.webp',
    '/assets/images/objectRecolor.webp',
    '/assets/images/removeBackground.webp',
  ].map((image) => ({ image }));
  if (!userId) {
    return (
      <>
        <section className="home">
          <h1 className="home-heading">
            Unleash Your Creative Vision with{" "}
            <Link
              href="/"
              className="bg-gradient-to-r from-slate-700 to-slate-900 to-indigo-400 inline-block text-transparent bg-clip-text"
            >
              Graphi<h1 className="bg-linear-65 from-green-600 to-green-600 inline-block text-transparent bg-clip-text">
                X
              </h1>o
            </Link>
          </h1>
          <ul className="flex justify-center items-center w-full gap-20">
            {navLinks.slice(1, 5).map((link) => (
              <Link
                key={link.route}
                href={link.route}
                className="flex justify-center items-center flex-col gap-2"
              >
                <li className="flex justify-center items-center w-fit rounded-full bg-white p-4">
                  <Image
                    src={link.icon}
                    alt="image"
                    width={24}
                    height={24}
                    className="brightness-50"
                  />
                </li>
                <p className="font-medium text-[14px] leading-[120%] text-center text-white">
                  {link.label}
                </p>
              </Link>
            ))}
          </ul>
        </section>
        {/* Image Slider Carousel (Now using the Client Component) */}
        <div style={{ maxWidth: '800px', margin: '20px auto' }}>
        <DynamicSlider />
        <hr />
        <Footer />
      </div>
      </>
    );
  }
  const resolvedSearchParams = await searchParams || {};

  const page = Number(resolvedSearchParams?.page) || 1;
  const searchQuery = (resolvedSearchParams?.query as string) || "";

  const images = await getUserImages({
    page,
    userId,
    searchQuery,
  });

  return (
    <>
      <section className="home">
        <h1 className="home-heading">
          Unleash Your Creative Vision with{" "}
          <Link
            href="/"
            className="bg-gradient-to-r from-slate-700 to-slate-900 to-indigo-400 inline-block text-transparent bg-clip-text"
          >
            Graphi<h1 className="bg-linear-65 from-green-600 to-green-600 inline-block text-transparent bg-clip-text">
              X
            </h1>o
          </Link>
        </h1>
        <ul className="flex justify-center items-center w-full gap-20">
          {navLinks.slice(1, 5).map((link) => (
            <Link
              key={link.route}
              href={link.route}
              className="flex justify-center items-center flex-col gap-2"
            >
              <li className="flex justify-center items-center w-fit rounded-full bg-white p-4">
                <Image
                  src={link.icon}
                  alt="image"
                  width={24}
                  height={24}
                  className="brightness-50"
                />
              </li>
              <p className="font-medium text-[14px] leading-[120%] text-center text-white">
                {link.label}
              </p>
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
      <br />
      <br />
      <hr />
      <Footer />
    </>
  );
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-purple-100 text-black py-12 px-4 mt-20 rounded-4xl">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <Link href="/"><h2 className="text-2xl font-bold mb-4">
            graphi<span className="text-green-500">X</span>o
          </h2>
          </Link>
          <p className="text-gray-600">
            AI-powered image transformation platform that helps you unleash your creativity.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Legal</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-500 transition">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="text-gray-600 hover:text-gray-500 transition">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="text-gray-600 hover:text-gray-500 transition">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/about" className="text-gray-600 hover:text-gray-500 transition">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/blog" className="text-gray-600 hover:text-gray-500 transition">
                Blog
              </Link>
            </li>
            <li>
              <Link href='/contact' className="text-gray-600 hover:text-gray-500 transition">Contact Us @contact</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-700 flex flex-col md:flex-row justify-between items-center">
        <p className="text-gray-700 text-sm">
          © {currentYear} GraphiXo. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Home;