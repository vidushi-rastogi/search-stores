import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ALPHABETS, SORTING_CATEGORIES, STORE_FILTERS, URL_QUERY_PARAMS } from "../constants";
import { classNames, convertToURLParamString, convertQueryStringToObject } from "../utils";
import Loader from "./Loader";
import { CashbackIcon, SearchIcon } from "../assets/icons";

const { NAME_KEY, CHECKS_KEY, SORT_KEY } = URL_QUERY_PARAMS;

// Function handles if the query key already exist then replace the value.
const parseURLParams = (searchParams, keyString, value) => {
  const keyValues = searchParams.replace('?', '').split('&');
  let queryObject = {};

  queryObject = keyValues.reduce((accumulator, pair) => {
    const [queryKey, queryValue] = pair.split('=');
    accumulator[queryKey] = queryKey === keyString ? value : queryValue;
    return accumulator;
  }, {});

  if (!searchParams.includes(keyString)) {
    queryObject[keyString] = value;
  }

  const queryString = Object.keys(queryObject)
    .map(key => `${key}=${queryObject[key]}`)
    .join('&');
  return `?${queryString}`;
}

// Function to return the specific query format required by the key.
const getSearchParamsForLocation = (searchParams, value, type) => {
  let keyString;
  let valueString = '';
  switch (type) {
    case 'alphabet': {
      keyString = NAME_KEY;
      valueString = `^${value}`;
      break;
    }
    case SORT_KEY: {
      keyString = type;
      valueString = value;
      break;
    }
    case CHECKS_KEY: {
      keyString = type;
      valueString = convertToURLParamString(value);
      break;
    }
    default: break;
  }
  if (!searchParams) return `?${keyString}=${valueString}`;
  else return parseURLParams(searchParams, keyString, valueString)
}

const AllStores = ({
  className,
  stores,
  setStores,
  selectedFilters,
  setSelectedFilters,
  setSelectedCategory,
  searchedName
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [inputName, setInputName] = useState('');
  const [checkedOptions, setCheckedOptions] = useState([]);
  const [page, setPage] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarkedStores, setBookMarkedStores] = useState([]);

  const localBookmarkedStores = localStorage.getItem("bookmarked");

  // Function to fetch more data if scroll down is initiated.
  const fetchMoreData = useCallback(async () => {
    if (isLoading) return;

    let queryString = '';

    if (location.search) {
      const queryObject = convertQueryStringToObject(location.search);
      queryString = Object.keys(queryObject)
          .map(key => {
              if (key.includes('status'))
                  return `status=${queryObject[key]}`
              else return `${key}=${queryObject[key]}`
          })
          .join('&');
    }

    setIsLoading(true);
    fetch(`http://localhost:3001/stores?${queryString}&_page=${page}&_limit=30`)
      .then(async (res) => {
        const data = await res.json();
        setStores((prevStores) => [...prevStores, ...data]);
      })
      .catch((err) => console.log(err));

    setPage((prevPage) => prevPage + 1);

    setIsLoading(false);
  }, [page, isLoading, setStores, location.search]);


  // Handles scroll down event.
  useEffect(() => {
    const handleScroll = () => {
      const { scrollTop, clientHeight, scrollHeight } =
        document.documentElement;
      if (scrollTop + clientHeight >= scrollHeight - 20) {
        fetchMoreData();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [fetchMoreData]);

  useEffect(() => {
    if (localBookmarkedStores) setBookMarkedStores(JSON.parse(localBookmarkedStores));
  }, [localBookmarkedStores])

  useEffect(() => {
    setInputName(searchedName)
  }, [searchedName])

  useEffect(() => {
    if (selectedFilters.checks)
      setCheckedOptions(selectedFilters.checks)
  }, [selectedFilters]);

  useEffect(() => {
    if (checkedOptions && checkedOptions.length)
      navigate(getSearchParamsForLocation(location.search, checkedOptions, CHECKS_KEY))
  }, [checkedOptions, navigate, location.search])


  const handleFilterChecks = (targetCheck) => {
    if (targetCheck.checked)
      setCheckedOptions([...checkedOptions,  targetCheck.value]);
    else
      setCheckedOptions(checkedOptions.filter(option => option !== targetCheck.value));
  }

  // Function to format cashback string.
  const getCasbackString = (store) => {
    if (store.cashback_enabled) {
      return `${store.rate_type} ${store.amount_type === "fixed" ? "$" : "%"}${store.cashback_amount.toFixed(2)}`
    }
    else return "No cashback available"
  }

  // Here, resetting all the filters (except name filter) when user searches by name, assuming that user wants to search a specific store.
  const resetFilters = () => {
    setSelectedFilters({
      alphabet: 'All',
      sortBy: '',
      checks: [],
    })
    setSelectedCategory('')
  }

  // Function to handle bookmark store functionality.
  const handleBookmark = (storeId) => {
    if (localBookmarkedStores) {
      let stores = JSON.parse(localBookmarkedStores);
      if (!stores.includes(storeId))
        stores = [...stores, storeId];
      else
        stores = stores.filter((store) => store !== storeId);
      localStorage.setItem('bookmarked', JSON.stringify(stores));
      setBookMarkedStores(stores);
    }
    else {
      localStorage.setItem('bookmarked', JSON.stringify([storeId]));
      setBookMarkedStores([storeId])
    }

  }

  return (
    <div className={`my-[50px] ${className} p-4`}>

      {/* Search Filters Section*/}
      <div className="border-b border-gray-300 mb-5 pb-3">
        <div className="flex justify-between mb-5 lg:flex-row flex-col">

          {/* Search by alphabet */}
          <div className="flex gap-2">
            {ALPHABETS.map((alphabet) =>
              <p
                onClick={() => {
                  navigate(getSearchParamsForLocation(location.search, alphabet, 'alphabet'))
                }}
                key={alphabet}
                className={classNames(
                  selectedFilters.alphabet === alphabet ? "text-indigo-400 font-semibold" : "",
                  "cursor-pointer text-xs hover:text-indigo-400"
                )}
              >{alphabet}</p>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex gap-2 lg:mt-0 mt-3">
            <p className="text-xs font-semibold">Sort by:</p>
            <select
              className="border rounded-xl border-gray-400 w-32 h-7 capitalize text-xs" 
              value={selectedFilters.sortBy}
              onChange={(e) => {
                navigate(getSearchParamsForLocation(location.search, e.target.value, SORT_KEY))
              }}
            >
              <option value="" hidden></option>
              {SORTING_CATEGORIES.map((sortCategory) => (
                <option
                  key={sortCategory}
                  value={sortCategory}
                  className="capitalize text-xs">{sortCategory}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-between lg:flex-row flex-col">

          {/* Checkbox filters */}
          <div className="grid grid-cols-3 gap-3">
            {STORE_FILTERS.map((filter) => (
              <div className="flex gap-1" key={filter}>
                <input
                  type="checkbox"
                  className="w-4"
                  checked={checkedOptions?.includes(filter)}
                  value={filter}
                  onChange={(e) => handleFilterChecks(e.target)}
                />
                <p className="text-xs">{filter}</p>
              </div>
            ))}
          </div>

          {/* Search by name */}
          <div className="flex gap-3 lg:mt-0 mt-3">
            <input
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              type="text"
              placeholder="Search stores"
              className="border rounded-xl border-gray-400 text-xs p-2"
            />
            <div className="flex items-center cursor-pointer" onClick={() => {
              resetFilters();
              inputName ? navigate(`?name_like=${inputName}`) :  navigate("/");
            }}>
              <img alt="search-icon" src={SearchIcon}/>
            </div>
          </div>
        </div>
      </div>
      
      {/* Searched Stores list */}
      <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 border rounded-2xl">
        {stores.map((store, index) => (
          <div key={index} className="bg-gray-100 p-5 m-2 rounded-2xl">
            <div className="w-full flex justify-end cursor-pointer" onClick={() => handleBookmark(store.id)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" id="heart"><path fill={bookmarkedStores.includes(store.id) ? "#f05542" : "#00000"} d="M5.301 3.002c-.889-.047-1.759.247-2.404.893-1.29 1.292-1.175 3.49.26 4.926l.515.515L8.332 14l4.659-4.664.515-.515c1.435-1.437 1.55-3.634.26-4.926-1.29-1.292-3.483-1.175-4.918.262l-.516.517-.517-.517C7.098 3.438 6.19 3.049 5.3 3.002z"></path></svg>
            </div>
            <div>
              <img alt="store-logo" className="rounded-xl h-14" src={store.logo} />
            </div>
            <p className="text-sm text-gray-500 mt-3 font-bold">{store.name}</p>
            <div className="mt-5 flex justify-between h-14 items-center">
              <img alt="cashback-icon" src={CashbackIcon}/>
              <p className="text-xs font-semibold">{getCasbackString(store)}</p>
            </div>

            <div className="flex justify-center mt-3">
              <button
                onClick={() => window.open(store.homepage)}
                className="border-2 border-indigo-400 rounded-2xl p-2 text-indigo-400 hover:bg-indigo-400 hover:text-white">
                Shop Now
              </button>
            </div>
          </div>
        ))}
        {isLoading && <Loader />}
      </div>
    </div>
  );
};

export default AllStores;
