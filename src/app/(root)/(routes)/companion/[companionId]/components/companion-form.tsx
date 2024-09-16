//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\app\(root)\(routes)\companion\[companionId]\components\companion-form.tsx

"use client";

import axios from "axios";
import * as z from "zod";
import { Companion, Category } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImageUpload } from "@/components/image-upload";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@components/ui/form";
import { Separator } from "@components/ui/separator";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@components/ui/select";
import { useToast } from "@components/ui/use-toast";
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
});

export const CompanionForm = ({ initialData, categories }: CompanionFormProps) => {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData ? {
            name: initialData.name,
            shortDescription: initialData.shortDescription || "",
            physicalAppearance: (initialData.characterDescription as any)?.physicalAppearance || "",
            identity: (initialData.characterDescription as any)?.identity || "",
            interactionStyle: (initialData.characterDescription as any)?.interactionStyle || "",
            categoryId: initialData.categoryId,
            src: initialData.src,
        } : {
            name: "",
            shortDescription: "",
            physicalAppearance: "",
            identity: "",
            interactionStyle: "",
            categoryId: "",
            src: "",
        },
    });

    const isLoading = form.formState.isSubmitting;

    useEffect(() => {
        if (initialData) {
            console.log("Setting form values with initialData:", initialData);
            form.reset({
                name: initialData.name,
                shortDescription: initialData.shortDescription || "",
                physicalAppearance: (initialData.characterDescription as any)?.physicalAppearance || "",
                identity: (initialData.characterDescription as any)?.identity || "",
                interactionStyle: (initialData.characterDescription as any)?.interactionStyle || "",
                categoryId: initialData.categoryId,
                src: initialData.src,
            });
        }
    }, [initialData, form]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            console.log("Form submitted with values:", values);

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
            };

            console.log("Payload prepared:", payload);

            if (initialData) {
                console.log("Updating existing companion:", initialData.id);
                await axios.patch(`/api/companion/${initialData.id}`, payload);
            } else {
                console.log("Creating new companion");
                await axios.post("/api/companion", payload);
            }

            console.log("Companion saved successfully");
            toast({ description: "Success." });
            router.refresh();
            router.push("/");
        } catch (error) {
            console.error("Error creating/updating companion:", error);
            toast({ variant: "destructive", description: "Something went wrong" });
        }
    };

    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                    <div className="space-y-2 w-full">
                        <h3 className="text-lg font-medium">General Information</h3>
                        <p className="text-sm text-muted-foreground">General information about your Companion</p>
                        <Separator className="bg-primary/10" />
                    </div>
                    <FormField
                        name="src"
                        render={({ field }) => (
                            <FormItem className="col-span-2 flex flex-col items-center justify-center space-y-4">
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
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2"></div>
                    <FormField
                        name="name"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading} placeholder="Character Name" {...field} />
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
                                    <Input disabled={isLoading} placeholder="Short description that does not dictate personality" {...field} />
                                </FormControl>
                                <FormDescription>A brief one-line description of your companion.</FormDescription>
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
                                    <Textarea rows={4} disabled={isLoading} placeholder="Describe physical appearance..." {...field} />
                                </FormControl>
                                <FormDescription>Describe how your AI Companion looks.</FormDescription>
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
                                    <Textarea rows={4} disabled={isLoading} placeholder="Describe the identity..." {...field} />
                                </FormControl>
                                <FormDescription>Provide a backstory and details about who your AI Companion is.</FormDescription>
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
                                    <Textarea rows={4} disabled={isLoading} placeholder="Describe interaction style..." {...field} />
                                </FormControl>
                                <FormDescription>Describe how your AI Companion interacts with the user.</FormDescription>
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
                                <Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
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
                                <FormDescription>Select a category for your AI.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="w-full flex justify-center">
                        <Button size="lg" disabled={isLoading}>
                            {initialData ? "Edit your companion" : "Create your companion"}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};