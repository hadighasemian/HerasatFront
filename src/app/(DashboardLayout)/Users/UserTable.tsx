"use client";
import React, {useState, useEffect, useRef} from 'react';
import {
    useReactTable,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    ColumnFiltersState,
    SortingState,
} from '@tanstack/react-table';
import { Badge, Button, Dropdown, DropdownItem, Spinner, TextInput } from "flowbite-react";
import Image from "next/image";
import {IconDots, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight} from "@tabler/icons-react";
import {Icon} from "@iconify/react";
import TitleIconCard from '@/app/components/shared/TitleIconCard';
import i18n from "@/utils/i18n";
import DeleteModal from "@/app/(DashboardLayout)/Users/DeleteModal";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import {UserType} from "@/resources/models/UserType";
import URLs from "@/resources/Net/URLs";
import AddUserModal from "@/app/(DashboardLayout)/Users/AddUserModal";
import {SearchApiParams} from "@/resources/models/SearchApiParams";
const columnHelper = createColumnHelper<UserType>();





function UserTable() {
    const [data, setData] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [popupDeleteModal, setPopupDeleteModal] = useState(false);
    const [popupAddModal, setPopupAddModal] = useState(false);
    const [deleteUser, setDeleteUser] = useState< UserType| null>(null);
    const [editUser, setEditUser] = useState< UserType| null>(null);
    const {login,user} = authModel();
    const axiosInstance = CreateAxiosInstanceServer({ login: login });
    const [searchTerm, setSearchTerm] = useState('');

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
        total: 0,
        lastPage: 1,
        from: 1,      // Add this
        to: 10        // Add this
    });

    const columns = [
        columnHelper.accessor('name', {
            cell: info => (
                <div className="flex gap-3 items-center">
                    <Image
                        src={info.row.original.avatar || "/images/profile/user-5.jpg"}
                        width={40}
                        height={40}
                        alt="avatar"
                        className="h-10 w-10 rounded-full"
                    />
                    <div className="items-center">
                        <span className={'bold by-2'}>{info.getValue()}</span>
                        {/*<br/>*/}
                        {/*<Badge className={''} color={'info'}>{info.row.original.job_number}</Badge>*/}
                    </div>
                </div>
            ),
            header: () => <span>نام</span>,
            enableSorting: true,
        }),
        columnHelper.accessor('mobile', {
            cell: info => (
                <div className="flex flex-col items-center">
                    {/*<span>{info.getValue()}</span>*/}
                    {/*<br/>*/}
                    <span>{info.row.original.national_code}</span>
                </div>
            ),
            header: () => <span>کد ملی</span>,
            enableSorting: true,
        }),

        columnHelper.accessor('assurance', {
            cell: info => (
                <div className="flex flex-col items-center ">
                <span color={''} className={'capitalize bold'}>
                    {info.getValue()}
                </span>
                    <span color={''} className="mt-1">
                    <span className="text-xs">{info.row.original.chart}</span>
                </span>
                </div>
            ),
            header: () => <span>چارت</span>,
        }),

        columnHelper.accessor('thread.threadId', {
            cell: info =>
                <div className="flex flex-col items-center">
                    <Badge color={"purple"}>
                        {info.row.original.thread?.id || "-"}
                    </Badge>
                </div>,
            header: () => <span>Thread</span>,
            enableSorting: false,
        }),
        columnHelper.accessor('role.name', {
            cell: info => (
                <Badge color="info" className="capitalize">
                    {info.row.original.role?.name || "-"}
                </Badge>
            ),
            header: () => <span>نقش</span>,
            enableSorting: false,
        }),
        columnHelper.display({
            id: 'actions',
            cell: info => (
                <Dropdown
                    label=""
                    dismissOnClick={false}
                    renderTrigger={() => (
                        <span
                            className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
            <IconDots size={22}/>
          </span>
                    )}
                >
                    <DropdownItem
                        className="flex gap-3"
                        onClick={() => {
                            setEditUser(info.row.original);
                            // setPopupAddModal(true);
                        }}
                    >
                        <Icon icon="solar:pen-new-square-broken" height={18}/>
                        <span>ویرایش</span>
                    </DropdownItem>
                    <DropdownItem
                        className="flex gap-3 text-red-500"
                        onClick={() => {
                            setDeleteUser(info.row.original);
                        }}
                    >
                        <Icon icon="solar:trash-bin-minimalistic-outline" height={18}/>
                        <span>حذف</span>
                    </DropdownItem>
                </Dropdown>
            ),
            header: () => <span>عملیات</span>,
        }),
    ];
    useEffect(() => {
        const timer = setTimeout(() => {
            // This executes after 500ms of no typing
            // if (searchTerm) {
                fetchData()
                // Perform search API call here
            // }
        }, 500); // Adjust delay as needed (300-1000ms)

        return () => clearTimeout(timer); // Cleanup
    }, [searchTerm]);
    useEffect(() => {
        if (editUser) {
            setPopupAddModal(true);
        }
    }, [editUser]);
    useEffect(() => {
        if (deleteUser) {
            setPopupDeleteModal(true);
        }
    }, [deleteUser]);
    function handleSearch() {
        fetchData();
    }
    useEffect(() => {
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, sorting]);
    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Create axios instance with authentication

            const params: SearchApiParams = {
                page: pagination.pageIndex + 1,
                per_page: pagination.pageSize,
            };

            if (searchTerm) {
                params.search = searchTerm;
            }

            if (sorting.length > 0) {
                params.sort_by = sorting[0].id;
                params.sort_dir = sorting[0].desc ? 'desc' : 'asc';
            }

            // Using POST request (change to GET if your API expects GET)
            const response = await axiosInstance.post(URLs.dashboard.user.index, null, { params });
            setData(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.meta.total,
                lastPage: response.data.meta.last_page,
                from: response.data.meta.from,
                to: response.data.meta.to
            });

        } catch (err) {
            setError((err as Error).message || 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const table = useReactTable({
        data,
        columns,
        pageCount: pagination.lastPage,
        state: {
            columnFilters,
            sorting,
            pagination: {
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
            },
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                const newPagination = updater({
                    pageIndex: pagination.pageIndex,
                    pageSize: pagination.pageSize,
                });
                setPagination({
                    ...pagination,
                    pageIndex: newPagination.pageIndex,
                    pageSize: newPagination.pageSize,
                });
            }
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: true,
        debugTable: true,
    });

    const handleDownload = () => {
        const headers = ["نام", "بیمه", "Thread", "نقش"];
        const rows = data.map(item => [
            item.name,
            item.mobile,
            item.national_code,
            item.assurance || "امور",
            item.job_number,
            item.thread?.threadId || "-",
            item.role?.name || "-"
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "users-data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (error) return (
        <div className="flex flex-col items-center justify-center h-64">
            <Icon
                icon="material-symbols:error-outline"
                className="text-red-500 text-5xl mb-4"
            />
            <p className="text-lg text-red-500">
                خطا در دریافت اطلاعات: {error}
            </p>
            <Button
                color="failure"
                onClick={fetchData}
                className="mt-4"
            >
                <Icon icon="solar:refresh-circle-line-duotone" className="mr-2"/>
                تلاش مجدد
            </Button>
        </div>
    );


    return (
        <TitleIconCard title="جدول کاربران" onDownload={handleDownload}>
            <DeleteModal
                popupModal={popupDeleteModal}
                setPopupModal={setPopupDeleteModal}
                obj={deleteUser}
                url={URLs.dashboard.user.delete+`/${deleteUser?.id}`}
                login={login}
                onSuccess={fetchData}
            />
            <AddUserModal
                popupModal={popupAddModal}
                setPopupModal={setPopupAddModal}
                obj={editUser}
                login={login}
                onSuccess={fetchData}
            />
            <div className="relative  overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
                        <Spinner
                            aria-label="Loading..."
                            size="xl"
                            color="purple"
                        />
                    </div>
                )}
                <div className="p-2">
                    <div className="flex flex-col sm:flex-row  justify-between">
                        <Button
                            color="primary"
                            onClick={() => setEditUser({} as UserType)}
                            className="ui-button-small px-2 bg-info"
                        >
                            {i18n.t('Add User')}
                        </Button>
                        <div className="relative w-2/4">
                            <TextInput
                                type="text"
                                placeholder="جستجو بر اساس نام، شماره همراه یا کد ملی"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className=" pr-10  w-full"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch();
                                    }
                                }}
                            />
                            <div
                                    className="absolute inset-y-0 left-0 flex items-center pl-2 pr-3 cursor-pointer"
                                    // onClick={(e) => setSearchTerm("")}
                                    aria-label="Reset search"
                                >
                                    <svg
                                        className="w-5 h-5 text-gray-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                        />
                                    </svg>
                            </div>
                            {/*<input*/}
                            {/*    type="search"*/}
                            {/*    className="block w-full p-3 pl-10 text-sm text-white  border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400"*/}
                            {/*    placeholder="Search in dark mode..."*/}
                            {/*/>*/}
                        </div>

                    </div>

                </div>
                <div className="overflow-x-auto">
                    <table className=" min-w-full">
                        <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="text-base text-black py-3 border-b border-ld px-4 cursor-pointer text-center"
                                        onClick={() => header.column.toggleSorting()}
                                    >
                                        <div className="flex justify-center items-center">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                            <span className="mr-1">
                                                {header.column.getIsSorted()
                                                    ? (header.column.getIsSorted() === 'asc' ? ' 🔼' : ' 🔽')
                                                    : ''}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        ))}
                        </thead>
                       <tbody className={`divide-y divide-border dark:divide-darkborder ${isLoading ? 'animate-pulse' : ''}`}>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id} className="whitespace-nowrap py-3 px-4">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
                <div className="sm:flex gap-2 p-3 items-center justify-between">
                    <div dir={'ltr'} className="sm:flex gap-2 p-3 items-center justify-between">
                        <div className="flex items-center gap-2">

                            <h1 className="text-gray-700">
                                نمایش {pagination.from} تا {pagination.to} از {pagination.total} رکورد
                            </h1>
                        </div>
                        {/*<Button className={'bg-transparent'}  onClick={() => fetchData()}>*/}
                            <Icon  onClick={() => fetchData()} icon={"solar:refresh-circle-line-duotone"} height={24} className="dark:bg-blue text-gray-700 cursor-pointer" />
                        {/*</Button>*/}
                        {/* ... rest of your pagination controls */}
                    </div>
                    <div className="sm:flex items-center gap-2 sm:mt-0 mt-3">
                        <div className="sm:flex items-center gap-2">

                            <div className="flex items-center gap-2">
                                {i18n.t('Go to page')}:
                                <input
                                    type="number"
                                    min="1"
                                    max={table.getPageCount()}
                                    defaultValue={table.getState().pagination.pageIndex + 1}
                                    onChange={(e) => {
                                        const page = e.target.value ? Number(e.target.value) - 1 : 0;
                                        table.setPageIndex(page);
                                    }}
                                    className="w-16 form-control-input"
                                />

                            </div>
                            <div className="flex text-gray-500 text-sm">
                                |
                                <span className="text-sm pe-1">{i18n.t('Page')}</span>
                                <span className="text-sm ">
                                    {table.getState().pagination.pageIndex + 1} {i18n.t('of')} {" "}
                                    {table.getPageCount()}
                                </span>
                                |
                            </div>

                            <div className="flex gap-2 sm:mt-0 mt-3">
                                <Button
                                    size="small"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                                >
                                    <IconChevronRight className="text-ld" size={20}/>
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                    disabled={!table.getCanNextPage()}
                                    className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                                >
                                    <IconChevronsRight className="text-ld" size={20}/>
                                </Button>
                                <div className="select-md sm:mt-0 mt-3">
                                    <select
                                        value={table.getState().pagination.pageSize}
                                        onChange={(e) => {
                                            table.setPageSize(Number(e.target.value));
                                        }}
                                        className="border w-20"
                                    >
                                        {[10, 15, 20, 25, 50].map((pageSize) => (
                                            <option key={pageSize} value={pageSize}>
                                                {pageSize}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Button
                                    size="small"
                                    onClick={() => table.setPageIndex(0)}
                                    disabled={!table.getCanPreviousPage()}
                                    className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                                >
                                    <IconChevronsLeft className="text-ld" size={20}/>
                                </Button>
                                <Button
                                    size="small"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    className="bg-lightgray dark:bg-dark hover:bg-lightprimary dark:hover:bg-lightprimary disabled:opacity-50"
                                >
                                    <IconChevronLeft className="text-ld" size={20}/>
                                </Button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </TitleIconCard>
    );
}

export default UserTable;