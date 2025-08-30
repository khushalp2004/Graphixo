"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  aspectRatioOptions,
  creditFee,
  defaultValues,
  transformationTypes,
} from "@/constants";
import { CustomField } from "./CustomField";
import { useEffect, useState, useTransition } from "react";
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { getCldImageUrl } from "next-cloudinary";
import TransformedImage from "./TransformedImage";
import MediaUploader from "./MediaUploader";
import {
  addImage,
  updateImage,
  textToImage,
  testCartoonifyAPI,
} from "@/lib/actions/image.actions.new";
import { updateCredits } from "@/lib/actions/user.actions";
import { InsufficientCreditsModal } from "./InsufficientCreditsModal";
import { Loader2, Bug, Wifi, WifiOff, Divide } from "lucide-react";
import { ClipDropService } from "@/lib/services/clipdrop.service";

// Type definitions
type Transformations = {
  [key: string]:
    | {
        prompt?: string;
        to?: string;
        [key: string]: any;
      }
    | boolean;
};

type TransformationFormProps = {
  action: "Add" | "Update";
  data?: any;
  userId: string;
  type: string;
  creditBalance: number;
  config?: Transformations | null;
};

// const createFormSchema = (type: string) => z.object({
//   title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
//   aspectRatio: z.string().optional(),
//   color: z.string().optional(),
//   prompt: z.string().min(1, "Prompt is required for text-to-image generation"),
//   publicId: type === 'texttoimage' ? z.string().optional() : z.string().min(1, "Image is required"),
// });

const createFormSchema = (type: string) => {
  return z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be 100 characters or less"),
    aspectRatio: z.string().optional(),
    color: z.string().optional(),
    prompt:
      type === "texttoimage" || type === "remove" || type === "recolor"
        ? z.string().min(1, "Prompt is required")
        : z.string().optional(),
    publicId:
      type === "texttoimage"
        ? z.string().optional()
        : z.string().min(1, "Image is required"),
  });
};

const TransformationForm = ({
  action,
  data = null,
  userId,
  type,
  creditBalance,
  config = null,
}: TransformationFormProps) => {
  const transformationType =
    transformationTypes[type as keyof typeof transformationTypes];
  const [image, setImage] = useState(data);
  const [newTransformation, setNewTransformation] =
    useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] =
    useState<Transformations | null>(config);
  const [isPending, startTransition] = useTransition();
  const [showProModal, setShowProModal] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<
    "unknown" | "connected" | "failed"
  >("unknown");
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const [transformationProgress, setTransformationProgress] = useState(0);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const router = useRouter();

  // Check if generative fill is locked (less than 11 coins) - only for fill type
  const isGenerativeFillLocked = type === "fill" && creditBalance < 11;
  
  // Check if text-to-image is locked (less than 11 coins) - only for texttoimage type
  const isTextToImageLocked = type === "texttoimage" && creditBalance < 11;

  // For text-to-image, we don't need aspect ratio or color fields
  const showAspectRatio = type === "fill";
  const showColorField = type === "recolor";
  const showPromptField =
    type === "remove" || type === "recolor" || type === "texttoimage";

  const initialValues =
    data && action === "Update"
      ? {
          title: data?.title,
          aspectRatio: data?.aspectRatio,
          color: data?.color,
          prompt: data?.prompt,
          publicId: data?.publicId,
        }
      : defaultValues;

  const form = useForm<z.infer<ReturnType<typeof createFormSchema>>>({
    resolver: zodResolver(createFormSchema(type)),
    defaultValues: initialValues,
  });

  // Test API connection when debug mode is enabled
  useEffect(() => {
    if (debugMode && type === "texttoimage") {
      testAPIConnection();
    }
  }, [debugMode, type]);

  const testAPIConnection = async () => {
    if (type !== "texttoimage") return;

    setIsTestingAPI(true);
    addDebugLog("🔍 Testing text-to-image API connection...");

    try {
      const result = await testCartoonifyAPI(true);

      // Check ClipDrop API status from results array
      const clipdropResult = result.results.find(
        (r) => r.endpoint === "ClipDrop API"
      );
      if (clipdropResult) {
        addDebugLog(
          `📊 ClipDrop API Status: ${clipdropResult.status} - ${clipdropResult.statusText}`
        );

        if (clipdropResult.success) {
          setApiStatus("connected");
          addDebugLog("✅ API connection successful");
        } else {
          setApiStatus("failed");
          addDebugLog("❌ API connection failed");
        }
      } else {
        setApiStatus("failed");
        addDebugLog("❌ No API results found");
      }
    } catch (error) {
      setApiStatus("failed");
      addDebugLog(`❌ API test error: ${error}`);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
  };

  const showSuccess = (message: string) => {
    setToastMessage(message);
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  };

  const showError = (message: string) => {
    setToastMessage(message);
    setShowErrorToast(true);
    setTimeout(() => setShowErrorToast(false), 5000);
  };

  async function onSubmit(
    values: z.infer<ReturnType<typeof createFormSchema>>
  ) {
    setIsSubmitting(true);
    addDebugLog("📝 Submitting form with values: " + JSON.stringify(values));
    addDebugLog(
      "📸 Current image state: " +
        JSON.stringify(
          image
            ? {
                ...image,
                secureURL: image?.secureURL?.substring(0, 50) + "...",
              }
            : null
        )
    );
    addDebugLog(
      "⚙️ Transformation config: " + JSON.stringify(transformationConfig)
    );

    try {
      let imageToSave = image;

      // For text-to-image, generate the image first if it doesn't exist
      if (type === "texttoimage" && !image && values.prompt) {
        addDebugLog("🎨 Generating image from text prompt during save...");
        const response = await fetch("/api/clipdrop/text-to-image", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: values.prompt }),
        });

        const result = await response.json();

        if (result.success) {
          imageToSave = {
            publicId: result.publicId || `clipdrop-${Date.now()}`,
            secureURL: result.secureUrl || result.imageUrl,
            width: result.width || 1024,
            height: result.height || 1024,
            transformationURL: result.secureUrl || result.imageUrl,
          };
          addDebugLog("✅ Image generated successfully during save");
        } else {
          throw new Error(
            result.error || "Image generation failed during save"
          );
        }
      }

      if (data || imageToSave || (type === "texttoimage" && values.prompt)) {
        const baseOptions = {
          width: imageToSave?.width,
          height: imageToSave?.height,
          src: imageToSave?.publicId,
          ...transformationConfig,
        };

        let transformationUrl;

        // Handle different transformation types with specific options
        if (type === "recolor" && transformationConfig?.recolor) {
          const recolorOptions = {
            ...baseOptions,
            effects: [
              {
                recolor: {
                  prompt:
                    typeof transformationConfig.recolor === "object" &&
                    transformationConfig.recolor.prompt
                      ? transformationConfig.recolor.prompt
                      : "",
                  to:
                    typeof transformationConfig.recolor === "object" &&
                    transformationConfig.recolor.to
                      ? transformationConfig.recolor.to
                      : "#ffffff",
                },
                colorize: "100",
              },
            ],
          };
          transformationUrl = getCldImageUrl(recolorOptions);
          addDebugLog("🎨 Recolor transformation URL: " + transformationUrl);
        } else {
          // Fallback for unknown transformation types
          transformationUrl = getCldImageUrl(baseOptions);
          addDebugLog("⚙️ Generic transformation URL: " + transformationUrl);
        }

        const imageData: any = {
          title: values.title,
          publicId: imageToSave?.publicId,
          transformationType: type,
          width: imageToSave?.width,
          height: imageToSave?.height,
          secureUrl: imageToSave?.secureURL,
          transformationURL: transformationUrl,
          aspectRatio: values.aspectRatio,
          prompt: values.prompt,
          color: values.color,
        };

        addDebugLog(
          "📋 Image Data Before Adding: " + JSON.stringify(imageData)
        );

        // Set the appropriate config based on transformation type
        if (type === "texttoimage") {
          imageData.config = { textToImage: { enabled: true } };
        }
        if (type === "restore") {
          imageData.config = { restore: true };
        } else if (type === "removeBackground") {
          imageData.config = { removeBackground: true };
        } else if (type === "fill") {
          imageData.config = { fillBackground: true };
        } else if (type === "remove") {
          imageData.config = {
            remove: {
              prompt: values.prompt || "",
              removeShadow: true,
              multiple: true,
            },
          };
        } else if (type === "recolor") {
          imageData.config = {
            recolor: {
              prompt: values.prompt || "",
              to: values.color || "#ffffff",
              multiple: true,
            },
          };
        } else {
          // Fallback to transformationConfig if available
          imageData.config = transformationConfig || {};
        }

        addDebugLog("📋 Final Image Data: " + JSON.stringify(imageData));

        if (action === "Add") {
          try {
            addDebugLog("🚀 Starting addImage process...");
            const newImage = await addImage({
              image: imageData,
              userId,
              path: "/",
            });

            if (newImage) {
              addDebugLog("✅ Image added successfully");
              form.reset();
              // setImage(data); // Removed to keep generated image visible
              router.push("/");
            }
          } catch (error) {
            addDebugLog("❌ Error adding image: " + error);
            console.log(error);
          }
        }

        if (action === "Update") {
          try {
            addDebugLog("🚀 Starting updateImage process...");
            const updatedImage = await updateImage({
              image: {
                ...imageData,
                _id: data._id,
              },
              userId,
              path: `/transformations/${data._id}`,
            });

            if (updatedImage) {
              addDebugLog("✅ Image updated successfully");
              router.push("/");
            }
          } catch (error) {
            addDebugLog("❌ Error updating image: " + error);
            console.log(error);
          }
        }
      } else {
        addDebugLog("❌ No image data available for saving");
        showError("Please generate an image first or provide image data");
      }
    } catch (error) {
      addDebugLog("❌ Error in onSubmit: " + error);
      showError(
        error instanceof Error ? error.message : "Failed to save image"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const onSelectFieldHandler = (
    value: string,
    onChangeField: (value: string) => void
  ) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey];

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }));

    setNewTransformation(
      transformationType.config as unknown as Transformations
    );

    return onChangeField(value);
  };

  const onInputChangeHandler = (
    fieldName: string,
    value: string,
    type: string,
    onChangeField: (value: string) => void
  ) => {
    debounce(() => {
      setNewTransformation((prevState: any) => {
        const newState = {
          ...(prevState || {}),
          [type]: {
            ...(prevState?.[type] || {}),
            [fieldName === "prompt" ? "prompt" : "to"]:
              value || (fieldName === "prompt" ? "" : "#ffffff"),
            effect: "colorize",
          },
        };

        // Special handling for recolor transformations
        if (type === "recolor" && fieldName === "color") {
          newState[type].effect = "colorize";
        }

        return newState;
      });
    }, 1000)();

    return onChangeField(value);
  };

  const onTransformHandler = async () => {
    setIsTransforming(true);
    setTransformationProgress(0);
    addDebugLog("🔄 Starting transformation...");

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setTransformationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 300);

      if (type === "texttoimage") {
        if (form.getValues().prompt) {
          // Text-to-image generation from prompt
          addDebugLog("🎨 Generating image from text prompt...");
          const prompt = form.getValues().prompt!;

          const response = await fetch("/api/clipdrop/text-to-image", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt: prompt }),
          });

          const result = await response.json();

          if (result.success) {
            addDebugLog("✅ Image generated successfully");

            // Create a new image object with the generated image
            const newImage = {
              publicId: result.publicId || `clipdrop-${Date.now()}`,
              secureURL: result.secureUrl || result.imageUrl,
              width: result.width || 1024,
              height: result.height || 1024,
              transformationURL: result.secureUrl || result.imageUrl,
            };

            setImage(newImage);
            form.setValue("publicId", newImage.publicId);
            addDebugLog("📸 Image set in form");

            setTransformationConfig({ textToImage: { enabled: true } });
            showSuccess("Image generated successfully!");
          } else {
            addDebugLog(`❌ Generation failed: ${result.error}`);
            showError(result.error || "Image generation failed");
            throw new Error(result.error || "Image generation failed");
          }
        } else {
          addDebugLog("❌ No prompt provided for text-to-image");
          showError("Please enter a prompt to generate an image");
          throw new Error("Please enter a prompt to generate an image");
        }
      } else {
        // Other transformation types
        if (newTransformation) {
          setTransformationConfig(
            deepMergeObjects(newTransformation, transformationConfig || {})
          );
        } else {
          // Ensure transformationConfig is set from transformationType config
          // For simple transformations like restore, removeBackground, fill, we can use the default config
          // For remove and recolor, we need to ensure prompt/color values are included
          let configToSet =
            transformationType.config as unknown as Transformations;

          if (type === "remove" && form.getValues().prompt) {
            configToSet = {
              remove: {
                prompt: form.getValues().prompt || "",
                removeShadow: true,
                multiple: true,
              },
            };
          } else if (type === "recolor") {
            configToSet = {
              recolor: {
                prompt: form.getValues().prompt || "",
                to: form.getValues().color || "#ffffff",
                multiple: true,
              },
            };
          }

          setTransformationConfig(configToSet);

          // Set image state with current image and transformation URL if available
          if (image && transformationConfig) {
            setImage({
              ...image,
              transformationURL: getCldImageUrl({
                width: image.width,
                height: image.height,
                src: image.publicId,
                ...transformationConfig,
              }),
            });
          }
        }
      }

      setNewTransformation(null);
      setTransformationProgress(100); // Complete progress

      await updateCredits(userId, creditFee);
      addDebugLog("💳 Credits updated successfully");

      clearInterval(progressInterval);
    } catch (error) {
      console.error("Transform error:", error);
      addDebugLog("❌ Transform error: " + error);
      showError(
        error instanceof Error ? error.message : "Transformation failed"
      );

      if (debugMode) {
        setDebugLogs((prev) => [...prev, `❌ Error: ${error}`]);
      }
    } finally {
      setIsTransforming(false);
      setTransformationProgress(0);
    }
  };

  useEffect(() => {
    if (data && action === "Update") {
      setImage(data);
      setTransformationConfig(data.config);
      setNewTransformation(
        transformationType.config as unknown as Transformations
      );
    } else if (action === "Add") {
      // For new transformations, ensure transformationConfig is set from the start
      if (!transformationConfig && transformationType.config) {
        setTransformationConfig(
          transformationType.config as unknown as Transformations
        );
      }
    }
  }, [data, action, transformationType.config, transformationConfig]);

  useEffect(() => {
    if (image && transformationType.config) {
      setNewTransformation(
        transformationType.config as unknown as Transformations
      );
    }
  }, [image, transformationType.config, type]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        {showProModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
              <p className="text-gray-600 mb-4">
                Generative Fill requires at least 11 coins. Please buy credits
                to use this feature.
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => setShowProModal(false)}
                  variant="outline"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => router.push("/credits")}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Buy Credits
                </Button>
              </div>
            </div>
          </div>
        )}

        {isGenerativeFillLocked && (
         <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6 rounded-2xl shadow-lg text-center border border-gray-200">
  <div className="flex items-center justify-center mb-4">
    <h3 className="text-xl font-semibold text-gray-900">
      Oops! You’re out of credits
    </h3>
  </div>

  <p className="mb-2 text-sm text-gray-700">
    You need at least{" "}
    <span className="font-semibold text-blue-700">11 credits </span>  
    to unlock <span className="text-fuchsia-600 font-semibold">Generative Fill</span>.
  </p>

  <p className="mb-6 text-xs text-gray-500">
    Add more credits and continue creating without limits ✨
  </p>

  <Button
    type="button"
    onClick={() => router.push("/credits")}
    className="bg-gradient-to-r from-blue-800 to-fuchsia-500 text-white hover:from-blue-700 hover:to-fuchsia-600 font-semibold rounded-md px-6 py-2 shadow-md transition"
  >
    ⚡ Buy Credits
  </Button>
</div>
        )}

        {isTextToImageLocked && (
          <div className="bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 p-6 rounded-2xl shadow-lg text-center border border-gray-200">
  <div className="flex items-center justify-center mb-4">
    <h3 className="text-xl font-semibold text-gray-900">
      Oops! You’re out of credits
    </h3>
  </div>

  <p className="mb-2 text-sm text-gray-700">
    You need at least{" "}
    <span className="font-semibold text-blue-700">11 credits </span>  
    to unlock <span className="text-fuchsia-600 font-semibold">Text to Image</span>.
  </p>

  <p className="mb-6 text-xs text-gray-500">
    Add more credits and continue creating without limits ✨
  </p>

  <Button
    type="button"
    onClick={() => router.push("/credits")}
    className="bg-gradient-to-r from-blue-800 to-fuchsia-500 text-white hover:from-blue-700 hover:to-fuchsia-600 font-semibold rounded-md px-6 py-2 shadow-md transition"
  >
    ⚡ Buy Credits
  </Button>
</div>
        )}

        <CustomField
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" placeholder="Enter image title" />}
        />

        {showAspectRatio && (
  <CustomField
    control={form.control}
    name="aspectRatio"
    formLabel="Aspect Ratio"
    className="w-full"
    render={({ field }) => (
      <Select
        onValueChange={(value) =>
          onSelectFieldHandler(value, field.onChange)
        }
        defaultValue={field.value}
      >
        <SelectTrigger className="input-field w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-gray-700 shadow-md transition duration-200 cursor-pointer">
          <SelectValue placeholder="Select Aspect Ratio" />
        </SelectTrigger>

        <SelectContent className="z-50 mt-2 h-auto w-full rounded-lg border border-gray-200 bg-white shadow-xl animate-in fade-in-80 slide-in-from-top-2">
          {Object.entries(aspectRatioOptions).map(([key, option]) => (
            <SelectItem
              key={key}
              value={key}
              className="cursor-pointer px-6 py-4 rounded-md transition-colors"
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )}
  />
)}



        <div className="flex w-full gap-4">
  {showColorField && (
    <CustomField
      control={form.control}
      name="color"
      formLabel="Replacement Color"
      className="w-1/2"
      render={({ field }) => (
        <Input
          value={field.value}
          className="input-field w-full"
          placeholder="Enter the color you want to use"
          onChange={(e) =>
            onInputChangeHandler(
              "color",
              e.target.value,
              "recolor",
              field.onChange
            )
          }
        />
      )}
    />
  )}

  {type === "recolor" && (
    <CustomField
      control={form.control}
      name="prompt"
      formLabel="Object to Recolor"
      className="w-1/2"
      render={({ field }) => (
        <Input
          value={field.value}
          className="input-field w-full"
          placeholder="Enter the object you want to recolor..."
          onChange={(e) =>
            onInputChangeHandler(
              "prompt",
              e.target.value,
              "recolor",
              field.onChange
            )
          }
        />
      )}
    />
  )}
</div>


        {type === "remove" && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel="Object to Remove"
              className="w-full"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  placeholder="Enter the object you want to remove..."
                  onChange={(e) =>
                    onInputChangeHandler(
                      "prompt",
                      e.target.value,
                      "remove",
                      field.onChange
                    )
                  }
                />
              )}
            />
          </div>
        )}

        {type === "texttoimage" && (
          <div className="prompt-field">
            <CustomField
              control={form.control}
              name="prompt"
              formLabel="Image Prompt"
              className="w-full mt-[-30px]"
              render={({ field }) => (
                <Input
                  value={field.value}
                  className="input-field"
                  placeholder="Describe the image you want to generate..."
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        )}

        {type !== "texttoimage" ? (
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col flex-1">
              <CustomField
                control={form.control}
                name="publicId"
                className="flex size-full flex-col"
                render={({ field }) => (
                  <MediaUploader
                    onValueChange={field.onChange}
                    setImage={setImage}
                    publicId={field.value}
                    image={image}
                    type={type}
                  />
                )}
              />
            </div>
            <div className="flex flex-col flex-1">
              {isGenerativeFillLocked ? (
                <><label className="font-bold text-[30px] leading-[140%] text-gray-600 mb-4">
                Transformed
              </label>
                <div className="flex flex-col items-center justify-center h-[34vh] w-full rounded-[10px] border border-dashed bg-gray-100">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium">
                    Generative Fill is a Pro Feature
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Requires 11+ coins to use
                  </p>
                </div>
                </>
              ) : isTextToImageLocked ? (
                <>
                <div className="flex flex-col items-center justify-center h-[34vh] w-full rounded-[10px] border border-dashed bg-gray-100">
                  <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-gray-600 font-medium">
                    Text-to-Image is a Pro Feature
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Requires 11+ coins to use
                  </p>
                </div>
                </>
              ) : isTransforming ? (
                <div className="flex flex-col items-center justify-center h-[450px] w-full rounded-[10px] border border-dashed bg-purple-100/20">
                  <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
                  <p className="mt-2 text-sm text-gray-500">
                    Transforming your image...
                  </p>
                </div>
              ) : (
                <TransformedImage
                  image={image}
                  type={type}
                  title={form.getValues().title}
                  isTransforming={isTransforming}
                  setIsTransforming={setIsTransforming}
                  transformationConfig={transformationConfig || {}}
                />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <TransformedImage
              image={image}
              type={type}
              title={form.getValues().title}
              isTransforming={isTransforming}
              setIsTransforming={setIsTransforming}
              transformationConfig={transformationConfig || {}}
            />
          </div>
        )}
        {/* Removed extra closing div to fix unclosed form error */}
-        <div className="flex flex-col md:flex-row justify-center items-center gap-2">
          <Button
            type="button"
            className="md:w-1/2 w-full h-[35px] md:h-[45px] capitalize  bg-blue-800 text-white hover:bg-blue-800/90 cursor-pointer"
            disabled={
              isTransforming ||
              (type === "texttoimage" && !form.watch("prompt")) ||
              isGenerativeFillLocked ||
              isTextToImageLocked
            }
            onClick={onTransformHandler}
          >
            {isTransforming
              ? "Processing..."
              : type === "texttoimage"
              ? "Generate Image"
              : "Apply Transformation"}
          </Button>

          {!isGenerativeFillLocked && !isTextToImageLocked ? (
            <Button
            type="submit"
            className="md:w-1/2 w-full h-[35px] md:h-[45px] rounded-md bg-fuchsia-700 hover:bg-fuchsia-700/90 cursor-pointer capitalize text-white"
            disabled={
              isSubmitting ||
              (type === "texttoimage" && !form.watch("prompt")) ||
              (type !== "texttoimage" && !image) ||
              ((type === "remove" || type === "recolor") &&
                !form.watch("prompt")) ||
              isGenerativeFillLocked ||
              isTextToImageLocked
            }
          >
            {isSubmitting ? "Saving..." : "Save Image"}
          </Button>
          ): (
            <></>
          )
        }
          
        </div>
      </form>
    </Form>
  );
};

export default TransformationForm;
