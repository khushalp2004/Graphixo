import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants'
import { getUserById } from '@/lib/actions/user.actions';
import {auth} from "@clerk/nextjs/server"
import { redirect } from 'next/navigation';
import { PageProps, TransformationTypeKey } from '@/types';

const AddTransformationTypePage = async ({ searchParams }: PageProps) => {
  // First get the userId and verify authentication
  const { userId } = await auth();
  if(!userId) redirect('/sign-in');

  // Then access the params
  const { type } = searchParams;
  const transformation = transformationTypes[type as TransformationTypeKey];

  const user = await getUserById(userId);

  return (
    <>
      <Header 
        title={transformation.title}
        subTitle={transformation.subTitle}
      />
    
      <section className="mt-10">
        <TransformationForm 
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationTypePage