"use client";

import React from "react";
import About from "@/components/pages/About";
import MainLayout from "@/components/layouts/MainLayout";

const AboutPage: React.FC = () => {
  return (
    <MainLayout>
      <About />
    </MainLayout>
  );
};

export default AboutPage;
