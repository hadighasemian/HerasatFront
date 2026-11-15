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
import { Badge, Button, TextInput, Spinner, Tooltip } from "flowbite-react";
import { Icon } from "@iconify/react";
import TitleIconCard from '@/app/components/shared/TitleIconCard';
import i18n from "@/utils/i18n";
import CreateAxiosInstanceServer from "@/resources/Net/CreateAxiosInstanceServer";
import authModel from "@/resources/models/Auth/AuthModel";
import moment from "jalali-moment";

interface VectorStore {
    id: string;
    object: string;
    name: string;
    status: string;
    usage_bytes: number;
    created_at: number;
    file_counts: {
        in_progress: number;
        completed: number;
        failed: number;
        cancelled: number;
        total: number;
    };
    metadata: any[];
    expires_after: number | null;
    expires_at: number | null;
    last_active_at: number;
}

interface VectorStoreResponse {
    success: boolean;
    assistant_id: string;
    assistant_name: string;
    vector_stores: VectorStore[];
}

const columnHelper = createColumnHelper<VectorStore>();

function VectorStoreList({ onSelect }: { onSelect: (store: VectorStore) => void }) {
    const [data, setData] = useState<VectorStore[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
    const { login } = authModel();
    const axiosInstance = CreateAxiosInstanceServer({ login });

    const columns = [
        columnHelper.accessor('name', {
            cell: info => (
                <Tooltip content={`ID: ${info.row.original.id}`}>
                    <div className="flex flex-col">
                        <span className="font-medium">{info.getValue()}</span>
                        <span className="text-sm text-purple-600 dark:text-purple-400">
                            {(info.row.original.usage_bytes / 1024).toFixed(2)} KB
                        </span>
                    </div>
                </Tooltip>
            ),
            header: () => <span>نام</span>,
            enableSorting: true,
        }),
        columnHelper.accessor('status', {
            cell: info => (
                <Badge color={info.getValue() === 'completed' ? 'success' : 'warning'} className="capitalize">
                    {info.getValue()}
                </Badge>
            ),
            header: () => <span>وضعیت</span>,
            enableSorting: true,
        }),
        columnHelper.accessor('created_at', {
            cell: info => (
                <div className="flex flex-col items-center">
                    <span>
                        {moment(info.getValue() * 1000).locale("fa").format("YYYY/MM/DD")}
                    </span>
                </div>
            ),
            header: () => <span>{i18n.t('Date')}</span>,
            enableSorting: true,
        }),
        columnHelper.accessor('file_counts', {
            cell: info => (
                <Tooltip content={`${i18n.t('Completed')}: ${info.getValue().completed}
${i18n.t('In Progress')}: ${info.getValue().in_progress}
${i18n.t('Failed')}: ${info.getValue().failed}
${i18n.t('Cancelled')}: ${info.getValue().cancelled}`}>
                    <div className="flex flex-col items-center cursor-help">
                        <span>{i18n.t('File Count')}: {info.getValue().total}</span>
                    </div>
                </Tooltip>
            ),
            header: () => <span>{i18n.t('Files')}</span>,
            enableSorting: false,
        }),
    ];

    useEffect(() => {
        fetchData();
    }, [sorting]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.post('dashboard/vector/assistants/vector-stores');
            const data = response.data as VectorStoreResponse;
            setData(data.vector_stores);
        } catch (err: any) {
            setError(err?.message || 'An error occurred');
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

    const handleRowClick = (store: VectorStore) => {
        if (selectedStoreId === store.id) {
            // If clicking the same row, refresh both the vector store list and file list
            fetchData();
            onSelect(store); // This will trigger file list refresh
        } else {
            // If clicking a different row, select it
            setSelectedStoreId(store.id);
            onSelect(store);
        }
    };

    if (error) return (
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
    );

    return (
        <TitleIconCard title={i18n.t('Vector Stores List')
        } onDownload={undefined}>
            <div className="relative">
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
                                    <tr 
                                        key={row.id}
                                        onClick={() => handleRowClick(row.original)}
                                        className={`cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors ${
                                            selectedStoreId === row.original.id 
                                                ? 'bg-purple-100 dark:bg-purple-900/30' 
                                                : ''
                                        }`}
                                    >
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
        </TitleIconCard>
    );
}

export default VectorStoreList; 