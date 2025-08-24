"use client";

import React from "react";
import Jobs from "@/components/pages/Job";
import MainLayout from "@/components/layouts/MainLayout";

const JobPage: React.FC = () => {
  return (
    <MainLayout>
      <Jobs />
    </MainLayout>
  );
};

export default JobPage;
