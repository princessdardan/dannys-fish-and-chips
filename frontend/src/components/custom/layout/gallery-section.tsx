"use client"

import { IGallerySectionProps, TImage } from "@/types";
import { StrapiImage } from "../../ui/strapi-image";
import { Carousel } from "motion-plus/react";
import { AnimatePresence } from "motion/react";
import * as motion from "motion/react-client";
import { useState } from "react";

function GalleryImage({ img, index }: { img: TImage; index: number }) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const caption = img.caption || img.alternativeText || `Image ${index + 1}`;

    const handleClick = () => {
        setIsPressed(!isPressed);
    };

    const showCaption = isHovered || isPressed;

    return (
        <motion.div
            className="relative"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <StrapiImage
                src={img.url}
                alt={img.alternativeText || `Gallery image ${index + 1}`}
                className="w-116 h-65 sm:w-xl sm:h-81 md:w-210 md:h-120 lg:w-240 lg:h-135 rounded-xl object-cover cursor-grab active:cursor-grabbing"
                width={960}
                height={540}
                draggable={false}
            />
            <AnimatePresence>
                {showCaption && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-2 left-2 bg-white/60 backdrop-blur-2xl text-wrap border border-white/30 rounded-md pointer-events-none"
                    >
                        <p className="text-primary-text text-xs uppercase tracking-wide font-semibold py-1.5 px-2 m-0 leading-none">
                            {caption}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/**
 * Horizontal gallery carousel section.
 *
 * Data flow: consumes Strapi image list and renders a draggable carousel.
 */
export function GallerySection({ data }: { data: IGallerySectionProps }) {
    if (!data) return null;

    const { heading, subHeading, description, images } = data;

    if (!images || !Array.isArray(images) || images.length === 0) return null;

    return (
        <section className="px-2 py-4 mx-auto md:px-6 lg:pt-12 lg:pb-16 bg-brand-pink overflow-hidden">
            <div className="container mx-auto max-w-2xl">
                <div className="text-container max-w-4xl mx-auto">
                    <h2 className="section-heading-red ">{heading}</h2>
                    <p className="font-light text-black text-xl md:text-2xl lg:text-3xl">{subHeading}</p>
                    {description && (
                        <p className="mx-auto mt-4 max-w-2xl text-brand-black">{description}</p>
                    )}
                </div>
            </div>
            <div className="container mx-auto overflow-x-clip">
                <Carousel
                    className="w-full max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-300 mx-auto"
                    items={images.map((img, index) => (
                        <GalleryImage key={img.id} img={img} index={index} />
                    ))}
                    overflow
                    gap={12}
                    snap={false}
                />
            </div>
        </section>
    );
}