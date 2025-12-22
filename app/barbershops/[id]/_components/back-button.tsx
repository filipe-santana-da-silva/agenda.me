"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      className="absolute top-4 left-4 z-20 rounded-full"
      size="icon"
      variant="outline"
    >
      <ArrowLeft className="size-4" />
    </Button>
  );
};

export default BackButton;
