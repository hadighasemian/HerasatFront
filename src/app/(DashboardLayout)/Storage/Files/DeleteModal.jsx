"use client";

import React, { useState } from "react";
import i18n from "@/utils/i18n";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Spinner } from "flowbite-react";
import {Notify} from "@/app/components/notification/Notification";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";

const DeleteModal = ({ popupModal, setPopupModal, obj, url, login, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async () => {
        setIsLoading(true);
        try {
            const axiosInstance = CreateAxiosInstanceServer({login: login});
            let params;
            // const response = await axiosInstance.get(url,  {params});
            const response = await axiosInstance.delete(url, { params });
            // console.log(response)
            onSuccess();
            Notify(i18n.t('Deleted successfully'), 'success');
        } catch (err) {
            console.log(err)
            Notify(err.message, 'danger');
        } finally {
            setIsLoading(false);
            setPopupModal(false);
        }
    };

    return (
        <Dialog
            open={popupModal}
            onClose={() => setPopupModal(false)}
            className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 z-50"
        >
            <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
                <DialogTitle as="h3" className="text-lg font-semibold">
                    {i18n.t('Delete File')} {obj?.filename}
                </DialogTitle>
                <p className="mt-2 text-sm">
                    {i18n.t('Are you sure you want to delete this file?')}
                </p>
                <div className="mt-4 flex gap-3">
                    <button
                        className="ui-button-small px-6 bg-info"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? <Spinner size="sm" /> : i18n.t("Yes, I'm sure")}
                    </button>
                    <button
                        onClick={() => setPopupModal(false)}
                        className="ui-button-small bg-error px-6"
                    >
                        {i18n.t("No, cancel")}
                    </button>
                </div>
            </DialogPanel>
        </Dialog>
    );
};

export default DeleteModal;
