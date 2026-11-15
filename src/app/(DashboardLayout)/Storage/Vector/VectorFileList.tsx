"use client";
import React, { useState, useEffect } from 'react';
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
import { Badge, Button, Spinner, Modal } from "flowbite-react";
import { Icon } from "@iconify/react";
import TitleIconCard from '@/app/components/shared/TitleIconCard';
import i18n from "@/utils/i18n";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import moment from "jalali-moment";
import DropZone from '@/app/components/form-components/Form-Elements/DropZone';
import AddFileToStoreModal from './AddFileToStoreModal';
import DeleteFileModal from './DeleteFileModal';

interface VectorFile {
    id: string;
    object: string;
    usageBytes: number;
    createdAt: number;
    vectorStoreId: string;
    status: string;
    lastError: string | null;
    chunkingStrategy: {
        type: string;
        maxChunkSizeTokens: number;
        chunkOverlapTokens: number;
    };
}

interface VectorFileResponse {
    success: boolean;
    files: VectorFile[];
}

const columnHelper = createColumnHelper<VectorFile>();

function VectorFileList({ vectorStoreId }: { vectorStoreId?: string }) {
    const [data, setData] = useState<VectorFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const { login } = authModel();
    const axiosInstance = CreateAxiosInstanceServer({ login });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

    const columns = [
        columnHelper.accessor('id', {
            cell: info => (
                <div className="flex flex-col">
                    <span className="font-medium">{info.getValue().slice(0, 8)}...</span>
                    <span className="text-sm text-purple-600 dark:text-purple-400">
                        {(info.row.original.usageBytes / 1024).toFixed(2)} KB
                    </span>
                </div>
            ),
            header: () => <span>{i18n.t('File ID')}</span>,
            enableSorting: true,
        }),
        columnHelper.accessor('status', {
            cell: info => (
                <Badge color={info.getValue() === 'completed' ? 'success' : 'warning'} className="capitalize">
                    {info.getValue()}
                </Badge>
            ),
            header: () => <span>{i18n.t('Status')}</span>,
            enableSorting: true,
        }),
        columnHelper.accessor('createdAt', {
            cell: info => (
                <div className="flex flex-col items-center">
                    <span>
                        {moment(info.getValue() * 1000).locale("fa").format("YYYY/MM/DD")}
                    </span>
                </div>
            ),
            header: () => <span>{i18n.t('Created At')}</span>,
            enableSorting: true,
        }),
        columnHelper.display({
            id: 'actions',
            cell: info => (
                <div className="flex justify-center">
                    <Button
                        color="gray"
                        size="xs"
                        className="hover:bg-red-500 hover:text-white transition-colors"
                        onClick={() => {
                            setSelectedFileId(info.row.original.id);
                            setDeleteModalOpen(true);
                        }}
                    >
                        <Icon icon="solar:trash-bin-trash-line-duotone" className="text-xl"/>
                    </Button>
                </div>
            ),
            header: () => <span>{i18n.t('Actions')}</span>,
        }),
    ];

    useEffect(() => {
        if (vectorStoreId) {
            fetchData();
        } else {
            setData([]);
        }
    }, [vectorStoreId, sorting]);

    const fetchData = async () => {
        if (!vectorStoreId) return;
        
        setIsLoading(true);
        try {
            const response = await axiosInstance.get('dashboard/vector/files', {
                params: { vector_store_id: vectorStoreId }
            });
            const data = response.data as VectorFileResponse;
            setData(data.files);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            sorting,
        },
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    const handleFileUpload = async () => {
        if (!selectedFile || !vectorStoreId) return;

        setUploadLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('vector_store_id', vectorStoreId);

        try {
            await axiosInstance.post('dashboard/vector/files', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setIsModalOpen(false);
            setSelectedFile(null);
            fetchData(); // Refresh the file list
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during upload');
        } finally {
            setUploadLoading(false);
        }
    };

    if (!vectorStoreId) {
        return (
            <TitleIconCard title={i18n.t('Vector Store Files')}>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    {i18n.t('Please select a Vector Store')}
                </div>
            </TitleIconCard>
        );
    }

    if (error) return (
        <TitleIconCard title={i18n.t('Vector Store Files')}>
            <div className="flex flex-col items-center justify-center h-64">
                <Icon
                    icon="material-symbols:error-outline"
                    className="text-red-500 text-5xl mb-4"
                />
                <p className="text-lg text-red-500">
                    {i18n.t('Error fetching data:')} {error}
                </p>
                <Button
                    color="failure"
                    onClick={fetchData}
                    className="mt-4"
                >
                    <Icon icon="solar:refresh-circle-line-duotone" className="mr-2"/>
                    {i18n.t('Try again')}
                </Button>
            </div>
        </TitleIconCard>
    );

    return (
        <TitleIconCard title={i18n.t('Vector Store Files')} onDownload={undefined}>
            <div className="relative flex flex-col">
                <div className="p-4 flex-shrink-0">
                    <Button
                        color="purple"
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                    >
                        <Icon icon="solar:add-circle-line-duotone" className="mr-2 text-xl"/>
                        {i18n.t('Add New File')}
                    </Button>
                </div>
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Spinner
                            aria-label="Loading..."
                            size="xl"
                            color="primary"
                        />
                    </div>
                )}
                <div className="w-full">
                    <div className="max-h-[500px] overflow-auto">
                        <table className="w-full">
                            <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th
                                                key={header.id}
                                                className="text-base py-3 border-b border-purple-200 dark:border-purple-800 px-4 cursor-pointer text-center text-purple-900 dark:text-purple-100"
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
                            <tbody className="divide-y divide-purple-100 dark:divide-purple-800">
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="whitespace-nowrap py-3 px-4 text-purple-900 dark:text-purple-100">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <AddFileToStoreModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                vectorStoreId={vectorStoreId}
                onSuccess={fetchData}
            />

            <DeleteFileModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedFileId(null);
                }}
                fileId={selectedFileId || ''}
                vectorStoreId={vectorStoreId || ''}
                onSuccess={fetchData}
            />
        </TitleIconCard>
    );
}

export default VectorFileList; 