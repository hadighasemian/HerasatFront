'use client';

import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { Button, Spinner, Label, FileInput } from "flowbite-react";
import { Icon } from "@iconify/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import CardBox from "@/app/components/shared/CardBox";
import { Notify } from "@/app/components/notification/Notification";
import i18n from "@/utils/i18n";

interface AddFileToStoreModalProps {
    isOpen: boolean;
    onClose: () => void;
    vectorStoreId: string;
    onSuccess: () => void;
}

interface FormValues {
    file: File | null;
}

const validationSchema = Yup.object().shape({
    file: Yup.mixed<File>()
        .required(i18n.t('Please upload a file'))
        .test('fileSize', i18n.t('File size must be less than 10MB'), (value) => {
            if (!value) return true;
            return value.size <= 10 * 1024 * 1024;
        })
        .test('fileType', i18n.t('Unsupported file type. Only PDF, DOCX, TXT, XLSX, XLS, CSV files are supported'), (value) => {
            if (!value) return true;
            const supportedTypes = ['.pdf', '.docx', '.txt','.xlsx','.xls','.csv'];
            const fileExtension = '.' + value.name.split('.').pop()?.toLowerCase();
            return supportedTypes.includes(fileExtension);
        }),
});

export default function AddFileToStoreModal({ isOpen, onClose, vectorStoreId, onSuccess }: AddFileToStoreModalProps) {
    const [uploadLoading, setUploadLoading] = useState(false);
    const { login } = authModel();
    const axiosInstance = CreateAxiosInstanceServer({ login });

    const formik = useFormik<FormValues>({
        initialValues: {
            file: null,
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setFieldError }) => {
            if (!values.file || !vectorStoreId) return;

            setUploadLoading(true);
            const formData = new FormData();
            formData.append('file', values.file);
            formData.append('vector_store_id', vectorStoreId);

            try {
                await axiosInstance.post('dashboard/vector/addfile', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                Notify(i18n.t('Successfully'), i18n.t('File uploaded successfully'));
                onClose();
                formik.resetForm();
                onSuccess();
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
                setFieldError('file', errorMessage);
                Notify(i18n.t('Error'), i18n.t('An error occurred while uploading the file'));
            } finally {
                setSubmitting(false);
                setUploadLoading(false);
            }
        },
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            formik.setFieldValue('file', file);
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
                    افزودن فایل جدید
                </DialogTitle>

                <form onSubmit={formik.handleSubmit} className="mt-4">
                    <CardBox className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">DropZone</h4>
                        <div className="flex w-full items-center justify-center py-2">
                            <Label
                                htmlFor="dropzone-file"
                                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-purple-300 bg-purple-50 hover:bg-purple-100 dark:border-purple-600 dark:bg-purple-900/20 dark:hover:border-purple-500 dark:hover:bg-purple-900/30"
                            >
                                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                    <Icon icon="solar:upload-square-line-duotone" className="text-4xl text-purple-600 mb-4"/>
                                    <p className="mb-2 text-sm text-purple-900 dark:text-purple-100">
                                        <span className="font-semibold">برای آپلود کلیک کنید</span> یا فایل را اینجا رها کنید
                                    </p>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">
                                        PDF، DOCX و TXT
                                    </p>
                                    {formik.values.file && (
                                        <p className="mt-2 text-sm text-green-600">
                                            فایل انتخاب شده: {formik.values.file.name}
                                        </p>
                                    )}
                                </div>
                                <FileInput
                                    id="dropzone-file"
                                    name="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".pdf,.docx,.txt"
                                />
                            </Label>
                        </div>
                        {formik.touched.file && formik.errors.file && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.file}</p>
                        )}
                    </CardBox>

                    <div className="flex gap-4">
                        <Button
                            type="submit"
                            color="purple"
                            disabled={formik.isSubmitting || uploadLoading || !formik.values.file}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {(formik.isSubmitting || uploadLoading) ? (
                                <>
                                    <Spinner size="sm" className="mr-2"/>
                                    در حال آپلود...
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:upload-line-duotone" className="mr-2"/>
                                    آپلود فایل
                                </>
                            )}
                        </Button>
                        <Button type="button" color="gray" onClick={onClose}>
                            انصراف
                        </Button>
                    </div>
                </form>
            </DialogPanel>
        </Dialog>
    );
} 