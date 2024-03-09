import React from "react";
import { classNames } from "../utils";
import { useNavigate } from "react-router-dom";

const Categories = ({
  className,
  categories,
  selectedCategory,
  setSelectedFilters,
  setSearchedName
}) => {
  const navigate = useNavigate();

  // Here, resetting all the filters (except category), assuming user wants to search by specific category only.
  const resetFilters = () => {
    setSelectedFilters({
      alphabet: 'All',
      sortBy: '',
      checks: [],
    })
    setSearchedName('')
  }

  return (
    <div className={`${className} my-[50px] h-96 overflow-y-auto overflow-x-none`}>
      <div className="bg-gray-100 rounded-2xl p-6">
        <h3 className="text-gray-500 md:text-2xl font-medium mb-4 text-lg">Store Categories</h3>
        {categories.map((category) => (
          <div
            key={category.id}
            className={classNames(
              selectedCategory?.id === category.id ? "bg-white" : "",
              "border-gray-300 border-b rounded-b pt-3 pb-3 p-2 cursor-pointer hover:bg-white md:text-lg text-xs"
            )}
            onClick={() => {
              resetFilters();
              navigate(`?cats=${category.id}`)
            }}
          >
            <p className="text-gray-500">{category.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
