"use client";

import React, {useEffect} from "react";
import {Dialog, DialogPanel, DialogTitle} from "@headlessui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
    Label,
    TextInput,
    Select,
    Button, Spinner,
} from "flowbite-react";
import CreateAxiosInstanceServer from "../../../resources/Net/CreateAxiosInstanceServer";
import i18n from "@/utils/i18n";
import {Notify} from "@/app/components/notification/Notification";

const AddUserModal = ({ popupModal, setPopupModal, obj, login, onSuccess }) => {
    const axiosInstance = CreateAxiosInstanceServer({ login });

    // console.log(obj)
    const editMode = obj && obj.id > -1;
    // Create validation schema outside of formik to avoid recreation on each render
    const validationSchema = Yup.object().shape({
        name: Yup.string().required(i18n.t('Required')),
        mobile: Yup.string()
            .matches(/^[0-9]{11}$/, i18n.t('Mobile must be 11 digits'))
            .required(i18n.t('Required')),
        national_code: Yup.string()
            .matches(/^[0-9]{10}$/, i18n.t('National code must be 10 digits'))
            .required(i18n.t('Required')),
        password: !obj ? Yup.string()
                .min(6, i18n.t('Password must be at least 6 characters'))
                .required(i18n.t('Required'))
            : Yup.string(),
        role_id: Yup.number().required(i18n.t('Required')),
    });

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            id: obj?.id || "",
            name: obj?.name || "",
            mobile: obj?.mobile || "",
            national_code: obj?.national_code || "",
            assurance: obj?.assurance || "",
            job_number: obj?.job_number || "",
            short_job_number: obj?.short_job_number || "",
            chart: obj?.chart || "",
            role_id: obj?.role_id || "",
        },
        validationSchema,
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                setSubmitting(true);
                let response;
                if(editMode){
                    response = await axiosInstance.put(`dashboard/user/${obj.id}`, values)
                    Notify(i18n.t('Successfully'), i18n.t('User updated successfully'), 'success')
                }else{
                    response = await axiosInstance.post(`dashboard/user/store`, values);
                    Notify(i18n.t('Successfully'), i18n.t('User created successfully'), 'success')
                }
                onSuccess();
                setPopupModal(false);
            } catch (error) {
                if (error?.errors) {
                    setErrors(error?.errors);
                }
            } finally {
                setSubmitting(false);
            }
        },
    });
    useEffect(() => {
        if (!popupModal) {
            formik.resetForm();
        }
    }, [popupModal]);

    return (
        <Dialog
            open={popupModal}
            onClose={() => setPopupModal(false)}
            transition
            className="fixed inset-0 flex w-screen items-center justify-center bg-black/30 p-4 transition duration-300 ease-out data-[closed]:opacity-0 z-50"
        >
            <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4">
                    <DialogPanel transition className="w-full max-w-md rounded-lg bg-white dark:bg-darkgray p-6 shadow-md dark:dark-shadow-md relative">
                        <button
                            type="button"
                            className="absolute top-4 end-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => setPopupModal(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                                <g fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <circle cx="12" cy="12" r="10" opacity="0.5"/>
                                    <path strokeLinecap="round" d="m14.5 9.5l-5 5m0-5l5 5"/>
                                </g>
                            </svg>
                        </button>

                        <DialogTitle as="h3" className="text-lg font-semibold text-ld pr-6">
                            {editMode ? i18n.t('Edit User') : i18n.t('Add User')}
                        </DialogTitle>
                        <div className="mt-2 w-100 bg-gray-300 h-[0.5px]"></div>
                        <div className="mt-2 text-sm text-darklink">
                            <form onSubmit={formik.handleSubmit}>
                                <div className="grid grid-cols-12 gap-6">
                                    {/* Name */}
                                    <div className="sm:col-span-6 col-span-12">
                                        <div className="mb-2 block">
                                            <Label htmlFor="name" value={i18n.t('Full Name')} />
                                        </div>
                                        <TextInput
                                            id="name"
                                            name="name"
                                            type="text"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.name}
                                            color={formik.touched.name && formik.errors.name ? "failure" : ""}
                                            helperText={formik.touched.name && formik.errors.name}
                                        />
                                    </div>

                                    {/* Role */}
                                    <div className="sm:col-span-6 col-span-12">
                                        <div className="mb-2 block">
                                            <Label htmlFor="role_id" value={i18n.t('Role')} />
                                        </div>
                                        <Select
                                            id="role_id"
                                            name="role_id"
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.role_id}
                                            color={formik.touched.role_id && formik.errors.role_id ? "failure" : ""}
                                        >
                                            <option value="">{i18n.t('Select Role')}</option>
                                            <option value="1">{i18n.t('User')}</option>
                                            <option value="2">{i18n.t('Admin')}</option>
                                        </Select>
                                        {formik.touched.role_id && formik.errors.role_id && (
                                            <p className="mt-2 text-sm text-red-600">{formik.errors.role_id}</p>
                                        )}
                                    </div>

                                    {/* National Code */}
                                    <div className="sm:col-span-6 col-span-12">
                                        <div className="mb-2 block">
                                            <Label htmlFor="national_code" value={i18n.t('National Code')} />
                                        </div>
                                        <TextInput
                                            id="national_code"
                                            name="national_code"
                                            type="text"
                                            disabled={editMode}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            value={formik.values.national_code}
                                            color={formik.touched.national_code && formik.errors.national_code ? "failure" : ""}
                                            helperText={formik.touched.national_code && formik.errors.national_code}
                                        />
                                    </div>

                                    {/* Mobile */}
                                    <div className="sm:col-span-6 col-span-12">
                                        <div className="mb-2 block">
                                            <Label htmlFor="mobile" value={i18n.t('Mobile')} />
                                        </div>
                                        <TextInput
                                            id="mobile"
                                            name="mobile"
                                            type="text"
                                            onChange={formik.handleChange}
                                            value={formik.values.mobile}
                                            onBlur={formik.handleBlur}
                                            color={formik.touched.mobile && formik.errors.mobile ? "failure" : ""}
                                            helperText={formik.touched.mobile && formik.errors.mobile}
                                        />
                                    </div>

                                    {/* Password (only for new users) */}
                                    {!obj && (
                                        <div className="sm:col-span-6 col-span-12">
                                            <div className="mb-2 block">
                                                <Label htmlFor="password" value={i18n.t('Password')} />
                                            </div>
                                            <TextInput
                                                id="password"
                                                name="password"
                                                type="password"
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                value={formik.values.password}
                                                color={formik.touched.password && formik.errors.password ? "failure" : ""}
                                                helperText={formik.touched.password && formik.errors.password}
                                            />
                                        </div>
                                    )}

                                    {/* Other fields */}
                                    <div className="sm:col-span-6 col-span-12">
                                        <div className="mb-2 block">
                                            <Label htmlFor="assurance" value={i18n.t('Assurance')} />
                                        </div>
                                        <TextInput
                                            id="assurance"
                                            name="assurance"
                                            type="text"
                                            onChange={formik.handleChange}
                                            value={formik.values.assurance}
                                            onBlur={formik.handleBlur}
                                            color={formik.touched.assurance && formik.errors.assurance ? "failure" : ""}
                                            helperText={formik.touched.assurance && formik.errors.assurance}
                                        />
                                    </div>

                                    {/* Chart */}
                                    <div className="sm:col-span-6 col-span-12">
                                        <div className="mb-2 block">
                                            <Label htmlFor="chart" value={i18n.t('Chart')} />
                                        </div>
                                        <TextInput
                                            id="chart"
                                            name="chart"
                                            type="text"
                                            onChange={formik.handleChange}
                                            value={formik.values.chart}
                                            onBlur={formik.handleBlur}
                                            color={formik.touched.chart && formik.errors.chart ? "failure" : ""}
                                            helperText={formik.touched.chart && formik.errors.chart}
                                        />
                                    </div>

                                    {/* Job Number */}
                                    <div className="sm:col-span-6 col-span-12">
                                        <div className="mb-2 block">
                                            <Label htmlFor="job_number" value={i18n.t('Job Number')} />
                                        </div>
                                        <TextInput
                                            id="job_number"
                                            name="job_number"
                                            type="text"
                                            onChange={formik.handleChange}
                                            value={formik.values.job_number}
                                            onBlur={formik.handleBlur}
                                            color={formik.touched.job_number && formik.errors.job_number ? "failure" : ""}
                                            helperText={formik.touched.job_number && formik.errors.job_number}
                                        />
                                    </div>

                                    {/* Short Job Number */}
                                    <div className="sm:col-span-6 col-span-12">
                                        <div className="mb-2 block">
                                            <Label htmlFor="short_job_number" value={i18n.t('Short Job Number')} />
                                        </div>
                                        <TextInput
                                            id="short_job_number"
                                            name="short_job_number"
                                            type="text"
                                            onChange={formik.handleChange}
                                            value={formik.values.short_job_number}
                                            onBlur={formik.handleBlur}
                                            color={formik.touched.short_job_number && formik.errors.short_job_number ? "failure" : ""}
                                            helperText={formik.touched.short_job_number && formik.errors.short_job_number}
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="col-span-12 flex items-center gap-4">
                                        <Button
                                            type="submit"
                                            color="primary"
                                            className="ui-button-small px-6 bg-info"
                                            disabled={formik.isSubmitting}
                                        >
                                            {formik.isSubmitting ?
                                                <span>
                                                    <Spinner aria-label="Alternate spinner button example" size="sm"/>
                                                    <span className="px-3 ">{i18n.t('Submitting...')}</span>
                                                </span>
                                                :
                                                i18n.t('Submit')
                                            }
                                        </Button>
                                        {/*<Button*/}
                                        {/*    type="reset"*/}
                                        {/*    color="gray"*/}
                                        {/*    onClick={formik.handleReset}*/}
                                        {/*    className="ui-button-small bg-warning px-6"*/}
                                        {/*>*/}
                                        {/*    {i18n.t('Reset')}*/}
                                        {/*</Button>*/}
                                        <Button
                                            type="reset"
                                            color="gray"
                                            onClick={() => setPopupModal(false)}
                                            className="ui-button-small bg-error px-6"
                                        >
                                            {i18n.t('Cancel')}
                                        </Button>


                                    </div>
                                </div>
                            </form>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    );
};

export default AddUserModal;