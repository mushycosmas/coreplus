"use client";

import React, { useEffect, useState } from "react";

interface HeroImage {
  url: string;
  title: string;
  tagline: string;
}

const HeroSection: React.FC = () => {
  const images: HeroImage[] = [
    {
      url: "https://emphires-demo.pbminfotech.com/html-demo/images/service/service-01.jpg",
      title: "Elevate Your Business",
      tagline: "Transform your business with strategic HR solutions.",
    },
    {
      url: "https://emphires-demo.pbminfotech.com/html-demo/images/service/service-02.jpg",
      title: "Empower Your Team",
      tagline: "Build stronger teams through effective HR management.",
    },
    {
      url: "https://emphires-demo.pbminfotech.com/html-demo/images/service/service-03.jpg",
      title: "Optimize Performance",
      tagline: "Maximize employee performance with innovative solutions.",
    },
  ];

  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [animateClass, setAnimateClass] = useState<string>("animate");

  useEffect(() => {
    const intervalId = setInterval(() => {
      setAnimateClass("");
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (animateClass === "") {
      const timeoutId = setTimeout(() => setAnimateClass("animate"), 50);
      return () => clearTimeout(timeoutId);
    }
  }, [animateClass]);

  return (
    <section className="hero-section">
      {/* Background image */}
      <img
        src={images[currentImageIndex].url}
        alt={images[currentImageIndex].title}
        className={`hero-image ${animateClass}`}
      />

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
  height: calc(100vh - 80px); /* Subtract header height */
  overflow: hidden;
  box-sizing: border-box;

}

/* For small devices (mobile) */
@media (max-width: 576px) {
  .hero-section {
    height: calc(100vh - 60px); /* Adjust if header is smaller */
    margin-top:0; /* No huge margin */
  }
}


        .hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: opacity 1.5s ease-in-out;
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
