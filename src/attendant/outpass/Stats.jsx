import React from "react";

function Card({ title, value, color }) {
  return (
    <div className="bg-white border border-gray-200/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-xs sm:shadow-sm shrink-0 min-w-[110px] sm:min-w-0">
      <p className="text-[10px] sm:text-xs uppercase tracking-wide text-gray-500 font-semibold truncate">
        {title}
      </p>

      <h2 className={`text-base sm:text-2xl font-black mt-0.5 sm:mt-1.5 ${color}`}>
        {value}
      </h2>
    </div>
  );
}

export default function Stats({
  total,
  page,
  totalPages,
  showing,
  color = "text-[#6d0f16]",
}) {
  return (
    <div className="flex overflow-x-auto gap-2.5 pb-1 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 scrollbar-none">
      <Card
        title="Total"
        value={total}
        color={color}
      />

      <Card
        title="Current Page"
        value={page}
        color={color}
      />

      <Card
        title="Total Pages"
        value={totalPages}
        color={color}
      />

      <Card
        title="Showing"
        value={showing}
        color={color}
      />
    </div>
  );
}