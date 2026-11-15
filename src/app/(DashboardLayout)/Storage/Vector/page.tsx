'use client';

import React, { useState } from "react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import i18n from "@/utils/i18n";
import VectorStoreList from "@/app/(DashboardLayout)/Storage/Vector/VectorStoreList";
import VectorFileList from "@/app/(DashboardLayout)/Storage/Vector/VectorFileList";

interface VectorStore {
    id: string;
    object: string;
    name: string;
    status: string;
    usage_bytes: number;
    created_at: number;
    file_counts: {
        in_progress: number;
        completed: number;
        failed: number;
        cancelled: number;
        total: number;
    };
    metadata: any[];
    expires_after: number | null;
    expires_at: number | null;
    last_active_at: number;
}

const BCrumb = [
    {
        to: "/Storage/Vectors",
        title: "Vectors",
    },
    {
        title: i18n.t('Vectors'),
    },
];

function page() {
    const [selectedVectorStore, setSelectedVectorStore] = useState<VectorStore | null>(null);

    return (
        <>
            <BreadcrumbComp title={i18n.t('Vectors')} items={BCrumb} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="w-full">
                    <VectorStoreList onSelect={(store) => setSelectedVectorStore(store)} />
                </div>
                <div className="w-full">
                    <VectorFileList vectorStoreId={selectedVectorStore?.id} />
                </div>
            </div>
        </>
    );
}

export default page;
