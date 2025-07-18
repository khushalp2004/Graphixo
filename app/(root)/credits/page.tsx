import { SignedIn } from "@clerk/nextjs";
import {auth} from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { plans } from "@/constants";
import { getUserById } from "@/lib/actions/user.actions";
import Checkout from "@/components/shared/Checkout";// Ensure this file exists at 'components/shared/Checkout.tsx' or update the path

const Credits = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  // return (
  //   <>
  //     <Header
  //       title="Buy Credits"
  //       subTitle="Choose a credit package that suits your needs!"
  //     />

  //     <section>
  //       <ul className="credits-list">
  //         {plans.map((plan) => (
  //           <li key={plan.name} className="credits-item">
  //             <div className="flex justify-center items-center flex-col gap-3">
  //               <Image src={plan.icon} alt="check" width={50} height={50} />
  //               <p className="font-semibold text-[20px] leading-[140%] mt-2 text-purple-500">
  //                 {plan.name}
  //               </p>
  //               <p className="text-[36px] font-semibold sm:text-[44px] leading-[120%] sm:leading-[56px] text-gray-700">${plan.price}</p>
  //               <p className="font-normal text-[16px] leading-[140%]">{plan.credits} Credits</p>
  //             </div>

  //             {/* Inclusions */}
  //             <ul className="flex flex-col gap-5 py-9">
  //               {plan.inclusions.map((inclusion) => (
  //                 <li
  //                   key={plan.name + inclusion.label}
  //                   className="flex items-center gap-4"
  //                 >
  //                   <Image
  //                     src={`/assets/icons/${
  //                       inclusion.isIncluded ? "check.svg" : "cross.svg"
  //                     }`}
  //                     alt="check"
  //                     width={24}
  //                     height={24}
  //                   />
  //                   <p className="font-normal text-[16px] leading-[140%]">{inclusion.label}</p>
  //                 </li>
  //               ))}
  //             </ul>

  //             {plan.name === "Free" ? (
  //               <Button variant="outline" className="credits-btn">
  //                 Free Consumable
  //               </Button>
  //             ) : (
  //               <SignedIn>
  //                 <Checkout
  //                   plan={plan.name}
  //                   amount={plan.price}
  //                   credits={plan.credits}
  //                   buyerId={user._id}
  //                 />
  //               </SignedIn>
  //             )}
  //           </li>
  //         ))}
  //       </ul>
  //     </section>
  //   </>
  // );
  


  //dummy
  return (
    <>
    <h1>Buy Credits(under construction)</h1>
    </>
  )
};

export default Credits;