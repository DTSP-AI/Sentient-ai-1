//C:\AI_src\Companion_UI\SaaS-AI-Companion\src\components\mobile-sidebar.tsx

import { Menu } from "lucide-react";
import {Sheet, SheetContent, SheetTrigger} from "@components/ui/sheet";
import { Sidebar } from "./sidebar";

export const MobileSidebar = ({
    isPro
}: {
    isPro: boolean;
}) => {
    return (
        <Sheet>
            <SheetTrigger className="md:hidden pr-4">
                <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-secondary pt-10 w-full max-w-xs">
                <Sidebar isPro={isPro} />
            </SheetContent>
        </Sheet>
    )
}