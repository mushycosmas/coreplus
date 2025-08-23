"use client";

import React from "react";

interface ReUseHeroSectionProps {
  title: string;
  tagline: string;
}

const ReUseHeroSection: React.FC<ReUseHeroSectionProps> = ({ title, tagline }) => {
  const heroStyle: React.CSSProperties = {
    backgroundColor: "#343a40",
    color: "#ffffff",
    padding: "50px 20px",
    textAlign: "center",
    width: "100%",
    minHeight: "60vh", // Adjust height as needed
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxSizing: "border-box",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "3rem",
    fontWeight: "bold",
    marginBottom: "20px",
  };

  const taglineStyle: React.CSSProperties = {
    fontSize: "1.25rem",
  };

  return (
    <section style={heroStyle}>
      <h1 style={titleStyle}>{title}</h1>
      <p style={taglineStyle}>{tagline}</p>
    </section>
  );
};

export default ReUseHeroSection;
