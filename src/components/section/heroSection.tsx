"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface HeroImage {
  url: string;
  title: string;
  tagline: string;
}

const HeroSection: React.FC = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [animateClass, setAnimateClass] = useState("animate");

  // Fetch hero sections from API
  const fetchHeroSections = async () => {
    try {
      const res = await fetch("/api/hero-section/heroSection");
      const data = await res.json();

      // Ensure data.items exists
      const mapped: HeroImage[] = (data.items || []).map((item: any) => ({
        url: item.background_image || "/hero/default.jpg",
        title: item.title,
        tagline: item.subtitle,
      }));

      setImages(mapped);
    } catch (err) {
      console.error("Failed to fetch hero sections:", err);
    }
  };

  useEffect(() => {
    fetchHeroSections();
  }, []);

  // Slide change interval
  useEffect(() => {
    if (images.length === 0) return;

    const intervalId = setInterval(() => {
      setAnimateClass(""); // reset animation
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, [images]);

  // Trigger animation class
  useEffect(() => {
    if (animateClass === "") {
      const timeoutId = setTimeout(() => setAnimateClass("animate"), 50);
      return () => clearTimeout(timeoutId);
    }
  }, [animateClass]);

  if (images.length === 0) return null; // wait for data

  return (
    <section className="hero-section">
      {/* Background image */}
      <div className={`hero-image-wrapper ${animateClass}`}>
        <Image
          src={images[currentImageIndex].url}
          alt={images[currentImageIndex].title}
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Hero content */}
      <div className={`hero-content ${animateClass}`}>
        <div className="hero-inner">
          <h1>{images[currentImageIndex].title}</h1>
          <p className="tagline">{images[currentImageIndex].tagline}</p>
        </div>
      </div>

      <style jsx>{`
        .hero-section {
          position: relative;
          width: 100%;
          height: calc(100vh - 80px);
          overflow: hidden;
          box-sizing: border-box;
        }

        @media (max-width: 576px) {
          .hero-section {
            height: calc(100vh - 60px);
            margin-top: 0;
          }
        }

        .hero-image-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: opacity 1.5s ease-in-out;
          z-index: 1;
        }

        .hero-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
          display: flex;
          justify-content: center;
          text-align: center;
          z-index: 2;
        }

        .hero-inner {
          max-width: 700px;
          background: rgba(0, 0, 0, 0.5);
          padding: 30px 40px;
          border-radius: 15px;
        }

        .hero-content h1 {
          font-size: 2.5rem;
          font-weight: bold;
          color: white;
        }

        .tagline {
          font-size: 1.2rem;
          margin-top: 10px;
          color: #ddd;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 1.8rem;
          }
          .tagline {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
