//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\components\pro-modal.tsx

"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog";
import { useProModal } from "@hooks/use-pro-modal";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";
import { useToast } from "@components/ui/use-toast";

// Placeholder domain - replace with your actual domain(s) when ready
const ALLOWED_DOMAINS = ["localhost"];

export const ProModal = () => {
  const proModal = useProModal();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isValidUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      // Check if the hostname of the URL is in the allowed domains list
      return ALLOWED_DOMAINS.includes(parsedUrl.hostname);
    } catch (error) {
      return false;
    }
  };

  const onSubscribe = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/stripe");
      const redirectUrl = response.data.url;

      // Validate the URL before redirecting
      if (isValidUrl(redirectUrl)) {
        window.location.href = redirectUrl;
      } else {
        throw new Error("Invalid redirect URL");
      }
    } catch (error) {
      toast({
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) {
    return null;
  }

  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader className="space-y-4">
          <DialogTitle className="text-center">Upgrade to Pro</DialogTitle>
          <DialogDescription className="text-center space-y-2">
            Create
            <span className="text-sky-500 mx-1 font-medium">Custom AI</span>
            Companions!
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="flex justify-between items-center">
          <p className="text-2xl font-medium">
            $9<span className="text-sm font-normal">.99 / mo</span>
          </p>
          <Button onClick={onSubscribe} disabled={loading} variant="premium">
            {loading ? "Subscribing..." : "Subscribe"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
