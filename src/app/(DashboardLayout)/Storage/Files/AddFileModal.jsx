"use client";

import React, { useEffect, useCallback, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Label, TextInput, Button, Spinner, Select, FileInput } from "flowbite-react";
import CreateAxiosInstanceServer from "../../../../resources/Net/CreateAxiosInstanceServer";
import i18n from "@/utils/i18n";
import { Notify } from "@/app/components/notification/Notification";
import CardBox from "@/app/components/shared/CardBox";
import URLs from "@/resources/Net/URLs";

const AddFileModal = ({ popupModal, setPopupModal, obj, login, onSuccess }) => {
    const axiosInstance = CreateAxiosInstanceServer({ login });
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const editMode = obj && obj.id;

    const validationSchema = Yup.object().shape({
        filename: Yup.string().required(i18n.t('Required')),
        purpose: Yup.string().required(i18n.t('Required')),
    });

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileError("");

            // Auto-fill the filename if not in edit mode
            if (!editMode && !formik.values.filename) {
                formik.setFieldValue('filename', selectedFile.name);
            }
        }
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: obj?.id || "",
            filename: obj?.filename || "",
            purpose: obj?.purpose || "assistants",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                if (!file && !editMode) {
                    setFileError(i18n.t('Please upload a file'));
                    return;
                }

                setSubmitting(true);
                setIsUploading(true);

                const formData = new FormData();
                formData.append('filename', values.filename);
                formData.append('purpose', values.purpose);
                if (file) {
                    formData.append('file', file);
                }

                // if (editMode) {
                //     await axiosInstance.put(`dashboard/assistant/files/${obj.id}`, formData, {
                //         headers: {
                //             'Content-Type': 'multipart/form-data'
                //         }
                //     });
                //     Notify(i18n.t('Successfully'), i18n.t('File updated successfully'), 'success');
                // } else {
                    await axiosInstance.post(URLs.dashboard.assistant.files.store, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    Notify(i18n.t('Successfully'), i18n.t('File created successfully'), 'success');
                // }

                onSuccess();
                setPopupModal(false);
            } catch (error) {
                console.log(error)
                if (error?.errors) {
                    setErrors(error?.errors);
                }
                Notify(i18n.t('Error'), i18n.t('An error occurred while uploading the file'), 'error');
            } finally {
                setSubmitting(false);
                setIsUploading(false);
            }
        },
    });

    useEffect(() => {
        if (!popupModal) {
            formik.resetForm();
            setFile(null);
            setFileError("");
        }
    }, [popupModal]);

    return (
        <Dialog
            open={popupModal}
            onClose={() => setPopupModal(false)}
            className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 z-50"
        >
            <DialogPanel className="w-full max-w-md rounded-lg bg-white p-6 shadow-md relative">
                <button
                    type="button"
                    className="absolute top-4 end-4 text-gray-500 hover:text-gray-700"
                    onClick={() => setPopupModal(false)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                        <g fill="none" stroke="currentColor" strokeWidth="1.5">
                            <circle cx="12" cy="12" r="10" opacity="0.5" />
                            <path strokeLinecap="round" d="m14.5 9.5l-5 5m0-5l5 5" />
                        </g>
                    </svg>
                </button>

                <DialogTitle as="h3" className="text-lg font-semibold">
                    {editMode ? i18n.t('Edit File') : i18n.t('Add File')}
                </DialogTitle>
                <form onSubmit={formik.handleSubmit} className="mt-4">
                    <CardBox className="mb-4">
                        <h4 className="text-lg font-semibold mb-2">DropZone</h4>
                        <div className="flex w-full items-center justify-center py-2">
                            <Label
                                htmlFor="dropzone-file"
                                className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                            >
                                <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                    <svg
                                        className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 20 16"
                                    >
                                        <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                                        />
                                    </svg>
                                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        PDF, WORD, EXCEL
                                    </p>
                                    {file && (
                                        <p className="mt-2 text-sm text-green-600">
                                            Selected: {file.name}
                                        </p>
                                    )}
                                </div>
                                <FileInput
                                    id="dropzone-file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".doc,.docx,.pdf,.xls,.xlsx"
                                />
                            </Label>
                        </div>
                        {fileError && <p className="mt-1 text-sm text-red-600">{fileError}</p>}
                    </CardBox>

                    <div className="mb-4">
                        <Label htmlFor="filename" value={i18n.t('Filename')} />
                        <TextInput
                            id="filename"
                            name="filename"
                            type="text"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.filename}
                            color={formik.touched.filename && formik.errors.filename ? "failure" : ""}
                            helperText={formik.touched.filename && formik.errors.filename}
                        />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="purpose" value={i18n.t('Purpose')} />
                        <Select
                            id="purpose"
                            name="purpose"
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            value={formik.values.purpose}
                            color={formik.touched.purpose && formik.errors.purpose ? "failure" : ""}
                        >
                            <option value="assistants">assistants</option>
                            <option value="fine-tune">fine-tune</option>
                            <option value="user_data">user_data</option>
                        </Select>
                        {formik.touched.purpose && formik.errors.purpose && (
                            <p className="mt-1 text-sm text-red-600">{formik.errors.purpose}</p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" disabled={formik.isSubmitting || isUploading}>
                            {(formik.isSubmitting || isUploading) ? <Spinner size="sm" /> : i18n.t('Submit')}
                        </Button>
                        <Button type="button" color="gray" onClick={() => setPopupModal(false)}>
                            {i18n.t('Cancel')}
                        </Button>
                    </div>
                </form>
            </DialogPanel>
        </Dialog>
    );
};

export default AddFileModal;