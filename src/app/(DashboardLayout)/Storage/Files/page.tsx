'use client';

import React from "react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import i18n from "@/utils/i18n";
import FileTable from "@/app/(DashboardLayout)/Storage/Files/FileTable";

const BCrumb = [
    {
        to: "/Storage/Files",
        title: "Files",
    },
    {
        title: i18n.t('Files'),
    },
];

function page() {
    return (
        <>
            <BreadcrumbComp title={i18n.t('Files')} items={BCrumb} />
            <FileTable />
        </>
    );
}

export default page;
