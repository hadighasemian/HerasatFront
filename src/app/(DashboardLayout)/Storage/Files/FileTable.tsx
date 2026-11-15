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
import {Badge, Dropdown, Button, TextInput, Spinner} from "flowbite-react";
import {IconDots, IconChevronLeft, IconChevronRight, IconChevronsLeft, IconChevronsRight} from "@tabler/icons-react";
import {Icon} from "@iconify/react";
import TitleIconCard from '@/app/components/shared/TitleIconCard';
import i18n from "@/utils/i18n";
import DeleteModal from "@/app/(DashboardLayout)/Users/DeleteModal";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import URLs from "@/resources/Net/URLs";
import {SearchApiParams} from "@/resources/models/SearchApiParams";
import moment from "jalali-moment";
import AddFileToStoreModal from "@/app/(DashboardLayout)/Storage/Files/AddFileModal";
import AddFileModal from '@/app/(DashboardLayout)/Storage/Files/AddFileModal';
interface FileType {
    id: string;
    object: string;
    bytes: number;
    createdAt: number;
    filename: string;
    purpose: string;
    status: string;
    statusDetails: string | null;
}

const columnHelper = createColumnHelper<FileType>();

function FileTable() {
    const [data, setData] = useState<FileType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [popupDeleteModal, setPopupDeleteModal] = useState(false);
    const [popupAddModal, setPopupAddModal] = useState(false);
    const [deleteFile, setDeleteFile] = useState<FileType | null>(null);
    const [editFile, setEditFile] = useState<FileType | null>(null);
    const {login, user} = authModel();
    const axiosInstance = CreateAxiosInstanceServer({login: login});
    const [searchTerm, setSearchTerm] = useState('');

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
        total: 0,
        lastPage: 1,
        from: 1,
        to: 10
    });

    const columns = [
        columnHelper.accessor('filename', {
            cell: info => (
                <div className='flex flex-row items-center gap-2'>
                    <span className="font-medium">{info.getValue()}</span>
                </div>

            ),
            header: () => <span>نام فایل</span>,
            enableSorting: true,
        }),

        columnHelper.accessor('bytes', {
            cell: info => (
                <div className="flex flex-col items-center">
                    <span>{(info.getValue() / 1024).toFixed(2)} KB</span>
                </div>
            ),
            header: () => <span>حجم</span>,
            enableSorting: true,
        }),
        columnHelper.accessor('createdAt', {
            cell: info => (
                <div className="flex flex-col items-center">
                    <span>
                        {moment(info.getValue() * 1000).locale("fa").format("YYYY/MM/DD HH:mm:ss")}
                    </span>
                </div>
            ),
            header: () => <span>تاریخ ایجاد</span>,
            enableSorting: true,
        }),
        columnHelper.accessor('status', {
            cell: info => (
                <Badge color={info.getValue() === 'processed' ? 'success' : 'warning'} className="capitalize">
                    {info.getValue()}
                </Badge>
            ),
            header: () => <span>وضعیت</span>,
            enableSorting: false,
        }),
        columnHelper.display({
            id: 'actions',
            cell: info => (
                <span  className={'text-red cursor-pointer '}  onClick={
                    () => {
                        setDeleteFile(info.row.original);
                    }
                }>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6.386c0-.484.345-.877.771-.877h2.665c.529-.016.996-.399 1.176-.965l.03-.1l.115-.391c.07-.24.131-.45.217-.637c.338-.739.964-1.252 1.687-1.383c.184-.033.378-.033.6-.033h3.478c.223 0 .417 0 .6.033c.723.131 1.35.644 1.687 1.383c.086.187.147.396.218.637l.114.391l.03.1c.18.566.74.95 1.27.965h2.57c.427 0 .772.393.772.877s-.345.877-.771.877H3.77c-.425 0-.77-.393-.77-.877"/><path fill="currentColor" fill-rule="evenodd" d="M9.425 11.482c.413-.044.78.273.821.707l.5 5.263c.041.433-.26.82-.671.864c-.412.043-.78-.273-.821-.707l-.5-5.263c-.041-.434.26-.821.671-.864m5.15 0c.412.043.713.43.671.864l-.5 5.263c-.04.434-.408.75-.82.707c-.413-.044-.713-.43-.672-.864l.5-5.264c.041-.433.409-.75.82-.707" clip-rule="evenodd"/><path fill="currentColor" d="M11.596 22h.808c2.783 0 4.174 0 5.08-.886c.904-.886.996-2.339 1.181-5.245l.267-4.188c.1-1.577.15-2.366-.303-2.865c-.454-.5-1.22-.5-2.753-.5H8.124c-1.533 0-2.3 0-2.753.5s-.404 1.288-.303 2.865l.267 4.188c.185 2.906.277 4.36 1.182 5.245c.905.886 2.296.886 5.079.886" opacity="0.5"/></svg>
                </span>
                // <Dropdown
                //     label=""
                //     dismissOnClick={false}
                //     renderTrigger={() => (
                //         <span
                //             className="h-9 w-9 flex justify-center items-center rounded-full hover:bg-lightprimary hover:text-primary cursor-pointer">
                //             <IconDots size={22}/>
                //         </span>
                //     )}
                // >
                //     {/*<Dropdown.Item*/}
                //     {/*    className="flex gap-3"*/}
                //     {/*    onClick={() => {*/}
                //     {/*        setEditFile(info.row.original);*/}
                //     {/*    }}*/}
                //     {/*>*/}
                //     {/*    <Icon icon="solar:pen-new-square-broken" height={18}/>*/}
                //     {/*    <span>ویرایش</span>*/}
                //     {/*</Dropdown.Item>*/}
                //     <Dropdown.Item
                //         className="flex gap-3 text-red-500"
                //         onClick={() => {
                //             setDeleteFile(info.row.original);
                //         }}
                //     >
                //         <Icon icon="solar:trash-bin-minimalistic-outline" height={18}/>
                //         <span>حذف</span>
                //     </Dropdown.Item>
                //     {/*<Dropdown.Item*/}
                //     {/*    className="flex gap-3 text-blue-500"*/}
                //     {/*    onClick={() => {*/}
                //     {/*        // Handle download*/}
                //     {/*        handleDownloadFile(info.row.original);*/}
                //     {/*    }}*/}
                //     {/*>*/}
                //     {/*    <Icon icon="solar:download-minimalistic-outline" height={18}/>*/}
                //     {/*    <span>دانلود</span>*/}
                //     {/*</Dropdown.Item>*/}
                // </Dropdown>
            ),
            header: () => <span>عملیات</span>,
        }),
    ];

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (editFile) {
            setPopupAddModal(true);
        }
    }, [editFile]);

    useEffect(() => {
        if (deleteFile) {
            setPopupDeleteModal(true);
        }
    }, [deleteFile]);

    function handleSearch() {
        fetchData();
    }

    useEffect(() => {
        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, sorting]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
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

            const response = await axiosInstance.get(URLs.dashboard.assistant.files.index, {params});
            setData(response.data.data);
            setPagination({
                ...pagination,
                total: response.data.meta.total,
                lastPage: response.data.meta.last_page,
                from: response.data.meta.from,
                to: response.data.meta.to
            });

        } catch (err) {
            // @ts-ignore
            setError(err.message || 'An error occurred');
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
        const headers = [
            "نام فایل",
            "شناسه فایل",
            "حجم",
            "تاریخ ایجاد",
            "هدف", "وضعیت"
        ];
        const rows = data.map(item => [
            item.id,
            item.filename,
            `${(item.bytes / 1024).toFixed(2)} KB`,
            new Date(item.createdAt * 1000).toLocaleString(),
            item.purpose,
            item.status
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(e => e.join(","))
        ].join("\n");

        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "files-data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadFile = (file: FileType) => {
        // Implement file download logic here
        console.log("Downloading file:", file.filename);
        // You would typically make an API call to get the file content
        // and then create a download link
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
        <TitleIconCard title="لیست فایل‌ها" onDownload={handleDownload}>
            <DeleteModal
                popupModal={popupDeleteModal}
                setPopupModal={setPopupDeleteModal}
                obj={deleteFile}
                url={`${URLs.dashboard.assistant.files.delete}/${deleteFile?.id}`}
                login={login}
                onSuccess={fetchData}
            />
            <AddFileModal
                popupModal={popupAddModal}
                setPopupModal={setPopupAddModal}
                obj={editFile}
                login={login}
                onSuccess={fetchData}
            />

            <div className="relative overflow-hidden">
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
                    <div className="flex flex-col sm:flex-row justify-between">
                        <Button
                            color="primary"
                            onClick={() => setEditFile({} as FileType)}
                            className="ui-button-small px-2 bg-info"
                        >
                            {i18n.t('Add File')}
                        </Button>
                        <div className="relative sm:my-2 md:my-0 sm:w-[360px] lg:w-2/4">
                            <TextInput
                                type="text"
                                placeholder="جستجو بر اساس نام فایل یا شناسه"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className=" w-full"
                                // onKeyPress={(e) => {
                                //     if (e.key === 'Enter') {
                                //         handleSearch();
                                //     }
                                // }}
                            />
                            <div
                                className="absolute inset-y-0 left-0 flex items-center pl-2 pr-3 cursor-pointer"
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
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="text-base py-3 border-b border-ld px-4 cursor-pointer text-center   text-black dark:text-white"
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
                        <Icon onClick={() => fetchData()} icon={"solar:refresh-circle-line-duotone"} height={24}
                              className="dark:bg-blue text-gray-700 cursor-pointer"/>
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

export default FileTable;

