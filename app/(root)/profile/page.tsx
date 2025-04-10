import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import { Collection } from "@/components/shared/Collection";
import Header from "@/components/shared/Header";
import { getUserImages } from "@/lib/actions/image.actions";
import { getUserById } from "@/lib/actions/user.actions";

type SearchParamProps = {
  searchParams?: {
    page?: string;
    query?: string;
  };
};

const Profile = async ({ searchParams }: SearchParamProps) => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const page = Number(searchParams?.page) || 1;
  const searchQuery = (searchParams?.query as string) || '';

  const user = await getUserById(userId);
  const images = await getUserImages({ 
    page, 
    userId,
    searchQuery
  });

  return (
    <>
      <Header title="Profile" />

      <section className="profile">
        <div className="profile-balance">
          <p className="font-medium text-[14px] leading-[120%] md:font-medium text-[16px] leading-[140%]">CREDITS AVAILABLE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/coins.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="text-[30px] font-bold md:text-[36px] leading-[110%] text-gray-600">{user.creditBalance}</h2>
          </div>
        </div>

        <div className="profile-image-manipulation">
          <p className="font-medium text-[14px] leading-[120%] md:font-medium text-[16px] leading-[140%]">IMAGE MANIPULATION DONE</p>
          <div className="mt-4 flex items-center gap-4">
            <Image
              src="/assets/icons/photo.svg"
              alt="coins"
              width={50}
              height={50}
              className="size-9 md:size-12"
            />
            <h2 className="text-[30px] font-bold md:text-[36px] leading-[110%] text-gray-600">{images?.data.length}</h2>
          </div>
        </div>
      </section>

      <section className="mt-8 md:mt-14">
      <Collection 
          hasSearch={true}
          images={images?.data}
          totalPages={images?.totalPages}
          page={page}
        />
      </section>
    </>
  );
};

export default Profile;