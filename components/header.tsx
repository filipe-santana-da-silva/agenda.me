import { CalendarPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "./ui/button";
import MenuSheet from "./menu-sheet";

interface HeaderProps {
  homeLink?: string;
  userName?: string;
}

const Header = ({ homeLink = "/", userName }: HeaderProps) => {
  return (
    <header className="bg-background flex items-center justify-between px-5 py-6">
      <Link href={homeLink}>
        <Image src="/logo.svg" alt="Aparatus" width={91} height={24} />
      </Link>
      <div className="flex items-center gap-4">
        {userName && (
          <div className="text-sm font-medium text-muted-foreground">
            Bem-vindo, <span className="font-semibold text-foreground">{userName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link href="/chat">
            <Button variant="outline" size="icon">
              <CalendarPlus className="size-5" />
            </Button>
          </Link>
          <MenuSheet />
        </div>
      </div>
    </header>
  );
};

export default Header;
