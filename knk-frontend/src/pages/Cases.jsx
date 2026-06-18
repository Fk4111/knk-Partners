import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import API from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import {
  MdSearch,
  MdClear,
  MdVisibility,
  MdChevronLeft,
  MdChevronRight
} from "react-icons/md";

export default function Cases() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const overdueFilter =
    searchParams.get("overdue");

  const [status, setStatus] = useState(
    searchParams.get("status") || ""
  );

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);


  // debounce typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);

  }, [search]);


  const fetchCases = useCallback(
   async (
      pg = page,
      s = debouncedSearch,
      st = status,
      overdue = overdueFilter
    ) => {

      setLoading(true);

      try {

        let url =
          `/cases?page=${pg}&limit=10`;

        if (s)
          url += `&search=${encodeURIComponent(s)}`;

          if (overdue === "true") {
            url += "&overdue=true";
          } else if (st) {
            url += `&status=${encodeURIComponent(st)}`;
          }

        const res = await API.get(url);

        setCases(res.data.data || []);

        setTotalPages(
          res.data.totalPages || 1
        );

        setTotal(
          res.data.total || 0
        );

      }
      catch (err) {
        console.log(err);
      }
      finally {
        setLoading(false);
      }

    },
    [page, debouncedSearch, status, overdueFilter]
  );


 // fetch whenever page/search/url filter changes
useEffect(() => {

  const urlStatus =
    searchParams.get("status") || "";

  const overdue =
    searchParams.get("overdue");

  setStatus(urlStatus);

  fetchCases(
    page,
    debouncedSearch,
    urlStatus,
    overdue
  );

}, [
  page,
  debouncedSearch,
  searchParams,
  fetchCases
]);


 const handleClear = () => {

  setSearch("");
  setStatus("");
  setPage(1);

  navigate("/cases", {
    replace: true
  });

};

// for archiving a case

const archiveCase = async (id) => {
  try {
    const confirmArchive = window.confirm(
      "Archive this case?"
    );

    if (!confirmArchive) return;

    await API.patch(
      `/cases/${id}/archive`
    );

    alert("Case archived successfully");

    fetchCases();
  } catch (error) {
    console.error(error);

    alert(
      error?.response?.data?.message ||
      "Failed to archive case"
    );
  }
};


  return (
    <DashboardLayout
      title="All Cases"
      breadcrumbs={["Home","Cases"]}
    >

      <div className="space-y-4">

        <div>
          <h1 className="text-xl font-bold">
            All Cases
          </h1>

          <p className="text-sm text-slate-400">
            {total} total records
          </p>
        </div>


        {/* SEARCH */}

        <div className="bg-white rounded-xl border border-slate-100 p-4">

          <div className="flex gap-3">

            <div className="relative flex-1">

              <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>

              <input
                value={search}

                onChange={(e)=>{

                  setSearch(
                    e.target.value
                  );

                  setPage(1);

                }}

                placeholder="Search name / application ID..."

                className="
                w-full
                pl-9
                pr-4
                py-2.5
                border
                rounded-lg
                text-sm
                focus:ring-2
                focus:!important ring-blue-500
                "
              />

            </div>


            <button

              onClick={handleClear}

              className="
              border
              px-4
              rounded-lg
              flex
              items-center
              gap-1
              "

            >

              <MdClear/>

              Clear

            </button>

          </div>

        </div>


        {/* TABLE */}

        <div className="bg-white rounded-xl border overflow-hidden">

          {loading ? (

            <LoadingSpinner/>

          ) : cases.length===0 ? (

            <EmptyState
              title="No cases found"
              message="Try adjusting search"
            />

          ) : (

           <div className="overflow-x-auto">

  <table className="w-full">

    <thead>
      <tr className="bg-slate-50 border-b border-slate-100">

        {[
          "APP ID",
          "CANDIDATE",
          "FATHER NAME",
          "DOB",
          "CITY",
          "STATE",
          "VENDOR",
          "STATUS",
          "ASSIGNED TO",
          "CREATED",
          "ACTION"
        ].map(h => (

          <th
            key={h}
            className="
            px-6
            py-4
            text-left
            text-xs
            font-semibold
            text-slate-500
            uppercase
            tracking-wide
            whitespace-nowrap
            "
          >
            {h}
          </th>

        ))}

      </tr>
    </thead>

    <tbody className="divide-y divide-slate-100">

      {cases.map(c => (

        <tr
          key={c._id}
          className="hover:bg-slate-50 transition-colors"
        >

          <td className="px-6 py-5 text-sm font-mono text-slate-600">
            {c.comp_ref_no}
          </td>

          <td className="px-6 py-5 font-semibold text-slate-900">
            {c.candidate_name || "—"}
          </td>

          <td className="px-6 py-5 text-slate-500">
            {c.father_name || "—"}
          </td>

          <td className="px-6 py-5 text-slate-500">
            {c.candidate_dob
              ? new Date(
                  c.candidate_dob
                ).toLocaleDateString("en-GB")
              : "—"}
          </td>

          <td className="px-6 py-5 text-slate-500">
            {c.city || "—"}
          </td>

          <td className="px-6 py-5 text-slate-500">
            {c.state || "—"}
          </td>

          <td className="px-6 py-5 text-slate-500">
            {c.vendor || "—"}
          </td>

          <td className="px-6 py-5">
            <StatusBadge
              status={c.check_status}
            />
          </td>

          <td className="px-6 py-5">

            {c.assignedTo?.email
              ? c.assignedTo.email.split("@")[0]
              : (
                <span className="italic text-slate-300">
                  Unassigned
                </span>
              )}

          </td>

          <td className="px-6 py-5 text-slate-400 text-sm">
            {new Date(
              c.createdAt
            ).toLocaleDateString(
              "en-GB",
              {
                day:"2-digit",
                month:"short",
                year:"2-digit"
              }
            )}
          </td>

                <td className="px-6 py-5">

        <div className="flex gap-2">

          <button
            onClick={() =>
              navigate(`/cases/${c._id}`)
            }
            className="
            border border-blue-200
            text-blue-600
            px-4 py-2
            rounded-xl
            hover:bg-blue-50
            flex items-center gap-2
            text-sm
            "
          >
            <MdVisibility />
            View
          </button>

          {[
            "DONE",
            "REJECTED",
            "STOPPED",
          ].includes(c.check_status) && (

            <button
              onClick={() =>
                archiveCase(c._id)
              }
              className="
              bg-red-100
              text-red-700
              px-4 py-2
              rounded-xl
              text-sm
              hover:bg-red-200
              "
            >
              Archive
            </button>

          )}

        </div>

      </td>

        </tr>

      ))}

    </tbody>

  </table>

</div>

          )}


          {!loading && totalPages>1 && (

            <div className="flex justify-end gap-2 p-4">

              <button

              disabled={page===1}

              onClick={()=>
                setPage(p=>p-1)
              }>

                <MdChevronLeft/>

              </button>


              <span>

                {page}/{totalPages}

              </span>


              <button

              disabled={
                page===totalPages
              }

              onClick={()=>
                setPage(
                  p=>p+1
                )
              }>

                <MdChevronRight/>

              </button>

            </div>

          )}

        </div>

      </div>

    </DashboardLayout>
  );
}