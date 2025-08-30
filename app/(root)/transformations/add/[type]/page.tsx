import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm';
import { transformationTypes } from '@/constants';
import { getUserById } from '@/lib/actions/user.actions';
import { TransformationTypeKey } from '@/types';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

const AddTransformationTypePage = async ({ params }: { params: Promise<{ type: string }> }) => {
  const { type } = await params;
  const { userId } = await auth();
  
  // Handle case where type might be "textToImage" instead of "texttoimage"
  const normalizedType = type === 'textToImage' ? 'texttoimage' : type;
  const transformation = transformationTypes[normalizedType as keyof typeof transformationTypes] as unknown as { title: string; subTitle: string; type: string };

  if (!userId) redirect('/sign-in');
  if (!transformation) redirect('/transformations/add/restore'); // Redirect to default if invalid type

  const user = await getUserById(userId);

  return (
    <>
      <Header 
        title={transformation.title}
        subTitle={transformation.subTitle}
      />
    
      <section className="mt-5">
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

export default AddTransformationTypePage;
