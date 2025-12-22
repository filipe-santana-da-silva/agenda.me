"use client";

import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { PageSectionScroller } from "./ui/page";
import { Scissors, Sparkles, User, Eye, Footprints, Waves } from "lucide-react";
import { Input } from "./ui/input";
import { SearchIcon } from "lucide-react";

const QuickSearch = () => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchValue.trim()) return;
    router.push(`/barbershops?search=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <>
      {/* Barra de busca */}
      <form onSubmit={handleSearch} className="flex items-center w-full gap-2">
        <Input
          className="w-full flex-4 border-border rounded-full text-sm h-10"
          placeholder="Pesquisar"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <button
          type="submit"
          className=" flex-1 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center flex-shrink-0"
        >
          <SearchIcon className="size-5" />
        </button>
      </form>

      {/* Links rápidos */}
      <PageSectionScroller>
        <div
          className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
        >
          <Scissors className="size-4" />
          <span className="text-card-foreground text-sm font-medium">
            Cabelo
          </span>
        </div>

        <div
          className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
        >
          <User className="size-4" />
          <span className="text-card-foreground text-sm font-medium">
            Barba
          </span>
        </div>

        <div
          className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
        >
          <Sparkles className="size-4" />
          <span className="text-card-foreground text-sm font-medium">
            Acabamento
          </span>
        </div>

        <div
          className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
        >
          <Eye className="size-4" />
          <span className="text-card-foreground text-sm font-medium">
            Sobrancelha
          </span>
        </div>

        <div
          className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
        >
          <Footprints className="size-4" />
          <span className="text-card-foreground text-sm font-medium">
            Pézinho
          </span>
        </div>

        <div
          className="border-border bg-card-background flex shrink-0 items-center justify-center gap-3 rounded-3xl border px-4 py-2"
        >
          <Waves className="size-4" />
          <span className="text-card-foreground text-sm font-medium">
            Progressiva
          </span>
        </div>
      </PageSectionScroller>
    </>
  );
};

export default QuickSearch;
