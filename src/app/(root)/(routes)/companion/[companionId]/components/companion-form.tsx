// Path: src/app/(root)/(routes)/companion/[companionId]/components/companion-form.tsx

"use client";

import axios from "axios";
import * as z from "zod";
import { Companion, Category } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "@/components/image-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface CompanionFormProps {
  initialData: Companion | null;
  categories: Category[];
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  shortDescription: z.string().min(1, { message: "Short Description is required." }),
  physicalAppearance: z.string().min(1, { message: "Physical Appearance is required." }),
  identity: z.string().min(1, { message: "Identity description is required." }),
  interactionStyle: z.string().min(1, { message: "Interaction style is required." }),
  src: z.string().min(1, { message: "Image is required." }),
  categoryId: z.string().min(1, { message: "Category is required." }),
  humor: z.number().min(0).max(5),
  empathy: z.number().min(0).max(5),
  assertiveness: z.number().min(0).max(5),
  sarcasm: z.number().min(0).max(5),
  hateModeration: z.number().min(0).max(5),
  harassmentModeration: z.number().min(0).max(5),
  violenceModeration: z.number().min(0).max(5),
  selfHarmModeration: z.number().min(0).max(5),
  sexualModeration: z.number().min(0).max(5),
});

export const CompanionForm = ({ initialData, categories }: CompanionFormProps) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          shortDescription: initialData.shortDescription || "",
          physicalAppearance: (initialData.characterDescription as any)?.physicalAppearance || "",
          identity: (initialData.characterDescription as any)?.identity || "",
          interactionStyle: (initialData.characterDescription as any)?.interactionStyle || "",
          categoryId: initialData.categoryId,
          src: initialData.src,
          humor: initialData.humor,
          empathy: initialData.empathy,
          assertiveness: initialData.assertiveness,
          sarcasm: initialData.sarcasm,
          hateModeration: initialData.hateModeration,
          harassmentModeration: initialData.harassmentModeration,
          violenceModeration: initialData.violenceModeration,
          selfHarmModeration: initialData.selfHarmModeration,
          sexualModeration: initialData.sexualModeration,
        }
      : {
          name: "",
          shortDescription: "",
          physicalAppearance: "",
          identity: "",
          interactionStyle: "",
          categoryId: "",
          src: "",
          humor: 3,
          empathy: 3,
          assertiveness: 3,
          sarcasm: 3,
          hateModeration: 3,
          harassmentModeration: 3,
          violenceModeration: 3,
          selfHarmModeration: 3,
          sexualModeration: 3,
        },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (initialData) {
      console.log("🔄 Resetting form with initial data");
      form.reset({
        name: initialData.name,
        shortDescription: initialData.shortDescription || "",
        physicalAppearance: (initialData.characterDescription as any)?.physicalAppearance || "",
        identity: (initialData.characterDescription as any)?.identity || "",
        interactionStyle: (initialData.characterDescription as any)?.interactionStyle || "",
        categoryId: initialData.categoryId,
        src: initialData.src,
        humor: initialData.humor,
        empathy: initialData.empathy,
        assertiveness: initialData.assertiveness,
        sarcasm: initialData.sarcasm,
        hateModeration: initialData.hateModeration,
        harassmentModeration: initialData.harassmentModeration,
        violenceModeration: initialData.violenceModeration,
        selfHarmModeration: initialData.selfHarmModeration,
        sexualModeration: initialData.sexualModeration,
      });
    }
  }, [initialData, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      console.log("🚀 Submitting form with values:", values);

      const characterDescription = {
        physicalAppearance: values.physicalAppearance,
        identity: values.identity,
        interactionStyle: values.interactionStyle,
      };

      const payload = {
        name: values.name,
        shortDescription: values.shortDescription,
        characterDescription,
        categoryId: values.categoryId,
        src: values.src,
        humor: values.humor,
        empathy: values.empathy,
        assertiveness: values.assertiveness,
        sarcasm: values.sarcasm,
        hateModeration: values.hateModeration,
        harassmentModeration: values.harassmentModeration,
        violenceModeration: values.violenceModeration,
        selfHarmModeration: values.selfHarmModeration,
        sexualModeration: values.sexualModeration,
      };

      console.log("📦 Payload prepared:", payload);

      if (initialData) {
        console.log(`✏️ Updating companion with ID: ${initialData.id}`);
        await axios.patch(`/api/companion/${initialData.id}`, payload);
        console.log("✅ Update successful");
      } else {
        console.log("🆕 Creating new companion");
        await axios.post("/api/companion", payload);
        console.log("✅ Creation successful");
      }

      toast({ description: "Success." });
      router.refresh();
      router.push("/");
    } catch (error) {
      console.error("❌ Error during submission:", error);
      toast({ variant: "destructive", description: "Something went wrong" });
    }
  };

  return (
    <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
          <div className="space-y-2 w-full">
            <h3 className="text-lg font-medium">General Information</h3>
            <p className="text-sm text-muted-foreground">
              General information about your Companion
            </p>
            <Separator className="bg-primary/10" />
          </div>
          <FormField
            name="src"
            render={({ field }) => (
              <FormItem className="flex flex-col items-center justify-center space-y-4">
                <FormControl>
                  <ImageUpload
                    disabled={isLoading}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="name"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Character Name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="shortDescription"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="Short description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="physicalAppearance"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Physical Appearance</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    disabled={isLoading}
                    placeholder="Describe physical appearance..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe how your AI Companion looks.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="identity"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Who am I?</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    disabled={isLoading}
                    placeholder="Describe the identity..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a backstory and details about who your AI Companion is.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="interactionStyle"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>How do I interact with the User?</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    disabled={isLoading}
                    placeholder="Describe interaction style..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Describe how your AI Companion interacts with the user.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="categoryId"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  disabled={isLoading}
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select a category for your AI.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Advanced Settings */}
          <div className="space-y-2 w-full">
            <h3 className="text-lg font-medium">Advanced Settings</h3>
            <p className="text-sm text-muted-foreground">
              Define the personality traits and moderation sensitivity for your
              companion
            </p>
            <Separator className="bg-primary/10" />
          </div>
          {/* Trait Scales */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Trait Scales</h4>
            {["humor", "empathy", "assertiveness", "sarcasm"].map((trait) => (
              <FormField
                key={trait}
                name={trait as "humor" | "empathy" | "assertiveness" | "sarcasm"}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{trait.charAt(0).toUpperCase() + trait.slice(1)}</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder={`Select ${trait} level`} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(6)].map((_, index) => (
                          <SelectItem key={index} value={String(index)}>
                            {index}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {/* Moderation Metrics */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Moderation Sensitivity</h4>
            {[
              "hateModeration",
              "harassmentModeration",
              "violenceModeration",
              "selfHarmModeration",
              "sexualModeration"
            ].map((metric) => (
              <FormField
                key={metric}
                name={metric as "hateModeration" | "harassmentModeration" | "violenceModeration" | "selfHarmModeration" | "sexualModeration"}
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{metric.replace("Moderation", "")}</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background">
                          <SelectValue placeholder="Select moderation level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...Array(6)].map((_, index) => (
                          <SelectItem key={index} value={String(index)}>
                            {index}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          {/* Submit Button */}
          <div className="w-full flex justify-center">
            <Button size="lg" type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};