'use client';

import React from 'react';
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button, Spinner } from "flowbite-react";
import { Icon } from "@iconify/react";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import { Notify } from "@/app/components/notification/Notification";
import i18n from "@/utils/i18n";

interface DeleteFileModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileId: string;
    vectorStoreId: string;
    onSuccess: () => void;
}

export default function DeleteFileModal({ isOpen, onClose, fileId, vectorStoreId, onSuccess }: DeleteFileModalProps) {
    const [isDeleting, setIsDeleting] = React.useState(false);
    const { login } = authModel();
    const axiosInstance = CreateAxiosInstanceServer({ login });

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await axiosInstance.delete('dashboard/vector/deletefile', {
                data: {
                    file_id: fileId,
                    vector_store_id: vectorStoreId
                }
            });
            Notify(i18n.t('Successfully'), i18n.t('File deleted successfully'));
            onSuccess();
            onClose();
        } catch (err) {
            Notify(i18n.t('Error'), i18n.t('Failed to delete file'));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 z-50"
        >
            <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-md relative">
                <button
                    type="button"
                    className="absolute top-4 end-4 text-gray-500 hover:text-gray-700"
                    onClick={onClose}
                    title="Close"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" opacity="0.5" />
                            <path strokeLinecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                        </g>
                    </svg>
                </button>

                <DialogTitle as="h3" className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    حذف فایل
                </DialogTitle>

                <div className="mt-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        آیا از حذف این فایل اطمینان دارید؟
                    </p>

                    <div className="flex gap-4">
                        <Button
                            color="failure"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <>
                                    <Spinner size="sm" className="mr-2"/>
                                    در حال حذف...
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:trash-bin-trash-line-duotone" className="mr-2"/>
                                    حذف
                                </>
                            )}
                        </Button>
                        <Button color="gray" onClick={onClose}>
                            انصراف
                        </Button>
                    </div>
                </div>
            </DialogPanel>
        </Dialog>
    );
} 