'use client'
import React from "react";
import BreadcrumbComp from "@/app/(DashboardLayout)/layout/shared/breadcrumb/BreadcrumbComp";
import i18n from "@/utils/i18n";
import UserTable from "@/app/(DashboardLayout)/Users/UserTable";


const BCrumb = [
    {
        to: "/",
        title: "Home",
    },
    {
        title: i18n.t('Users'),
    },
];
function page() {
    return (
        <>
            <BreadcrumbComp title={i18n.t('Users')} items={BCrumb} />

            <UserTable />
        </>
    );
}

export default page;
