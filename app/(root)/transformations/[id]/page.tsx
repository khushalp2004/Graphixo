import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";

import Header from "@/components/shared/Header";
import TransformedImage from "@/components/shared/TransformedImage";
import { Button } from "@/components/ui/button";
import { getImageById } from "@/lib/actions/image.actions";
import { getImageSize } from "@/lib/utils";
import { DeleteConfirmation } from "@/components/shared/DeleteConfirmation";
import { SearchParamProps } from "@/types";

const ImageDetails = async ({ params }: SearchParamProps) => {
  const { userId } = await auth();
  const resolvedParams = await params;
  const image = await getImageById(resolvedParams.id);
  
  if (!image) {
    return <div className="flex justify-center items-center h-screen">
      <p className="text-red-500">Image not found</p>
    </div>;
  }

  console.log("Original Image secureURL:", image?.secureUrl);
  console.log("Transformed Image secureURL:", image?.publicId);

  return (
    <>
      <Header title={image.title} />

      <section className="mt-5 flex flex-wrap gap-4">
        <div className="font-medium text-[14px] leading-[120%] md:font-medium text-[16px] leading-[140%] flex gap-2">
          <p className="text-gray-600">Transformation:</p>
          <p className=" capitalize text-purple-400">
            {image.transformationType}
          </p>
        </div>

        {image.prompt && (
          <>
            <p className="hidden text-gray-400/50 md:block">&#x25CF;</p>
            <div className="font-medium text-[14px] leading-[120%] md:font-medium text-[16px] leading-[140%] flex gap-2 ">
              <p className="text-gray-600">Prompt:</p>
              <p className=" capitalize text-purple-400">{image.prompt}</p>
            </div>
          </>
        )}

        {image.color && (
          <>
            <p className="hidden text-gray-400/50 md:block">&#x25CF;</p>
            <div className="font-medium text-[14px] leading-[120%] md:font-medium text-[16px] leading-[140%] flex gap-2">
              <p className="text-gray-600">Color:</p>
              <p className=" capitalize text-purple-400">{image.color}</p>
            </div>
          </>
        )}

        {image.aspectRatio && (
          <>
            <p className="hidden text-gray-400/50 md:block">&#x25CF;</p>
            <div className="font-medium text-[14px] leading-[120%] md:font-medium text-[16px] leading-[140%] flex gap-2">
              <p className="text-gray-600">Aspect Ratio:</p>
              <p className=" capitalize text-purple-400">{image.aspectRatio}</p>
            </div>
          </>
        )}
      </section>

      <section className="mt-10 border-t border-gray-400/15">
        <div className="transformation-grid">
          {/* MEDIA UPLOADER */}
          <div className="flex flex-col gap-4">
            <h3 className="font-bold text-[30px] leading-[140%] text-gray-600">Original</h3>

            
                <Image
                  width={getImageSize(image.transformationType, image, "width")}
                  height={getImageSize(image.transformationType, image, "height")}
                  src={image.secureUrl}
                  alt="Original image"
                  className="transformation-original_image"
                />
              
            
          </div>

          {/* TRANSFORMED IMAGE */}
          {image?.publicId ? (
            <TransformedImage
              image={image}
              type={image.transformationType}
              title={image.title}
              isTransforming={false}
              transformationConfig={image.config}
              hasDownload={true}
            />
          ) : (
            <div className="transformed-placeholder">
              <p>Transformed image not available</p>
            </div>
          )}
        </div>

        {userId === image.author.clerkId && (
          <div className="mt-4 space-y-4">
            <Button asChild type="button" className="submit-button capitalize">
              <Link href={`/transformations/${image._id}/update`}>
                Update Image
              </Link>
            </Button>

            <DeleteConfirmation imageId={image._id?.toString() ?? ''} />
          </div>
        )}
      </section>
    </>
  );
};

export default ImageDetails;