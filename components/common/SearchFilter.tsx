"use client";

import { useState } from "react";

interface SearchFilterProps {
  onSearch?: (filters: SearchFilters) => void;
  onReset?: () => void;
  onMapClick?: () => void;
  isMapOpen?: boolean;
}

export interface SearchFilters {
  keyword?: string;
  roomType?: string;
  priceRange?: string;
  areaRange?: string;
  sortBy?: string;
}

export const ROOM_TYPES = [
  { value: "", label: "Loại phòng" },
  { value: "phong_tro", label: "Phòng trọ" },
  { value: "can_ho_mini", label: "Căn hộ mini" },
  { value: "chung_cu", label: "Chung cư" },
  { value: "nha_nguyen_can", label: "Nhà nguyên căn" },
  { value: "ky_tuc_xa", label: "Ký túc xá" },
];

const PRICE_RANGES = [
  { value: "", label: "Giá thuê" },
  { value: "0-1000000", label: "< 1 triệu" },
  { value: "1000000-2000000", label: "1 - 2 triệu" },
  { value: "2000000-3000000", label: "2 - 3 triệu" },
  { value: "3000000-5000000", label: "3 - 5 triệu" },
  { value: "5000000-7000000", label: "5 - 7 triệu" },
  { value: "7000000-10000000", label: "7 - 10 triệu" },
  { value: "10000000-", label: "> 10 triệu" },
];

const AREA_RANGES = [
  { value: "", label: "Diện tích" },
  { value: "0-20", label: "< 20 m²" },
  { value: "20-30", label: "20 - 30 m²" },
  { value: "30-50", label: "30 - 50 m²" },
  { value: "50-70", label: "50 - 70 m²" },
  { value: "70-100", label: "70 - 100 m²" },
  { value: "100-", label: "> 100 m²" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Mặc định" },
  { value: "newest", label: "Tin mới nhất" },
  { value: "oldest", label: "Tin cũ nhất" },
  { value: "price_asc", label: "Giá tăng dần" },
  { value: "price_desc", label: "Giá giảm dần" },
  { value: "area_asc", label: "Diện tích tăng dần" },
  { value: "area_desc", label: "Diện tích giảm dần" },
];

export default function SearchFilter({
  onSearch,
  onReset,
  onMapClick,
  isMapOpen,
}: SearchFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    roomType: "",
    priceRange: "",
    areaRange: "",
    sortBy: "newest",
  });

  const handleChange = (field: keyof SearchFilters, value: string) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    // Auto search on filter change (except sort which handles itself)
    if (field !== "sortBy") {
      onSearch?.(newFilters);
    }
  };

  const handleSearch = () => {
    onSearch?.(filters);
  };

  const handleReset = () => {
    setFilters({
      roomType: "",
      priceRange: "",
      areaRange: "",
      sortBy: "newest",
    });
    onReset?.();
  };

  const hasActiveFilters = filters.roomType || filters.priceRange || filters.areaRange;

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-2">
        {/* Dropdown filters */}
        <div className="flex flex-1 flex-wrap gap-2">
          {/* Loại phòng */}
          <div className="min-w-[140px] flex-1">
            <select
              value={filters.roomType || ""}
              onChange={(e) => handleChange("roomType", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {ROOM_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Giá thuê */}
          <div className="min-w-[140px] flex-1">
            <select
              value={filters.priceRange || ""}
              onChange={(e) => handleChange("priceRange", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {PRICE_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Diện tích */}
          <div className="min-w-[140px] flex-1">
            <select
              value={filters.areaRange || ""}
              onChange={(e) => handleChange("areaRange", e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {AREA_RANGES.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="min-w-[140px] flex-1">
            <select
              value={filters.sortBy || "newest"}
              onChange={(e) => {
                handleChange("sortBy", e.target.value);
                // Auto search on sort change
                setTimeout(() => {
                  onSearch?.({ ...filters, sortBy: e.target.value });
                }, 0);
              }}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 transition-all hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value + opt.label} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-800"
            >
              Xóa lọc
            </button>
          )}
          <button
            type="button"
            onClick={handleSearch}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-[0.98]"
          >
            🔍 Tìm kiếm
          </button>
          <button
            type="button"
            onClick={onMapClick}
            className={`rounded-lg px-3 py-2 text-sm font-bold transition-all flex items-center gap-1 active:scale-[0.98] ${
              isMapOpen
                ? "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {isMapOpen ? "✕ Đóng bản đồ" : "📍 Bản đồ"}
          </button>
        </div>
      </div>
    </div>
  );
}

