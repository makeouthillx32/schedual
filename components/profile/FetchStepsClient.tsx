"use client";

import dynamic from "next/dynamic";

const FetchDataSteps = dynamic(() => import("./fetch-data-steps"), {
  ssr: false,
});

export default function FetchStepsClient() {
  return <FetchDataSteps />;
}