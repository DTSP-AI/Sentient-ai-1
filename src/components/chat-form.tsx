//src\components\chat-form.tsx

"use client";

import { ChangeEvent, FormEvent } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { SendHorizonal } from "lucide-react";

interface ChatFormProps {
  input: string;
  inputRef: React.RefObject<HTMLInputElement>; // Accept the inputRef
  handleInputChange: (e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
}

export const ChatForm = ({
  input,
  inputRef, // Use the inputRef
  handleInputChange,
  onSubmit,
  isLoading
}: ChatFormProps) => {
  return (
    <form onSubmit={onSubmit} className="border-t border-primary/10 w-full px-6 md:px-20 py-6 flex items-center gap-x-2"> {/* Adjusted padding */}
      <Input 
        disabled={isLoading}
        value={input}
        onChange={handleInputChange}
        placeholder="Type a message"
        className="rounded-lg bg-primary/10"
        ref={inputRef} // Pass the ref to Input
      />
      <Button type="submit" disabled={isLoading} variant="ghost">
        <SendHorizonal className="h-6 w-6" />
      </Button>
    </form>
  );
};
