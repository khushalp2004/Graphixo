import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Header from "@/components/shared/Header";
import TransformationForm from "@/components/shared/TransformationForm";
import { transformationTypes } from "@/constants";

const CartoonifyPage = async () => {
  const { userId } = await auth();

  if (!userId) redirect("/sign-in");

  return (
    <>
      <Header title={transformationTypes.cartoonify.title} subTitle={transformationTypes.cartoonify.subTitle} />

      <section className="mt-10">
        <TransformationForm 
          action="Add" 
          userId={userId} 
          type="cartoonify" 
          creditBalance={200} 
        />
      </section>
    </>
  );
};

export default CartoonifyPage;
