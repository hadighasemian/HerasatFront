"use client";

import React, { useState } from "react";
import i18n from "@/utils/i18n";
import {Dialog, DialogPanel, DialogTitle} from "@headlessui/react";
import {Badge, Spinner} from "flowbite-react";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import {Notify} from "@/app/components/notification/Notification";

const DeleteModal = ({ popupModal, setPopupModal, obj,url,login,onSuccess }) => {

    const [isLoading, setIsLoading] = useState(false);
    console.log(url)
    console.log(obj)
    const handleDelete = async () => {
        // Handle delete logic here using userId
        setIsLoading(true);
        try {
            // Create axios instance with authentication
            const axiosInstance = CreateAxiosInstanceServer({login: login});
            // Using POST request (change to GET if your API expects GET)
            let params;
            const response = await axiosInstance.delete(url,  {params});
            onSuccess()
            Notify('حذف شد.', 'success')
        } catch (err) {
            Notify(err.message, 'danger')
            // onSuccess()
            // setError(err.message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
        setPopupModal(false);
    };

    return (
        <Dialog
            open={popupModal}
            onClose={() => setPopupModal(false)}
            transition
            className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0 z-50"
        >
            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel
                        transition
                        className="w-full max-w-md rounded-lg bg-white dark:bg-darkgray p-6 shadow-md dark:dark-shadow-md "
                    >
                        <DialogTitle as="h3" className="text-lg font-semibold text-ld">
                            {i18n.t('Delete')} {obj?.name}

                        </DialogTitle>
                        <p className="mt-2 text-sm text-darklink">
                            {i18n.t('Are you sure you want to delete this user?')}
                            {/*<Badge color={"gray"} className={'mx-auto'}>{obj?.name}</Badge>*/}
                        </p>
                        <div className="mt-4 flex gap-3">
                            <button
                                className="ui-button-small px-6 bg-info"
                                onClick={() => handleDelete()}
                                disabled={isLoading}
                            >
                                {isLoading ?
                                    <span>
                                        <Spinner aria-label="Alternate spinner button example" size="sm"/>
                                        <span className="px-3 ">{i18n.t('Loading...')}</span>
                                    </span>
                                    :
                                    i18n.t("Yes, I'm sure")
                                }
                            </button>
                            <button
                                onClick={() => setPopupModal(false)}
                                className="ui-button-small bg-error px-6"
                            >
                                {i18n.t("No, cancel")}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};
export default DeleteModal