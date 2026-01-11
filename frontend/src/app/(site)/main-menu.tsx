"use client";

import { NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger } from "@/components/ui/navigation-menu";
import { TMenuLink } from "@/types";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface MenuLinkProps {
    id: number;
    __component: string;
    title: string;
    url: string;
}

export interface TSection {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    heading: string;
    links: TMenuLink[];
}

export interface DropdownMenuProps {
    id: number;
    __component: string;
    title: string;
    sections: TSection[];
}

export type IMainMenuItems = MenuLinkProps | DropdownMenuProps;

function MenuLink({ data}: { data: MenuLinkProps}) {
    const pathname = usePathname();

    if (!data) return null;

    const { title, url } = data;

    // Defensive guard: ensure required properties exist
    if (!url || !title) return null;

    const isActive = pathname === url;

    return (
        <NavigationMenuLink asChild>
            <Link
                href={url}
                className={cn(
                    "text-md font-normal transition-colors px-4 py-2",
                    isActive
                        ? "text-brand-red font-bold underline underline-offset-3"
                        : "text-brand-red hover:underline hover:underline-offset-3 hover:text-brand-red/70"
                )}
            >
                {title}
            </Link>
        </NavigationMenuLink>
    )
}
function Dropdown({ data}: { data: DropdownMenuProps }) {
    const pathname = usePathname();

    if (!data) return null;

    const { title, sections } = data;
    if (!sections || sections.length === 0) return null;

    // Check if any sub-link is active
    const isSubLinkActive = sections.some((section) =>
        section.links?.some((link) => pathname === link.url)
    );

    return (
        <>
            <NavigationMenuTrigger
                className={cn(
                    "text-md font-normal transition-colors bg-transparent! data-[state=open]:bg-transparent! rounded-md",
                    isSubLinkActive
                        ? "bg-brand-yellow/20 text-brand-red font-semibold hover:text-brand-red/70"
                        : "text-brand-red hover:bg-brand-yellow/10 hover:text-brand-red/70"
                )}
            >
                {title}
            </NavigationMenuTrigger>
            <NavigationMenuContent>
                <div className="min-w-70 rounded-md bg-white p-4">
                    {sections.map((section) => (
                        <div key={section.id} className="mb-2 last:mb-0">
                            {section.heading && (
                                <h3 className="px-2 py-2 text-xs font-semibold text-black uppercase tracking-wider">
                                    {section.heading}
                                </h3>
                            )}
                            {section.links && section.links.length > 0 && (
                                <ul className="flex flex-col gap-1">
                                    {section.links.map((link) => {
                                        // Defensive guard: ensure link has required properties
                                        if (!link?.url || !link?.title) return null;

                                        const isLinkActive = pathname === link.url;
                                        return (
                                            <li key={link.id}>
                                                <NavigationMenuLink asChild>
                                                    <Link
                                                        href={link.url}
                                                        className={cn(
                                                            "flex items-start gap-3 px-4 py-2.5 rounded-md transition-colors",
                                                            isLinkActive
                                                                ? "bg-brand-yellow/20 text-brand-red font-semibold"
                                                                : "text-brand-red hover:bg-brand-yellow/10 hover:text-brand-red/70"
                                                        )}
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-md font-normal">
                                                                {link.title}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </NavigationMenuLink>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>
            </NavigationMenuContent>
        </>
    )
}

function mainMenuRenderer(MainMenuItem: IMainMenuItems, index: number) {
    switch (MainMenuItem.__component) {
        case "menu.menu-link":
            return <MenuLink key={index} data={MainMenuItem as MenuLinkProps} />;
        case "menu.dropdown":
            return <Dropdown key={index} data={MainMenuItem as DropdownMenuProps} />;
        default:
            return null;
    }
}

export function MainMenu({ data }: { data: IMainMenuItems[]}) {
    if (!data || data.length === 0) return null;
    
    return (
        <>
            {data.map((item, index) => (
                <NavigationMenuItem key={item.id}>
                    {mainMenuRenderer(item, index)}
                </NavigationMenuItem>
            ))}
        </>
    )
}
