"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { aspectRatioOptions, creditFee, defaultValues, transformationTypes } from "@/constants"
import { CustomField } from "./CustomField"
import { useEffect, useState, useTransition } from "react"
import { AspectRatioKey, debounce, deepMergeObjects } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { getCldImageUrl } from "next-cloudinary"
import TransformedImage from "./TransformedImage"
import MediaUploader from "./MediaUploader"
import { addImage, updateImage, cartoonifyImage, testCartoonifyAPI } from "@/lib/actions/image.actions"
import { updateCredits } from "@/lib/actions/user.actions"
import { InsufficientCreditsModal } from "./InsufficientCreditsModal"
import { Loader2, Bug, Wifi, WifiOff } from "lucide-react"

// Type definitions
type Transformations = {
  [key: string]: {
    prompt?: string;
    to?: string;
    [key: string]: any;
  } | boolean;
};

type TransformationFormProps = {
  action: 'Add' | 'Update';
  data?: any;
  userId: string;
  type: string;
  creditBalance: number;
  config?: Transformations | null;
};

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be 100 characters or less"),
  aspectRatio: z.string().optional(),
  color: z.string().optional(),
  prompt: z.string().optional(),
  publicId: z.string().min(1, "Image is required"),
})

const TransformationForm = ({ 
  action, 
  data = null, 
  userId, 
  type, 
  creditBalance, 
  config = null 
}: TransformationFormProps) => {
  const transformationType = transformationTypes[type as keyof typeof transformationTypes];
  const [image, setImage] = useState(data)
  const [newTransformation, setNewTransformation] = useState<Transformations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformationConfig, setTransformationConfig] = useState<Transformations | null>(config)
  const [isPending, startTransition] = useTransition()
  const [showProModal, setShowProModal] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'failed'>('unknown');
  const [isTestingAPI, setIsTestingAPI] = useState(false);
  const router = useRouter()
  
  // Check if generative fill is locked (less than 11 coins)
  const isGenerativeFillLocked = type === 'fill' && creditBalance < 11;

  const initialValues = data && action === 'Update' ? {
    title: data?.title,
    aspectRatio: data?.aspectRatio,
    color: data?.color,
    prompt: data?.prompt,
    publicId: data?.publicId,
  } : defaultValues

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialValues,
  })

  // Test API connection when debug mode is enabled
  useEffect(() => {
    if (debugMode && type === 'cartoonify') {
      testAPIConnection();
    }
  }, [debugMode, type]);

  const testAPIConnection = async () => {
    if (type !== 'cartoonify') return;
    
    setIsTestingAPI(true);
    addDebugLog('🔍 Testing cartoonify API connection...');
    
    try {
      const result = await testCartoonifyAPI(true);
      addDebugLog(`📊 API Status: ${result.status} - ${result.statusText}`);
      
      if (result.success) {
        setApiStatus('connected');
        addDebugLog('✅ API connection successful');
      } else {
        setApiStatus('failed');
        addDebugLog('❌ API connection failed');
      }
    } catch (error) {
      setApiStatus('failed');
      addDebugLog(`❌ API test error: ${error}`);
    } finally {
      setIsTestingAPI(false);
    }
  };

  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    addDebugLog('📝 Submitting form with values: ' + JSON.stringify(values));
    addDebugLog('📸 Current image state: ' + JSON.stringify(image ? { ...image, secureURL: image?.secureURL?.substring(0, 50) + '...' } : null));
    addDebugLog('⚙️ Transformation config: ' + JSON.stringify(transformationConfig));

    if(data || image) {
      const baseOptions = {
        width: image?.width,
        height: image?.height,
        src: image?.publicId,
        ...transformationConfig
      };

      let transformationUrl;
      if (type === 'recolor' && transformationConfig?.recolor) {
        const recolorOptions = {
          ...baseOptions,
          effects: [{
            recolor: {
              prompt: typeof transformationConfig.recolor === 'object' && transformationConfig.recolor.prompt ? transformationConfig.recolor.prompt : '',
              to: typeof transformationConfig.recolor === 'object' && transformationConfig.recolor.to ? transformationConfig.recolor.to : '#ffffff'
            },
            colorize: '100'
          }]
        };
        transformationUrl = getCldImageUrl(recolorOptions);
        addDebugLog('🎨 Recolor transformation URL: ' + transformationUrl);
      } else {
        transformationUrl = getCldImageUrl(baseOptions);
      }

      const imageData: any = {
        title: values.title,
        publicId: image?.publicId,
        transformationType: type,
        width: image?.width,
        height: image?.height,
        secureUrl: image?.secureURL,
        transformationURL: transformationUrl,
        aspectRatio: values.aspectRatio,
        prompt: values.prompt,
        color: values.color,
      };

      addDebugLog("📋 Image Data Before Adding: " + JSON.stringify(imageData));

      if (type === 'cartoonify') {
        imageData.config = { cartoonify: { enabled: true } };
      }

      addDebugLog("📋 Final Image Data: " + JSON.stringify(imageData));

      if(action === 'Add') {
        try {
          addDebugLog('🚀 Starting addImage process...');
          const newImage = await addImage({
            image: imageData,
            userId,
            path: '/'
          })

          if(newImage) {
            addDebugLog('✅ Image added successfully');
            form.reset()
            setImage(data)
            router.push('/')
          }
        } catch (error) {
          addDebugLog('❌ Error adding image: ' + error);
          console.log(error);
        }
      }

      if(action === 'Update') {
        try {
          addDebugLog('🚀 Starting updateImage process...');
          const updatedImage = await updateImage({
            image: {
              ...imageData,
              _id: data._id
            },
            userId,
            path: `/transformations/${data._id}`
          })

          if(updatedImage) {
            addDebugLog('✅ Image updated successfully');
            router.push('/')
          }
        } catch (error) {
          addDebugLog('❌ Error updating image: ' + error);
          console.log(error);
        }
      }
    }

    setIsSubmitting(false)
  }

  const onSelectFieldHandler = (value: string, onChangeField: (value: string) => void) => {
    const imageSize = aspectRatioOptions[value as AspectRatioKey]

    setImage((prevState: any) => ({
      ...prevState,
      aspectRatio: imageSize.aspectRatio,
      width: imageSize.width,
      height: imageSize.height,
    }))

    setNewTransformation(transformationType.config as unknown as Transformations);

    return onChangeField(value)
  }

  const onInputChangeHandler = (fieldName: string, value: string, type: string, onChangeField: (value: string) => void) => {
    debounce(() => {
      setNewTransformation((prevState: any) => {
        const newState = {
          ...(prevState || {}),
          [type]: {
            ...(prevState?.[type] || {}),
            [fieldName === 'prompt' ? 'prompt' : 'to']: value || (fieldName === 'prompt' ? '' : '#ffffff'),
            effect: 'colorize'
          }
        };
        
        // Special handling for recolor transformations
        if (type === 'recolor' && fieldName === 'color') {
          newState[type].effect = 'colorize';
        }
        
        return newState;
      });
    }, 1000)();
      
    return onChangeField(value);
  }

  const onTransformHandler = async () => {
    setIsTransforming(true);
    addDebugLog('🔄 Starting transformation...');
    
    try {
      if (type === 'cartoonify' && image?.secureURL) {
        addDebugLog('🎨 Processing cartoonify transformation...');
        addDebugLog('📸 Original image URL: ' + image.secureURL);

        const cartoonifiedUrl = await cartoonifyImage(image.secureURL, debugMode);
        
        addDebugLog('✅ Cartoonify transformation complete');
        addDebugLog('🌐 New cartoonified URL: ' + cartoonifiedUrl);

        // Update image with cartoonified version
        setImage((prev: any) => ({
          ...prev,
          secureURL: cartoonifiedUrl,
          transformationURL: cartoonifiedUrl
        }));

        setTransformationConfig({ cartoonify: { enabled: true } });
      } else if (newTransformation) {
        setTransformationConfig(
          deepMergeObjects(newTransformation, transformationConfig || {})
        )
      }

      setNewTransformation(null)

      await updateCredits(userId, creditFee)
      addDebugLog('💳 Credits updated successfully');
    } catch (error) {
      console.error('Transform error:', error);
      addDebugLog('❌ Transform error: ' + error);
      if (debugMode) {
        setDebugLogs(prev => [...prev, `❌ Error: ${error}`]);
      }
    } finally {
      setIsTransforming(false);
    }
  }

  useEffect(() => {
    if (data && action === 'Update') {
      setImage(data);
      setTransformationConfig(data.config);
      setNewTransformation(transformationType.config as unknown as Transformations);
    }
  }, [data, action, transformationType.config]);

  useEffect(() => {
    if(image && (type === 'restore' || type === 'removeBackground' || type === 'cartoonify')) {
      setNewTransformation(transformationType.config as unknown as Transformations)
    }
  }, [image, transformationType.config, type])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {creditBalance < Math.abs(creditFee) && <InsufficientCreditsModal />}
        {showProModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-2">Pro Feature</h3>
              <p className="text-gray-600 mb-4">
                Generative Fill requires at least 11 coins. Please buy credits to use this feature.
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
                  onClick={() => router.push('/credits')}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  Buy Credits
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {isGenerativeFillLocked && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-8 h-8 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <h3 className="text-xl font-bold">Generative Fill <span className="ml-2 text-sm bg-white text-purple-600 px-2 py-1 rounded">Pro</span></h3>
            </div>
            <p className="mb-4">Generative Fill requires at least 11 coins</p>
            <Button 
              type="button"
              onClick={() => router.push('/credits')}
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              Buy Credits
            </Button>
          </div>
        )}
        
        <CustomField 
          control={form.control}
          name="title"
          formLabel="Image Title"
          className="w-full"
          render={({ field }) => <Input {...field} className="input-field" />}
        />

        {type === 'fill' && (
          <CustomField
            control={form.control}
            name="aspectRatio"
            formLabel="Aspect Ratio"
            className="w-full"
            render={({ field }) => (
              <Select
                onValueChange={(value) => onSelectFieldHandler(value, field.onChange)}
                value={field.value}
                disabled={isGenerativeFillLocked}
              >
                <SelectTrigger className="select-field bg-white">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(aspectRatioOptions).map((key) => (
                    <SelectItem key={key} value={key} className="select-item">
                      {aspectRatioOptions[key as AspectRatioKey].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}  
          />
        )}

        {(type === 'remove' || type === 'recolor') && (
          <div className="prompt-field">
            <CustomField 
              control={form.control}
              name="prompt"
              formLabel={
                type === 'remove' ? 'Object to remove' : 'Object to recolor'
              }
              className="w-full"
              render={({ field }) => (
                <Input 
                  value={field.value}
                  className="input-field"
                  onChange={(e) => onInputChangeHandler(
                    'prompt',
                    e.target.value,
                    type,
                    field.onChange
                  )}
                />
              )}
            />

            {type === 'recolor' && (
              <CustomField 
                control={form.control}
                name="color"
                formLabel="Replacement Color"
                className="w-full"
                render={({ field }) => (
                  <Input 
                    value={field.value}
                    className="input-field"
                    onChange={(e) => onInputChangeHandler(
                      'color',
                      e.target.value,
                      'recolor',
                      field.onChange
                    )}
                  />
                )}
              />
            )}
          </div>
        )}

        <div className="media-uploader-field">
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

          {isGenerativeFillLocked ? (
            <div className="flex flex-col items-center justify-center h-[450px] w-full rounded-[10px] border border-dashed bg-gray-100">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <p className="text-gray-600 font-medium">Generative Fill is a Pro Feature</p>
              <p className="text-sm text-gray-500 mt-1">Requires 11+ coins to use</p>
            </div>
          ) : isTransforming ? (
            <div className="flex flex-col items-center justify-center h-[450px] w-full rounded-[10px] border border-dashed bg-purple-100/20">
              <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
              <p className="mt-2 text-sm text-gray-500">Transforming your image...</p>
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
        {/* Removed extra closing div to fix unclosed form error */}
        <div className="flex flex-col gap-4">
          {type === 'cartoonify' && (
            <div className="flex items-center gap-2">
              <Button 
                type="button"
                variant={debugMode ? "destructive" : "outline"}
                onClick={() => setDebugMode(!debugMode)}
                className="text-sm flex items-center gap-2"
              >
                <Bug className="w-4 h-4" />
                {debugMode ? 'Disable Debug' : 'Enable Debug'}
              </Button>
              
              {debugMode && (
                <Button 
                  type="button"
                  variant="outline"
                  onClick={testAPIConnection}
                  disabled={isTestingAPI}
                  className="text-sm flex items-center gap-2"
                >
                  {isTestingAPI ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : apiStatus === 'connected' ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : apiStatus === 'failed' ? (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  ) : null}
                  Test API
                </Button>
              )}
              
              {debugMode && (
                <span className={`text-xs px-2 py-1 rounded ${
                  apiStatus === 'connected' ? 'bg-green-100 text-green-800' :
                  apiStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  API: {apiStatus}
                </span>
              )}
            </div>
          )}
          
          <Button 
            type="button"
            className="submit-button capitalize"
            disabled={isTransforming || !newTransformation || isGenerativeFillLocked}
            onClick={onTransformHandler}
          >
            {isTransforming ? 'Transforming...' : 'Apply Transformation'}
          </Button>
          <Button 
            type="submit"
            className="submit-button capitalize"
            disabled={isSubmitting || isGenerativeFillLocked}
          >
            {isSubmitting ? 'Submitting...' : 'Save Image'}
          </Button>
        </div>

        {debugMode && debugLogs.length > 0 && (
          <div className="bg-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Debug Logs:
            </h4>
            <div className="text-xs font-mono space-y-1">
              {debugLogs.map((log, index) => (
                <div key={index} className="p-1 bg-white rounded text-xs">
                  {log}
                </div>
              ))}
            </div>
            <Button 
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDebugLogs([])}
              className="mt-2 text-xs"
            >
              Clear Logs
            </Button>
          </div>
        )}
      </form>
    </Form>
  )
}

export default TransformationForm
